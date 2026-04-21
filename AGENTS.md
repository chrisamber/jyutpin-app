# AGENTS.md — WaaPou (jyutpin-app)

Instructions for AI agents (Hermes, Codex, etc.) working on this repo.
Claude Code instructions are in CLAUDE.md. This file is yours.

## Project

Cantonese song-learning PWA. React 19 + Vite 8 + Tailwind v4.
**Current mission:** amber-audio design system overhaul (see Design Plan below).

```bash
npm run dev      # Vite on :5173
npm run build    # Must exit 0 before any commit
npm run lint     # ESLint
```

## Design Plan

Full spec: `/Users/chrisamber/.claude/plans/claude-design-tools-for-woolly-mochi.md`
Read it before touching any UI code.

**TL;DR design rules:**
1. Never hardcode hex in components — use `var(--color-*)` tokens
2. Dark mode via `.dark` class on `<html>` — no per-component `dark:` prefix
3. Inter Variable (`--font-sans`) for body — Noto Serif SC (`--font-serif`) for CJK only
4. 8pt grid: use `--space-*` tokens for all spacing
5. Primary accent: `var(--color-accent)` = #C08A4D light / #D4A86A dark

## Phases Remaining

| Phase | Task | Status |
|---|---|---|
| 3 | Layout & Spacing (AppShell, Header, SearchHero) | 🔜 Next |
| 4 | Component Library (Button, Input, Card, ToneBadge) | ⏳ Pending |
| 5 | Dark Mode + ThemeToggle component | ⏳ Pending |
| 6 | Motion & Polish | ⏳ Pending |
| 7 | QA & Verification | ⏳ Pending |

Phases 1+2 (tokens, typography) are **done**.
~55 design system violations were fixed in the last sprint.

## Reporting Protocol

After completing any phase or significant block of work, send a Telegram report:

```
Use the Hermes messaging tools to send to telegram:2131066031:

🏁 Phase [N] — [status]
Build: clean / errors
Files changed: [list]
Summary: [2-3 sentences]
Blockers: [none / describe]
```

Claude Code (orchestrator) is monitoring that channel and will respond.

## Technical Constraints

- `storageId` namespaces all localStorage: `"demo"` | `"lrclib:{id}"` | `"custom:{id}"`
- Do not break: LRCLIB search, `to-jyutping` rendering, SongContext state, PDF export
- `src/styles/print.css` handles print — never add dark mode classes to print
- `src/data/tones.js` exports `TONE_COLORS` — import from there, don't hardcode tone colors

## Key Files

| File | Purpose |
|---|---|
| `src/index.css` | All design tokens (colors, type, spacing, motion) |
| `src/data/tones.js` | 6-tone Cantonese color system |
| `src/components/layout/AppShell.jsx` | Page container & padding |
| `src/components/layout/Header.jsx` | Top nav (ThemeToggle goes here) |
| `src/components/layout/TabNav.jsx` | Tab navigation |
| `src/components/search/SearchHero.jsx` | Landing search screen |
| `src/components/lyrics/LyricsDisplay.jsx` | Main lyrics study view |
| `src/components/lyrics/JyutpingAnnotation.jsx` | Ruby tone annotations |
| `src/components/tone/ToneBadge.jsx` | Tone number badge |
| `src/context/SongContext.jsx` | Global song state — read before touching state |
| `docs/claude-context/architecture.md` | Data shapes & localStorage patterns |

> `DELEGATION.md` is **superseded** (2026-04-21). Do not follow it. This file + the plan file are the only sources of truth.
