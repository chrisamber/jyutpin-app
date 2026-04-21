---
title: ML Dataset Guide
topic: ml
tags: [ml, dataset, parquet, training, tokenization]
audience: [ai-agent, developer]
related: [03-roman-numeral-spec.md, 09-api-examples.md]
---

# ML Dataset Guide

How the `amber-chords` corpus becomes training data. Covers the parquet export schema, tokenization choices, train/val/test splits, and dataset versioning. Ends with three concrete ML experiments the dataset is shaped to support.

## Parquet export schema

Exports live at `s3://amber-chords-datasets/<version>/songs.parquet`. One row per song.

```
song_id:               string
key:                   string         # "C", "F#", ...
mode:                  string         # "major" | "minor" | "dorian" | ...
tempo:                 int32          # BPM, rounded
abs_sequence:          list<string>   # absolute chord symbols, bar-aligned
rn_sequence:           list<string>   # Roman numerals, same length as abs_sequence
chord_vocab:           list<string>   # unique chords used in the song
genre:                 string         # optional, manually labeled
year:                  int16          # optional
section_boundaries:    list<int32>    # bar indices where section label changes
```

Partitioning: `mode=<mode>/key=<key>/part-*.parquet`. Enables fast pushdown for "all major-key songs" or "all songs in D dorian" without a full scan. Per-partition files stay under 128 MB so they fit in a Spark executor memory page.

Nullability: `genre` and `year` are `null` for automatically ingested rows. `rn_sequence` elements are `null` where derivation failed; consumers should filter `rn_sequence != [null, null, ...]` for supervised tasks.

## Tokenization strategies

The chord stream can be tokenized three ways. Pick based on whether the downstream task cares about rhythm.

**Chord-change-level.** Emit one token per chord change; collapse sustained bars. Compact but drops timing.

```
abs: ["C", "C", "F", "F", "G", "C"]
tokens (chord-change): ["C", "F", "G", "C"]
```

Typical vocabulary size: 150–300 chord symbols. Sequence lengths: 20–120 tokens per song.

**Beat-level.** Emit one token per beat (or per 16th, if drilling deeper). Preserves rhythm at the cost of 4x (or 16x) token count. A sustain is a literal repeat of the previous chord.

```
tokens (beat, 4/4): ["C","C","C","C", "F","F","F","F", ...]
```

Use when the task is rhythm-sensitive — groove modeling, voice leading, accompaniment generation.

**Hybrid: chord-change + beat-duration delta.** Emit a `(chord, duration_in_beats)` pair per change. Keeps timing without repetition.

```
tokens (hybrid): [("C", 8), ("F", 8), ("G", 4), ("C", 4)]
```

**Recommendation.** Use chord-change-level for generative progression tasks (completion, harmonic continuation, style transfer). Use beat-level only when the task consumes rhythm (accompaniment generation, groove-aware classification). Hybrid is strictly better than beat-level when training transformer decoders — fewer tokens, same information — but is more expensive to preprocess and less common in public literature.

## Train/val/test split

- **Ratio:** 80/10/10.
- **Stratification:** dual-key on `(key, genre)`. Proportions of each `(key, genre)` pair are matched across splits within ±2 percentage points.
- **Reproducibility:** seed 42. Committed alongside each dataset version as `split_manifest.json`.
- **Stability across re-ingests:** split assignment is driven by `bucket = sha256(song_id)[:8] mod 100`. Buckets `[0, 80)` go to train, `[80, 90)` to val, `[90, 100)` to test. A new song added in v1.1 lands in the same bucket it would have in v1.0 — so existing models stay comparable when the corpus grows.

Do not shuffle by row index. Shuffling by index leaks songs across splits on re-ingest and invalidates all held-out metrics.

## Dataset versioning

SemVer on the tuple `(schema_version, corpus_size_bucket)`:

- **Patch** — bug fix to existing rows (e.g., correcting a wrong RN label). No schema change, no song count change.
- **Minor** — new songs added. Corpus grows. Schema unchanged.
- **Major** — schema change (new column, dtype change, vocabulary-breaking enum).

Version string: `dataset-v<major>.<minor>.<patch>-<size>songs`, e.g. `dataset-v1.0.0-3000songs`, `dataset-v1.1.0-3500songs`, `dataset-v2.0.0-3500songs`.

**Manifest.** Every published version ships with `manifest.json`:

```json
{
  "version": "dataset-v1.1.0-3500songs",
  "schema_version": "1.3.0",
  "row_count": 3547,
  "sha256": "a91f...c02",
  "partitions": 168,
  "split_manifest_sha256": "7d4e...91a",
  "published_at": "2026-04-17T09:00:00Z"
}
```

The `sha256` is computed over the sorted concatenation of per-partition hashes. Consumers verify before training.

## Recommended ML experiments

Three experiments the dataset is shaped to support out-of-the-box. Each lists features, a baseline, and a stretch model.

### 1. Progression completion

Given the first 3 chords of a progression, predict the 4th (and beyond).

- **Features:** `rn_sequence` tokens, chord-change level.
- **Labels:** next token (or next N tokens for rollout).
- **Baseline:** bigram / trigram language model over Roman numerals. Trains in seconds; surprisingly strong on diatonic pop.
- **Stretch:** causal transformer decoder (GPT-style), 4 layers, 256 dim, trained with next-token prediction. Condition on `key` and `mode` as a prefix token.
- **Metric:** top-k accuracy at k=1, k=3. Perplexity on held-out test.

### 2. Style / genre classification

Given a full `rn_sequence`, predict `genre`.

- **Features:** `rn_sequence` as a bag of n-grams (2-grams and 3-grams).
- **Baseline:** TF-IDF over n-grams + logistic regression. Interpretable feature weights — expose which progressions are diagnostic of each genre.
- **Stretch:** fine-tuned BERT-style encoder on the RN token stream. Expect ~10 point macro-F1 lift over the baseline on fine-grained genres.
- **Metric:** macro-F1 across genres. Confusion matrix for error analysis.

### 3. Auto-harmonization

Given a melody and a declared key, generate a chord progression.

- **Features:** melody notes (pitch + duration) + key + mode.
- **Labels:** aligned `rn_sequence`.
- **Baseline:** rule-based — for each bar, pick the diatonic chord that covers the most melody notes.
- **Stretch:** seq2seq transformer on (melody_tokens, rn_tokens) pairs.
- **Prerequisite:** requires a note-extraction pipeline stage that emits per-bar melody from MusicXML. Not yet live — track under the pipeline roadmap.
- **Metric:** BLEU against human harmonization; human preference A/B for subjective quality.

## Licensing warning

The public dataset subset must consist only of CC-BY-licensed original compositions or public-domain works. Do not publish a dataset containing copyrighted commercial music — even transformed as Roman-numeral sequences, the underlying progression + melody pair is derivative. Internal-only datasets may include commercial material, but must carry an `internal: true` flag in the manifest and be gated behind authentication.

## See also

- [03-roman-numeral-spec.md](03-roman-numeral-spec.md)
- [09-api-examples.md](09-api-examples.md)
- [11-testing-fixtures.md](11-testing-fixtures.md)
