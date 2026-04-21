---
title: Ingestion Pipeline
topic: ingestion
tags: [musicxml, music21, sibelius, pipeline, vercel-blob, postgres]
audience: [ai-agent, developer]
related: [06-schema-reference.md, 07-postgres-recipes.md]
---

# Ingestion Pipeline

End-to-end walkthrough of getting a chord-annotated song from Sibelius into the amber-chords Postgres database. Ten stages; any failure routes to a review queue with enough payload to replay. Pipeline is idempotent keyed on `sha256(raw_musicxml_bytes)`.

## Stage 1 — Sibelius export settings

In Sibelius: **File → Export → MusicXML**. Configure:

- Format: **Uncompressed (.xml)** — we want plain XML, not `.mxl`, to keep sha256 stable across tooling.
- Parts: **All instruments** — chord symbols may live on a dedicated "Chords" staff.
- Chord symbols: **Keep chord symbols** (enabled by default; verify).
- Layout: **Music layout** (off — we don't care about page breaks).

Save to `data/raw/{slug}.musicxml`. Filename is ignored by the pipeline; the sha256 is authoritative.

## Stage 2 — MusicXML validation

Validate against the W3C MusicXML 4.0 XSD before doing any expensive parsing. Fail fast.

```python
import subprocess
from pathlib import Path

XSD = Path("vendor/musicxml/schema/musicxml.xsd")

def validate_musicxml(path: Path) -> None:
    result = subprocess.run(
        ["xmllint", "--noout", "--schema", str(XSD), str(path)],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        raise IngestError("failed_xsd", stage="validate", detail=result.stderr)
```

Common XSD failures: Sibelius emits the occasional extension element. Route to review rather than force-passing.

## Stage 3 — music21 parse

```python
from music21 import converter
from music21.musicxml.xmlToM21 import MusicXMLImportException

def parse_score(path: Path):
    try:
        return converter.parse(str(path), format="musicxml")
    except MusicXMLImportException as e:
        raise IngestError("failed_parse", stage="music21", detail=str(e))
```

Score objects are held in memory for stages 4–5. Do **not** re-parse between stages.

## Stage 4 — Normalize bars and beats

Walk measures. For each measure, collect `<harmony>` elements, compute their beat position from `offset` within the measure divisions, then build the beat grid with `.` sustains and `-` rests.

```python
def normalize_bars(score):
    part = score.parts[0]   # chords are on part 0 for leadsheets
    ts = part.recurse().getElementsByClass("TimeSignature").first()
    beats_per_bar = ts.numerator if ts else 4
    bars = []

    for i, measure in enumerate(part.getElementsByClass("Measure")):
        grid = ["."] * beats_per_bar     # default: sustain
        rns  = ["."] * beats_per_bar

        # dedupe multiple <harmony> on the same beat (Sibelius quirk)
        seen_beats = set()
        for cs in measure.getElementsByClass("ChordSymbol"):
            beat_idx = int(round(cs.offset * beats_per_bar / measure.duration.quarterLength))
            if beat_idx in seen_beats:
                continue
            seen_beats.add(beat_idx)
            grid[beat_idx] = cs.figure            # e.g. "Dm7"
            rns[beat_idx]  = None                 # filled in stage 5

        # if a bar is fully sustained (no attacks), beat 1 = "-" rest
        if all(g == "." for g in grid) and i == 0:
            grid[0] = "-"
            rns[0]  = "-"

        bars.append({
            "index": i,
            "beats": [
                {"beat": b + 1, "abs": grid[b], "rn": rns[b]}
                for b in range(beats_per_bar)
            ]
        })
    return bars
```

Sibelius often emits duplicate `<harmony>` elements at the same offset when a chord is copied across staves. The `seen_beats` set collapses them. Sub-beat chord changes are truncated to nearest beat in v1.0.

## Stage 5 — Roman numeral derivation

```python
from music21 import roman, harmony, key as m21key

def derive_romans(score, bars):
    k = score.analyze("key")          # music21.key.Key
    ambiguities = []

    for bar in bars:
        for beat in bar["beats"]:
            if beat["abs"] in (".", "-"):
                beat["rn"] = beat["abs"]
                continue
            try:
                cs = harmony.ChordSymbol(beat["abs"])
                rn = roman.romanNumeralFromChord(cs, k)
                beat["rn"] = rn.figure
            except Exception as e:
                ambiguities.append({
                    "bar": bar["index"], "beat": beat["beat"],
                    "abs": beat["abs"], "error": str(e),
                })
                beat["rn"] = None

    return k, ambiguities

def compute_derived(bars):
    abs_seq, rn_seq = [], []
    for bar in bars:
        for beat in bar["beats"]:
            if beat["abs"] in (".", "-"):
                continue
            abs_seq.append(beat["abs"])
            rn_seq.append(beat["rn"])
    return {
        "absSequence":    abs_seq,
        "rnSequence":     rn_seq,
        "chordVocab":     sorted(set(abs_seq)),
        "uniqueRomanSet": sorted(set(rn_seq)),
    }
```

If `ambiguities` is non-empty after the loop, the song is routed to the review queue with the candidate list in the payload so a human (or a follow-up LLM pass) can disambiguate. We do not ship partial `rn_sequence` values with `null` entries — either every attack has an `rn` or the song is held.

## Stage 6 — Schema validation

Before any write, validate the assembled `ChordSong` object against the JSON Schema shipped in `@amberaudio/chord-schema`.

```python
import json
from jsonschema import Draft202012Validator

SCHEMA = json.loads(Path("schema/chord_song.schema.json").read_text())
_validator = Draft202012Validator(SCHEMA)

def validate_schema(song: dict) -> None:
    errors = sorted(_validator.iter_errors(song), key=lambda e: e.path)
    if errors:
        raise IngestError(
            "failed_schema", stage="schema",
            detail=[{"path": list(e.path), "msg": e.message} for e in errors],
        )
```

AJV is used in the TypeScript API layer for request validation; `jsonschema` is the Python equivalent used here. Both compile the same `chord_song.schema.json`.

## Stage 7 — Blob upload

Upload the original MusicXML to Vercel Blob keyed by sha256. The sha256 is computed once from the raw bytes and threaded through every downstream stage as the idempotency key.

```python
import hashlib
import httpx
import os

def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()

def upload_blob(path: Path, digest: str) -> str:
    token = os.environ["BLOB_READ_WRITE_TOKEN"]
    key = f"songs/{digest}.musicxml"
    with path.open("rb") as f:
        r = httpx.put(
            f"https://blob.vercel-storage.com/{key}",
            params={"addRandomSuffix": "false"},
            headers={
                "authorization": f"Bearer {token}",
                "x-content-type": "application/vnd.recordare.musicxml+xml",
            },
            content=f.read(),
            timeout=60,
        )
    r.raise_for_status()
    return r.json()["url"]
```

`addRandomSuffix=false` is critical — we want the blob URL to be a pure function of the content hash so re-ingest of an unchanged file returns the same URL.

## Stage 8 — Postgres upsert

Write the row with `ON CONFLICT (source_sha256) DO UPDATE`. See recipe 9 in `07-postgres-recipes.md` for the full SQL.

```python
import psycopg
from psycopg.types.json import Jsonb

UPSERT_SQL = Path("sql/upsert_song.sql").read_text()

def upsert(conn, song: dict) -> dict:
    with conn.cursor() as cur:
        cur.execute(UPSERT_SQL, (
            song["id"], song["title"], song["artist"],
            song["key"], song["mode"], song.get("tempo"),
            song["timeSig"][0], song["timeSig"][1],
            Jsonb(song),
            song["derived"]["absSequence"],
            song["derived"]["rnSequence"],
            song["derived"]["chordVocab"],
            song["sourceMusicxmlUrl"], song["sourceSha256"],
            song["schemaVersion"],
        ))
        row = cur.fetchone()
    conn.commit()
    return {"id": row[0], "inserted": row[1]}
```

## Stage 9 — Review queue routing

Any `IngestError` raised in stages 2–6 is caught at the top level and inserted into `ingest_review_queue`:

```sql
CREATE TABLE ingest_review_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_sha256 TEXT NOT NULL,
  stage TEXT NOT NULL,
  error_code TEXT NOT NULL,
  payload JSONB NOT NULL,
  retry_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
CREATE INDEX review_queue_open ON ingest_review_queue (created_at)
  WHERE resolved_at IS NULL;
```

```python
def route_to_review(conn, sha: str, err: IngestError, raw_path: Path) -> None:
    payload = {
        "detail": err.detail,
        "rawMusicxmlPath": str(raw_path),
        "stage": err.stage,
    }
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO ingest_review_queue (source_sha256, stage, error_code, payload)
            VALUES (%s, %s, %s, %s)
        """, (sha, err.stage, err.code, Jsonb(payload)))
    conn.commit()
```

Retries: a nightly worker pulls rows where `retry_count < 3` and re-runs the pipeline. After three failures the row is left for human review.

## Stage 10 — Telemetry

Counters per stage land in a thin metrics table, flushed per run:

```sql
CREATE TABLE ingest_metrics (
  run_id UUID PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ,
  ingested INT NOT NULL DEFAULT 0,
  failed_parse INT NOT NULL DEFAULT 0,
  failed_roman INT NOT NULL DEFAULT 0,
  failed_schema INT NOT NULL DEFAULT 0,
  failed_other INT NOT NULL DEFAULT 0
);
```

Dashboards read this table directly. For richer traces, the pipeline also emits OpenTelemetry spans (one per stage) to the Vercel Observability collector.

## Happy path — chained pseudocode

```python
def ingest_one(conn, path: Path) -> None:
    digest = sha256_of(path)
    validate_musicxml(path)                    # stage 2
    score = parse_score(path)                  # stage 3
    bars = normalize_bars(score)               # stage 4
    k, ambiguities = derive_romans(score, bars)
    if ambiguities:
        raise IngestError("ambiguous_roman", "roman", ambiguities)

    derived = compute_derived(bars)            # stage 5 finalize
    blob_url = upload_blob(path, digest)       # stage 7

    song = {
        "schemaVersion": "1.0.0",
        "id": str(uuid.uuid4()),
        "title":  score.metadata.title  or "Untitled",
        "artist": score.metadata.composer or "Unknown",
        "key":    k.tonic.name,
        "mode":   k.mode,
        "tempo":  extract_tempo(score),
        "timeSig": extract_time_sig(score),
        "sections": extract_sections(score),
        "bars": bars,
        "derived": derived,
        "sourceMusicxmlUrl": blob_url,
        "sourceSha256": digest,
        "ingestedAt": datetime.now(timezone.utc).isoformat(),
    }
    validate_schema(song)                      # stage 6
    result = upsert(conn, song)                # stage 8
    record_metric(conn, "ingested")            # stage 10
    return result
```

## Failure path — routing to review

```python
def ingest_safe(conn, path: Path) -> None:
    digest = sha256_of(path)
    try:
        ingest_one(conn, path)
    except IngestError as err:
        route_to_review(conn, digest, err, path)   # stage 9
        record_metric(conn, f"failed_{err.stage}") # stage 10
    except Exception as err:
        route_to_review(
            conn, digest,
            IngestError("unexpected", "other", repr(err)),
            path,
        )
        record_metric(conn, "failed_other")
```

Every exit path — success or failure — leaves a durable record. The pipeline is therefore safe to run from a cron on a bulk directory (`data/raw/*.musicxml`): reruns are no-ops for already-ingested files (sha256 idempotency) and retries for review-queued ones (retry counter).

## See also

- [Schema Reference](./06-schema-reference.md) — the shape every stage converges on.
- [Postgres Recipes](./07-postgres-recipes.md) — the upsert SQL and index behavior.
