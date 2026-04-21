---
title: Error Catalog
topic: reference
tags: [errors, debugging, operations]
audience: [ai-agent, developer]
related: [09-api-examples.md, 11-testing-fixtures.md]
---

# Error Catalog

Exhaustive list of failure modes emitted by the ingestion pipeline and API. Codes are stable and machine-readable; each row prescribes a recovery playbook. `Severity` drives alert routing: `warning` is logged, `error` enqueues human review, `fatal` halts the pipeline and pages on-call.

## Parse stage

Errors raised while loading a MusicXML file into a parse tree. Raised by `xmllint` preflight or the `music21` loader.

| Error Code | Severity | Symptom | Root Cause | Recovery Playbook |
|---|---|---|---|---|
| `PARSE_MALFORMED_XML` | error | `xmllint` exits non-zero; parser raises `SyntaxError` before any elements are read. | XML syntax broken in Sibelius export (missing close tag, bad encoding, truncated file). | Re-export the score from Sibelius with the "Uncompressed" option; re-run ingest. Route original to `review-queue/malformed/`. |
| `PARSE_MISSING_KEY` | error | `<key><fifths>` element absent from the first measure; loader reports `key=None`. | Sibelius file authored without a key signature (common in drum/percussion-only parts). | Open in Sibelius, set key signature in bar 1, re-export. Or mark the song `mode=atonal` and bypass RN derivation. |
| `PARSE_UNSUPPORTED_VERSION` | fatal | MusicXML version attribute `<score-partwise version="2.0">` or older; loader refuses. | Legacy export from an older Sibelius or third-party tool. | Upgrade Sibelius to current version, open the file, and re-save. If unavailable, run through MuseScore `Save As` to upgrade to MusicXML 3.1. |

## Derivation stage

Errors raised during Roman-numeral derivation. The parse tree is valid; interpretation failed.

| Error Code | Severity | Symptom | Root Cause | Recovery Playbook |
|---|---|---|---|---|
| `RN_AMBIGUOUS` | warning | Multiple Roman numerals score within tolerance (e.g., both `V7/ii` and `II7` plausible). | Chord fits more than one interpretation — common in chromatic mediants and dominant-function ambiguity. | Emit candidates to human review with a ranked list; store the chosen label on resolution. Safe to ship with `rn=null` and retry later. |
| `RN_OUT_OF_KEY` | error | Chord has no diatonic or modal reading within the declared key. | Atonal passage or key mis-detection upstream. | Verify the key against the score. Try analyzing the offending section in isolation; if still out of key, tag the section `mode=chromatic`. |
| `RN_KEY_DETECTION_FAILED` | error | `music21.analysis.key` returns confidence `< 0.6`. | Ambiguous tonality (modal pieces, short excerpts, chromatic intros). | Route to human review queue. The reviewer labels key manually; the pipeline re-runs derivation with the labeled key. |

## Schema stage

Errors raised while normalizing the derived chord stream into the storage schema.

| Error Code | Severity | Symptom | Root Cause | Recovery Playbook |
|---|---|---|---|---|
| `SCHEMA_INVALID_ENUM` | error | Chord symbol not in the controlled vocabulary (e.g., `C7b9#11`). | New or non-standard symbol introduced by the derivation stage. | Normalize to the nearest enum value (drop the `b9` extension), or extend the vocabulary with a SemVer minor bump on `schema_version`. Record a migration note. |
| `SCHEMA_BEAT_MISMATCH` | error | Total beats on a measure != beats implied by `time_signature`. | Chord mapped to the wrong measure or `divisions` mis-read during XPath scan. | Recompute beat position from MusicXML `<divisions>` and `<duration>`; re-emit the measure. If persists, inspect the source for pickup measures (anacrusis). |
| `SCHEMA_MISSING_REQUIRED` | error | A required field (`key`, `mode`, `abs_sequence`, `time_signature`, `source_sha256`) is absent from the payload. | Ingest bug — upstream stage failed to populate the field. | Check the normalization code; log the upstream payload. For API POST, return `400` with `field` populated (see [09-api-examples.md](09-api-examples.md)). |

## DB stage

Errors raised during Postgres writes. These are surfaced to the API as `409` or `500`.

| Error Code | Severity | Symptom | Root Cause | Recovery Playbook |
|---|---|---|---|---|
| `DB_UNIQUE_VIOLATION` | warning | Postgres `23505` on `songs.source_sha256` unique index. | Re-ingest of an unchanged MusicXML file. | Upsert via `ON CONFLICT (source_sha256) DO UPDATE SET ...`. On API, return `409` with `existing_id`. |
| `DB_FK_VIOLATION` | error | Postgres `23503`; a `section` row references a non-existent `song_id` or bar index outside `[start_bar, end_bar]`. | Normalization bug — section emitted before the parent song or with a stale bar range. | Validate the section's bar range against the parent song's bar count before insert; re-run ingest after fix. |
| `DB_CONNECTION_TIMEOUT` | fatal | Driver raises `pool timeout` after 30s. | Postgres pool exhausted under traffic spike, or leaked connections in a long-running worker. | Retry with exponential backoff (250ms → 4s, max 3 attempts). If persistent, page on-call; check pool size and leaked handles in worker. |

## Blob stage

Errors raised while uploading the original MusicXML or derived parquet files to Vercel Blob.

| Error Code | Severity | Symptom | Root Cause | Recovery Playbook |
|---|---|---|---|---|
| `BLOB_UPLOAD_FAILED` | error | Vercel Blob returned `5xx` on the `PUT` call. | Upstream outage at Vercel Blob. | Retry with exponential backoff (500ms → 8s, max 3). After exhaustion, park the payload in a local queue and surface a `warning` until Blob recovers. |
| `BLOB_QUOTA_EXCEEDED` | fatal | `413` or Vercel-specific "quota exceeded" error on `PUT`. | Blob storage tier full. | Halt ingest pipeline. Request a tier upgrade from Vercel or purge old revisions per the retention policy in the data plan. |

## Routing rules

- `warning` — logged to OpenTelemetry, not surfaced to API callers unless attached to a response.
- `error` — 4xx or 5xx to the API caller; also enqueued to `review-queue/` with the full payload and error metadata.
- `fatal` — pipeline stops processing new work; PagerDuty alert via the `ingest-fatal` channel.

Every error includes a stable `X-Request-Id` header (API) or `request_id` field (worker logs) for cross-stage correlation. Use the request-id to pivot from an alert back to the originating payload.

## See also

- [09-api-examples.md](09-api-examples.md)
- [11-testing-fixtures.md](11-testing-fixtures.md)
- [03-roman-numeral-spec.md](03-roman-numeral-spec.md)
