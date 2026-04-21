---
title: Roman Numeral Derivation Spec
topic: music-theory
tags: [roman-numerals, harmony, notation, grammar]
audience: [ai-agent, developer]
related: [04-musicxml-reference.md, 05-music21-patterns.md]
---

# Roman Numeral Derivation Spec

Canonical grammar for Roman numerals used in the `amber-chords` corpus. Every chord symbol ingested from MusicXML is reduced to a Roman numeral token relative to a key. This document defines the token set, the case conventions, the ambiguity resolution rules, and the worked examples the parser is tested against.

## 1. Case conventions

Case encodes triad quality. Never deviate.

| Quality | Rendering | Examples |
|---|---|---|
| Major triad | UPPERCASE | `I`, `IV`, `V`, `bVII` |
| Minor triad | lowercase | `ii`, `iii`, `vi`, `iv` |
| Diminished | lowercase + `°` | `vii°`, `ii°` |
| Augmented | UPPERCASE + `+` | `III+`, `V+` |
| Half-diminished | lowercase + `ø` | `iiø7`, `viiø7` |

`°` (U+00B0) and `ø` (U+00F8) are the canonical glyphs. ASCII fallbacks `dim` and `hd` are accepted on input but normalized to the glyph form on write.

## 2. Quality suffixes

Suffixes follow the numeral directly, no spaces. Order: seventh → extension → suspension → addition.

| Suffix | Meaning |
|---|---|
| `7` | Minor seventh above root (dominant seventh when the root triad is major) |
| `maj7` / `M7` | Major seventh above root |
| `m7` | Minor triad + minor seventh (redundant with lowercase but allowed for explicitness) |
| `ø7` | Half-diminished seventh (minor triad + dim5 + min7) |
| `°7` | Fully-diminished seventh (dim triad + dim7) |
| `9`, `11`, `13` | Extensions; imply a seventh below |
| `sus4`, `sus2` | Replace the third |
| `add9`, `add11` | Add without implying a seventh |
| `no3`, `no5` | Explicit omission |

Examples: `V7`, `Imaj7`, `ii7`, `viiø7`, `V13`, `Isus4`, `IVadd9`, `vii°7`.

## 3. Accidentals on the numeral

Flats and sharps in front of the numeral denote chromatic root degrees relative to the major-mode diatonic collection of the tonic key.

- `bII`, `bIII`, `bVI`, `bVII` — flatted scale degrees (borrowed or Neapolitan)
- `#iv°`, `#vii°` — raised scale degrees (common leading-tone-of functions)

The tonic is always 1 (no accidental). Use lowercase `b` and `#`; parser also accepts `♭` and `♯` on input.

## 4. Secondary dominants and applied chords

Slash notation denotes a chord whose function is relative to a non-tonic scale degree.

- `V/V` — the dominant of the dominant. In C major: `D` (D major triad).
- `V7/ii` — dominant seventh of the supertonic. In C major: `A7` (resolves to Dm).
- `vii°/V` — leading-tone diminished of V. In C major: `F#°`.
- `ii/V` — supertonic of V, typically preparing the secondary dominant. In C major: `Am` (functioning as `ii` in the key of G).

Rule: **resolve to the degree on the right side of the slash**. The denominator is always a scale-degree Roman numeral in the tonic key. The numerator is the local function within that denominator's implied key.

Applied chords chain: `V7/V/V` is possible but rare; the parser supports up to two slashes.

## 5. Borrowed / modal interchange (major key)

When the tonic is major but the chord belongs to the parallel minor (or another mode), the chord is labeled with its flatted-degree name:

- `bVII` — subtonic major (from mixolydian). In C major: `Bb`.
- `iv` — minor subdominant (from minor). In C major: `Fm`.
- `bVI` — flat submediant (from minor). In C major: `Ab`.
- `bIII` — flat mediant (from minor). In C major: `Eb`.
- `bII` — Neapolitan (see §6).
- `v` — minor dominant (from minor or dorian). In C major: `Gm`. Rare; usually re-analyzed as modulation.

In minor keys the natural-minor diatonic set is the default; borrowings from major are labeled `#VI`, `#VII`, `III` (raised mediant), etc.

## 6. Neapolitan

`bII` is the Neapolitan. Traditionally appears in first inversion and is often labeled `N6`. The corpus uses:

- `bII` — root position
- `N6` — first inversion (canonical voicing)
- `bII6` — equivalent to `N6`, accepted on input, normalized to `N6`

Inversion figures use Arabic numerals (`6`, `64`, `65`, `43`, `42`, `7`).

## 7. Augmented sixths

Three standard types. The numeral is replaced by a two-letter code; no slash, no case variation.

- `It6` — Italian sixth (root, M3, A6 above the flat submediant)
- `Fr6` — French sixth (adds A4)
- `Gr6` — German sixth (adds P5; enharmonically a dominant seventh)

These resolve to V (or `I64` → V). The parser does not attempt to re-spell `Gr6` as `bVI7` even when the MusicXML spelling matches a dominant seventh — it relies on the resolution target.

## 8. Ambiguity resolution rules

When a chord admits multiple Roman interpretations in a given key context, apply these rules **in order**. Stop at the first that fires.

1. **Diatonic-fit wins.** If the chord's pitch-class set is a subset of the key's diatonic collection (major scale for major keys, natural minor for minor keys), use the diatonic reading. Example: in C major, `Dm` is always `ii`, never `iv/vi`.
2. **Secondary dominant when dominant quality + descending-fifth resolution.** If the chord has dominant quality (major triad, optionally with minor seventh) and the following chord's root is a perfect fifth below (or perfect fourth above), label as `V` or `V7` of the following chord's degree. Example: `A7 → Dm` in C major becomes `V7/ii ii`.
3. **Modal borrowing when parallel-mode fit + no resolution.** If neither rule 1 nor rule 2 applies, check if the chord belongs to the parallel mode's diatonic collection. If yes, label with the borrowed-degree name (`bVII`, `iv`, `bVI`, `bIII`). Example: `Fm` in C major after `F` is `iv` (modal mixture), not `i/iv`.
4. **Simplest label wins.** If multiple interpretations remain viable, prefer the one with the fewest accidentals and no slash. Break further ties by preferring major-key diatonic over minor-key diatonic, and root position over inversion.

When all four rules fail to pick a unique label (rare; usually fully chromatic passages), emit `?` as the Roman numeral and flag the chord for review. The ingestion pipeline persists the raw MusicXML chord symbol alongside, so manual re-analysis is non-destructive.

## 9. Worked examples

### 9a. C major diatonic cadence

Chords: `C Am Dm G7 C`
Roman: `I vi ii V7 I`

All five chords fit the C-major diatonic collection. Rule 1 fires on each.

### 9b. C major with a secondary dominant

Chords: `C A7 Dm G7 C`
Roman: `I V7/ii ii V7 I`

`A7` is not diatonic in C (has `C#`). Rule 1 fails. `A7` is dominant quality and `Dm` is a perfect fifth below `A`, so rule 2 fires: `V7/ii`.

### 9c. C major with modal mixture

Chords: `C Ab F Fm C`
Roman: `I bVI IV iv I`

`Ab` is not in C major; rule 1 fails. `Ab` is a major triad but the next chord `F` is a third below, not a fifth — rule 2 fails. `Ab` belongs to C natural minor — rule 3 fires: `bVI`.

`Fm` similarly fails rules 1 and 2 (no fifth resolution to `Bb` follows), and belongs to C minor — rule 3 fires: `iv`.

### 9d. A minor diatonic cadence

Chords: `Am Dm E7 Am`
Roman: `i iv V7 i`

Minor-key context. The `E7` has `G#`, which is outside natural minor but is the standard raised leading tone in harmonic minor — the parser treats harmonic minor as part of the minor-key diatonic collection for rule 1 purposes. `V7` is thus diatonic.

### 9e. Enharmonic edge case

Chords (MusicXML spelling): `C Eb7 Ab C`
Candidate interpretations in C major:
- `I bIII7 bVI I` (borrowed chain)
- `I Gr6/V? ...` (rejected — `Eb7` does not resolve to V)

Rule 1 fails (`Eb7` has `Eb`, `G`, `Bb`, `Db` — three non-diatonic pitches). Rule 2 tests dominant-fifth: `Eb7 → Ab` is a descending fifth and `Eb7` has dominant quality → fires. Result: `I V7/bVI bVI I`.

If the composer had spelled the same chord as `D#7`, the parser still normalizes by pitch class, not spelling, and produces the same Roman numeral. Spelling affects display fallback only, not function assignment.

## See also

- [04-musicxml-reference.md](./04-musicxml-reference.md) — source format for chord symbols
- [05-music21-patterns.md](./05-music21-patterns.md) — Python APIs used to derive these Roman numerals
