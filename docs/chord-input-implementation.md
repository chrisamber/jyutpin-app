# Chord Input Implementation

## Overview

A visual, character-level chord editing system built into the Annotated Lyrics view. Zero new dependencies — pure React + existing design tokens.

## Architecture

### Data Model

Chords are stored **separately from lyric analysis** in localStorage:

```
Key: chords:{storageId}
Value: JSON sparse map — { lineIndex: { charIndex: chordString } }

Example:
{
  "0": { "0": "Am", "4": "F" },
  "3": { "2": "G7", "8": "Cadd9" }
}
```

- `storageId` is `"demo"` for the demo song, `"lrclib:{id}"` for search results
- Indices beyond `line.tokens.length` are **trailing chords** (chords that happen after the singer stops on that line)
- Chord data is merged onto analyzed tokens at render time — the jyutping analysis pipeline is never touched

### Files

| File | Role |
|---|---|
| `src/services/chordStorage.js` | `loadChords`, `saveChords`, `mergeChords`, `collectUsedChords` |
| `src/components/lyrics/ChordPopover.jsx` | Input popover with quick-pick pills |
| `src/context/AppContext.jsx` | `chordEditMode` (bool) + `chordDisplay` ("above" \| "bars") |
| `src/components/lyrics/LyricsDisplay.jsx` | Toggle button, chord state, merging onto lines |
| `src/components/lyrics/LyricsLine.jsx` | `TrailingChordSlot`, `ChordBarsLine`, pass-through props |
| `src/components/lyrics/JyutpingAnnotation.jsx` | Click-to-edit, `isTrailing` spacer support |

### State in AppContext

```js
chordEditMode: false,       // toggles TOGGLE_CHORD_EDIT
chordDisplay: "bars",       // SET_CHORD_DISPLAY — "above" | "bars"
```

### mergeChords (chordStorage.js)

Runs on every render in `LyricsDisplay` via `useMemo`. Produces a new `lines` array with chord fields overlaid from the user's chord map. Trailing chords (index >= token count) are appended as `{ char: " ", isTrailing: true, chord }` tokens.

## UX Flow

1. User clicks **♫ chords** button in the lyrics toolbar → enters chord edit mode
2. Every non-whitespace character gets a hover ring (cursor-pointer)
3. Clicking a character opens `ChordPopover` — focused text input + quick-pick pills of chords used elsewhere in the song
4. Enter confirms, Escape cancels, empty submit deletes the chord
5. A **"+" dashed button** appears after the last character of every line for trailing chords
6. Chord edit mode OFF → chords display in the chosen mode (above/bars)

## Display Modes

### "above" mode
Chords render directly above their character via `JyutpingAnnotation` (existing amber monospace label).

### "bars" mode (default)
A `ChordBarsLine` component renders above each lyric line:
```
|Cadd9 |Bm7b5 |E7 |Am7 |
```
Character-level chord labels are hidden in this mode. The bar notation shows all chords for the line in sequence.

## Known Limitations / Next Steps

- **No beat assignment** — chords are attached to characters, not beats. The bar display doesn't show which beat each chord falls on.
- **No rhythm notation** — no way to specify half-bar chords, quarter-note chords, anticipations, etc.
- **No time signature** — assumed 4/4 throughout
- **No transposition** — chord labels are stored as-is, no key-change logic
- See `leadsheet-formatting-research.md` for the planned beat-grid upgrade
