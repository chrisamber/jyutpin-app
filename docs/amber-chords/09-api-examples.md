---
title: API Examples
topic: api
tags: [api, examples, rest, curl]
audience: [ai-agent, developer]
related: [03-roman-numeral-spec.md, 10-error-catalog.md]
---

# API Examples

Request/response gallery for the `amber-chords` public API. Base URL `https://chords.amberaudio.com/v1`. All requests require `Authorization: Bearer akey_xxx`. Responses include `X-RateLimit-Remaining`, `X-Request-Id`, and `Cache-Control: public, max-age=300` on GETs.

## 1. Jazz standard — `GET /v1/songs/:id`

Autumn Leaves in E minor. Demonstrates secondary-dominant routing and `ii7b5 V7 i` minor cadence.

```http
GET /v1/songs/sng_9a1f2c HTTP/1.1
Host: chords.amberaudio.com
Authorization: Bearer akey_xxx
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json
X-RateLimit-Remaining: 4987
X-Request-Id: req_01HY7T9K2M
Cache-Control: public, max-age=300
```

```json
{
  "id": "sng_9a1f2c",
  "title": "Autumn Leaves (study)",
  "key": "E",
  "mode": "minor",
  "tempo": 112,
  "time_signature": "4/4",
  "schema_version": "1.3.0",
  "source_sha256": "3f2a...e91",
  "abs_sequence": ["Am7","D7","Gmaj7","Cmaj7","F#m7b5","B7","Em","Em"],
  "rn_sequence": ["iv7","VII7","IIImaj7","VImaj7","ii7b5","V7","i","i"],
  "sections": [
    { "label": "A", "start_bar": 1, "end_bar": 8 }
  ],
  "chord_vocab": ["Am7","D7","Gmaj7","Cmaj7","F#m7b5","B7","Em"]
}
```

## 2. Cantopop ballad — `POST /v1/songs`

Ballad in C major with a bridge modulation up to G. Illustrates multi-section `key` override.

```http
POST /v1/songs HTTP/1.1
Host: chords.amberaudio.com
Authorization: Bearer akey_xxx
Content-Type: application/json
```

```json
{
  "title": "Beautiful Cantonese Song",
  "key": "C",
  "mode": "major",
  "tempo": 78,
  "time_signature": "4/4",
  "sections": [
    {
      "label": "verse",
      "start_bar": 1,
      "end_bar": 8,
      "key": "C",
      "abs_sequence": ["C","Am","F","G","C","Am","F","G"]
    },
    {
      "label": "bridge",
      "start_bar": 9,
      "end_bar": 12,
      "key": "G",
      "abs_sequence": ["G","Em","C","D"]
    }
  ],
  "source_sha256": "9c4b...a02"
}
```

```http
HTTP/1.1 201 Created
Location: /v1/songs/sng_b77e01
X-RateLimit-Remaining: 4986
X-Request-Id: req_01HY7TB3F1
```

```json
{
  "id": "sng_b77e01",
  "rn_sequence": ["I","vi","IV","V","I","vi","IV","V","I","vi","IV","V"],
  "key_changes": [{ "bar": 9, "from": "C", "to": "G" }],
  "created_at": "2026-04-17T14:22:08Z"
}
```

## 3. Modal pop — `GET /v1/search?progression=`

Dorian vamp. Search endpoint matches Roman-numeral progressions across the corpus and returns hit positions.

```http
GET /v1/search?progression=i,iv,bVI,bVII,i&mode=dorian&limit=3 HTTP/1.1
Host: chords.amberaudio.com
Authorization: Bearer akey_xxx
```

```http
HTTP/1.1 200 OK
X-RateLimit-Remaining: 4982
X-Request-Id: req_01HY7TC4D8
Cache-Control: public, max-age=300
```

```json
{
  "query": {
    "progression": ["i","iv","bVI","bVII","i"],
    "mode": "dorian"
  },
  "total": 14,
  "results": [
    {
      "song_id": "sng_3d2211",
      "title": "Evening Drift",
      "key": "A",
      "mode": "dorian",
      "abs_sequence": ["Am","Dm","F","G","Am"],
      "occurrences": [{ "start_bar": 1, "end_bar": 5 }],
      "score": 0.98
    },
    {
      "song_id": "sng_77aa10",
      "title": "Scarborough (arr.)",
      "key": "E",
      "mode": "dorian",
      "abs_sequence": ["Em","Am","C","D","Em"],
      "occurrences": [
        { "start_bar": 1, "end_bar": 5 },
        { "start_bar": 17, "end_bar": 21 }
      ],
      "score": 0.96
    }
  ]
}
```

## 4. Worship — `GET /v1/search?progression=ii7,V7,Imaj7`

Jazz-flavored ii-V-I lookup over the worship corpus. Shows the canonical `ii7,V7,Imaj7` progression query.

```http
GET /v1/search?progression=ii7,V7,Imaj7&genre=worship&limit=2 HTTP/1.1
Host: chords.amberaudio.com
Authorization: Bearer akey_xxx
```

```http
HTTP/1.1 200 OK
X-RateLimit-Remaining: 4981
X-Request-Id: req_01HY7TD02R
Cache-Control: public, max-age=300
```

```json
{
  "query": { "progression": ["ii7","V7","Imaj7"], "genre": "worship" },
  "total": 2,
  "results": [
    {
      "song_id": "sng_gw4401",
      "title": "Great Is Your Faithfulness (arr.)",
      "key": "G",
      "mode": "major",
      "abs_sequence": ["G","C","D","Em","G","C","D","Em"],
      "rn_sequence": ["I","IV","V","vi","I","IV","V","vi"],
      "occurrences": [],
      "score": 0.41,
      "note": "near-miss: contains I-IV-V-vi, not ii7-V7-Imaj7"
    }
  ]
}
```

A strict 4-bar `I-V-vi-IV` in G major (`Gmaj C D Em`) is also exposed as `rn_sequence = ["I","V","vi","IV"]`. Use `match=strict` to suppress near-miss scoring.

## 5. Blues — `POST /v1/songs` (12-bar blues in A)

Classic 12-bar shell. Demonstrates `dominant7` chord vocabulary and `form=12bar-blues` tag propagation.

```http
POST /v1/songs HTTP/1.1
Host: chords.amberaudio.com
Authorization: Bearer akey_xxx
Content-Type: application/json
```

```json
{
  "title": "A Blues (study)",
  "key": "A",
  "mode": "major",
  "tempo": 96,
  "time_signature": "4/4",
  "form": "12bar-blues",
  "abs_sequence": [
    "A7","A7","A7","A7",
    "D7","D7","A7","A7",
    "E7","D7","A7","E7"
  ],
  "source_sha256": "11bb...d4e"
}
```

```http
HTTP/1.1 201 Created
Location: /v1/songs/sng_blu012
```

```json
{
  "id": "sng_blu012",
  "rn_sequence": ["I7","I7","I7","I7","IV7","IV7","I7","I7","V7","IV7","I7","V7"],
  "form": "12bar-blues",
  "chord_vocab": ["A7","D7","E7"]
}
```

## Validation failure — `400`

Missing required `key` field in POST body.

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json
X-Request-Id: req_01HY7TE9PP
```

```json
{
  "error": "SCHEMA_MISSING_REQUIRED",
  "message": "field 'key' is required on POST /v1/songs",
  "field": "key",
  "doc_url": "https://chords.amberaudio.com/docs/errors#SCHEMA_MISSING_REQUIRED"
}
```

## Duplicate — `409`

Re-ingest of an unchanged source MusicXML file. `source_sha256` collides with an existing row.

```http
HTTP/1.1 409 Conflict
Content-Type: application/json
X-Request-Id: req_01HY7TFQ22
```

```json
{
  "error": "DB_UNIQUE_VIOLATION",
  "message": "song with source_sha256=3f2a...e91 already exists",
  "existing_id": "sng_9a1f2c",
  "hint": "use PUT /v1/songs/sng_9a1f2c to update in place"
}
```

## See also

- [03-roman-numeral-spec.md](03-roman-numeral-spec.md)
- [10-error-catalog.md](10-error-catalog.md)
- [11-testing-fixtures.md](11-testing-fixtures.md)
