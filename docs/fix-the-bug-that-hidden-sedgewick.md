# Fix: dark-mode styles leaking into light mode

## Context

The homepage preview card ("PREVIEW — 背脊唱情歌" in [SearchHero.jsx:182](src/components/search/SearchHero.jsx:182)) renders dark on an otherwise light page. Root cause: **195 invalid Tailwind class names** across 29 component files using a token-based pattern (`bg-bg-surface`, `text-text-muted`, `border-border-subtle`, etc.) that Tailwind v4 does not produce from the `@theme` config in [index.css](src/index.css).

Commit `8293bad` already fixed [AppShell.jsx](src/AppShell.jsx) and parts of [SearchHero.jsx](src/components/search/SearchHero.jsx) by switching to Tailwind's arbitrary-value syntax: `bg-[var(--color-bg-surface)]`. The remainder of the codebase was not migrated, so those classes silently no-op. When a parent element sets `color` from dark-mode CSS vars or the browser's defaults apply, cards with no generated background rule appear wrongly colored — producing the dark card the user sees.

Goal: finish the migration so every component resolves light/dark mode correctly.

## Fix pattern

Replace token-prefixed classes with arbitrary-value syntax against the CSS custom properties defined in [src/index.css](src/index.css) (`@theme` block, lines 38–62, with `.dark` overrides at 186–226).

| Invalid                    | Replace with                            |
|----------------------------|-----------------------------------------|
| `bg-bg-base`               | `bg-[var(--color-bg-base)]`             |
| `bg-bg-surface`            | `bg-[var(--color-bg-surface)]`          |
| `bg-bg-elevated`           | `bg-[var(--color-bg-elevated)]`         |
| `bg-bg-sunken`             | `bg-[var(--color-bg-sunken)]`           |
| `bg-bg-primary`            | `bg-[var(--color-bg-base)]` *(verify intent; token `bg-primary` does not exist — most likely `bg-base`)* |
| `bg-bg-hover`              | `bg-[var(--color-accent-bg-hover)]` *(verify)* |
| `text-text-primary`        | `text-[var(--color-text-primary)]`      |
| `text-text-secondary`      | `text-[var(--color-text-secondary)]`    |
| `text-text-muted`          | `text-[var(--color-text-muted)]`        |
| `border-border-subtle`     | `border-[var(--color-border-subtle)]`   |
| `border-border-default`    | `border-[var(--color-border-default)]`  |
| `border-border-strong`     | `border-[var(--color-border-strong)]`   |

Opacity modifiers (e.g. `text-accent/60`) must become `text-[var(--color-accent)]/60` — arbitrary values preserve `/N` opacity syntax.

## Files to modify (29)

Full list from investigation (sorted by call site density):

1. [src/App.jsx:25](src/App.jsx:25)
2. [src/components/artist/ArtistCatalog.jsx](src/components/artist/ArtistCatalog.jsx) — 15 sites
3. [src/components/chords/ChordDiagram.jsx:21](src/components/chords/ChordDiagram.jsx:21)
4. [src/components/chords/ChordSheet.jsx:8](src/components/chords/ChordSheet.jsx:8)
5. [src/components/layout/Header.jsx](src/components/layout/Header.jsx) — 3 sites
6. [src/components/layout/SongHeader.jsx](src/components/layout/SongHeader.jsx) — 21 sites
7. [src/components/layout/TabNav.jsx](src/components/layout/TabNav.jsx) — 14 sites
8. [src/components/layout/TeleprompterView.jsx:61](src/components/layout/TeleprompterView.jsx:61)
9. [src/components/layout/ThemeToggle.jsx:37](src/components/layout/ThemeToggle.jsx:37)
10. [src/components/lyrics/ChordPopover.jsx](src/components/lyrics/ChordPopover.jsx) — 12 sites
11. [src/components/lyrics/JyutpingAnnotation.jsx](src/components/lyrics/JyutpingAnnotation.jsx) — 2 sites
12. [src/components/lyrics/LyricsDisplay.jsx](src/components/lyrics/LyricsDisplay.jsx) — 17 sites
13. [src/components/lyrics/LyricsEditor.jsx](src/components/lyrics/LyricsEditor.jsx) — 9 sites
14. [src/components/lyrics/LyricsLine.jsx](src/components/lyrics/LyricsLine.jsx) — 5 sites
15. [src/components/lyrics/PronunciationNotes.jsx](src/components/lyrics/PronunciationNotes.jsx) — 4 sites
16. [src/components/lyrics/SectionLabel.jsx:14](src/components/lyrics/SectionLabel.jsx:14)
17. [src/components/lyrics/ToneAnalytics.jsx](src/components/lyrics/ToneAnalytics.jsx) — 12 sites
18. [src/components/lyrics/ToneReference.jsx](src/components/lyrics/ToneReference.jsx) — 6 sites
19. [src/components/print/LeadsheetView.jsx:162](src/components/print/LeadsheetView.jsx:162)
20. [src/components/search/AddSongModal.jsx](src/components/search/AddSongModal.jsx) — 14 sites
21. [src/components/search/SearchHero.jsx](src/components/search/SearchHero.jsx) — 16 remaining sites (incl. line 182, the visible bug)
22. [src/components/search/SearchResults.jsx](src/components/search/SearchResults.jsx) — 4 sites
23. [src/components/song/DangerZones.jsx](src/components/song/DangerZones.jsx) — 4 sites
24. [src/components/song/SongBreakdown.jsx:41](src/components/song/SongBreakdown.jsx:41)
25. [src/components/song/SongLine.jsx](src/components/song/SongLine.jsx) — 3 sites
26. [src/components/song/SongMeta.jsx](src/components/song/SongMeta.jsx) — 19 sites
27. [src/components/study/Overview.jsx:13](src/components/study/Overview.jsx:13)
28. [src/components/study/ToneSystem.jsx:56](src/components/study/ToneSystem.jsx:56)
29. [src/components/youtube/YouTubePlayer.jsx](src/components/youtube/YouTubePlayer.jsx) — 5 sites

Approach: do this as a mechanical find/replace per file (Edit `replace_all` for each invalid→valid pair), then scan for any stragglers with `grep -rE "(bg-bg-|text-text-|border-border-)" src/`.

## Special cases to verify before replacing

- **`bg-bg-primary`** — no `--color-bg-primary` token exists. Options (pick by context): `--color-bg-base` (page), `--color-bg-elevated` (cards), or `--color-bg-surface` (panels). Inspect each of the 14 occurrences individually.
- **`bg-bg-hover`** — no `--color-bg-hover` token exists. Likely intent is `--color-accent-bg-hover`. Verify against surrounding component.
- **`text-accent`, `text-accent/60`, `border-accent`, etc.** (bare `accent`, not `text-text-accent`) — these *may* actually work in Tailwind v4 since `--color-accent` is defined; check a built CSS output before changing. If they fail, convert to `text-[var(--color-accent)]`.

## Verification

1. `npm run build` — must succeed cleanly.
2. `npm run dev`, open `localhost:5173`, confirm the "PREVIEW — 背脊唱情歌" card has a light gray background with dark text in light mode.
3. Toggle dark mode via ThemeToggle — confirm the card, header, nav, song page, and modals all swap correctly (no stuck-light elements, no stuck-dark elements).
4. Navigate to the demo song (`背脊唱情歌`) and through each tab (Lyrics, Chords, Study, Analytics) in both themes — spot-check for unstyled surfaces.
5. `grep -rE "\b(bg-bg-|text-text-|border-border-)" src/` — must return zero matches.
6. `npm run lint` — no new warnings.
