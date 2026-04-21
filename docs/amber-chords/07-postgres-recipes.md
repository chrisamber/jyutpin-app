---
title: Postgres Recipes
topic: database
tags: [postgres, sql, gin, jsonb, neon, cookbook]
audience: [ai-agent, developer]
related: [06-schema-reference.md, 08-ingestion-pipeline.md]
---

# Postgres Recipes

Query cookbook for the `songs` table on Neon Postgres. All recipes assume the canonical schema below (`chord_json` is the `ChordSong` JSON from `06-schema-reference.md`; `abs_sequence`, `rn_sequence`, `chord_vocab` are the derived arrays denormalized into columns for index-friendly querying).

```sql
CREATE TABLE songs (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  key TEXT NOT NULL,
  mode TEXT NOT NULL,
  tempo INT,
  time_sig_num SMALLINT,
  time_sig_den SMALLINT,
  chord_json JSONB NOT NULL,
  abs_sequence TEXT[] NOT NULL,
  rn_sequence TEXT[] NOT NULL,
  chord_vocab TEXT[] NOT NULL,
  musicxml_url TEXT,
  source_sha256 TEXT UNIQUE,
  schema_version TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX songs_rn_sequence_gin ON songs USING GIN (rn_sequence);
CREATE INDEX songs_chord_vocab_gin ON songs USING GIN (chord_vocab);
CREATE INDEX songs_key_mode       ON songs (key, mode) WHERE deleted_at IS NULL;
CREATE INDEX songs_artist_trgm    ON songs USING GIN (artist gin_trgm_ops);
```

---

## 1. Find songs containing a ii-V-I progression

The `@>` operator on `text[]` with a GIN index is the fast path. It checks **subset** membership — the target array must contain every element of the probe, but not necessarily contiguously or in order.

```sql
SELECT id, title, artist
FROM songs
WHERE rn_sequence @> ARRAY['ii7','V7','Imaj7']::text[]
  AND deleted_at IS NULL
ORDER BY title
LIMIT 100;
```

For **ordered, contiguous** ii-V-I (true progression matching, not bag-of-chords), fall back to a string-encoded array and LIKE. This loses index support but is correct:

```sql
SELECT id, title, artist
FROM songs
WHERE array_to_string(rn_sequence, ' ') LIKE '%ii7 V7 Imaj7%'
  AND rn_sequence @> ARRAY['ii7','V7','Imaj7']::text[]   -- index-pruning prefilter
  AND deleted_at IS NULL;
```

The `@>` clause still uses the GIN index to shrink the candidate set before the LIKE scan.

---

## 2. Songs in major keys only

Covered by the partial B-tree index `songs_key_mode`.

```sql
SELECT id, title, artist, key
FROM songs
WHERE mode = 'major'
  AND deleted_at IS NULL
ORDER BY key, title;
```

To narrow to a specific key:

```sql
SELECT id, title FROM songs
WHERE key = 'C' AND mode = 'major' AND deleted_at IS NULL;
```

---

## 3. Top 50 most common 4-chord progressions

Slide a window of size 4 across `rn_sequence` using `generate_subscripts` in a `LATERAL` join. Emit each 4-gram as a text[], then group.

```sql
SELECT
  ngram,
  COUNT(*)  AS occurrences,
  COUNT(DISTINCT song_id) AS distinct_songs
FROM (
  SELECT
    s.id AS song_id,
    ARRAY[
      s.rn_sequence[i],
      s.rn_sequence[i+1],
      s.rn_sequence[i+2],
      s.rn_sequence[i+3]
    ] AS ngram
  FROM songs s,
       LATERAL generate_subscripts(s.rn_sequence, 1) AS i
  WHERE s.deleted_at IS NULL
    AND i + 3 <= array_length(s.rn_sequence, 1)
) grams
GROUP BY ngram
ORDER BY occurrences DESC
LIMIT 50;
```

For absolute-chord n-grams, substitute `abs_sequence`. For variable n, parameterize the window size and emit the slice with `s.rn_sequence[i:i+n-1]`.

---

## 4. Songs by artist with chord stats

Trigram fuzzy match (`%` operator, `gin_trgm_ops` index) plus aggregates.

```sql
SELECT
  id,
  title,
  artist,
  cardinality(chord_vocab)     AS unique_chord_count,
  array_length(abs_sequence,1) AS total_attacks,
  key,
  mode
FROM songs
WHERE artist % 'bill evans'
  AND deleted_at IS NULL
ORDER BY similarity(artist, 'bill evans') DESC, title
LIMIT 50;
```

Requires `CREATE EXTENSION IF NOT EXISTS pg_trgm;` once per database.

---

## 5. GIN index performance — EXPLAIN ANALYZE

Plan for recipe 1 on a ~50k-row table:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id FROM songs
WHERE rn_sequence @> ARRAY['ii7','V7','Imaj7']::text[]
  AND deleted_at IS NULL;
```

Expected shape (approximate, Neon compute-enabled):

```
Bitmap Heap Scan on songs  (cost=48.12..812.33 rows=320 width=16)
                            (actual time=1.84..9.71 rows=412 loops=1)
  Recheck Cond: (rn_sequence @> '{ii7,V7,Imaj7}'::text[])
  Filter: (deleted_at IS NULL)
  Heap Blocks: exact=298
  Buffers: shared hit=312
  ->  Bitmap Index Scan on songs_rn_sequence_gin
        (cost=0.00..48.04 rows=320 width=0)
        (actual time=1.21..1.21 rows=412 loops=1)
        Index Cond: (rn_sequence @> '{ii7,V7,Imaj7}'::text[])
Planning Time: 0.42 ms
Execution Time: 9.88 ms
```

Two signals the index is healthy: `Bitmap Index Scan on songs_rn_sequence_gin` (not a `Seq Scan`) and single-digit-ms `Execution Time` at 50k rows.

---

## 6. Computing derived columns — trigger vs on-ingest

**Trigger approach** (derivation owned by database):

```sql
CREATE OR REPLACE FUNCTION songs_derive_arrays() RETURNS trigger AS $$
DECLARE
  bar JSONB;
  beat JSONB;
  abs_acc TEXT[] := ARRAY[]::TEXT[];
  rn_acc  TEXT[] := ARRAY[]::TEXT[];
BEGIN
  FOR bar IN SELECT * FROM jsonb_array_elements(NEW.chord_json->'bars') LOOP
    FOR beat IN SELECT * FROM jsonb_array_elements(bar->'beats') LOOP
      IF beat->>'abs' NOT IN ('.', '-') THEN
        abs_acc := abs_acc || (beat->>'abs');
        rn_acc  := rn_acc  || (beat->>'rn');
      END IF;
    END LOOP;
  END LOOP;
  NEW.abs_sequence := abs_acc;
  NEW.rn_sequence  := rn_acc;
  NEW.chord_vocab  := ARRAY(SELECT DISTINCT unnest(abs_acc) ORDER BY 1);
  NEW.updated_at   := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER songs_derive
BEFORE INSERT OR UPDATE OF chord_json ON songs
FOR EACH ROW EXECUTE FUNCTION songs_derive_arrays();
```

**On-ingest approach** (derivation owned by app code, recipe 9 below writes the arrays explicitly).

**Recommendation: on-ingest.** Reasons:

1. Versionable — derivation rules live in TypeScript alongside the schema package; you can diff history of the rule.
2. Testable in isolation — unit tests run without Postgres.
3. Portable — same derivation runs in the browser for preview / dry-run.
4. Trigger PL/pgSQL doesn't get code review the way the app repo does.

Keep the trigger only as a safety net during backfill migrations.

---

## 7. Full-text search on title + artist

Weighted `tsvector` with A weight on title, B on artist. Materialize as a generated column for index support.

```sql
ALTER TABLE songs ADD COLUMN search_tsv tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(title,  '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(artist, '')), 'B')
  ) STORED;

CREATE INDEX songs_search_gin ON songs USING GIN (search_tsv);
```

Query with ranking:

```sql
SELECT id, title, artist,
       ts_rank(search_tsv, query) AS rank
FROM songs, plainto_tsquery('simple', $1) AS query
WHERE search_tsv @@ query
  AND deleted_at IS NULL
ORDER BY rank DESC, title
LIMIT 20;
```

Use the `'simple'` configuration rather than `'english'` to avoid stemming song titles like "Leaves" → "leav".

---

## 8. Keyset pagination

Faster and more stable than `OFFSET` for large result sets. Order by a unique composite key.

```sql
-- first page
SELECT id, title, artist, created_at
FROM songs
WHERE deleted_at IS NULL
ORDER BY created_at DESC, id DESC
LIMIT 50;

-- subsequent pages: pass last row's (created_at, id) as $1, $2
SELECT id, title, artist, created_at
FROM songs
WHERE deleted_at IS NULL
  AND (created_at, id) < ($1, $2)
ORDER BY created_at DESC, id DESC
LIMIT 50;
```

Row-value comparison `(created_at, id) < ($1, $2)` is lexicographic: rows with smaller `created_at` win; ties broken by smaller `id`. Supported by a composite index `(created_at DESC, id DESC)` if paging is hot.

---

## 9. Batch upsert on re-ingest

`source_sha256` is the idempotency key. Re-ingest of an unchanged MusicXML is a no-op; re-ingest after an edit replaces derived columns.

```sql
INSERT INTO songs (
  id, title, artist, key, mode, tempo,
  time_sig_num, time_sig_den,
  chord_json, abs_sequence, rn_sequence, chord_vocab,
  musicxml_url, source_sha256, schema_version
) VALUES (
  $1, $2, $3, $4, $5, $6,
  $7, $8,
  $9::jsonb, $10::text[], $11::text[], $12::text[],
  $13, $14, $15
)
ON CONFLICT (source_sha256) DO UPDATE SET
  title          = EXCLUDED.title,
  artist         = EXCLUDED.artist,
  key            = EXCLUDED.key,
  mode           = EXCLUDED.mode,
  tempo          = EXCLUDED.tempo,
  time_sig_num   = EXCLUDED.time_sig_num,
  time_sig_den   = EXCLUDED.time_sig_den,
  chord_json     = EXCLUDED.chord_json,
  abs_sequence   = EXCLUDED.abs_sequence,
  rn_sequence    = EXCLUDED.rn_sequence,
  chord_vocab    = EXCLUDED.chord_vocab,
  musicxml_url   = EXCLUDED.musicxml_url,
  schema_version = EXCLUDED.schema_version,
  updated_at     = NOW()
RETURNING id, (xmax = 0) AS inserted;
```

`(xmax = 0)` is the Postgres idiom for "row was inserted, not updated" — useful for telemetry.

---

## 10. Soft delete

Never `DELETE` — set `deleted_at` and filter everywhere.

```sql
UPDATE songs SET deleted_at = NOW() WHERE id = $1;

-- restore
UPDATE songs SET deleted_at = NULL WHERE id = $1;
```

Every read query must include `WHERE deleted_at IS NULL`. The partial indexes (`songs_key_mode`) already carry this predicate; add it to any new indexes you create to keep them lean.

Tombstone garbage collection (optional, monthly cron):

```sql
DELETE FROM songs
WHERE deleted_at IS NOT NULL
  AND deleted_at < NOW() - INTERVAL '90 days';
```

## See also

- [Schema Reference](./06-schema-reference.md) — JSON shape of `chord_json`.
- [Ingestion Pipeline](./08-ingestion-pipeline.md) — producer of these rows.
