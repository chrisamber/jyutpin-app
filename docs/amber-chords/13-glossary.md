---
title: Glossary
topic: reference
tags: [glossary, terminology, reference]
audience: [ai-agent, developer]
related: [01-music-theory-primer.md, 02-chord-vocabulary.md]
---

# Glossary

Alphabetical reference for terms used across the `amber-chords` corpus, ingestion pipeline, and API. Music-theory and engineering terms are interleaved. Definitions are one-sentence; follow cross-refs for depth.

## A

- **Absolute chord** — A chord named by pitch (e.g. `G7`), independent of key; contrast with [Roman numeral](#r).
- **Added tone** — A non-chord tone added without implying seventh-chord stacking (e.g. `Cadd9`, `C6`).
- **Applied chord** — A chord that tonicizes a non-tonic scale degree; synonym for [secondary dominant](#s) when the applied quality is dominant.
- **Augmented** — Triad with major third and raised fifth (`Caug` = C–E–G#).
- **Augmented sixth** — Pre-dominant chromatic chord family (Italian, French, German) resolving outward to the dominant.

## B

- **Bar grid** — Ingestion output: per-bar array of beat-indexed chord tokens; see [tokenization](#t).
- **Beat grid** — Generic term for time-quantized chord placement; amber-chords defaults to 4 beats/bar in 4/4.
- **Borrowed chord** — Diatonic chord from the parallel key (e.g. `bVI` in major borrowed from minor); see [modal interchange](#m).

## C

- **Cadence** — Harmonic closing gesture (authentic V–I, plagal IV–I, deceptive V–vi, half …–V).
- **ChordPro** — Plain-text leadsheet format with inline `[chord]` tokens above lyrics; one of the ingestion input formats.
- **Chord quality** — The interval stack defining a chord's sound (maj, min, dim, aug, dom7, etc.).
- **Circle of fifths** — Cyclic arrangement of keys by perfect fifth; drives key-signature spelling rules.
- **Corpus** — The full amber-chords song dataset as stored in [Postgres](#p) [JSONB](#j).

## D

- **Diatonic** — Belonging to the current key's seven-note scale; contrast with chromatic.
- **Diminished** — Triad with minor third and lowered fifth (`Cdim` = C–Eb–Gb).
- **Dominant** — Scale degree 5 or the V chord; pulls toward [tonic](#t).
- **Drizzle (ORM)** — TypeScript-first SQL ORM used by the Next.js API layer.

## E

- **Enharmonic** — Same pitch, different spelling (`F#` ≡ `Gb`); corpus prefers key-consistent spelling.
- **Extension** — Chord tone above the seventh (9, 11, 13); see [02-chord-vocabulary.md](02-chord-vocabulary.md).

## F

- **Fully diminished seventh** — `o7` chord: stacked minor thirds (`Cdim7` = C–Eb–Gb–Bbb).
- **Functional harmony** — Analysis framework classifying chords by role (tonic / subdominant / dominant).

## G

- **GIN index** — Postgres generalized inverted index; used on [JSONB](#j) columns for chord-progression queries.

## H

- **Half-diminished** — `ø7` / `m7b5` chord (`Cm7b5` = C–Eb–Gb–Bb); natural vii° in minor.
- **HookTheory** — Public chord-progression dataset and API; amber-chords' vocabulary is HookTheory-compatible.

## I

- **Ingestion** — Pipeline converting Sibelius → MusicXML → music21 → Postgres JSONB rows.
- **Inversion** — Chord with non-root bass: root / 1st (third in bass) / 2nd (fifth in bass) / 3rd (seventh in bass).
- **Ionian** — The major mode; see [01-music-theory-primer.md](01-music-theory-primer.md).

## J

- **JSONB** — Postgres binary JSON type storing the per-song bar grid and metadata.
- **Jyutping** — Cantonese romanization standard; consumed by the downstream jyutpin-app client.

## K

- **Key signature** — Sharp/flat set defining a key's diatonic collection; drives root spelling.

## L

- **Leadsheet** — Single-staff score with melody + chord symbols + lyrics; primary output format.
- **Locrian** — Mode on scale degree 7; diminished tonic triad, rarely tonicized.

## M

- **MusicXML** — XML score interchange format; amber-chords' canonical ingestion input.
- **music21** — MIT Python library for computational musicology; performs XML parsing and chord analysis.
- **Modal interchange** — Use of chords from a parallel mode; see [borrowed chord](#b).

## N

- **N.C.** — "No chord" token; silence/rest in the chord stream. See [tokenization](#t).
- **Neapolitan** — `bII` chord (`Db` in C major/minor), typically in first inversion (`bII6`).

## P

- **Parquet** — Columnar file format; amber-chords exports ML training snapshots as Parquet.
- **Passing chord** — Non-functional chord bridging two diatonic chords by stepwise motion.
- **Postgres** — Primary database; stores corpus in [JSONB](#j) with [GIN](#g) indexes.

## Q

- **Quality** — See [chord quality](#c).

## R

- **Roman numeral** — Key-relative chord label (`I`, `ii`, `V7`, `bVI`); enables transposition-invariant analysis.
- **Root** — Chord's defining pitch, named before the quality suffix.

## S

- **Secondary dominant** — `V/x` chord: dominant of a non-tonic degree (e.g. `V/V` = `D7` in C major).
- **SemVer** — Semantic versioning; corpus schema and API versions follow MAJOR.MINOR.PATCH.
- **Sibelius** — Avid's notation software; source of primary score input via MusicXML export.
- **Slash chord** — Chord with specified non-root bass written `Chord/Bass` (e.g. `C/E`).
- **Subdominant** — Scale degree 4 or IV chord; pre-dominant function.
- **Suspension** — Non-chord tone held from prior chord resolving stepwise (sus2 / sus4).

## T

- **Tokenization** — Converting a score into discrete chord symbols on a [beat grid](#b).
- **Tonic** — Scale degree 1 or I chord; harmonic resolution point.
- **Transpose** — Shift all roots by a fixed interval; preserves [Roman numeral](#r) analysis.
- **Triad** — Three-note chord: root + third + fifth.

## V

- **Vercel Blob** — Object storage used for raw MusicXML inputs and exported Parquet snapshots.
- **Voice leading** — Melodic motion of individual chord tones between successive chords.

## See also

- [01-music-theory-primer.md](01-music-theory-primer.md)
- [02-chord-vocabulary.md](02-chord-vocabulary.md)
