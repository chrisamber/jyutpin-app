---
title: Music Theory Primer
topic: music-theory
tags: [theory, chords, modes, harmony, reference]
audience: [ai-agent, developer]
related: [02-chord-vocabulary.md, 13-glossary.md]
---

# Music Theory Primer

Terse reference for the harmonic concepts the `amber-chords` corpus encodes. Assumes familiarity with terms in the [glossary](13-glossary.md). Pitch spelling follows key-signature convention unless stated otherwise.

## 1. Chord Qualities

Interval stacks from the root. `R` = root, `M` = major, `m` = minor, `P` = perfect, `A` = augmented, `d` = diminished.

| Symbol | Name | Intervals | Pitches (on C) |
|---|---|---|---|
| `C` | Major triad | R M3 P5 | C E G |
| `Cm` | Minor triad | R m3 P5 | C Eb G |
| `Cdim` | Diminished triad | R m3 d5 | C Eb Gb |
| `Caug` | Augmented triad | R M3 A5 | C E G# |
| `Csus2` | Suspended 2 | R M2 P5 | C D G |
| `Csus4` | Suspended 4 | R P4 P5 | C F G |
| `Cmaj7` | Major 7 | R M3 P5 M7 | C E G B |
| `Cm7` | Minor 7 | R m3 P5 m7 | C Eb G Bb |
| `C7` | Dominant 7 | R M3 P5 m7 | C E G Bb |
| `Cm7b5` (`Cø7`) | Half-diminished | R m3 d5 m7 | C Eb Gb Bb |
| `Cdim7` (`Co7`) | Fully diminished | R m3 d5 d7 | C Eb Gb Bbb |
| `CmM7` | Minor-major 7 | R m3 P5 M7 | C Eb G B |
| `Cadd9` | Added 9 | R M3 P5 M9 | C E G D |
| `Cadd11` | Added 11 | R M3 P5 P11 | C E G F |
| `C6` | Major 6 | R M3 P5 M6 | C E G A |
| `Cm6` | Minor 6 | R m3 P5 M6 | C Eb G A |
| `C6/9` | Six-nine | R M3 P5 M6 M9 | C E G A D |
| `C9` | Dominant 9 | R M3 P5 m7 M9 | C E G Bb D |
| `Cmaj9` | Major 9 | R M3 P5 M7 M9 | C E G B D |
| `Cm9` | Minor 9 | R m3 P5 m7 M9 | C Eb G Bb D |
| `C11` | Dominant 11 | R M3 P5 m7 M9 P11 | C E G Bb D F |
| `Cmaj11` | Major 11 | R M3 P5 M7 M9 P11 | C E G B D F |
| `C13` | Dominant 13 | R M3 P5 m7 M9 (P11) M13 | C E G Bb D (F) A |
| `Cm13` | Minor 13 | R m3 P5 m7 M9 (P11) M13 | C Eb G Bb D (F) A |
| `C7b9` | Dominant 7 flat 9 | R M3 P5 m7 m9 | C E G Bb Db |
| `C7#9` | Dominant 7 sharp 9 | R M3 P5 m7 A9 | C E G Bb D# |
| `C7#11` | Dominant 7 sharp 11 | R M3 P5 m7 M9 A11 | C E G Bb D F# |
| `C7b13` | Dominant 7 flat 13 | R M3 P5 m7 m13 | C E G Bb Ab |
| `C7b5` | Dominant 7 flat 5 | R M3 d5 m7 | C E Gb Bb |
| `C7#5` | Dominant 7 sharp 5 | R M3 A5 m7 | C E G# Bb |
| `C7sus4` (`Csus4add7`) | Sus4 dominant | R P4 P5 m7 | C F G Bb |

Parenthesized tones (P11 in C13) are typically omitted to avoid m9 clashes with M3.

## 2. Inversions

Position named by bass degree.

| Position | Bass | Figured bass (triad) | Figured bass (7th) |
|---|---|---|---|
| Root | R | `5/3` | `7` |
| 1st | 3rd | `6/3` → `6` | `6/5` |
| 2nd | 5th | `6/4` | `4/3` |
| 3rd | 7th | — | `4/2` → `2` |

Written as [slash chords](13-glossary.md#s): `C/E` (1st inv.), `C/G` (2nd inv.), `C7/Bb` (3rd inv.).

## 3. Slash Notation

`Chord/Bass`. Bass need not be a chord tone:

- `C/E` — C major, 1st inversion.
- `Am/C` — A minor, 1st inversion.
- `D/F#` — D major, 1st inversion.
- `G/B` — G major, 1st inversion (common passing bass).
- `F/G` — "G11 without 3rd or 5th"; functions as dominant pedal.
- `Bb/C` — upper-structure over C pedal; implies C9sus4-ish.

## 4. Keys and Modes

A **key** specifies a tonic + mode. A **mode** is a rotation of the major scale starting on a different degree. All seven modes of C major use only white keys.

| Mode | Degree | Tonic on C-major parent | Characteristic |
|---|---|---|---|
| Ionian | 1 | C | Major scale; M3, M7 |
| Dorian | 2 | D | Minor with raised 6 |
| Phrygian | 3 | E | Minor with lowered 2 |
| Lydian | 4 | F | Major with raised 4 |
| Mixolydian | 5 | G | Major with lowered 7 |
| Aeolian | 6 | A | Natural minor |
| Locrian | 7 | B | Diminished tonic; m2, d5 |

Modal cadences avoid V–i (which implies Ionian/Aeolian): Dorian leans on i–IV, Mixolydian on I–bVII, Phrygian on i–bII.

## 5. Diatonic Harmony — C Major

Triads and sevenths built on each scale degree.

| Degree | Triad | Seventh | Roman | Function |
|---|---|---|---|---|
| 1 | C | Cmaj7 | I / Imaj7 | Tonic |
| 2 | Dm | Dm7 | ii / ii7 | Subdominant (pre-dominant) |
| 3 | Em | Em7 | iii / iii7 | Tonic substitute |
| 4 | F | Fmaj7 | IV / IVmaj7 | Subdominant |
| 5 | G | G7 | V / V7 | Dominant |
| 6 | Am | Am7 | vi / vi7 | Tonic substitute |
| 7 | Bdim | Bm7b5 | vii° / viiø7 | Dominant substitute |

## 6. Diatonic Harmony — A Minor

Three minor-scale variants. Roman numeral qualities shift per variant; corpus labels the variant in metadata.

### Natural minor (Aeolian)

| Deg | Triad | 7th | Roman |
|---|---|---|---|
| 1 | Am | Am7 | i |
| 2 | Bdim | Bm7b5 | iiø |
| 3 | C | Cmaj7 | bIII |
| 4 | Dm | Dm7 | iv |
| 5 | Em | Em7 | v |
| 6 | F | Fmaj7 | bVI |
| 7 | G | G7 | bVII |

### Harmonic minor (raised 7)

| Deg | Triad | 7th | Roman |
|---|---|---|---|
| 1 | Am | AmM7 | i |
| 2 | Bdim | Bm7b5 | iiø |
| 3 | Caug | Cmaj7#5 | bIII+ |
| 4 | Dm | Dm7 | iv |
| 5 | E | E7 | V |
| 6 | F | Fmaj7 | bVI |
| 7 | G#dim | G#dim7 | vii° |

### Melodic minor (ascending: raised 6 and 7)

| Deg | Triad | 7th | Roman |
|---|---|---|---|
| 1 | Am | AmM7 | i |
| 2 | Bm | Bm7 | ii |
| 3 | Caug | Cmaj7#5 | bIII+ |
| 4 | D | D7 | IV |
| 5 | E | E7 | V |
| 6 | F#dim | F#m7b5 | viø |
| 7 | G#dim | G#m7b5 | viiø |

In practice pop/rock corpora use a mixed-minor palette: i, iv, v (or V), bVI, bVII, with vii° borrowed from harmonic minor for leading-tone cadences.

## 7. Functional Categories

| Function | Major degrees | Minor degrees |
|---|---|---|
| Tonic (T) | I, iii, vi | i, bIII, bVI |
| Subdominant (S) | ii, IV | iiø, iv |
| Dominant (D) | V, vii° | V, v, bVII, vii° |

Standard progressions: T → S → D → T. Chord substitutions preserve function (vi for I; ii for IV; vii° for V).

## See also

- [02-chord-vocabulary.md](02-chord-vocabulary.md)
- [13-glossary.md](13-glossary.md)
