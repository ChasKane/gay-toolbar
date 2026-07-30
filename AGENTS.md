# Agent Notes

Product/design decisions: **[docs/taste-log.md](docs/taste-log.md)**.

## Development layout

Source lives in `Freelancing/.Projects/gay-toolbar`. `pnpm dev` / `pnpm build` write `main.js`, `styles.css`, and `manifest.json` into `wolfpack/.obsidian/plugins/gay-toolbar` (override via `env.mjs` `obsidianExportPath` or `OBSIDIAN_PLUGIN_DIR`). Vault install keeps only runtime files + `data.json`.

## Taste Log

Maintain **[docs/taste-log.md](docs/taste-log.md)** — a running log of intentional product choices and why they were made.

- **Add an entry** when shipping a feature or behavior change, including small ones driven by a specific user request.
- **Removal:** add a removal note (what was removed, why, and what replaced it or why nothing replaced it).
- **Refactor:** update existing entries when intent changes; don’t leave stale rationale.
- Each entry: date, area (plugin / tooling / docs), what changed, and reasoning (user request, constraint, trade-off).

Agents: update the Taste Log in the same change that implements the behavior — not as a follow-up.

- Keep `CHANGES_IN_THIS_COMMIT.md` in sync as you edit. Write it as a short, user-friendly summary of what changed and why it matters, not as an internal implementation log.
- Before creating any commit, update `CURRENT_UPDATE_POPUP_TEXT` in `src/Intro/ChasUpdateAvatar.tsx` from the user-friendly version of `CHANGES_IN_THIS_COMMIT.md` (current version only — what the avatar popup types out). **Prepend** the same section to `UPDATE_NOTES_TEXT` for the cumulative settings preview; keep prior version sections (sourced from GitHub releases). Keep the avatar copy chill and useful; do not bring back tutorial or onboarding copy.
