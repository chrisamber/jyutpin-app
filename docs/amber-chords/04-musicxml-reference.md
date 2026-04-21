---
title: MusicXML Reference for Chord Extraction
topic: ingestion
tags: [musicxml, sibelius, harmony, parsing, schema]
audience: [ai-agent, developer]
related: [03-roman-numeral-spec.md, 05-music21-patterns.md]
---

# MusicXML Reference for Chord Extraction

Structure-of-a-MusicXML-file cheat sheet scoped to what the `amber-chords` ingestion pipeline needs: the element tree, the `<harmony>` payload, the `<kind>` enum, and the Sibelius export quirks that break naive parsers. Anything outside chord extraction (articulation, lyrics, dynamics) is out of scope here.

## Element tree

### `<score-partwise>`

Root element. The partwise variant groups music by part, then by measure — this is what Sibelius and Finale export by default. The alternative `<score-timewise>` groups by measure, then by part; music21 will convert either on import, but prefer partwise for round-tripping.

```xml
<score-partwise version="4.0">
  <part-list>...</part-list>
  <part id="P1">...</part>
</score-partwise>
```

### `<part-list>` + `<score-part>`

Declares each instrument's metadata once. `<score-part id="P1">` must match a `<part id="P1">` below. Harmony extraction generally ignores instrumentation but may use the part name to select a "lead sheet" part when a score has multiple.

```xml
<part-list>
  <score-part id="P1">
    <part-name>Piano</part-name>
  </score-part>
</part-list>
```

### `<part id="P1">`

Container for the measures of a single instrument. Chord symbols on the lead part are authoritative; duplicates on other parts should be ignored by the ingestor.

```xml
<part id="P1">
  <measure number="1">...</measure>
  <measure number="2">...</measure>
</part>
```

### `<measure number="1">`

Bar container. The `number` attribute is a string (to allow "1a", "2b" for pickup or alternate endings). `<attributes>` appears inside the first measure and any measure where key/time/divisions change.

```xml
<measure number="1">
  <attributes>...</attributes>
  <harmony>...</harmony>
  <note>...</note>
</measure>
```

### `<attributes>`

Holds divisions, key, time signature, clef. Only the first three matter for harmony.

```xml
<attributes>
  <divisions>4</divisions>
  <key><fifths>0</fifths></key>
  <time><beats>4</beats><beat-type>4</beat-type></time>
</attributes>
```

- `<divisions>` — ticks per quarter note. `4` means sixteenth-note resolution; `24` allows triplet subdivisions. Used to convert `<duration>` into beat offsets.
- `<key><fifths>` — integer on the circle of fifths. `0` = C major / A minor, `-1` = F major (one flat), `+1` = G major (one sharp), `+2` = D major, `-3` = Eb major, and so on. Negative = flats, positive = sharps. The `<mode>` child (`major` | `minor`) disambiguates; if absent, assume major.
- `<time>` — meter. `<beats>` over `<beat-type>`. For harmony, the product with divisions determines bar length in ticks.

### `<harmony>`

The chord symbol. Attached to a position in the measure via the preceding `<note>` offsets (or `<offset>` child). Every harmony has a `<root>` and a `<kind>`; optional `<bass>` and `<degree>` extend it.

```xml
<harmony>
  <root>
    <root-step>C</root-step>
    <root-alter>-1</root-alter>
  </root>
  <kind>major-seventh</kind>
</harmony>
```

- `<root-step>` — letter name `A`–`G`.
- `<root-alter>` — integer semitone offset: `-1` flat, `1` sharp, `-2` double flat, `2` double sharp, `0` or absent = natural.

### `<kind>` enum

The chord quality, as a fixed-vocabulary string. music21 and the MusicXML 4.0 spec accept (non-exhaustive): `major`, `minor`, `augmented`, `diminished`, `dominant`, `major-seventh`, `minor-seventh`, `diminished-seventh`, `augmented-seventh`, `half-diminished`, `major-minor` (alias `minor-major`), `major-sixth`, `minor-sixth`, `dominant-ninth`, `major-ninth`, `minor-ninth`, `dominant-11th`, `major-11th`, `minor-11th`, `dominant-13th`, `major-13th`, `minor-13th`, `suspended-second`, `suspended-fourth`, `power` (root + fifth), `none` (N.C. / no chord). The optional `text` attribute holds the display string (`m7`, `Δ`, etc.).

### `<degree>`

Modifications layered on top of `<kind>`. Three child elements: `<degree-value>` (the scale degree, 1–13), `<degree-alter>` (chromatic offset), and `<degree-type>` (`add`, `alter`, `subtract`).

```xml
<harmony>
  <root><root-step>C</root-step></root>
  <kind>dominant</kind>
  <degree>
    <degree-value>9</degree-value>
    <degree-alter>-1</degree-alter>
    <degree-type>add</degree-type>
  </degree>
</harmony>
```

The above is `C7b9`. Multiple `<degree>` elements stack (`C7#5#9` has two).

### `<note>` with `<duration>` and `<voice>`

Melody notes occupy beat positions within the measure. `<duration>` is measured in divisions; dividing by `<divisions>` gives quarter-note length. `<voice>` separates simultaneous lines. For harmony timing, sum durations in voice 1 to track the current beat.

```xml
<note>
  <pitch><step>C</step><octave>4</octave></pitch>
  <duration>4</duration>
  <voice>1</voice>
  <type>quarter</type>
</note>
```

With `<divisions>4</divisions>`, `<duration>4</duration>` = one quarter note = one beat.

### `<bass>` for slash chords

Specifies an alternate bass note. Same schema as `<root>`.

```xml
<harmony>
  <root><root-step>C</root-step></root>
  <kind>major</kind>
  <bass><bass-step>E</bass-step></bass>
</harmony>
```

This is `C/E`.

## Annotated 4-bar example: ii-V-I in C major

Dm7, G7, Cmaj7, Cmaj7 with a quarter-note melody on each beat.

```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Lead</part-name></score-part>
  </part-list>
  <part id="P1">

    <!-- Bar 1: Dm7 held whole note; melody F G A F -->
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths><mode>major</mode></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <harmony>
        <root><root-step>D</root-step></root>
        <kind text="m7">minor-seventh</kind>
      </harmony>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><voice>1</voice><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><voice>1</voice><type>quarter</type></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>4</duration><voice>1</voice><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><voice>1</voice><type>quarter</type></note>
    </measure>

    <!-- Bar 2: G7; melody B D F D -->
    <measure number="2">
      <harmony>
        <root><root-step>G</root-step></root>
        <kind text="7">dominant</kind>
      </harmony>
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>4</duration><voice>1</voice><type>quarter</type></note>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>4</duration><voice>1</voice><type>quarter</type></note>
      <note><pitch><step>F</step><octave>5</octave></pitch><duration>4</duration><voice>1</voice><type>quarter</type></note>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>4</duration><voice>1</voice><type>quarter</type></note>
    </measure>

    <!-- Bar 3: Cmaj7; melody E G B G -->
    <measure number="3">
      <harmony>
        <root><root-step>C</root-step></root>
        <kind text="maj7">major-seventh</kind>
      </harmony>
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><voice>1</voice><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><voice>1</voice><type>quarter</type></note>
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>4</duration><voice>1</voice><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><voice>1</voice><type>quarter</type></note>
    </measure>

    <!-- Bar 4: Cmaj7 held; melody whole note C -->
    <measure number="4">
      <harmony>
        <root><root-step>C</root-step></root>
        <kind text="maj7">major-seventh</kind>
      </harmony>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>16</duration><voice>1</voice><type>whole</type></note>
    </measure>

  </part>
</score-partwise>
```

## Sibelius export gotchas

Sibelius (through 2024.x) emits MusicXML that the naive reader gets wrong. Handle these at ingest:

- **Duplicate `<harmony>` on every beat while a chord holds.** Sibelius re-emits the same chord symbol on beats 1, 2, 3, 4 even if the symbol only appears once in the notation. Dedupe by (root, kind, bass, degrees) against the previous harmony on the same beat-adjacent position; only record a change when the tuple differs.
- **Missing `<kind>` text attribute.** The corpus parser must accept both `<kind text="m7">minor-seventh</kind>` (Sibelius with text) and `<kind>minor-seventh</kind>` (value-only, common in Finale and MuseScore exports). Never rely on the `text` attribute for parsing — use the element value and treat `text` as display-only.
- **`<divisions>` may differ per part.** A score with piano (divisions=8 for sixteenth-triplets) and a guitar chart (divisions=4) will have different tick resolutions. Always scope `<divisions>` to the current `<part>` — never hoist it to score level.
- **Tied notes may span measures.** A whole note tied across a barline inflates the voice-1 duration sum. This is irrelevant to harmony (each `<harmony>` carries its own position) but will miscount beat offsets if you naively accumulate `<duration>` across measures. Reset the beat counter at each `<measure>`.

## See also

- [03-roman-numeral-spec.md](./03-roman-numeral-spec.md) — what the parsed chords get normalized to
- [05-music21-patterns.md](./05-music21-patterns.md) — the Python APIs that consume this XML
