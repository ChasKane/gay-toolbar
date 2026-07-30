#!/bin/bash
# Run from a plugin source dir under Freelancing/.Projects/<plugin>.
# Builds via `pnpm/npm run dev` (which also copies into the vault install),
# then adb-pushes to Android and reloads desktop Obsidian when outputs change.

set -euo pipefail

echo "Usage: $0 [--data|-d] to include data.json"
echo "After each sync, runs 'obsidian plugin:reload' for desktop (if Obsidian CLI is installed)."

PLUGIN_NAME=$(basename "$PWD")
PLUGIN_ID=$(jq -r '.id' manifest.json 2>/dev/null || sed -n 's/.*"id": *"\([^"]*\)".*/\1/p' manifest.json | head -1)
if [ -z "$PLUGIN_ID" ]; then
  echo "Could not read id from manifest.json"
  exit 1
fi

# Android vault path (device)
ANDROID_PLUGIN_PATH="/sdcard/Documents/wolfpack/.obsidian/plugins/$PLUGIN_ID"

SYNC_DATA=false
if [[ "${1:-}" == "--data" ]] || [[ "${1:-}" == "-d" ]]; then
  SYNC_DATA=true
fi

if [ -f pnpm-lock.yaml ] || [ -f pnpm-lock.yml ]; then
  DEV_CMD=(pnpm run dev)
elif [ -f bun.lock ] || [ -f bun.lockb ]; then
  DEV_CMD=(bun run dev)
else
  DEV_CMD=(npm run dev)
fi

"${DEV_CMD[@]}" &
DEV_PID=$!

if [ "$SYNC_DATA" = true ]; then
  echo "Watching for changes in $PLUGIN_NAME (including data.json)..."
  FILES_TO_WATCH="main.js styles.css manifest.json data.json"
else
  echo "Watching for changes in $PLUGIN_NAME (excluding data.json)..."
  FILES_TO_WATCH="main.js styles.css manifest.json"
fi

cleanup() {
  echo "Stopping ${DEV_CMD[*]} (PID: $DEV_PID)..."
  kill "$DEV_PID" 2>/dev/null || true
  exit
}
trap cleanup SIGINT SIGTERM

export ANDROID_PLUGIN_PATH SYNC_DATA PLUGIN_NAME PLUGIN_ID
# shellcheck disable=SC2086
fswatch -o $FILES_TO_WATCH | xargs -n1 -I{} sh -c '
  echo "Files changed..."
  if adb devices | grep -q "device$"; then
    adb push main.js "$ANDROID_PLUGIN_PATH/main.js" && \
    adb push styles.css "$ANDROID_PLUGIN_PATH/styles.css" && \
    adb push manifest.json "$ANDROID_PLUGIN_PATH/manifest.json" && \
    ( [ "$SYNC_DATA" = true ] && adb push data.json "$ANDROID_PLUGIN_PATH/data.json" || true ) && \
    echo "Device sync complete."
  else
    echo "No device connected; skipping adb push."
  fi
  if obsidian plugin:reload id="$PLUGIN_ID" 2>/dev/null; then
    echo "Obsidian plugin reloaded."
    osascript -e "display notification \"$PLUGIN_NAME reloaded\" with title \"Obsidian\"" 2>/dev/null || true
  fi
'

wait "$DEV_PID"
