# 華譜 WaaPou — Product Roadmap

*Updated: Apr 16, 2026 · Format: Now / Next / Later · Owner: Chris*

---

## Status Overview

**~14 features shipped** · **2 in progress** · **0 blocked** · **~12 backlog items** · **Accessibility sprint added today**

Chord overlay system shipped Apr 13. Beat-grid data model is the live WIP. A full WCAG 2.1 AA audit was completed Apr 16 — 6 critical issues added to Now.

---

## ✅ Shipped (since Masterplan, Mar 2026)

| Feature | Horizon | Notes |
|---|---|---|
| Chord edit mode + bar display | H1.1 | Click-to-place chords, bars view, localStorage persistence, quick-pick pills |
| Print-ready leadsheet (PDF export) | H1.2 | `pdfExport.js` + `LeadsheetView.jsx` — Amber Audio branding in footer |
| Mandarin Pinyin mode | H1.3 | `mandarin.js`, `pinyin-pro`, per-token pinyin field, Yale toggle also built |
| Teleprompter mode | H1.6 | Full-screen, arrow-key scroll, Escape to exit |
| Google TTS line playback | H1.4 | `yue-HK` voice, hover-to-reveal play button — **needs `VITE_GOOGLE_TTS_API_KEY`** |
| Custom songs | – | Add own lyrics + metadata, stored in localStorage |
| Metadata editor | – | Inline edit title/artist/album/language/YouTube URL |
| Chord transposition | – | `transpose.js`, capo display, −6 to +6 semitones |
| Artist catalog page | – | Curated artist/song list, LRCLIB fetch on click |
| Recent songs | – | `recentSongs.js`, max 8, localStorage-backed |
| Section labels | – | `sections:{storageId}`, renders in leadsheet |
| LRC synced lyrics | – | Parsed + stored in `SongContext.syncedLyrics` — display not yet wired |
| PWA (华譜 WaaPou) | H1.5 | Service worker registered via `vite-plugin-pwa`, `autoUpdate` |
| Yale romanization | – | `yale.js`, per-line toggle in AppContext |
| iTunes album art | – | Cached in localStorage, fetched on song load |

---

## 🔨 Now — Current Sprint (Apr 2026)

> Active execution tracked in [SPRINTS.md](SPRINTS.md). This section is the strategic view; SPRINTS.md is where paste-ready prompts, Gates, and the Sprint log live.

Two parallel themes this sprint: **beat-grid chord system** (the live WIP from Apr 13 handover) and the **accessibility sprint 1** (critical blockers from today's audit).

### Theme A — Beat-Grid Chord System

The current chord system attaches chords to character positions. The beat-grid upgrade adds beat-level precision to bar notation (`| Am . F . | G . C . |`). Architecture is fully designed in `docs/handover.md` and `docs/leadsheet-formatting-research.md`.

| Item | Status | Notes |
|---|---|---|
| **New chord data format** in `chordStorage.js` | In Progress | Nested `{ lineIndex: { barIndex: { beatIndex } } }` — migration discards old char-index format |
| **`ChordBarsLine` beat renderer** in `LyricsLine.jsx` | Not Started | Replaces sequential renderer; renders `.` sustainers and `-` rests |
| **Beat selector in `ChordPopover`** | Not Started | `Beat: [1] [2] [3] [4]` row, saves `{ chord, bar, beat }` to new format |
| **Update `handleChordEdit`** in `LyricsDisplay.jsx` | Not Started | Writes to new nested structure |
| **Time signature field** in `SongMeta` | Not Started | `beatsPerBar: 4`, allow 3/4/6, defaults 4/4 |

### Theme B — Accessibility Sprint 1 (Critical)

From the WCAG 2.1 AA audit (`docs/accessibility-audit-2026-04-16.md`). These block keyboard and screen reader users.

| Item | File | Severity | Notes |
|---|---|---|---|
| **Darken `--color-text-muted`** | `src/index.css` | 🔴 Critical | `#94A3B8` → `#6B7280` (2.56:1 → 5.74:1). One token change, fixes dozens of components |
| **Modal focus trap + dialog role** | `AddSongModal.jsx` | 🔴 Critical | Add `role="dialog"` `aria-modal` `aria-labelledby`; trap Tab; return focus on close |
| **ARIA tabs pattern** | `TabNav.jsx` | 🔴 Critical | Add `role="tablist"` / `role="tab"` / `aria-selected`; ArrowLeft/ArrowRight nav |
| **SVG chord diagram accessibility** | `ChordDiagram.jsx` | 🔴 Critical | Add `role="img"` + `aria-label` + `<title>` to every SVG |
| **Global `:focus-visible` ring** | `src/index.css` | 🟡 Major | `*:focus-visible { outline: 2px solid #D97706; outline-offset: 2px; }` |
| **`LyricsLine` + `SongLine` divs → buttons** | `LyricsLine.jsx`, `SongLine.jsx` | 🟡 Major | Convert `<div onClick>` to `<button aria-expanded>` for keyboard access |

---

## 📋 Next — 1–3 Months

Ordered by value vs. effort (highest-value, lowest-effort first):

| Item | Priority | Effort | Why |
|---|---|---|---|
| **Accessibility Sprint 2** | High | ~6h | Form label linkage, toggle `aria-pressed`, touch target sizes (min 44px), tone color contrast fixes for T2/T3/T4 — see audit doc |
| **Synced lyrics (LRC) playback** | High | ~1 day | `syncedLyrics` field already parsed and in context. Wire active-line highlighting to play position. Closes the TTS + study loop. |
| **Delete custom song UI** | High | ~2h | `deleteCustomSong()` exists in `customSongs.js`. No UI. Low effort, important for storage-conscious users. |
| **YouTube player wiring** | High | ~1 day | `YouTubePlayer.jsx` stub + `src/services/youtube.js` ready. Needs `VITE_YOUTUBE_API_KEY`. Custom songs already store YouTube URL. |
| **Google TTS API key** | High | ~30min | Feature is fully built. Provision the key and add a visible "TTS not available" indicator when key is absent — currently silently no-ops. |
| **Accessibility Sprint 3** | Medium | ~3h | Polish pass: `ToneVisual` SVG labels, `SearchHero` sr-only label, `ToneAnalytics` bar aria-labels, `SectionLabel` select label — see audit doc |
| **Artist catalog auto-populate** | Medium | ~1 day | `catalog.js` is manually curated. Auto-fetch song list from LRCLIB for each artist and merge with curated data. |
| **Tone drill improvements** | Medium | ~1 day | `drillGenerator.js` exists. Add: pass/fail per drill, localStorage persistence of drill scores, spaced repetition ordering. |
| **PWA offline caching audit** | Medium | ~4h | App is a PWA but TTS and LRCLIB are online-only. Define offline scope: what's cached (analyzed songs, chord data), what requires network. Show offline indicator. |

---

## 🔭 Later — 3–6 Months (H2 Masterplan)

These are planned and scoped but not yet started. Dependency: H1 features above must ship first.

| Item | Masterplan Ref | Notes |
|---|---|---|
| **Setlist management** | H2.1 | OnSong's killer feature — free for Chinese musicians. Create/reorder/share setlists; set key per song in setlist. Needs Supabase for sharing (or localStorage-only v1). |
| **TTS voice selection UI** | – | `yue-HK-Standard-A/B/C/D` + Wavenet options. Currently hardcoded to A in `tts.js`. |
| **Pinyin/Yale toggle per-line** | – | Currently global in AppContext. Mixed-language songs (Canto-Mando) need per-section romanization mode. |
| **Share / export custom songs** | – | Export as JSON or shareable URL. Users want to send annotated songs to bandmates. |
| **Danger zone editor** | – | Currently demo-song only. Let users mark pronunciation traps on any line and save in `localStorage`. |
| **Additional lyrics sources** | – | `src/services/lyrics/` stub. Candidates: NetEase (Mandarin catalog), Musixmatch (broader). Unblocks songs LRCLIB doesn't have. |
| **Hokkien (POJ/Tâi-lô) support** | H2.3 | Second-largest dialect in SE Asia. Pluggable romanization engine. Doubles addressable market. |
| **ChordPro import/export** | H2.6 | Import existing OnSong/ChordPro charts. Export bilingual charts back. Zero lock-in strategy. |
| **Jianpu display mode** | H2.4 | Numbered notation toggle. Absorbs Jianpu-site audience into a modern UX. Significant renderer work. |
| **Community annotations** | H2.5 | User-contributed chord charts, pronunciation tips, danger zones. Upvote system. Needs backend (Supabase). |

---

## 🌐 Horizon 3 — 12–24 Months

| Item | Masterplan Ref | Notes |
|---|---|---|
| **Amberfy auto-chord detection** | H3.1 | Upload/link audio → Amberfy detects chords → WaaPou generates bilingual leadsheet. The full Amber Audio showcase. |
| **Gemini Live conversational practice** | – | Live Cantonese teacher mode. Needs backend relay (can't expose key in browser). Highest differentiation. |
| **Songwriting mode with tonal contour** | H3.2 | Warns when melody contradicts natural tonal contour (字正腔圓). Novel — doesn't exist anywhere. |
| **Teacher/Lesson mode** | H3.3 | Structured curricula around songs. B2B play with music schools across SE Asia. |
| **Hakka / Teochew / Shanghainese** | H3.4 | Each dialect unlocks a geographic pocket. Pluggable romanization architecture (started with Cantonese + Mandarin). |
| **WaaPou API** | H3.5 | Bilingual leadsheet as a service. B2B licensing to KTV chains, education platforms, karaoke apps. |

---

## ⚠️ Risks & Dependencies

| Risk | Impact | Status | Mitigation |
|---|---|---|---|
| **Google TTS API key not provisioned** | TTS playback silently no-ops | ⚠️ Unresolved | Provision key + add visible "TTS unavailable" UI state |
| **YouTube API key not provisioned** | YouTube player stays dormant | ⚠️ Unresolved | Provision key; stub already handles graceful absence |
| **Tone colors T2/T3/T4 fail contrast** | Romanization illegible for low-vision users | 🔴 New (from audit) | Darken tokens or set `font-medium` minimum on romanization — see Sprint 2 |
| **`text-muted` fails WCAG contrast** | Section labels, timestamps unreadable | 🔴 Critical (from audit) | Darken token in Sprint 1 (single line change) |
| **`to-jyutping` 2MB dictionary lag** | First analysis slow on poor connections | ✅ Mitigated | Already lazy-loaded; add loading indicator during first-run analysis |
| **localStorage storage limits (~5MB)** | Custom songs with long lyrics may overflow | ✅ Mitigated | `saveCustomSong` has try/catch; add storage usage indicator in later sprint |
| **Beat-grid migration discards old chord data** | Users lose chord annotations on upgrade | 🟡 Acceptable | Old char-index format is dev-era test data; no real user data at risk yet |

---

## Capacity & Sequencing Notes

WaaPou is a solo project (Chris). Rough velocity: ~1 substantial feature per session (3–5 hours).

**Do not start Next before completing Now.** Specifically:
- The beat-grid system is the in-flight WIP — finish before adding new features to the chord system
- Accessibility Sprint 1 is the highest-leverage change (one token edit fixes the most-common visual failure)
- YouTube and TTS are mostly about provisioning keys, not code — low effort, high user-visible impact

**What comes off when adding something new:** Jianpu display and community annotations are the lowest-priority H2 items and should be deprioritized if a higher-value opportunity emerges (e.g., a worship leader partnership that would benefit from setlist management first).

---

## Key Metrics Targets (from Masterplan)

| Metric | H1 Target (6 mo) | H2 Target (12 mo) |
|---|---|---|
| Monthly Active Users | 10,000 | 100,000 |
| Leadsheets generated | 50,000 | 500,000 |
| Songs with chord annotations | 500 | 5,000 |
| Dialects supported | 2 (Yue + Mandarin) | 3 (+Hokkien) |

---

---

## V1 Exit Plan (decided 2026-04-23)

This repo is the **Vite prototype**. Plan:

1. **Complete S1** (Accessibility Critical) — the final sprint on this codebase.
2. **Tag v1.0.0**, open-source the repo, deploy to production.
3. **Start a new Next.js repo** — builds on everything learnt here. Beat-grid chords, auth, Supabase, community features, and all H2+ items live there.

Beat-grid (S2), Accessibility Sprint 2 (S3), and all items from "Next" onwards belong to the new repo. This roadmap is now a read-only historical record after V1 ships.

---

*华譜 WaaPou — Sing what you speak. An Amber Audio product. Always free.*
