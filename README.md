# WaaPou · 華譜

**Free bilingual leadsheets for Chinese-dialect musicians.** Automatic Jyutping annotations, tone colouring, and printable PDF export — built for Cantopop learners and players.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

> **Status:** v1.0 beta — Vite prototype, usable today. Active future development is moving to a Next.js rewrite (separate repo, link coming). This repo remains the source of the deployed app and will receive bug fixes until v2 is ready.

---

## What it does

Learning to sing Cantonese songs is hard — the language has six tones, most lyrics sites don't show pronunciation, and printed chord sheets rarely include romanisation. WaaPou fixes that:

1. **Search a Cantopop song** — pulled from LRCLIB's open lyrics database
2. **Get automatic Jyutping** — each character is annotated with its romanised pronunciation
3. **See tone colours** — the six Cantonese tones are colour-coded so you can study pitch patterns at a glance
4. **Annotate chords** — click a syllable to attach a chord; your edits persist locally
5. **Export a printable leadsheet** — PDF export for rehearsals, gigs, or lessons

A curated demo song (背脊唱情歌) ships with hand-verified Jyutping so you can try everything without signing up or searching.

## Language support

| Language | ISO code | Romanisation | Status |
|---|---|---|---|
| Cantonese | `yue` | Jyutping | 🚧 **Under active development** — auto-annotation works, tone colours and chord flow shipped; edge cases still being refined |
| Mandarin | `cmn` | Pinyin | Preview only — UI stub, engine not yet wired |
| Hokkien / Min Nan | `nan` | POJ / Tâi-lô | 🚧 **Under development** — placeholder UI shipped; romanisation engine planned as first use of the pluggable DialectEngine abstraction |
| Hakka, Teochew, Shanghainese | — | — | Horizon roadmap |

v1.0 is a Cantonese-first release. The dialect switcher and preview banner exist so you can see where the project is going, but only `yue` produces real romanisation today.

## Tech stack

- **React 19** + **Vite 7** — fast HMR dev loop, ES-module production build
- **Tailwind CSS v4** — utility-first styling with the new Vite plugin
- **Vitest** + **Testing Library** — unit + component tests under jsdom
- **`to-jyutping`** + **`pinyin-pro`** — romanisation for Cantonese and Mandarin
- **`jspdf`** + **`html2canvas`** — client-side PDF rendering
- **`vite-plugin-pwa`** — installable offline-capable PWA
- **Upstash Redis** (optional) — shared translation cache
- **Anthropic Claude** (optional) — on-demand English translations via a Vercel serverless function

Hosted on [Vercel](https://vercel.com).

## Quickstart

```bash
# Requires Node ≥ 20
npm install
npm run dev          # start Vite dev server on :5173
```

Open http://localhost:5173 and click the demo song to see the full study UI.

### Other scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the built app locally (useful for PDF / print testing) |
| `npm run lint` | ESLint |
| `npm test` | Run Vitest suite |
| `npm run test:watch` | Vitest in watch mode |

### Optional environment variables

The app works without any env vars. For the optional integrations, copy `.env.local.example` to `.env.local`:

| Variable | Purpose |
|---|---|
| `VITE_GOOGLE_TTS_API_KEY` | Cantonese text-to-speech (yue-HK) |
| `VITE_YOUTUBE_API_KEY` | YouTube player integration |
| `ANTHROPIC_API_KEY` | English translations via `/api/translate` (server-only) |
| `KV_REST_API_URL` + `KV_REST_API_TOKEN` | Upstash Redis cache for translations |

Server-side vars (`ANTHROPIC_API_KEY`, `KV_*`) only work with the Vercel serverless function — use `vercel dev` to exercise them locally.

## Project structure

```
src/
├── components/       # UI — layout, search, lyrics display, song breakdown
├── context/          # SongContext — central state for the active song
├── hooks/            # useSongAnalysis, etc.
├── services/         # LRCLIB, YouTube, PDF export
└── data/             # Demo song with hand-verified Jyutping
api/
└── translate.js      # Vercel serverless function for Claude translations
public/               # Static assets, PWA manifest, icons
```

## Deployment

The app is deployed automatically to Vercel on every push to `main`. Preview URLs are created for every other branch.

Local deploys:

```bash
vercel          # deploy a preview
vercel --prod   # deploy to production
```

Set `VITE_*` env vars in the Vercel dashboard — never commit them.

## Roadmap & migration to Next.js

This repo is the **Vite prototype** (v1.x). It ships the app you see deployed today and will keep getting bug fixes.

**v2 is being rebuilt in Next.js** in a separate repo (link will be added here once it's public). The rewrite is driven by:

- Server-side rendering for better first-load performance and SEO
- Built-in API routes for the translation / lyrics services (currently a single Vercel function)
- Easier path to setlists, community annotations, and the DialectEngine abstraction

If you're thinking about contributing a large feature, open an issue first — we may want to land it in the Next.js repo instead.

## Contributing

Contributions are welcome — bug reports, Jyutping corrections, new demo songs, or feature ideas. Please open an issue to discuss larger changes first.

## License

[MIT](./LICENSE) © chrisamber

## Acknowledgements

- **LRCLIB** — open lyrics database
- **`to-jyutping`** by CanCLID — the Jyutping conversion engine that makes this project possible
- **`@tombatossals/chords-db`** — guitar chord voicings
