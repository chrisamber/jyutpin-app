---
title: amber-chords Documentation Index
topic: reference
tags: [index, toc, rag, retrieval]
audience: [ai-agent, developer]
related: [01-music-theory-primer.md, 06-schema-reference.md, 08-ingestion-pipeline.md]
---

# amber-chords Documentation Index

Entry point for the `amber-chords` RAG documentation set. Thirteen focused reference files totaling ~14k words, tuned for retrieval by AI coding agents building or extending the chord-corpus product. The master product plan lives one directory up at [../amber-chords-plan.md](../amber-chords-plan.md); this set supplies the foundational knowledge an agent needs to execute it without guessing.

## How to use this set

- **Bulk embed** — ingest all `.md` files plus [docs.json](docs.json) (machine-readable manifest) into your vector store. Chunk on `##` headers.
- **Query patterns** — phrase questions as "how do I X" or "what is Y" for best retrieval. Each file's abstract (first paragraph after H1) is the strongest embedding anchor.
- **Canonical source order** — when two docs disagree, [06-schema-reference.md](06-schema-reference.md) wins for data shape, [03-roman-numeral-spec.md](03-roman-numeral-spec.md) wins for harmonic notation, [../amber-chords-plan.md](../amber-chords-plan.md) wins for product decisions.
- **Do not modify** [../amber-chords-plan.md](../amber-chords-plan.md) from these docs — flag conflicts, don't silently diverge.

## Topic map

| Topic | Files |
|---|---|
| Music theory | [01](01-music-theory-primer.md), [02](02-chord-vocabulary.md), [03](03-roman-numeral-spec.md) |
| Ingestion | [04](04-musicxml-reference.md), [05](05-music21-patterns.md), [08](08-ingestion-pipeline.md), [11](11-testing-fixtures.md) |
| Schema / data model | [02](02-chord-vocabulary.md), [06](06-schema-reference.md) |
| Database | [07](07-postgres-recipes.md) |
| API | [05](05-music21-patterns.md), [09](09-api-examples.md) |
| Operations | [10](10-error-catalog.md) |
| Machine learning | [12](12-ml-dataset-guide.md) |
| Reference | [13](13-glossary.md) |

## Document catalog

### [01-music-theory-primer.md](01-music-theory-primer.md)
Terse reference for chord qualities, inversions, modes, and diatonic harmonization in major and both minors. The verify-my-theory doc, not the teach-me-theory doc.

### [02-chord-vocabulary.md](02-chord-vocabulary.md)
The canonical ~200-symbol chord enum, normalization rules (`Cmaj7 == CM7 == CΔ`), and beat-grid tokenization with `.` sustain / `-` rest conventions.

### [03-roman-numeral-spec.md](03-roman-numeral-spec.md)
Full grammar for Roman numerals: case conventions, quality suffixes, secondary dominants, modal interchange, Neapolitan, augmented sixths, and ambiguity-resolution rules with worked examples.

### [04-musicxml-reference.md](04-musicxml-reference.md)
MusicXML element cheat sheet focused on chord extraction: `<harmony>`, `<kind>` enum, `<root-alter>`, beat alignment via `<divisions>`. Annotated 4-bar ii-V-I example. Sibelius export gotchas.

### [05-music21-patterns.md](05-music21-patterns.md)
Python recipes for the ingestion pipeline. Only the music21 APIs actually used: `converter.parse`, `Score.analyze('key')`, `harmony.ChordSymbol`, `roman.romanNumeralFromChord`. Five complete snippets. Pinned to music21 ≥ 9.1.

### [06-schema-reference.md](06-schema-reference.md)
Canonical JSON schema for a chord-annotated song. Defines every field and the exact computation rule for each derived array (`absSequence`, `rnSequence`, `chordVocab`, `uniqueRomanSet`). Published as `@amberaudio/chord-schema`.

### [07-postgres-recipes.md](07-postgres-recipes.md)
Ten-recipe query cookbook against the `songs` table: progression search with `@>`, GIN indexes, top-N progressions via `LATERAL`, keyset pagination, idempotent upsert, soft delete, and full-text search.

### [08-ingestion-pipeline.md](08-ingestion-pipeline.md)
Ten-stage end-to-end walkthrough from Sibelius export to Postgres upsert, with pseudocode. Idempotent on `sha256(raw_musicxml_bytes)`. Failure routing to `ingest_review_queue`.

### [09-api-examples.md](09-api-examples.md)
Request/response gallery across five genres (jazz, Cantopop, modal, worship, blues). Demonstrates `GET /v1/songs/:id`, `GET /v1/search?progression=`, `POST /v1/songs`, and 400/409 error responses.

### [10-error-catalog.md](10-error-catalog.md)
Every failure code the pipeline emits, grouped by stage (parse, derivation, schema, DB, Blob). Each row: symptom, root cause, recovery playbook, severity.

### [11-testing-fixtures.md](11-testing-fixtures.md)
Catalog of MusicXML test fixtures — simple I-IV-V, secondary dominants, modal interchange, key change, malformed. Each pins an expected JSON sibling for regression testing.

### [12-ml-dataset-guide.md](12-ml-dataset-guide.md)
Parquet export schema, tokenization strategies (chord-change vs beat-level), train/val/test splits, dataset versioning, and three concrete ML experiments (progression completion, style classification, auto-harmonization).

### [13-glossary.md](13-glossary.md)
Alphabetical glossary of ~60 music-theory and engineering terms. One-sentence definitions; cross-linked to deeper docs.

## Suggested retrieval patterns

| If the agent asks… | Top hit should be |
|---|---|
| "how do I derive a Roman numeral for a secondary dominant?" | [03](03-roman-numeral-spec.md) |
| "what SQL finds songs containing a ii-V-I progression?" | [07](07-postgres-recipes.md) |
| "what does music21 ChordSymbol expose?" | [05](05-music21-patterns.md) |
| "what's the JSON shape for a song with a key change?" | [06](06-schema-reference.md) |
| "what chord symbols are allowed in the vocabulary?" | [02](02-chord-vocabulary.md) |
| "what error codes can ingestion raise?" | [10](10-error-catalog.md) |
| "how do I tokenize chords for a transformer?" | [12](12-ml-dataset-guide.md) |
| "what's a half-diminished chord?" | [13](13-glossary.md) → [01](01-music-theory-primer.md) |
| "show me a `POST /v1/songs` request" | [09](09-api-examples.md) |

## See also

- [../amber-chords-plan.md](../amber-chords-plan.md) — master product plan (vision, repo layout, roadmap)
- [../chord-input-implementation.md](../chord-input-implementation.md) — jyutpin consumer chord UX (migration context)
- [../leadsheet-formatting-research.md](../leadsheet-formatting-research.md) — prior-art comparison of leadsheet formats
- [docs.json](docs.json) — machine-readable manifest for RAG ingestion
