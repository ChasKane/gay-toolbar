# Agent Notes

Product/design decisions: **[docs/taste-log.md](docs/taste-log.md)**.

## Taste Log

Maintain **[docs/taste-log.md](docs/taste-log.md)** — a running log of intentional product choices and why they were made.

- **Add an entry** when shipping a feature or behavior change, including small ones driven by a specific user request.
- **Removal:** add a removal note (what was removed, why, and what replaced it or why nothing replaced it).
- **Refactor:** update existing entries when intent changes; don’t leave stale rationale.
- Each entry: date, area (plugin / tooling / docs), what changed, and reasoning (user request, constraint, trade-off).

Agents: update the Taste Log in the same change that implements the behavior — not as a follow-up.

- Keep `CHANGES_IN_THIS_COMMIT.md` in sync as you edit. Write it as a short, user-friendly summary of what changed and why it matters, not as an internal implementation log.
- Before creating any commit, update the text in `src/Intro/ChasUpdateAvatar.tsx` from the user-friendly version of `CHANGES_IN_THIS_COMMIT.md`. Keep the avatar copy chill and useful, focused on what's new in the version. Do not bring back tutorial or onboarding copy.
