---
title: Chord Vocabulary
topic: schema
tags: [chords, vocabulary, tokenization, normalization, schema]
audience: [ai-agent, developer]
related: [01-music-theory-primer.md, 13-glossary.md]
---

# Chord Vocabulary

Canonical chord-symbol set for the `amber-chords` corpus. Roughly 200 symbols, HookTheory-compatible, closed over 12 chromatic roots. All ingestion output is normalized to this enum; queries and ML features assume canonical form. See [01-music-theory-primer.md](01-music-theory-primer.md) for interval definitions.

## 1. Symbol Set

Examples shown on root `C`; every entry exists for all 12 roots (`C C# Db D D# Eb E F F# Gb G G# Ab A A# Bb B`).

### 1.1 Triads

```
C       Cm      Cdim    Caug    Csus2   Csus4
```

### 1.2 Sevenths

```
Cmaj7   Cm7     C7      Cm7b5   Cdim7   CmM7
```

### 1.3 Dominant alterations

```
C7b5    C7#5    C7b9    C7#9    C7#11   C7b13
```

### 1.4 Extensions

```
C9      Cmaj9   Cm9
C11     Cmaj11
C13     Cm13
```

### 1.5 Added tones

```
Cadd9   Cadd11   C6   Cm6   C6/9
```

### 1.6 Sus with seventh

```
C7sus4  (canonical)    Csus4add7 (alias → C7sus4)
```

### 1.7 Slash chords

Any symbol above may take a slash bass. Canonical slash set (most frequent in corpus):

```
C/E   C/G   C/B   C/Bb   C/D   C/F
Am/C  Am/E  Am/G
D/F#  D/A   D/C
G/B   G/D   G/F
F/A   F/C   F/E
Em/G  Em/B
```

Any `Chord/Bass` where `Bass` is a natural / sharp / flat is valid. Normalize the `Bass` to key-consistent spelling.

### 1.8 Special tokens

| Token | Meaning |
|---|---|
| `N.C.` | No chord (silence / rest region) |
| `.` | Sustain: repeat prior chord on this beat |
| `-` | Rest: no chord sounding this beat (shorter than `N.C.` region) |

`.` is a beat-grid placeholder only — it never appears in the key of a chord-transition index.

## 2. Normalization Rules

Ingestion maps input variants to canonical form. Left side = accepted alias, right side = canonical.

| Input | Canonical | Rule |
|---|---|---|
| `CM7`, `CΔ`, `CΔ7`, `Cmajor7` | `Cmaj7` | Major seventh |
| `Cmin7`, `C-7`, `Cmi7` | `Cm7` | Minor seventh |
| `Cmin`, `C-`, `Cmi` | `Cm` | Minor triad |
| `Cø`, `Cø7`, `Cm7(b5)`, `Chalfdim` | `Cm7b5` | Half-diminished |
| `C°`, `C°7`, `Cdim7`, `Co7` | `Cdim7` | Fully diminished |
| `C°` (triad only, no 7) | `Cdim` | Diminished triad |
| `C+`, `Caug5`, `C(#5)` | `Caug` | Augmented triad |
| `C△`, `CM` | `Cmaj7` | Treat bare delta as maj7 (HookTheory convention) |
| `Csus`, `Csus4` | `Csus4` | Bare `sus` → sus4 |
| `Csus4add7`, `C7(sus4)` | `C7sus4` | Dominant sus4 |
| `Cmaj7/9`, `Cmaj7(9)` | `Cmaj9` | Collapse (9) into extension name |
| `C(add9)`, `C2` | `Cadd9` | `C2` is ambiguous; corpus treats as add9 |
| `C6add9` | `C6/9` | Canonical 6/9 spelling |
| `C7(b9)` | `C7b9` | Strip parentheses |
| `Cm/maj7`, `Cm(maj7)`, `C-Δ7` | `CmM7` | Minor-major seventh |

### 2.1 Root spelling

Enharmonic roots are context-dependent. Prefer the spelling that matches the piece's key signature.

| Prefer | Over | When |
|---|---|---|
| `Bb` | `A#` | Flat keys, minor-mode subtonic |
| `Eb` | `D#` | Flat keys |
| `Ab` | `G#` | Flat keys |
| `Db` | `C#` | Flat keys, Neapolitan |
| `Gb` | `F#` | Db / Gb major contexts |
| `F#` | `Gb` | Sharp keys, secondary dominants (`D7/F#`) |
| `C#` | `Db` | Sharp keys |

Bass spelling in slash chords follows the same rule: `D/F#` in G major, `Bb/D` in F major.

### 2.2 Case

Root letter uppercase. Quality suffix lowercase except `M7`/`maj7` forms. Slash bass follows root convention.

## 3. Tokenization: Beat Grid

Chords attach to a time-quantized grid, not to characters or note offsets. Default: **4 beats per bar**, **4/4 meter**. Non-4/4 meters store the meter's beat count per bar.

### 3.1 Grid shape

```ts
type Grid = Bar[];
type Bar = Beat[];         // length = meter.beatsPerBar
type Beat = ChordSymbol | "." | "-";
```

`ChordSymbol` triggers a new attack on that beat. `.` sustains the most recent `ChordSymbol`. `-` creates a silent beat (ties do not carry through `-`).

### 3.2 Example: 4-bar progression in C major, 4/4

```json
{
  "meter": { "beatsPerBar": 4, "beatUnit": 4 },
  "grid": [
    ["C",    ".", ".", "."],
    ["Am",   ".", ".", "."],
    ["F",    ".", "G", "."],
    ["C",    ".", "G7", "-"]
  ]
}
```

Rendered: `|C       |Am      |F   G   |C   G7 . |` (last beat rest).

### 3.3 Example: Off-beat attacks

Sixteenth-note subdivisions require subdividing the grid. Default ingestion quantizes to 8th notes when off-beat chords are detected:

```json
{
  "meter": { "beatsPerBar": 4, "beatUnit": 4, "subdivision": 2 },
  "grid": [
    ["C", ".", ".", ".", "F", ".", ".", "."]
  ]
}
```

`subdivision: 2` means 8 slots per bar (8th notes). `subdivision: 4` = 16th notes. Avoid going finer than needed; coarser grids compress better and are faster to query.

### 3.4 Example: 3/4 waltz

```json
{
  "meter": { "beatsPerBar": 3, "beatUnit": 4 },
  "grid": [
    ["G",  ".", "."],
    ["D",  ".", "."],
    ["Em", ".", "."],
    ["C",  "D", "."]
  ]
}
```

### 3.5 Pickup bars

Pickup (anacrusis) stored as a partial bar with leading `-` beats:

```json
["-", "-", "-", "G7"]
```

## 4. Frequency Distribution

_(Populated post-ingestion. Placeholder — to be filled from corpus snapshot.)_

| Rank | Symbol | Count | % of corpus |
|---|---|---|---|
| 1 | `C` | TBD | TBD |
| 2 | `G` | TBD | TBD |
| 3 | `Am` | TBD | TBD |
| 4 | `F` | TBD | TBD |
| ... | ... | ... | ... |

Report also tracks per-key and per-mode distributions, plus bigram / trigram transition counts for ML features.

## 5. Out-of-Vocabulary Handling

Ingestion errors on symbols outside the canonical set after normalization. The pipeline logs the offending score + measure and does **not** silently downgrade. Common causes: custom Sibelius text objects, unicode lookalikes (fake `maj7`), or shorthand from lead-sheet PDFs that bypass MusicXML.

## See also

- [01-music-theory-primer.md](01-music-theory-primer.md)
- [13-glossary.md](13-glossary.md)
