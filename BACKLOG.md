# Backlog

Parking lot for work that is *not* in the current sprint. Source of candidates for the next sprint. Paired with [SPRINTS.md](SPRINTS.md) (execution) and [product-roadmap.md](product-roadmap.md) (strategic view).

> Rule: if it's not in a sprint, it lives here. Scattered TODO comments in code do not count as planning.

---

## Polish — likely 1–2 sprints away

Pulled from `product-roadmap.md` "Next" table. Each is self-contained enough to slot into a sprint.

| Item | Effort | Notes |
|---|---|---|
| **Synced lyrics (LRC) playback** | ~1 day | `syncedLyrics` already parsed into `SongContext`. Wire active-line highlighting to playback position. Closes the TTS + study loop. |
| **Delete custom song UI** | ~2h | `deleteCustomSong()` in `customSongs.js` has no UI. Low effort, high user value for storage-conscious users. |
| **YouTube player wiring** | ~1 day | `YouTubePlayer.jsx` stub + `youtube.js` ready. Needs `VITE_YOUTUBE_API_KEY` provisioned. Custom songs already store URLs. |
| **Google TTS key provisioning + UX fallback** | ~30min | Feature built. Provision key + add visible "TTS unavailable" indicator when absent (today silently no-ops). |
| **Artist catalog auto-populate** | ~1 day | `catalog.js` curated manually. Auto-fetch from LRCLIB, merge with curated list. |
| **Tone drill improvements** | ~1 day | Add pass/fail per drill, localStorage persistence of scores, spaced-repetition ordering. |
| **PWA offline caching audit** | ~4h | Define offline scope: what's cached (analyzed songs, chord data), what requires network. Show offline indicator. |

---

## Phase 2 — H2 Masterplan candidates (3–6 months)

Dependency: Phase 1 polish must ship first. Order is a starting point, not a commitment.

- **Setlist management** (H2.1) — OnSong's killer feature. Create/reorder/share setlists; per-song key. v1 can be localStorage-only; later Supabase for sharing.
- **Additional lyrics sources** — `src/services/lyrics/` stub exists. NetEase (Mandarin) and Musixmatch (broader) unlock songs LRCLIB lacks.
- **ChordPro import/export** (H2.6) — zero lock-in strategy. Import OnSong charts; export bilingual charts back.
- **Share / export custom songs** — JSON or shareable URL. Users want to send annotated songs to bandmates.
- **Danger zone editor** — today demo-song only. Let users mark pronunciation traps on any line, persist in localStorage.
- **Hokkien (POJ/Tâi-lô) support** (H2.3) — second-largest SE Asian dialect. Requires pluggable romanization engine (start of the DialectEngine abstraction).
- **Pinyin/Yale toggle per-line** — today global. Mixed Canto-Mando songs need per-section romanization mode.
- **TTS voice selection UI** — `yue-HK-A/B/C/D` + Wavenet variants. Today hardcoded to A in `tts.js`.
- **Jianpu display mode** (H2.4) — numbered notation toggle. Significant renderer work; lower priority.
- **Community annotations** (H2.5) — user-contributed chord charts, tips, danger zones. Needs backend.

---

## Horizon 3 — 12–24 months

- **Amberfy auto-chord detection** (H3.1) — audio → detected chords → WaaPou leadsheet. Full Amber Audio showcase.
- **Gemini Live conversational practice** — live Cantonese teacher mode. Backend relay required.
- **Songwriting mode with tonal contour** (H3.2) — warns when melody contradicts tonal contour (字正腔圓). Novel.
- **Teacher / Lesson mode** (H3.3) — structured curricula. B2B play for SE Asian music schools.
- **Hakka / Teochew / Shanghainese** (H3.4) — each unlocks a geographic pocket.
- **WaaPou API** (H3.5) — bilingual leadsheet as a service. B2B licensing to KTV chains, karaoke apps.

---

## Risk register

Carry-forward risks. Each needs a concrete mitigation or an explicit "accept and monitor" decision.

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| `--color-text-muted` fails WCAG contrast | Section labels, timestamps unreadable | High (audit confirmed) | S1.A1.1 — single token change |
| Tone colors T2/T3/T4 fail contrast on white | Romanization illegible for low-vision users | Medium | Darken tokens or `font-medium` minimum — slated for S3 |
| localStorage 5 MB ceiling | Custom songs with long lyrics may overflow | Low per-user; inevitable at tail | `saveCustomSong` try/catch present; add visible storage meter in a later sprint |
| Beat-grid migration drops old chord data | User loses annotations on upgrade | Accepted — dev-era data only | Documented in `docs/claude-context/chord-migration.md`; discard on read |
| Google TTS key not provisioned in prod | TTS silently no-ops | Current state | Polish backlog item — provision + visible "TTS unavailable" indicator |
| YouTube key not provisioned in prod | Player stays dormant | Current state | Same as TTS — paired backlog item |
| `to-jyutping` 2 MB dictionary lag on slow networks | First analysis slow | Medium | Already lazy-loaded; consider loading indicator during first-run |
| PWA service-worker cache-bust on deploy | Users stuck on old version | Low | `vite-plugin-pwa` uses `autoUpdate`; verified in [docs/claude-context/pwa-support.md](docs/claude-context/pwa-support.md) |
| LRCLIB upstream outage | Search breaks | Low | Cache last N fetched songs in localStorage; show offline state (pending) |
| Redis (Upstash) translation cache unavailable | Translations fall back to direct Anthropic call | Low | Already handled by `api/translate` guardrails; monitor spend |

---

## Stuck items

Populated by SPRINTS.md emergency overrides. Each carries a `stuck:SN.X` tag pointing to the sprint + sub-item that stalled.

*None yet.*

---

*For strategic framing (Now / Next / Later, metrics, horizons) see [product-roadmap.md](product-roadmap.md). For in-flight execution see [SPRINTS.md](SPRINTS.md).*
