---
title: Schema Reference
topic: schema
tags: [schema, json, typescript, data-model, reference]
audience: [ai-agent, developer]
related: [07-postgres-recipes.md, 08-ingestion-pipeline.md, 13-glossary.md]
---

# Schema Reference

Canonical JSON shape for a chord-annotated song in amber-chords. Every persisted song, every API response, and every ingestion output conforms to this schema. TypeScript types are published as `@amberaudio/chord-schema`; this document is the normative spec that package tracks.

## Top-level shape

```json
{
  "schemaVersion": "1.0.0",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Autumn Leaves",
  "artist": "Joseph Kosma",
  "key": "C",
  "mode": "major",
  "tempo": 120,
  "timeSig": [4, 4],
  "sections": [
    { "name": "verse", "startBar": 1, "endBar": 8 }
  ],
  "bars": [
    {
      "index": 0,
      "beats": [
        { "beat": 1, "abs": "Dm7",   "rn": "ii7" },
        { "beat": 2, "abs": ".",     "rn": "." },
        { "beat": 3, "abs": "G7",    "rn": "V7" },
        { "beat": 4, "abs": ".",     "rn": "." }
      ]
    }
  ],
  "derived": {
    "absSequence":     ["Dm7", "G7", "Cmaj7"],
    "rnSequence":      ["ii7", "V7", "Imaj7"],
    "chordVocab":      ["Cmaj7", "Dm7", "G7"],
    "uniqueRomanSet":  ["Imaj7", "V7", "ii7"]
  },
  "sourceMusicxmlUrl": "https://blob.vercel-storage.com/songs/abc123.musicxml",
  "sourceSha256": "abc123def456...",
  "ingestedAt": "2026-04-18T10:00:00Z"
}
```

## Field semantics

| Field | Type | Required | Notes |
|---|---|---|---|
| `schemaVersion` | `string` (semver) | yes | Currently `1.0.0`. Bump major on breaking shape change. |
| `id` | `uuid` | yes | Stable identifier, assigned at ingest. |
| `title` | `string` | yes | Raw from MusicXML `<work-title>`. |
| `artist` | `string` | yes | Raw from MusicXML `<creator type="composer">`. |
| `key` | `string` | yes | Tonic pitch class, e.g. `"C"`, `"F#"`, `"Bb"`. |
| `mode` | `"major" \| "minor"` | yes | Derived by `music21.analyze('key')`. |
| `tempo` | `integer \| null` | no | BPM from first `<sound tempo>` or null. |
| `timeSig` | `[num, den]` | yes | `[4, 4]` default when absent in source. |
| `sections` | `Section[]` | no | Optional; empty array if source lacks rehearsal marks. |
| `bars` | `Bar[]` | yes | Ordered, 0-indexed. |
| `derived` | `Derived` | yes | Precomputed query helpers. See below. |
| `sourceMusicxmlUrl` | `string` | yes | Vercel Blob URL of the original MusicXML. |
| `sourceSha256` | `string` | yes | SHA-256 of the raw MusicXML bytes. Idempotency key. |
| `ingestedAt` | `ISO-8601` | yes | UTC timestamp. |

### Bar / beat

A `Bar` has `index` (0-based) and a fixed-length `beats` array matching `timeSig[0]`. Each beat carries:

- `abs` — absolute chord symbol (`"Cmaj7"`, `"Dm7"`, `"F#m7b5"`), or the sentinel `"."` (sustain previous beat) or `"-"` (rest / N.C.).
- `rn` — Roman numeral figure from `music21.roman.romanNumeralFromChord` (`"ii7"`, `"V7"`, `"Imaj7"`, `"bVII"`). Parallel to `abs`: `"."` sustains, `"-"` rests.

Beat count is enforced by the schema. A 3/4 bar has exactly three beat entries. Sub-beat chord changes are not yet modeled in v1.0.

## Derived arrays — exact computation rules

The `derived` block is computed deterministically from `bars` at ingest time. Consumers MUST NOT rely on the database to recompute; whoever writes the row owns derivation.

### `absSequence`
Flat ordered array of chord **attacks only**. Walk bars in order, walk each bar's beats in order, and emit `beat.abs` **iff** `beat.abs !== "." && beat.abs !== "-"`. Preserves attack order across bar boundaries.

### `rnSequence`
Parallel to `absSequence` — same indices, same length. For each emitted `abs`, emit its sibling `rn`. Guaranteed: `absSequence.length === rnSequence.length`.

### `chordVocab`
`Array.from(new Set(absSequence)).sort()`. Deduplicated, lexicographically sorted. Sort is ASCII/Unicode; e.g. `"Cmaj7" < "Dm7" < "F#7" < "G7"`.

### `uniqueRomanSet`
`Array.from(new Set(rnSequence)).sort()`. Deduplicated, lexicographically sorted.

Both `chordVocab` and `uniqueRomanSet` are indexed via GIN in Postgres; the sort order is stable but not semantically meaningful — it exists only to make equality/diff comparisons deterministic.

## Worked example

Four-bar progression in C major, one chord per bar (held full bar): `Dm7 | G7 | Cmaj7 | Cmaj7`.

```json
{
  "schemaVersion": "1.0.0",
  "id": "11111111-2222-3333-4444-555555555555",
  "title": "Example ii-V-I",
  "artist": "Demo",
  "key": "C",
  "mode": "major",
  "tempo": null,
  "timeSig": [4, 4],
  "sections": [],
  "bars": [
    { "index": 0, "beats": [
      { "beat": 1, "abs": "Dm7",   "rn": "ii7" },
      { "beat": 2, "abs": ".",     "rn": "." },
      { "beat": 3, "abs": ".",     "rn": "." },
      { "beat": 4, "abs": ".",     "rn": "." }
    ]},
    { "index": 1, "beats": [
      { "beat": 1, "abs": "G7",    "rn": "V7" },
      { "beat": 2, "abs": ".",     "rn": "." },
      { "beat": 3, "abs": ".",     "rn": "." },
      { "beat": 4, "abs": ".",     "rn": "." }
    ]},
    { "index": 2, "beats": [
      { "beat": 1, "abs": "Cmaj7", "rn": "Imaj7" },
      { "beat": 2, "abs": ".",     "rn": "." },
      { "beat": 3, "abs": ".",     "rn": "." },
      { "beat": 4, "abs": ".",     "rn": "." }
    ]},
    { "index": 3, "beats": [
      { "beat": 1, "abs": "Cmaj7", "rn": "Imaj7" },
      { "beat": 2, "abs": ".",     "rn": "." },
      { "beat": 3, "abs": ".",     "rn": "." },
      { "beat": 4, "abs": ".",     "rn": "." }
    ]}
  ],
  "derived": {
    "absSequence":    ["Dm7", "G7", "Cmaj7", "Cmaj7"],
    "rnSequence":     ["ii7", "V7", "Imaj7", "Imaj7"],
    "chordVocab":     ["Cmaj7", "Dm7", "G7"],
    "uniqueRomanSet": ["Imaj7", "V7", "ii7"]
  },
  "sourceMusicxmlUrl": "https://blob.vercel-storage.com/songs/deadbeef.musicxml",
  "sourceSha256": "deadbeef...",
  "ingestedAt": "2026-04-18T10:00:00Z"
}
```

Walk-through:

1. **absSequence** — bar 0 beat 1 emits `Dm7`; beats 2-4 are `.` (skip). Bar 1 beat 1 emits `G7`. Bar 2 beat 1 emits `Cmaj7`. Bar 3 beat 1 emits `Cmaj7` (even though it's the same chord as the previous bar, it is a fresh attack). Result: `["Dm7", "G7", "Cmaj7", "Cmaj7"]`.
2. **rnSequence** — parallel: `["ii7", "V7", "Imaj7", "Imaj7"]`.
3. **chordVocab** — `new Set(absSequence)` → `{Dm7, G7, Cmaj7}`; sorted → `["Cmaj7", "Dm7", "G7"]`.
4. **uniqueRomanSet** — `new Set(rnSequence)` → `{ii7, V7, Imaj7}`; sorted → `["Imaj7", "V7", "ii7"]`.

## TypeScript types

Types are published as [`@amberaudio/chord-schema`](https://www.npmjs.com/package/@amberaudio/chord-schema). The package also ships the JSON Schema used by AJV validation in the ingestion pipeline.

```typescript
import type {
  ChordSong,
  Bar,
  Beat,
  Derived,
  Section,
} from "@amberaudio/chord-schema";

import { chordSongSchema, isChordSong } from "@amberaudio/chord-schema";

const raw: unknown = await fetch("/api/songs/abc").then(r => r.json());
if (!isChordSong(raw)) throw new Error("invalid schema");

const song: ChordSong = raw;
const iiVIs: number = song.derived.rnSequence
  .join(" ")
  .match(/ii7 V7 Imaj7/g)?.length ?? 0;
```

For runtime validation elsewhere (e.g. API route handlers):

```typescript
import Ajv from "ajv";
import { chordSongSchema } from "@amberaudio/chord-schema";

const ajv = new Ajv({ strict: true });
const validate = ajv.compile(chordSongSchema);
if (!validate(payload)) throw new Error(ajv.errorsText(validate.errors));
```

## Versioning rules

- Any change that removes a field, renames a field, or alters a sentinel (`.` / `-`) → major bump.
- Adding a new optional top-level field → minor bump. Consumers pin on major.
- `schemaVersion` is persisted on every row so migrations can target specific versions.

## See also

- [Postgres Recipes](./07-postgres-recipes.md) — how the derived arrays are queried.
- [Ingestion Pipeline](./08-ingestion-pipeline.md) — how a song reaches this shape.
- [Glossary](./13-glossary.md) — terminology: Roman numerals, figured bass, key analysis.
