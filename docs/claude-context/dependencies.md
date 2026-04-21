# Key Dependencies & Stub Points

## Key dependencies

- `to-jyutping` — Chinese → Jyutping (~2MB dict, lazy-loaded on first analysis)
- `pinyin-pro` — Mandarin pinyin lookup (used by `mandarin.js`)
- `jspdf` + `html2canvas` — PDF export (`pdfExport.js`)
- `vite-plugin-pwa` — PWA service worker and manifest

## Stub points for future expansion

- **YouTube**: `src/services/youtube.js` and `src/components/youtube/YouTubePlayer.jsx` — needs `VITE_YOUTUBE_API_KEY`
- **TTS**: `src/services/tts.js` — needs `VITE_GOOGLE_TTS_API_KEY`; Cantonese yue-HK voice
- **Chord beat-grid editor**: `chordStorage.js` new format is defined; `ChordBarsLine` in `LyricsLine.jsx` renders it; `handleChordEdit` in `LyricsDisplay.jsx` already writes new-format bar grid data. Missing: beat-selector UI component in `ChordPopover` for full bar notation editing.
 - `ChordDiagram.jsx` — renders a guitar chord diagram SVG from CHORD_SHAPES data
 - `ChordSheet.jsx` — full chord sheet view showing all chords used in a song
- **Additional lyrics sources**: `src/services/lyrics/` — add `netease.js`, `musixmatch.js` and register them in `index.js` fallback chain
- **KKBox metadata**: `src/services/metadata.js` — not yet created

