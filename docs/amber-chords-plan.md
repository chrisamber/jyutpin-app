# amber-chords

A first-party Amber Audio product: a chord-annotated song corpus, API, and ML-ready dataset. Jyutpin/WaaPou is the first consumer, not the owner.

---

## 1. Vision & Positioning

**What it is.** `amber-chords` is a curated, structured corpus of chord-annotated songs plus an HTTP API and a shared schema package. The underlying asset is a set of MusicXML files (2–3k songs exported from Sibelius) normalized into a beat-aligned JSON representation that stores chords in both absolute (e.g. `Am`) and functional (Roman numeral, e.g. `vi`) form.

**Why it is its own product, not a jyutpin feature.**

- Jyutpin/WaaPou targets Cantonese learners — a small market. A chord engine is language-agnostic and can power Mandarin, J-pop, worship, jazz practice, or songwriting tools.
- The dataset itself is the moat. Curated, transposition-invariant, ML-ready chord data of this size is rare. It deserves independent branding, versioning, and licensing.
- Keeping the corpus inside jyutpin entangles a consumer UI with infrastructure, makes it impossible to sell/open-source the data independently, and prevents a clean API boundary.
- API-first design forces discipline: if jyutpin consumes it via HTTP, so can any future app, partner, or ML notebook.

**Positioning statement.** *The Genius for functional harmony: every song, every chord, in every key, ready to query.*

**First-class consumers (planned).**

1. jyutpin-app (WaaPou) — Cantonese chord + lyric leadsheets.
2. A future Mandarin worship app.
3. Internal ML notebooks for progression generation and style classification.
4. Potential third-party API customers.

---

## 2. Repo Layout

Two repos under the Amber Audio GitHub org:

```
amber-chords/                      # API + web (Next.js 15 on Vercel)
├── app/
│   ├── (marketing)/               # Landing page at chords.amberaudio.com
│   ├── api/
│   │   └── v1/
│   │       ├── songs/
│   │       │   ├── route.ts                 # GET list, POST create
│   │       │   └── [id]/
│   │       │       ├── route.ts             # GET one
│   │       │       └── musicxml/route.ts    # GET MusicXML blob
│   │       ├── search/route.ts              # GET ?progression=ii-V-I
│   │       └── keys/route.ts                # API key mgmt (admin)
│   └── docs/                      # API reference (MDX)
├── lib/
│   ├── db/
│   │   ├── schema.ts              # Drizzle schema
│   │   ├── queries.ts
│   │   └── migrations/
│   ├── auth/                      # API key verification middleware
│   ├── blob/                      # Vercel Blob client for MusicXML
│   └── search/                    # Progression search (rn_sequence @>)
├── drizzle.config.ts
├── package.json
└── vercel.json

amber-chords-ingest/               # Python ingestion pipeline (separate repo)
├── ingest/
│   ├── __init__.py
│   ├── parse.py                   # music21 MusicXML -> normalized JSON
│   ├── roman.py                   # Key-aware Roman numeral derivation
│   ├── validate.py                # JSON Schema validation
│   ├── upload.py                  # Postgres + Blob writes via API
│   ├── review_queue.py            # Human-review staging for failures
│   └── cli.py                     # `amber-chords-ingest path/to/folder`
├── tests/
├── fixtures/                      # Sample MusicXML for tests
├── pyproject.toml
└── .github/workflows/ci.yml

@amberaudio/chord-schema/          # npm package (monorepo-ready, lives in amber-chords/packages/schema)
├── src/
│   ├── schema.json                # JSON Schema (draft 2020-12)
│   ├── types.ts                   # Generated TS types (json-schema-to-typescript)
│   └── index.ts                   # Runtime validator (ajv) + types re-export
├── package.json
└── README.md
```

---

## 3. Data Model

### 3.1 Song JSON (runtime shape; also the shape returned by the API)

```json
{
  "id": "01HXYZ...ULID",
  "version": 1,
  "schemaVersion": "1.0.0",
  "metadata": {
    "title": "Autumn Leaves",
    "artist": "Joseph Kosma",
    "composer": "Joseph Kosma",
    "lyricist": "Jacques Prevert",
    "year": 1945,
    "language": null,
    "source": { "kind": "sibelius-musicxml", "importedAt": "2026-04-17T00:00:00Z" },
    "tags": ["jazz-standard", "real-book"],
    "license": "proprietary"
  },
  "musical": {
    "key": { "tonic": "Gm", "mode": "minor" },
    "timeSignature": { "numerator": 4, "denominator": 4 },
    "tempo": { "bpm": 96, "feel": "swing" },
    "beatsPerBar": 4
  },
  "sections": [
    { "id": "A1", "label": "A", "startBar": 0, "endBar": 7 },
    { "id": "A2", "label": "A", "startBar": 8, "endBar": 15 },
    { "id": "B",  "label": "B", "startBar": 16, "endBar": 23 }
  ],
  "bars": [
    {
      "index": 0,
      "sectionId": "A1",
      "beats": [
        { "beat": 0, "chord": { "absolute": "Cm7", "roman": "iv7" } },
        { "beat": 1, "chord": null },
        { "beat": 2, "chord": { "absolute": "F7",  "roman": "VII7" } },
        { "beat": 3, "chord": null }
      ]
    }
  ],
  "derived": {
    "rnSequence": ["iv7", "VII7", "III^7", "VI^7", "iiø7", "V7", "i"],
    "absSequence": ["Cm7", "F7", "Bb^7", "Eb^7", "Aø7", "D7", "Gm"],
    "chordVocab": ["Cm7", "F7", "Bb^7", "Eb^7", "Aø7", "D7", "Gm"],
    "uniqueRomanSet": ["iv7", "VII7", "III^7", "VI^7", "iiø7", "V7", "i"]
  },
  "archive": {
    "musicxmlBlobUrl": "https://blob.vercel-storage.com/amber-chords/01HXYZ.musicxml",
    "musicxmlSha256": "abc123...",
    "musicxmlBytes": 18423
  }
}
```

Notes:

- `bars[].beats[].chord` is `null` for sustain. A rest/N.C. is `{ "absolute": "N.C.", "roman": null }`.
- `derived.*` is server-computed, indexed, and the primary input to ML and progression search.
- Roman numerals use uppercase for major quality, lowercase for minor, `^7` for maj7, `ø7` for half-diminished, `o7` for fully diminished. Stored as plain strings; a parser lives in `@amberaudio/chord-schema`.
- No lyrics, no romanization, no per-language content. Consumers overlay their own.

### 3.2 JSON Schema (draft excerpt; full doc ships in `@amberaudio/chord-schema`)

```json
{
  "$id": "https://chords.amberaudio.com/schema/song-1.0.0.json",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["id", "schemaVersion", "metadata", "musical", "bars", "derived"],
  "properties": {
    "id": { "type": "string", "pattern": "^[0-9A-HJKMNP-TV-Z]{26}$" },
    "schemaVersion": { "type": "string" },
    "musical": {
      "type": "object",
      "required": ["key", "timeSignature", "beatsPerBar"],
      "properties": {
        "key": {
          "type": "object",
          "required": ["tonic", "mode"],
          "properties": {
            "tonic": { "type": "string", "pattern": "^[A-G][b#]?m?$" },
            "mode":  { "enum": ["major", "minor", "dorian", "mixolydian", "lydian", "phrygian", "locrian"] }
          }
        }
      }
    },
    "bars": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["index", "beats"],
        "properties": {
          "beats": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["beat", "chord"],
              "properties": {
                "beat": { "type": "integer", "minimum": 0 },
                "chord": {
                  "oneOf": [
                    { "type": "null" },
                    {
                      "type": "object",
                      "required": ["absolute"],
                      "properties": {
                        "absolute": { "type": "string" },
                        "roman":    { "type": ["string", "null"] }
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  }
}
```

### 3.3 Postgres schema (Drizzle / plain SQL)

```sql
-- Core corpus
CREATE TABLE songs (
  id              TEXT PRIMARY KEY,                 -- ULID
  schema_version  TEXT NOT NULL DEFAULT '1.0.0',
  title           TEXT NOT NULL,
  artist          TEXT,
  composer        TEXT,
  lyricist        TEXT,
  year            INTEGER,
  tonic           TEXT NOT NULL,                    -- 'Gm', 'C', 'F#'
  mode            TEXT NOT NULL,                    -- 'major' | 'minor' | modal
  tempo_bpm       REAL,
  time_num        SMALLINT NOT NULL,
  time_den        SMALLINT NOT NULL,
  beats_per_bar   SMALLINT NOT NULL,
  bar_count       INTEGER NOT NULL,
  license         TEXT,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  source_kind     TEXT NOT NULL,                    -- 'sibelius-musicxml'
  data            JSONB NOT NULL,                   -- full song JSON (3.1 above)
  rn_sequence     TEXT[] NOT NULL,                  -- flat Roman numeral tokens for ML/search
  abs_sequence    TEXT[] NOT NULL,                  -- flat absolute chord tokens
  musicxml_url    TEXT NOT NULL,                    -- Vercel Blob URL
  musicxml_sha256 TEXT NOT NULL,
  musicxml_bytes  INTEGER NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX songs_artist_idx          ON songs (artist);
CREATE INDEX songs_tags_gin            ON songs USING GIN (tags);
CREATE INDEX songs_data_gin            ON songs USING GIN (data jsonb_path_ops);
CREATE INDEX songs_rn_seq_gin          ON songs USING GIN (rn_sequence);
CREATE INDEX songs_abs_seq_gin         ON songs USING GIN (abs_sequence);
CREATE INDEX songs_tonic_mode_idx      ON songs (tonic, mode);

-- API keys
CREATE TABLE api_keys (
  id             TEXT PRIMARY KEY,                  -- ULID
  name           TEXT NOT NULL,                     -- human label, e.g. 'jyutpin-prod'
  consumer       TEXT NOT NULL,                     -- 'jyutpin', 'internal-ml', etc.
  key_hash       TEXT NOT NULL UNIQUE,              -- sha256(raw_key)
  key_prefix     TEXT NOT NULL,                     -- first 8 chars for display
  scopes         TEXT[] NOT NULL DEFAULT '{read}',  -- 'read' | 'write' | 'admin'
  rate_limit_rpm INTEGER NOT NULL DEFAULT 120,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at   TIMESTAMPTZ,
  revoked_at     TIMESTAMPTZ
);

-- Ingest audit + human-review queue
CREATE TABLE ingest_runs (
  id           TEXT PRIMARY KEY,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at  TIMESTAMPTZ,
  total        INTEGER NOT NULL DEFAULT 0,
  succeeded    INTEGER NOT NULL DEFAULT 0,
  failed       INTEGER NOT NULL DEFAULT 0,
  notes        TEXT
);

CREATE TABLE ingest_review_queue (
  id            TEXT PRIMARY KEY,
  run_id        TEXT REFERENCES ingest_runs(id),
  source_path   TEXT NOT NULL,                      -- original MusicXML filename
  musicxml_url  TEXT,                               -- uploaded even on failure for review
  error_stage   TEXT NOT NULL,                      -- 'parse' | 'roman' | 'validate'
  error_detail  JSONB NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',    -- 'pending' | 'resolved' | 'skipped'
  resolved_song_id TEXT REFERENCES songs(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.4 Blob <-> Row relationship

- Canonical MusicXML lives in Vercel Blob at `amber-chords/{song_id}.musicxml` (immutable, content-addressed via `musicxml_sha256`).
- `songs.data` is the derived runtime representation. Regenerating it from the archive is always possible; re-ingest tooling lives in `amber-chords-ingest`.
- When a song is re-ingested (e.g. after a parser fix), `song_id` is stable, `schema_version` bumps, `data`/`rn_sequence` are overwritten, MusicXML blob is overwritten only if the source file itself changed.

---

## 4. Ingestion Pipeline

```
Sibelius (batch export MusicXML)
        │
        ▼
amber-chords-ingest CLI  (Python 3.12)
  1. Walk folder, glob *.xml / *.musicxml
  2. parse.py      : music21.converter.parse -> normalize to schema
  3. roman.py      : music21.roman.romanNumeralFromChord(chord, key)
                     - respects tonicization / secondary dominants
                     - falls back to `null` roman if ambiguous
  4. validate.py   : ajv-equivalent (jsonschema lib) against schema 1.0.0
  5. upload.py     : POST /v1/songs (admin API key) + PUT MusicXML to Blob
  6. On any failure -> ingest_review_queue row, MusicXML still uploaded
        │
        ▼
Postgres (songs) + Vercel Blob (MusicXML archive)
```

**CLI example:**

```bash
amber-chords-ingest run \
  --input ./sibelius-exports/ \
  --api https://chords.amberaudio.com \
  --key $AMBER_CHORDS_ADMIN_KEY \
  --dry-run    # validate without uploading
```

**Human-review queue.** Anything that fails parse, roman derivation, or schema validation lands in `ingest_review_queue` with the original MusicXML still archived. A small Next.js admin route at `/admin/review` (API-key gated) lists failures, shows the raw XML + parse error, and lets a human edit the JSON and mark resolved. No fancy UI; list + textarea + save.

**Idempotency.** Each MusicXML file hashes to a stable `musicxml_sha256`. The CLI checks Postgres before uploading; unchanged files are skipped unless `--force`.

---

## 5. API Surface (v1)

Base URL: `https://chords.amberaudio.com/v1`. All responses JSON. Auth via `Authorization: Bearer <api_key>` (see section 6).

### GET /v1/songs

List songs, paginated.

```
GET /v1/songs?artist=Joni+Mitchell&tag=jazz-standard&limit=50&cursor=...
Authorization: Bearer amb_live_...

200 OK
{
  "data": [
    { "id": "01HXYZ...", "title": "Blue", "artist": "Joni Mitchell", "tonic": "C", "mode": "major", "barCount": 48 }
  ],
  "nextCursor": "eyJpZCI6Ij..."
}
```

### GET /v1/songs/:id

```
GET /v1/songs/01HXYZ...

200 OK
<full Song JSON from section 3.1>
```

### GET /v1/songs/:id/musicxml

Streams the original MusicXML (redirects to Blob URL with short-lived signature).

```
GET /v1/songs/01HXYZ.../musicxml
-> 302 Location: https://blob.vercel-storage.com/...
```

### GET /v1/search

Progression search. Matches contiguous subsequence in `rn_sequence` (via `text[] @>` + position check) or `abs_sequence` if `?absolute=true`.

```
GET /v1/search?progression=ii7-V7-I^7&limit=20

200 OK
{
  "query": { "progression": ["ii7", "V7", "I^7"], "absolute": false },
  "matches": [
    {
      "songId": "01HXYZ...",
      "title": "Autumn Leaves",
      "occurrences": [ { "barIndex": 4, "beatIndex": 0 } ]
    }
  ]
}
```

### POST /v1/songs (auth: `write` scope)

Upsert a song. Used exclusively by the ingestion pipeline and future user submissions.

```
POST /v1/songs
Authorization: Bearer amb_live_...
Content-Type: application/json

{ <Song JSON> , "musicxmlBase64": "..." }

201 Created
{ "id": "01HXYZ...", "musicxmlBlobUrl": "..." }
```

### GET /v1/keys (auth: `admin`)

Lists API keys (hashes only). `POST /v1/keys` mints a new one and returns the raw key exactly once.

### Error shape

```json
{ "error": { "code": "not_found", "message": "Song 01HXYZ... not found" } }
```

---

## 6. Auth Model

**v1: API keys, nothing more.**

- Format: `amb_live_<26-char-ULID>_<32-char-secret>`. Prefix is human-recognizable; secret is what matters.
- Storage: `api_keys.key_hash = sha256(raw_key)`. Raw key shown exactly once at creation.
- Middleware: Next.js `middleware.ts` matches `/v1/*`, parses Bearer token, looks up hash, checks `revoked_at IS NULL`, injects `{ consumer, scopes }` into request context.
- Scopes: `read` (GET), `write` (POST songs), `admin` (key mgmt, review queue).
- Rate limiting: per-key `rate_limit_rpm` column, enforced via Vercel KV counter.

**Future, not now:** OAuth / Sign in with Vercel for a public developer portal, team-scoped keys, usage billing. Do not build until there are external developers asking for it.

**Key rotation.** New key minted, old key kept active for 30 days, then revoked. Consumer deploys pick up the new key via Vercel env vars.

---

## 7. Shared Schema Package: `@amberaudio/chord-schema`

Published to npm, public. Lives in `amber-chords/packages/schema/`.

```
packages/schema/
├── src/
│   ├── schema.json             # canonical JSON Schema
│   ├── types.ts                # generated from schema.json (json-schema-to-typescript)
│   ├── validators.ts           # ajv compiled validators
│   ├── roman.ts                # parseRoman('iiø7') -> { degree: 2, quality: 'half-diminished', ext: '7' }
│   └── index.ts
├── package.json                # "exports": { ".": "./src/index.ts" }
└── README.md
```

**Versioning.** Semver strict. Schema breaking changes -> major. Each published version embeds `schemaVersion` string matching the JSON Schema `$id`.

**jyutpin-app import (future state):**

```ts
import type { Song, Bar, Chord } from '@amberaudio/chord-schema'
import { validateSong, parseRoman } from '@amberaudio/chord-schema'
```

jyutpin-app keeps its own local chord format (`chordStorage.js`) until the migration in section 11 is complete. The schema package just gives it types the moment it starts calling the API.

---

## 8. ML-Readiness

### Chord vocabulary

**Choice (provisional):** HookTheory-style ~200-symbol Roman numeral vocabulary. Rationale: battle-tested in published ML papers, compact enough for transformer training, expressive enough for pop/jazz. Escape hatch: `rn_sequence` tokens are plain strings, so we can retokenize to McGill Billboard or Harte notation later without data migration.

**Tokenization.** Each beat that has a chord change emits one token. Sustains are not tokens (they are implied by beat position). For sequence models, downsample to chord-change sequence (`rnSequence`) or keep beat-aligned with a `<sustain>` token — both are trivially derivable.

### Dataset versioning

- Dataset snapshots are exported as Parquet files to Vercel Blob under `amber-chords/datasets/{date}-v{n}.parquet`.
- Each snapshot embeds `schemaVersion` and a SHA over the set of included `song_id + updated_at` pairs.
- A small CLI (`amber-chords-ingest dataset export --out ...`) produces snapshots; notebooks pin to a snapshot URL, never to live DB.

### First ML experiments (ordered by payoff per effort)

1. **Progression generation.** GPT-style transformer on `rn_sequence`, conditioned on `tonic/mode/tags`. Evaluate via held-out perplexity and human A/B.
2. **Style classification.** Bag-of-rn-bigrams + logistic regression baseline, then small transformer. Label from `tags`.
3. **Auto-harmonization.** Given a melody (future work — needs note data from MusicXML), predict chords. Already have MusicXML, so melody extraction is free.
4. **Chord-substitution suggestions.** Given a progression, propose alternates (tritone sub, modal interchange) using retrieval over the corpus.

---

## 9. Tech Stack

**Ingestion (`amber-chords-ingest`)**
- Python 3.12
- `music21` — MusicXML parsing, Roman numeral derivation, key analysis
- `jsonschema` — validation
- `httpx` — API client
- `SQLAlchemy` + `Alembic` — only for local dev DB; production writes go through the API
- `typer` — CLI
- `pytest`

**API + Web (`amber-chords`)**
- Next.js 15 (App Router, Node.js runtime for DB routes)
- Drizzle ORM + Neon Postgres (serverless)
- Vercel Blob for MusicXML archive
- Vercel KV for rate limits
- `ajv` for runtime JSON Schema validation (shared with `@amberaudio/chord-schema`)
- MDX for `/docs`
- TypeScript strict

**Shared**
- `@amberaudio/chord-schema` published to npm public registry

---

## 10. Deployment Plan

- **Vercel team:** new team `amber-audio` (separate from jyutpin's personal scope). Contains two projects: `amber-chords` (API/web) and `amber-chords-admin` (optional review tool, or routed under `/admin` in main app).
- **Domain:** `chords.amberaudio.com` for API. `amberaudio.com` reserved for brand landing (not this plan).
- **Environments:**
  - Production: `chords.amberaudio.com`, Neon prod branch, Blob prod store.
  - Preview: auto per PR, uses Neon preview branches (Vercel Neon integration) and a shared Blob store with `preview/` prefix.
- **GitHub Actions**
  - `amber-chords`: typecheck, lint, `drizzle-kit generate` diff check, unit tests. Deploy handled by Vercel Git integration.
  - `amber-chords-ingest`: pytest, mypy, ruff on PR. `workflow_dispatch` job to run batch ingest against production (requires `AMBER_CHORDS_ADMIN_KEY` secret).
- **Secrets:** `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `KV_*`, `AMBER_CHORDS_ADMIN_KEY` (self-issued for internal jobs).

---

## 11. Migration Plan for jyutpin-app

Goal: jyutpin-app stops being the source of truth for chord data without breaking existing users.

**Today (jyutpin localStorage).**
- `chords:{storageId}` — per-song user annotations in OLD (`{line:{char:chord}}`) or NEW (`{line:{bar:{beat:chord}}}`) format.
- No central corpus; demo song chords live inline.

**Phase 0 — coexist (ships with amber-chords M1).**
- jyutpin-app installs `@amberaudio/chord-schema` but does not call the API.
- Existing localStorage chord data untouched.

**Phase 1 — read-through for curated songs (amber-chords M2).**
- When a song is loaded, jyutpin queries `GET /v1/songs?isrc=...` or `?title+artist=...`. If a match exists, its beat-grid chords become the default overlay, pre-filled into the jyutpin UI.
- User edits still write to localStorage and take precedence over the corpus-provided chords (merge at render time, same pattern as today).
- Demo song (背脊唱情歌) gets ingested as the first amber-chords record.

**Phase 2 — write-back (post-M3).**
- Authenticated users (future jyutpin accounts) can opt-in to submit corrections via `POST /v1/songs` with `write` scope.
- localStorage becomes a cache, not a source of truth, for logged-in users. Anonymous users continue as today.

**Phase 3 — decommission jyutpin chord editor backend.**
- `chordStorage.js` in jyutpin becomes a thin client over amber-chords API + a local offline cache. OLD-format migration utility runs on first read and upserts to amber-chords.

No code in jyutpin-app needs to change until amber-chords M2.

---

## 12. Roadmap / Milestones

| Milestone | Scope | Exit criteria |
|---|---|---|
| **M1 — Schema + pilot ingest** | `@amberaudio/chord-schema` v1.0.0 published. `amber-chords-ingest` ingests 100 songs from Sibelius. Postgres + Blob up on prod. | 100 songs queryable via direct SQL. JSON Schema validates all of them. Review queue working. |
| **M2 — Public API** | v1 endpoints live at `chords.amberaudio.com`. API key auth. Basic docs page. jyutpin-app consumes `GET /v1/songs/:id` for demo song. | jyutpin demo song served from amber-chords in production. External `curl` with API key works. |
| **M3 — Full corpus** | All 2–3k Sibelius songs ingested. Review queue drained. Progression search (`GET /v1/search`) shipped. | `rn_sequence @>` queries return correct results. Corpus size documented. |
| **M4 — ML experiments** | Parquet dataset export. Progression-generation transformer trained on M3 corpus. Notebook published internally. | Model generates stylistically plausible 8-bar progressions given key + genre tag. |
| **M5 — Second consumer** | A second app (Mandarin worship or songwriting tool) ships consuming amber-chords. | Non-jyutpin consumer in production using an independently-issued API key. |

Rough calendar (aspirational, not committed): M1 within 4 weeks of start, M2 +3 weeks, M3 +6 weeks, M4 +8 weeks, M5 opportunistic.

---

## 13. Open Questions

1. **Licensing of the corpus.** User-authored arrangements of copyrighted songs — can we serve the MusicXML publicly, or only derived chord data? Leaning: MusicXML archive is private (admin-only endpoint), derived chords served freely under a permissive data license (CC-BY?). Needs legal sanity check.
2. **CC-licensed seed subset.** Should we ingest a public dataset (e.g. Wikifonia remnants, iRealPro community charts, McGill Billboard) to seed credibility and inbound SEO without copyright exposure? Leaning yes, tagged `license: cc-by-sa` and served with no MusicXML archive.
3. **Final chord vocabulary.** HookTheory-200 vs McGill Billboard vs Harte notation. Decision can wait until M3 — tokens are strings, retokenization is cheap.
4. **Pricing.** Free tier for research + open-source consumers; paid for commercial? Or fully free until there's a reason not to be? Likely free through M5.
5. **ISRC / MusicBrainz IDs.** Add an `external_ids` JSONB column now or later? Leaning now, so deduping across sources is trivial.
6. **Modal corpora.** Are modal tunes (dorian, mixolydian) stored with `mode: 'dorian'` and Roman numerals relative to the modal tonic, or relative to the parallel major? Current plan: relative to modal tonic. Needs validation against music21's default behavior.
7. **Melody storage.** MusicXML has it; do we parse it into the song JSON now for future ML, or keep JSON chord-only and re-derive on demand? Leaning: chord-only in JSON, melody stays in the archive until M4.
8. **Admin UI scope.** Barebones review queue vs a proper editor. Start barebones; invest only if review volume warrants.
9. **Ingest concurrency.** 3k songs, single-threaded music21 parse is slow. Parallelize with `multiprocessing` or punt? Punt unless M3 timeline slips.
10. **Schema package repo layout.** Keep inside `amber-chords/packages/schema` as a workspace, or split to its own repo? Leaning monorepo until there's pain.
