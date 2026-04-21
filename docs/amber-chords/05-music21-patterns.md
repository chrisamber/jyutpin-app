---
title: music21 Ingestion Patterns
topic: api
tags: [music21, python, ingestion, parsing, recipes]
audience: [ai-agent, developer]
related: [03-roman-numeral-spec.md, 04-musicxml-reference.md]
---

# music21 Ingestion Patterns

Tight recipe file for the Python side of the `amber-chords` ingestion pipeline. Only the music21 APIs actually used in production are documented here. Pinned version: `music21 >= 9.1`. All snippets are complete and runnable.

## Imports and setup

```python
from music21 import converter, harmony, roman, key, stream
from music21.musicxml.xmlToM21 import MusicXMLImportException
```

Nothing else from music21 is imported in production code. `converter` parses files. `harmony.ChordSymbol` is the parsed `<harmony>` element. `roman.RomanNumeral` and `roman.romanNumeralFromChord` handle the key-relative analysis. `key.Key` and `key.KeySignature` track tonic context. `stream.Measure` is the iteration unit.

## Core API reference

### `converter.parse(path)`

Parses a MusicXML (or MIDI, ABC, Humdrum) file into a `music21.stream.Score`. For the pipeline, input is always `.musicxml` or `.xml`.

```python
score = converter.parse("/path/to/song.musicxml")
```

Returns a `Score` object with `score.parts` (list of `Part`), each of which contains `Measure` objects.

### `score.analyze('key')`

Runs the Krumhansl-Schmuckler key-finding algorithm over the entire score. Returns a `music21.key.Key`. Use this when the MusicXML has no `<key>` element or when you want to override a transposed key signature.

```python
k = score.analyze('key')
# k.tonic.name -> "C"
# k.mode       -> "major"
```

For files with an explicit `<key>`, the first `KeySignature` in the score is authoritative; `analyze('key')` is a fallback.

### Measure iteration

```python
for measure in score.parts[0].getElementsByClass(stream.Measure):
    ...
```

`getElementsByClass` returns only top-level elements. For chord symbols anywhere inside the measure (including nested voices), use `recurse`.

### Chord symbol extraction

```python
for cs in measure.recurse().getElementsByClass(harmony.ChordSymbol):
    print(cs.figure, cs.offset)
```

- `cs.figure` — the chord symbol as a string (`"Dm7"`, `"G7"`, `"Cmaj7"`). This is the display form and is what the database stores as the raw chord label.
- `cs.offset` — float offset in quarter notes, relative to the containing Measure. A chord at `offset=0.0` is on beat 1; `offset=2.0` is on beat 3 in 4/4; `offset=1.5` is the "and" of 2 at eighth resolution. Beat number is `offset + 1` when quarterLength is 1 (i.e., 4/4 time).

### Roman numeral derivation

```python
rn = roman.romanNumeralFromChord(cs, k)
# rn.figure    -> "ii7"
# rn.scaleDegree -> 2
```

`romanNumeralFromChord` takes a `Chord` or `ChordSymbol` and a `Key`. Returns a `RomanNumeral`. The `.figure` string follows music21's conventions, which mostly align with the corpus spec — secondary dominants emit as `V7/ii`, borrowed chords as `bVI`, etc. Post-process to normalize glyphs (`°`, `ø`) per [03-roman-numeral-spec.md](./03-roman-numeral-spec.md).

### Key changes mid-score

```python
for ks in score.recurse().getElementsByClass(key.KeySignature):
    print(ks.offset, ks.sharps)
```

`KeySignature` only gives sharps/flats — not mode. Convert to a full `Key` by calling `ks.asKey('major')` or `ks.asKey('minor')`. The "apply most recent key going forward" rule means sorting key signatures by absolute offset in the score and binding each chord to the most recent key signature that precedes it.

### Malformed input handling

`converter.parse` raises `MusicXMLImportException` on malformed files (unbalanced tags, unknown `<kind>`, missing required elements). Wrap in `try/except` at the top level. Subclasses of `Exception` that escape music21's own guards should also be caught defensively — corpus input is untrusted.

## Worked snippets

### 1. Parse a file and print key

```python
from music21 import converter

score = converter.parse("/data/songs/stardust.musicxml")
k = score.analyze('key')
print(f"Key: {k.tonic.name} {k.mode}")
# Key: Bb major
```

### 2. Extract chords per measure with beat positions

```python
from music21 import converter, harmony, stream

score = converter.parse("/data/songs/stardust.musicxml")
part = score.parts[0]

for measure in part.getElementsByClass(stream.Measure):
    for cs in measure.recurse().getElementsByClass(harmony.ChordSymbol):
        beat = cs.offset + 1  # 1-indexed beat in 4/4
        print(f"m{measure.number} beat {beat}: {cs.figure}")

# m1 beat 1: Dm7
# m2 beat 1: G7
# m3 beat 1: Cmaj7
# m4 beat 1: Cmaj7
```

### 3. Derive Roman numerals given key context

```python
from music21 import converter, harmony, roman, stream

score = converter.parse("/data/songs/stardust.musicxml")
k = score.analyze('key')
part = score.parts[0]

rows = []
for measure in part.getElementsByClass(stream.Measure):
    for cs in measure.recurse().getElementsByClass(harmony.ChordSymbol):
        rn = roman.romanNumeralFromChord(cs, k)
        rows.append({
            "measure": measure.number,
            "beat": cs.offset + 1,
            "chord": cs.figure,
            "roman": rn.figure,
            "scale_degree": rn.scaleDegree,
        })

for r in rows:
    print(r)
# {"measure": 1, "beat": 1, "chord": "Dm7",   "roman": "ii7",   "scale_degree": 2}
# {"measure": 2, "beat": 1, "chord": "G7",    "roman": "V7",    "scale_degree": 5}
# {"measure": 3, "beat": 1, "chord": "Cmaj7", "roman": "I7",    "scale_degree": 1}
```

### 4. Handle a key change mid-song

Bind each chord to the most recent key signature preceding it. `score.recurse()` walks in document order; combine its offsets with the elements' `activeSite` offset to get absolute positions.

```python
from music21 import converter, harmony, key, roman, stream

score = converter.parse("/data/songs/modulates.musicxml")

# Collect all key signatures with absolute offsets
key_events = []
for ks in score.recurse().getElementsByClass(key.KeySignature):
    abs_offset = ks.getOffsetInHierarchy(score)
    mode = 'minor' if (ks.getContextByClass(key.Key) and ks.getContextByClass(key.Key).mode == 'minor') else 'major'
    key_events.append((abs_offset, ks.asKey(mode)))
key_events.sort(key=lambda x: x[0])

def key_at(offset: float):
    """Return the Key active at the given absolute offset."""
    active = key_events[0][1]
    for off, k in key_events:
        if off <= offset:
            active = k
        else:
            break
    return active

part = score.parts[0]
for measure in part.getElementsByClass(stream.Measure):
    for cs in measure.recurse().getElementsByClass(harmony.ChordSymbol):
        abs_offset = cs.getOffsetInHierarchy(score)
        k = key_at(abs_offset)
        rn = roman.romanNumeralFromChord(cs, k)
        print(f"m{measure.number} [{k.tonic.name} {k.mode}]: {cs.figure} = {rn.figure}")

# m1 [C major]: Dm7 = ii7
# m2 [C major]: G7 = V7
# m3 [G major]: Am7 = ii7
# m4 [G major]: D7 = V7
```

### 5. Graceful handling of a malformed file

Catch `MusicXMLImportException` and fall back to a structured error record so the pipeline can log and continue the batch.

```python
from music21 import converter
from music21.musicxml.xmlToM21 import MusicXMLImportException

def safe_parse(path: str):
    try:
        score = converter.parse(path)
    except MusicXMLImportException as e:
        return {"ok": False, "path": path, "error": f"musicxml_import: {e}"}
    except Exception as e:
        # Defensive: malformed XML, encoding errors, unexpected music21 failures
        return {"ok": False, "path": path, "error": f"unexpected: {type(e).__name__}: {e}"}

    try:
        k = score.analyze('key')
    except Exception as e:
        return {"ok": False, "path": path, "error": f"key_analysis: {e}"}

    return {"ok": True, "score": score, "key": k}

result = safe_parse("/data/songs/corrupted.musicxml")
if not result["ok"]:
    print(f"SKIP {result['path']}: {result['error']}")
else:
    print(f"OK {result['key'].tonic.name} {result['key'].mode}")
```

The pipeline records failed files in a `ingest_errors` table with the path, error kind, and timestamp — the corpus itself is never partially written.

## See also

- [03-roman-numeral-spec.md](./03-roman-numeral-spec.md) — the normalization target for `rn.figure`
- [04-musicxml-reference.md](./04-musicxml-reference.md) — element-level reference for the input format
