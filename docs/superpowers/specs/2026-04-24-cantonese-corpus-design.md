# Cantonese Song Corpus — Design Spec

*Date: 2026-04-24 · Author: Chris Amber · Status: Approved*

---

## Goal

Integrate 100 popular Cantonese songs with rich learning annotations (Jyutping, danger zones, drills) as a static corpus shipped with the app. The corpus must:

- Be hand-authored one song at a time via Claude Max interactive sessions
- Persist user data (chords, sections) in localStorage using the existing key pattern
- Export as `corpus.jsonl` for ML fine-tuning
- Survive app version migrations without data loss

---

## Approach

**JSON corpus files (Approach B)** — one `.json` file per song, aggregated via `import.meta.glob`. JSON is natively the ML export format; per-song files produce clean git diffs; the Vite glob import means `index.js` never needs manual updates.

---

## File Organization

```
src/data/corpus/
  index.js                        ← aggregator, exports CORPUS Map + getCuratedSong()
  gareth-t/
    back-turned-love-song.json
  eason-chan/
    sap-nin.json
    fu-si-san-ha.json
  jacky-cheung/
    mui-tin-oi-nei-do-jat-se.json
  ...

scripts/
  export-corpus.js                ← writes corpus.jsonl for ML fine-tuning

src/data/corpus-schema.js         ← JSDoc typedef (single source of truth for shape)
```

**Slug convention:** `{artist-en-kebab}/{title-jyutping-romanized-kebab}` — tones dropped from filename for readability (`sap-nin.json` not `sap6-nin4.json`).

---

## Canonical Song Schema

```json
{
  "_meta": {
    "slug": "eason-chan/sap-nin",
    "storageId": "curated:eason-chan:sap-nin",
    "generatedBy": "claude-sonnet-4-6",
    "generatedAt": "2026-04-24",
    "schemaVersion": 1,
    "lrclibId": 12345
  },
  "title": "十年",
  "titleEn": "Ten Years",
  "artist": "陳奕迅",
  "artistEn": "Eason Chan",
  "album": "黑白灰",
  "year": 2003,
  "language": "yue",
  "lines": [
    {
      "chinese": "原來過了很久",
      "jyutping": "jyun4 loi4 gwo3 liu5 han2 gau2",
      "translation": "It turns out a long time has passed",
      "section": "verse-1",
      "dangers": [
        {
          "word": "過",
          "jyutping": "gwo3",
          "tone": 3,
          "note": "Mid level — must stay flat."
        }
      ]
    }
  ],
  "drills": [
    {
      "type": "entering-tones",
      "title": "Unreleased Stops",
      "subtitle": "8 words found",
      "targets": [
        { "word": "不", "jyutping": "bat1" }
      ],
      "steps": [
        "Say each slowly. At the final -p/-t/-k, your tongue/lips CLOSE but produce ZERO sound after.",
        "Test: hold a tissue. The tissue should NOT move on the stop consonant."
      ]
    }
  ],
  // singingRules and dangerWordsSummary are omitted entirely when not generated
}

```

### Field reference

| Field | Required | Notes |
|---|---|---|
| `_meta.slug` | yes | `{artist-slug}/{song-slug}` |
| `_meta.storageId` | yes | `curated:{artist-slug}:{song-slug}` — namespaces all localStorage keys |
| `_meta.schemaVersion` | yes | `1` — increment on breaking schema changes |
| `_meta.lrclibId` | no | Present when lyrics sourced from LRCLIB |
| `lines[].section` | no | `verse-1`, `verse-2`, `pre-chorus`, `chorus`, `bridge`, `outro` |
| `lines[].dangers` | no | Omit key entirely when no dangers (not `[]`) |
| `drills[].type` | yes | Enum — see below |
| `singingRules` | no | Optional top-level; omit when not generated |
| `dangerWordsSummary` | no | Optional top-level; omit when not generated |

### Drill types (enum)

| Type | Description |
|---|---|
| `entering-tones` | Unreleased stop finals (-p/-t/-k) |
| `ng-onset` | ng- initial words |
| `tone-confusion` | Minimal pairs where wrong tone = different word |
| `aspirated-initials` | Aspirated vs unaspirated stop pairs |
| `tone-pair` | T2 vs T5 scoop calibration, or other contour pairs |
| `contour-reading` | Full phrase pitch contour reading |

### Chorus repeat lines

Omit from the JSON. The app deduplicates by `chinese` text match at render time (existing behaviour). This keeps files lean and the ML corpus non-redundant.

---

## StorageId & localStorage

`storageId: "curated:{artist-slug}:{song-slug}"` plugs directly into the existing key pattern:

```
chords:curated:eason-chan:sap-nin
sections:curated:eason-chan:sap-nin
editedlyrics:curated:eason-chan:sap-nin
```

No migration required — the `curated:` prefix is new and does not collide with `lrclib:` or `demo:` keys.

---

## `src/data/corpus/index.js`

```js
const modules = import.meta.glob('./**/*.json', { eager: true });

export const CORPUS = new Map(
  Object.values(modules).map((m) => [m.default._meta.storageId, m.default])
);

export function getCuratedSong(storageId) {
  return CORPUS.get(storageId) ?? null;
}
```

---

## App Integration

1. `SongContext` calls `getCuratedSong(storageId)` on load. If a match is found, base Jyutping/dangers/drills come from the corpus file; user chords/sections are merged from localStorage as usual.
2. The catalog page shows a "Curated" badge on songs whose `storageId` exists in `CORPUS`.
3. The study UI renders drills from `song.drills[]` if present.
4. Curated annotations (Jyutping, danger zones, drills) are **read-only** in the UI. Corrections go back to the source JSON file.

---

## Export Pipeline

```js
// scripts/export-corpus.js  (plain Node — no Vite)
import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';

const files = globSync('src/data/corpus/**/*.json');
const songs = files.map((f) => JSON.parse(readFileSync(f, 'utf8')));
writeFileSync('corpus.jsonl', songs.map((s) => JSON.stringify(s)).join('\n'));
console.log(`Exported ${songs.length} songs → corpus.jsonl`);
```

Run: `node scripts/export-corpus.js` → `corpus.jsonl`, one song per line, ready for fine-tuning. (`glob` is already a transitive dep via Vite — no new install needed.)

---

## Authoring Workflow (Claude Max)

For each new song, use this prompt in Claude Max:

```
System context: You are generating a structured Cantonese song learning file in JSON.
Follow the schema exactly. Language: Cantonese (yue), Jyutping romanization only.

Song: {title} by {artist} ({year})
Lyrics:
{paste raw lyrics}

Generate a JSON object with:
- _meta: slug "{artist-slug}/{song-slug}", storageId "curated:{artist-slug}:{song-slug}",
  generatedBy "claude-sonnet-4-6", generatedAt "{today}", schemaVersion 1
- All metadata fields (title, titleEn, artist, artistEn, album, year, language: "yue")
- lines[] — every unique line with chinese, jyutping (verified Jyutping), translation
  (natural English), section label, and dangers[] where relevant
- drills[] — detect: entering-tones, ng-onset, tone-confusion, aspirated-initials,
  tone-pair, contour-reading
- Omit chorus repeat lines (app dedupes by text match)
- Omit singingRules and dangerWordsSummary for now
```

Save output as `src/data/corpus/{artist-slug}/{song-slug}.json` and commit.

---

## Migration Strategy

- `schemaVersion: 1` is stored in every file's `_meta`
- If a breaking schema change is needed in future, bump to `2` and add a migration shim in `index.js` that upgrades v1 → v2 at load time
- User localStorage keys (`chords:`, `sections:`) are independent of schema version and need no migration

---

## What's Out of Scope

- Runtime annotation generation (all annotation is offline, author-driven)
- User correction of curated annotations (read-only; fix in source file)
- Mandarin (`cmn`) or Yale romanization variants in corpus (Jyutping only)
