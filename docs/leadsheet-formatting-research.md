# Leadsheet Chord Formatting — Research

Researched in session April 2026. Covers professional text-based leadsheet formats and how each handles rhythm/beat assignment within bars.

---

## Format Comparison

### 1. OnSong

**Current format in use** (Chris's convention): `| Cadd9 - Bm7b5 E7 |`

Note: In true OnSong, `-` is a chord quality marker (e.g. `E-` = Em), **not a beat marker**. `/` is the correct sustain symbol.

**True OnSong syntax:**
- `|` = bar line
- `/` = sustain previous chord for one beat
- Spaces = visual separation (no formal beat grid — position is proportional/visual)
- No explicit rest or syncopation notation

**Examples:**
```
|C       |          ← whole bar of C
|C   G   |          ← 2 chords (visual spacing)
|C G Am F|          ← 4 chords
|C / / / |          ← C for 4 beats (slashes = sustain)
```

**Verdict:** Display-oriented. Not parseable for beat precision.

---

### 2. iReal Pro ⭐ Recommended basis

Cell-based grid: **4 cells per measure in 4/4** (1 cell = 1 beat). Stored as URL-encoded string.

**Tokens:**
- `|` = single barline
- `[` `]` = double barline (section boundary)
- `{` `}` = repeat brackets
- ` ` (space/empty cell) = "continue previous chord" for this beat
- `n` = N.C. (no chord)
- `p` = slash (visual repeat of chord)
- `x` = repeat previous measure
- `r` = repeat previous 2 measures

**Examples:**
```
|C   |           ← C for whole bar (C + 3 empty cells)
|C  G |          ← C for 2 beats, G for 2 beats
|CGAF|           ← C G Am F, one per beat
|C  n |          ← C for 2 beats, rest for 2 beats
```

**Verdict:** Best balance of simplicity and parsability. Beat position is explicit. Sub-beat not supported.

---

### 3. ChordPro Grid Extension

Directive-based. Uses `{start_of_grid}` / `{end_of_grid}`.

**Tokens:**
- `.` = empty beat (chord continues from previous)
- `|` = single barline
- `||` = double barline
- `|:` `:|` = repeat
- `%` = repeat previous measure

**Examples:**
```
{start_of_grid shape="4x4"}
| C  .  .  .  | G  .  .  .  |    ← 1 chord per bar
| C  .  G  .  | Am .  F  .  |    ← 2 chords per bar (beats 1 & 3)
| C  G  Am F  | Dm Em F  G  |    ← 4 chords per bar
{end_of_grid}
```

**Verdict:** Clean. Dot = sustain is visually obvious. Good for display; needs a parser.

---

### 4. Nashville Number System

The most rhythm-aware text system. Numbers represent scale degrees; same conventions apply to chord names.

**Conventions:**
- One number per bar = whole bar (e.g. `1 | 4 | 5 | 1`)
- **Underline/grouping** = multiple chords share a bar: `(1 5)` = 2 beats each
- **Diamond/hold** = `<1>` = fermata / let ring
- **Push** = `>1` = anticipation (chord comes eighth note early)
- **Staccato** = `.` under = choke chord immediately

**Examples:**
```
1       | 4       | 5       | 1       |    ← whole bars
(1  5)  | 6-      | (4  5)  | >1      |    ← split bar, minor, split, push
```

**Verdict:** Best for musicians reading in the room. Complex to parse for apps.

---

### 5. Band-in-a-Box

Half-bar grid (2 beats per cell). Rich sub-beat support.

**Tokens:**
- `,` (comma) = separate two chords within one 2-beat cell (= 1 beat each)
- `C.` = rest
- `C...` = hold/sustain (fermata)
- `^C` = push (eighth note early)
- `^^C` = sixteenth-note push

**Examples:**
```
C           ← whole bar
C  G        ← 2 beats C, 2 beats G (in separate cells)
C,G  Am,F   ← 4 chords, 1 beat each (comma splits 2-beat cell)
^G7         ← G7 pushed (anticipated)
```

**Verdict:** Most musically expressive text format. Cryptic for non-musicians.

---

### 6. Impro-Visor

120 slots per beat. Proportional placement.

**Tokens:**
- `|` = barline
- `/` = 1 beat of "continue previous"
- `NC` = no chord

**Examples:**
```
C C7 | F | Dm7 G7 | C |    ← C+C7 = 2 beats each; F = whole; Dm7+G7 = 2 beats each
```

**Verdict:** Purist jazz notation. Overkill for pop/Cantopop.

---

## Recommended Format for WaaPou

Based on research, the **iReal Pro + ChordPro Grid hybrid** is the best fit:

```
| Cadd9 .  Bm7b5 E7 |    ← dot = sustain (hold beat), space-separated = next beat
| C    .  .     .  |    ← whole bar of C
| C    G  Am    F  |    ← 4 chords, 1 per beat (4/4)
| C    .  G     .  |    ← 2 chords, 2 beats each
```

**Rules:**
- `|` delimits bars
- Each space-separated token = one beat position
- `.` = sustain (previous chord continues on this beat)
- `n` or `-` = no chord / rest
- Time signature default = 4/4 (expandable)
- Each bar should have exactly N tokens matching the time signature

**Parsing is trivial:** split by `|`, then split each bar by spaces, filter `.` as "continue".

---

## Planned Implementation

See `handover.md` for full plan. The beat-grid system requires:

1. **Data model change:** chord map stores `{ lineIndex: { beatIndex: chordString } }` where `beatIndex` counts beats globally across bars within that line (not character positions)
2. **Bar/beat editor UI:** visual grid cells in chord edit mode (4 cells per bar in 4/4)
3. **Renderer update:** `ChordBarsLine` renders the proper `| Cadd9 . G . |` format
4. **Time signature metadata:** stored per-song in `SongMeta` localStorage
