# Taste Log

Running record of intentional product and UX choices — what we changed, why, and what we removed. Agents update this in the same commit/change as the behavior (see **AGENTS.md**).

## Format

```markdown
### YYYY-MM-DD — Short title
- **Area:** plugin | tooling | docs
- **Change:** what shipped or changed
- **Reason:** user request, constraint, trade-off, or rejection of an alternative
```

For removals, use **Removed:** instead of **Change:** and note what replaced it (or why nothing replaced it). On refactors, edit the original entry or add a follow-up that points to it.

---

## Entries

### 2026-07-21 — Saved configs: locale dates + load-time migration
- **Area:** plugin
- **Change:** Saved-config markdown now writes a machine-readable `**Timestamp:**` (epoch ms) alongside the human `**Date:**` line. Parsing prefers Timestamp; unparseable locale dates (e.g. DD/MM/YYYY) no longer produce `NaN` that crashes `Intl.DateTimeFormat` and unmounts the toolbar. Display formatters are defensive; the configs screen has an error boundary so a future crash stays on that screen. Loading a saved config runs `migrateLockColorsInPlace` + `migrateSettings` before apply (preserving custom commands, palette, and configs file path).
- **Reason:** GitHub issue #20 — “View saved configs” made the toolbar disappear after saving in locales that write DD/MM dates; loading older configs also needed schema migration the same way first-load upgrades do.

### 2026-07-13 — Color picker sync + desktop status bar height
- **Area:** plugin
- **Change:** Color picker now converts hex via `react-color-palette`'s `ColorService` (correct RGB/HSV scales) so opening it shows the current button/swipe/toolbar color. Desktop status bar offset also watches toolbar resize (and `settingsScreen`) so it lifts when the color picker (or other settings screens) change height.
- **Reason:** Bug report — picker showed a stale/wrong color after sync effect; status bar stayed put when entering the color picker because height deps omitted screen changes.

### 2026-06-22 — pnpm for package management
- **Area:** tooling
- **Change:** Replaced npm (`package-lock.json`) with pnpm (`pnpm-lock.yaml`, `packageManager` field). CI release workflow, `release.sh`, and README dev setup use pnpm. Upgraded Jest 25 → 29 (with matching ts-jest / jest-environment-jsdom) to clear 11 audit findings from ancient transitive deps; one remaining `js-yaml` advisory patched via pnpm override.
- **Reason:** User request; pnpm is faster and deduplicates deps more aggressively. npm's flat hoisting had masked a Jest 25.0 / 25.5 skew and a `jest-environment-jsdom` 30.x mismatch with Jest 25.

### 2026-06-21 — Re-enable update notes replays current version
- **Area:** plugin
- **Change:** Turning **Show Gay Toolbar update notes** off then on again clears `lastSeenUpdateNotesVersion`, so the avatar replays after edit mode closes (undocumented easter egg).
- **Reason:** Lets people re-read release notes without a version bump; gated on exiting settings so it does not pop over the toggle itself.

### 2026-06-21 — Popup shows current version only; no auto-scroll during typewriter
- **Area:** plugin
- **Change:** Avatar popup types `CURRENT_UPDATE_POPUP_TEXT` (latest release only). Cumulative `UPDATE_NOTES_TEXT` stays in settings preview. Removed scroll-to-bottom on each typed character so users can scroll the bubble freely.
- **Reason:** Long cumulative text in the popup fought manual scrolling; post-update popup should highlight what's new now, with full history in settings.

### 2026-06-21 — Cumulative update notes in settings preview
- **Area:** plugin
- **Change:** `UPDATE_NOTES_TEXT` stacks release notes from GitHub (2.0.0–2.2.0) plus the current version in the settings preview only.
- **Reason:** Full release history belongs in settings; the post-update popup should stay focused on the latest version.

### 2026-06-21 — Empty swipe ring slots accept drag-and-drop
- **Area:** plugin
- **Change:** Empty swipe slots in button settings register as drop targets; dragging a filled swipe onto an empty slot moves it there (source becomes empty) instead of requiring a swap between two filled slots.
- **Reason:** Reordering swipes should work like grid button moves — empty positions are valid destinations, not dead zones.

### 2026-06-21 — Update note uses "Don't show again" checkbox
- **Area:** plugin
- **Change:** Replaced the separate "Skip these notes" button with a **Don't show again** checkbox beside **Got it**. Opt-out applies only when checked on dismiss (× or Got it).
- **Reason:** Clearer affordance — skip is optional at dismiss time, not a competing primary action.

### 2026-06-21 — Live reload when data.json syncs externally
- **Area:** plugin
- **Change:** Implemented Obsidian's `onExternalSettingsChange` so toolbar settings, custom commands, and CSS variables rehydrate when `data.json` is modified outside the plugin (Obsidian Sync, iCloud, manual edit). Debounced 300ms; Zustand persist subscription skips writes while applying external data.
- **Reason:** Cross-device sync left running instances on stale in-memory settings until restart; Obsidian provides this hook specifically for production runtime, vs custom file watching or dev-only Hot-Reload.

### 2026-06-18 — Taste Log introduced
- **Area:** docs
- **Change:** Added `docs/taste-log.md`; AGENTS.md **Taste Log** section (link at top, entry format, add on features/removals/refactors, update in same change as behavior).
- **Reason:** Cross-repo agent policy — preserve design intent and user-driven choices so future agents don’t revert them without understanding why.
