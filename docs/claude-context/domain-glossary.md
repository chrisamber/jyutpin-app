# Domain Glossary

## Key Domain Concepts

- **Jyutping**: Standard romanization for Cantonese. Format: initial + final + tone number (1-6).
- **Tone numbers**: 1 (high level), 2 (high rising), 3 (mid level), 4 (low falling), 5 (low rising), 6 (low level).
- **Danger zones**: Pronunciation pitfalls where incorrect tone produces a different word (demo song only).
- **LRCLIB**: Free lyrics API at lrclib.net - no auth needed, CORS-friendly, returns plain + synced lyrics.
- **to-jyutping**: NPM package for Chinese to Jyutping conversion (~2MB dict, lazy-loaded). Covers ~99% of Cantonese vocabulary.
- **storageId**: Unique key per song for all localStorage namespacing. demo | lrclib:{id} | custom:{id}.

## Danger Zones (detail)


**Data shape** (from defaultSong.js → SONG_LINES[i].dangers):

    {
      word: "望",        // the Chinese character that is the danger word
      jyutping: "mong6",  // the correct Jyutping
      tone: 6,              // the critical tone number
      note: "Low level - must stay flat. If you rise, it sounds like 忘 (mong4)."
    }

**User-visible behavior**: In the study view Danger Zones tab, demo song users see all annotated danger words ranked 1-8. Ranks 1-3 (望, 背脊, 情) are highlighted in a red panel as the highest-stakes words. Each entry shows: Chinese character, Jyutping, tone number, and a plain-English note explaining the pitfall.

Auto-detected songs (non-demo) use detectPronunciationNotes() in pronunciationNotes.js instead - a lighter heuristic pass that flags entering tones, ng- onsets, and tone-2/5 confusions without hand-written notes.

**Example** (line 1 of the demo song):
> 望 (mong6, T6) - if raised to T4, it becomes 忘 (mong4, forget) instead of gaze. Both appear in the song; the tonal contrast is the emotional axis.

## Tone-to-Colour Mapping

Each tone number maps to a named colour. Used in JyutpingAnnotation.jsx to colour-code romanization, and in ToneBadge.jsx for syllable badges.


| Tone | Name | Contour | Hex (light theme) |
|---|---|---|---|
| 1 | High Level | flat high | #DC2626 (red) |
| 2 | High Rising | rising | #C2410C (orange, 4.5:1 AA) |
| 3 | Mid Level | flat mid | #B45309 (amber, 4.5:1 AA) |
| 4 | Low Falling | falling | #15803D (green, 4.5:1 AA) |
| 5 | Low Rising | low rising | #2563EB (blue) |
| 6 | Low Level | flat low | #9333EA (purple) |

T2/T3/T4 tokens were darkened in Sprint 2 to meet WCAG AA 4.5:1 contrast on white. The contour symbols (↗, ↘, -) appear in the tone filter UI.

## PWA

The app is a Progressive Web App named 華譜 WaaPou, registered via vite-plugin-pwa with autoUpdate. The manifest and icons are configured in vite.config.js. See [pwa-support.md](pwa-support.md) for install quirks, offline scope, and service-worker update behavior.
