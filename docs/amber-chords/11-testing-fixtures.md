---
title: Testing Fixtures
topic: ingestion
tags: [testing, fixtures, musicxml, ci]
audience: [ai-agent, developer]
related: [10-error-catalog.md, 03-roman-numeral-spec.md]
---

# Testing Fixtures

Catalog of MusicXML fixtures used by the ingest test suite. Each fixture exercises a specific branch of the parse → derivation → schema pipeline. Fixtures live under `tests/fixtures/` and are committed alongside an `expected.json` sibling that pins the parsed output.

## Fixture catalog

### 1. `fixtures/simple-i-iv-v.musicxml`

- **Purpose:** smoke-test the happy path.
- **Content:** 4 bars in C major: `C | F | G | C`, 4/4, quarter = 100.
- **Tests:** MusicXML parse, chord-symbol extraction, diatonic RN derivation.
- **Expected shape:**

```json
{
  "key": "C",
  "mode": "major",
  "abs_sequence": ["C", "F", "G", "C"],
  "rn_sequence": ["I", "IV", "V", "I"],
  "chord_vocab": ["C", "F", "G"],
  "errors": []
}
```

### 2. `fixtures/ii-v-i-with-secondary.musicxml`

- **Purpose:** verify secondary-dominant recognition.
- **Content:** 8 bars in C major: `Dm7 | G7 | Cmaj7 | Cmaj7 | A7 | Dm7 | G7 | Cmaj7`. The `A7` in bar 5 is the secondary dominant of `ii`.
- **Tests:** `V7/x` labeling, applied-dominant routing, extended chord symbols (`maj7`, `m7`).
- **Expected shape:**

```json
{
  "key": "C",
  "mode": "major",
  "rn_sequence": ["ii7", "V7", "Imaj7", "Imaj7", "V7/ii", "ii7", "V7", "Imaj7"],
  "chord_vocab": ["Dm7", "G7", "Cmaj7", "A7"]
}
```

Assertion: `"V7/ii" in rn_sequence`.

### 3. `fixtures/modal-interchange.musicxml`

- **Purpose:** verify borrowed-chord labels use `b`-prefixed numerals and handle a parallel-minor borrow.
- **Content:** 4 bars in C major: `C | Ab | F | Fm`. `Ab` is borrowed from C minor; `Fm` is the parallel-minor iv.
- **Tests:** modal-interchange routing, `bVI` labeling, distinguishing `iv` from `IV`.
- **Expected shape:**

```json
{
  "key": "C",
  "mode": "major",
  "rn_sequence": ["I", "bVI", "IV", "iv"],
  "chord_vocab": ["C", "Ab", "F", "Fm"]
}
```

### 4. `fixtures/key-change.musicxml`

- **Purpose:** verify multi-key section handling.
- **Content:** 8 bars. Bars 1–4 in C major: `C | Am | F | G`. Bars 5–8 in G major: `G | Em | C | D`. A `<key><fifths>1</fifths></key>` element appears at bar 5.
- **Tests:** mid-song key change detection, section splitting, per-section `rn_sequence`.
- **Expected shape:**

```json
{
  "key": "C",
  "mode": "major",
  "key_changes": [{ "bar": 5, "from": "C", "to": "G" }],
  "sections": [
    { "key": "C", "rn_sequence": ["I", "vi", "IV", "V"] },
    { "key": "G", "rn_sequence": ["I", "vi", "IV", "V"] }
  ]
}
```

Assertion: `len(key_changes) == 1 and sections[0].key != sections[1].key`.

### 5. `fixtures/malformed.musicxml`

- **Purpose:** verify graceful failure and review-queue routing.
- **Content:** a valid header followed by an unclosed `<measure>` tag — intentionally broken.
- **Tests:** `xmllint` preflight, error classification, review-queue write.
- **Expected shape:**

```json
{
  "status": "error",
  "error": "PARSE_MALFORMED_XML",
  "routed_to": "review-queue/malformed/",
  "song_id": null
}
```

Assertion: the test runner also verifies a file appears under `review-queue/malformed/` with the original payload.

## Writing a new fixture

Follow this checklist whenever a new pipeline branch needs coverage:

1. **Compose in Sibelius.** Use the shortest musical example that isolates the behavior — 2 to 8 bars is typical. Name the Sibelius file after the fixture's behavior, not the song.
2. **Export uncompressed.** `File → Export → MusicXML → Uncompressed (.musicxml)`. Compressed `.mxl` is not accepted by the test loader.
3. **Place under `tests/fixtures/`.** Use kebab-case filenames that describe the branch: `fixtures/<behavior>.musicxml`.
4. **Commit expected JSON alongside.** Create `tests/fixtures/<behavior>.expected.json` with the full parsed output. Keep it minimal — only the fields the test asserts against. Regenerate by running `python tools/generate_fixture_expected.py <fixture>` and hand-review the diff.
5. **Add to `test_ingest.py`.** Register the fixture in the `FIXTURES` list with an assertion closure. Run `pytest -k <behavior>` to confirm. For error fixtures, assert the error code and the review-queue side effect.

## CI behavior

All fixtures run on every PR via `pytest tests/test_ingest.py`. A fixture change requires the companion `expected.json` to be updated in the same commit — CI fails if the parsed output drifts from the pinned expectation. The malformed fixture is tagged `@pytest.mark.error_path`; its assertion confirms routing rather than a clean parse.

## See also

- [10-error-catalog.md](10-error-catalog.md)
- [03-roman-numeral-spec.md](03-roman-numeral-spec.md)
- [09-api-examples.md](09-api-examples.md)
