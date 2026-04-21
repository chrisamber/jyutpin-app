# DELEGATION.md — Superseded

**Status:** Archived 2026-04-21. Do not follow this file.

This file previously contained an earlier draft of the design overhaul delegation plan. It conflicted with the current source-of-truth on several points (accent hex, tone color handling, dark-mode strategy), which caused agent drift.

## Current source of truth

1. **[AGENTS.md](AGENTS.md)** — rules, phases remaining, reporting protocol, key files.
2. **[CLAUDE.md](CLAUDE.md)** — human + orchestrator context.
3. **`/Users/chrisamber/.claude/plans/claude-design-tools-for-woolly-mochi.md`** — full design spec (tokens, typography, component matrix).
4. **[.continue/config.yaml](.continue/config.yaml)** — phase prompts MiniMax executes.

If any of the above disagree, AGENTS.md wins for rules, the plan file wins for design specifics.

## Key corrections vs. the old DELEGATION.md

- Accent: `#C08A4D` light / `#D4A86A` dark (NOT `#B8860B` / `#FFD700`).
- Tone colors: import from `src/data/tones.js`. Never hardcode hexes.
- Dark mode: `.dark` class swap at `:root`. Never use `dark:` prefix classes.
- Body font: Inter Variable. Not Georgia.

## Report channel

All phase reports go to `telegram:2131066031` via the hermes MCP tool. Claude Code monitors.
