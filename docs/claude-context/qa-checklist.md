# Manual QA Checklist (reference)

> For the *working* checklist you tick before each release, see [/QA-CHECKLIST.md](../../QA-CHECKLIST.md) at the repo root. This file explains *why* each area matters and what to look for.

A growing vitest suite covers pure utilities (see `src/**/*.test.js`). Run `npm test` as part of every release gate. Everything below is the UI/UX/device pass the tests don't cover. Approximate time: 10–15 minutes.

## 1. Search → Demo Load

- [ ] Visit `/` — lands on search view
- [ ] Type part of a song title or artist — results appear (or empty state shown)
- [ ] Click the demo song card — transitions to study view within ~2 s
- [ ] "Loading..." state shown during analysis
- [ ] Song title, artist, album art (if available) displayed correctly
- [ ] All 6 tab sections (Lyrics, Breakdown, Danger Zones, Drills, Overview, Singing Rules) render content

## 2. Lyrics & Tone Analysis

- [ ] Each Chinese character has a Jyutping annotation above it (ruby/rt tag)
- [ ] Tone colours are visible: tones 1–6 each have a distinct colour (red/orange/amber/green/blue/purple)
- [ ] Romanization toggle cycles: "Jyutping" → "Yale" → "None" → back
- [ ] TTS play button on each line triggers Cantonese TTS (if API key is set)
- [ ] TTS stops when a new line is played
- [ ] Long-press / expand on a line shows pronunciation notes panel

## 3. Chord Editing

- [ ] Toggle "♫ chords" on — chord notation appears on lyrics
- [ ] Tap a chord token → ChordPopover opens with the chord name
- [ ] Edit the chord name → `chords:{storageId}` updated in localStorage
- [ ] Transpose `+` / `−` buttons shift all displayed chords correctly
- [ ] After transpose, chord diagrams update to show the transposed shape
- [ ] Export to PDF → chord notation appears on the leadsheet

## 4. Search & Custom Songs

- [ ] Add a custom song (via "Add Song" modal)
- [ ] Custom song appears in "My Songs" / recents
- [ ] Delete or edit custom song — state updates correctly
- [ ] Search with no results shows empty state

## 5. PDF / Leadsheet Export

- [ ] Click print/export → PDF generated
- [ ] PDF contains: song title, artist, lyrics with chords, section labels
- [ ] Romanization mode (Jyutping / Yale) reflected in PDF output
- [ ] Transpose setting reflected in PDF output
- [ ] No layout overflow or cut-off on A4 page

## 6. Transposition

- [ ] Capo calculator shows correct fret for common keys
- [ ] Transpose label ("Key of C", etc.) updates on transpose change
- [ ] All chord diagrams reflect the transposed chord, not the original

## 7. Danger Zones (demo song only)

- [ ] Top 3 danger words displayed with red highlighting
- [ ] Remaining danger words shown with rank
- [ ] Each danger word shows: Chinese text, Jyutping, tonal note explaining the pitfall
- [ ] "Singing Rules" section lists the 6 ordinal rules

## 8. PWA & Offline

- [ ] Service worker registers on first load (check DevTools → Application → Service Workers)
- [ ] "Add to Home Screen" / install works on desktop Chrome
- [ ] After install, app opens in standalone mode
- [ ] Offline: previously loaded demo song is accessible without network
- [ ] Offline: PDF export works without network

## 9. Accessibility

- [ ] Tab through the app — all interactive elements reachable
- [ ] `:focus-visible` ring appears on focused elements (amber outline)
- [ ] Screen reader reads lyrics lines in order (basic test with VoiceOver/NVDA)
- [ ] Modal (AddSongModal) traps focus and returns focus on close
- [ ] Tone colours have sufficient contrast on white (see accessibility audit for exact ratios)