# Chord Integration Guide — 緊急聯絡人

## Overview

The chord data for "緊急聯絡人" by Gareth.T is now structured and ready to integrate. This guide explains how to load and use it.

---

## File Structure

```
src/data/songs/
├── index.js                      ← Loads all curated songs
├── jinyulianheren-chords.js      ← Chord data (this song)
```

**Key: A | Capo: 1** (Beginner-friendly version)
- **Original Key:** Bb
- **Tempo:** 70 BPM
- **Time Signature:** 4/4

---

## How to Use

### Option A: Auto-Load Chords on Song Search
When user searches for "緊急聯絡人", automatically initialize chords:

```javascript
import { initializeCuratedSongData } from "@/data/songs/index.js";

// In your song loader (e.g., loadCatalogSong or loadLrclibSong)
if (songTitle === "緊急聯絡人" && songArtist === "Gareth.T") {
  initializeCuratedSongData("jinyulianheren");
  // Chords now saved to localStorage: chords:lrclib:jinyulianheren
}
```

### Option B: Manual Import (Testing)
```javascript
import { JINYULIANHEREN_CHORDS } from "@/data/songs/jinyulianheren-chords.js";

console.log(JINYULIANHEREN_CHORDS.lines[0]);
// Output: { lyric: "傳來法語...", chords: "Emaj7 | G#m C#m" }

// Save to localStorage
localStorage.setItem(
  "chords:lrclib:jinyulianheren",
  JSON.stringify(JINYULIANHEREN_CHORDS.lines.reduce((acc, line, i) => {
    acc[i] = line.chords;
    return acc;
  }, {}))
);
```

### Option C: Display in ChordSheet Component
The existing `ChordSheet.jsx` component reads chords from localStorage keyed by line index:

```javascript
// Component automatically loads: chords:{storageId}
const storageId = "lrclib:jinyulianheren";
const chordsMap = JSON.parse(localStorage.getItem(`chords:${storageId}`) || "{}");
// chordsMap[0] = "Emaj7 | G#m C#m"
// chordsMap[1] = "Amaj7 | C#m"
// ... etc
```

---

## Data Format

Each line maps to its chord progression:

```javascript
{
  lyric: "傳來法語 問你 是我的家屬吧",
  chords: "Emaj7 | G#m C#m"  // Chord symbols separated by |
}
```

**Chord Format:**
- `|` = bar separator
- `Emaj7`, `G#m`, etc. = standard chord symbols
- Multiple chords on same line = played in sequence

---

## Key Variations

If you want to support different keys/capos:

| Key | Capo | Difficulty | Use Case |
|-----|------|------------|----------|
| A   | 1    | Easy       | Recommended (current) |
| Bb  | 0    | Advanced   | Original recording |
| F   | 0    | Intermediate | Alternative |

To add another key, duplicate the `lines` array and transpose all chord symbols.

---

## Integration Checklist

- [x] Chord data file created (`jinyulianheren-chords.js`)
- [x] Index/loader module created (`songs/index.js`)
- [ ] Hook into `loadCatalogSong` or `loadLrclibSong` to auto-initialize
- [ ] Test chord display in `ChordSheet` component
- [ ] (Optional) Add UI to switch between key variations

---

## Testing

### Manual Test (Browser Console)
```javascript
// Test import
import { initializeCuratedSongData } from "@/data/songs/index.js";
initializeCuratedSongData("jinyulianheren");

// Check localStorage
JSON.parse(localStorage.getItem("chords:lrclib:jinyulianheren"));
// Should show: { "0": "Emaj7 | G#m C#m", "1": "Amaj7 | C#m", ... }
```

### UI Test
1. Search for "緊急聯絡人"
2. Click song
3. Navigate to Chords tab
4. Verify chords display above/below lyrics

---

## Adding More Songs

To add chords for another song:

1. Create `src/data/songs/{song-key}-chords.js`
2. Export `{SONG_KEY}_CHORDS` object matching the template
3. Add to `CURATED_SONGS` in `songs/index.js`
4. Call `initializeCuratedSongData()` when song loads

Template:
```javascript
export const NEWSONG_CHORDS = {
  metadata: { title, artist, key, capo, ... },
  intro: [...],
  lines: [
    { lyric: "...", chords: "..." },
    ...
  ],
  sections: { ... },
};
```

---

## Notes

- Chords are stored in **localStorage**, not in version control
- Users can edit chords in the UI; edits override the loaded data
- The `saveChordsToStorage()` function is a one-time initialization
- For offline PWA use, chords persist in service worker cache
