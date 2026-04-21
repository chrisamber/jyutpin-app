---
name: phase3
description: Execute Phase 3 — Layout & Spacing
invokable: true
---

Prerequisite: run /checkin first and wait for Claude Code acknowledgement on telegram.

Then read AGENTS.md and the plan at `/Users/chrisamber/.claude/plans/claude-design-tools-for-woolly-mochi.md` §4 Phase 3.

Apply 8pt grid tokens across: AppShell.jsx, Header.jsx, SearchHero.jsx.
Replace ad-hoc p-4/p-5 with --space-* semantic values from /src/index.css.

Known bugs to fix as part of this phase:
- SearchHero.jsx lines 43-85: RecentSongs rows drift horizontally because title (variable-width CJK) and artist (truncated) share a flex row with no deterministic column widths. Fix: 2-column layout — title as min-w-0 flex-1, artist as fixed max-w with text-right.
- Recent row song.title may be empty for older localStorage entries — fall back to artist as primary label when title is missing.

Design rules (from AGENTS.md):
- Never hardcode hex — use var(--color-*) tokens
- Dark mode via .dark class on <html>, never dark: prefix classes
- Inter Variable for body, Noto Serif SC for CJK only
- 8pt grid: --space-* tokens for spacing
- Accent: var(--color-accent)

Run `npm run build` when done. Then run /report.
