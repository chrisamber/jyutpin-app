# CLAUDE.md

Cantonese song-learning PWA (WaaPou / 華譜). React 19 + Vite 8 + Tailwind v4.

**What users do:** search a Cantopop song → get auto-Jyutping with tone coloring → annotate chords → study tones and danger zones → export a printable leadsheet. A curated demo (背脊唱情歌) ships with hand-verified Jyutping and learning material.

**Architecture (one line):** `Search → LRCLIB → to-jyutping → SongContext → UI`, with user chords merged from localStorage at render time.

## Quickstart

```bash
npm run dev      # Vite on :5173 — opens to search; click the demo song to see the full study UI
npm run build    # Production build to dist/ — must exit cleanly before shipping
npm run preview  # Serve dist/ — use this for PDF/print testing
npm run lint     # ESLint
npm test         # Vitest (jsdom) — must exit cleanly before shipping
```

Optional env vars in `.env.local` (app works without them):
- `VITE_GOOGLE_TTS_API_KEY` — Cantonese TTS (yue-HK)
- `VITE_YOUTUBE_API_KEY` — YouTube player integration
- `ANTHROPIC_API_KEY` — Claude Haiku English translations via `/api/translate` (server-only; use `vercel dev` to exercise the function locally)
- `KV_REST_API_URL` + `KV_REST_API_TOKEN` — optional Upstash Redis for shared translation cache across users

See [.env.local.example](.env.local.example) for the full list.

**Deployment:** hosted on Vercel. Config lives in [vercel.json](vercel.json) (Vite framework preset, builds to `dist/`). Set `VITE_*` env vars in the Vercel dashboard — never commit them. Requires **Node ≥20** (pinned in `package.json` `engines`).

## Where to go next

Pick the doc that matches what you're doing — don't read them all up front.

| If you're… | Read |
|---|---|
| Building a feature, touching state, or adding a service | [architecture.md](docs/claude-context/architecture.md) — data shapes, `SongContext`, `storageId`, localStorage keys, chord formats |
| Styling, creating UI, or working from a Figma handoff | [design-system.md](docs/claude-context/design-system.md) — tokens, typography, component folders, Figma flow |
| Confused by Cantonese/music terms (Jyutping, tones, danger zones) | [domain-glossary.md](docs/claude-context/domain-glossary.md) |
| Adding a package, lyrics source, or picking up a stubbed feature | [dependencies.md](docs/claude-context/dependencies.md) — key packages, stub points, legacy files |
| Checking what's shipped, in-progress, or planned | [product-roadmap.md](product-roadmap.md) — live Now/Next/Later; authoritative for feature status |
| Checking PWA install quirks, offline scope, SW update behavior | [pwa-support.md](docs/claude-context/pwa-support.md) |
| Checking CI/CD pipeline and local pre-deploy steps | [cicd.md](docs/claude-context/cicd.md) |
| Checking performance budgets and asset sizes | [performance-budget.md](docs/claude-context/performance-budget.md) |
| Running a manual QA pass before release | [QA-CHECKLIST.md](QA-CHECKLIST.md) — working tick-list; [docs/claude-context/qa-checklist.md](docs/claude-context/qa-checklist.md) for the *why* behind each item |
| Starting a sprint, or needing to know what's open | [SPRINTS.md](SPRINTS.md) — operator runbook: one sprint at a time, paste-ready prompts, Gates, Sprint log |
| Parking an idea, logging a risk, or finding the next sprint candidate | [BACKLOG.md](BACKLOG.md) — Polish, Phase 2, Horizon 3, risk register, stuck items |
| Writing a release note or seeing what landed recently | [CHANGELOG.md](CHANGELOG.md) — Keep a Changelog format |

Note: `storageId` (`"demo"` | `"lrclib:{id}"` | `"custom:{id}"`) namespaces every localStorage key — see architecture.md before touching persistence.

## Root-level files

Everything at the repo root is either app code or live docs. PM runbook files live at the root for operator visibility: [SPRINTS.md](SPRINTS.md), [BACKLOG.md](BACKLOG.md), [QA-CHECKLIST.md](QA-CHECKLIST.md), [CHANGELOG.md](CHANGELOG.md), [product-roadmap.md](product-roadmap.md). Deep reference docs live in `docs/claude-context/`.
