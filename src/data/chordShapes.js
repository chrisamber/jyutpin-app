// Guitar chord voicing dictionary — standard open-position shapes.
// Format per chord:
//   frets: array of 6 numbers (strings E A D G B e, low→high)
//          -1 = muted (X), 0 = open, 1-5 = fret number
//   fingers: array of 6 numbers (0 = none, 1-4 = finger index)
//   barre: { fret, fromString } — optional barre indicator (string index 0=low E)
//   baseFret: fret offset if shape starts above fret 1 (default 1)

export const CHORD_SHAPES = {
  // ── Major ────────────────────────────────────────────────────────────
  "C":    { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  "D":    { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
  "E":    { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
  "F":    { frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 4, 3, 1], barre: { fret: 1, fromString: 0 } },
  "G":    { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
  "A":    { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
  "B":    { frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 2, fromString: 1 } },
  "C#":   { frets: [-1, 4, 3, 1, 2, 1], fingers: [0, 4, 3, 1, 2, 1], baseFret: 1, barre: { fret: 4, fromString: 1 } },
  "Db":   { frets: [-1, 4, 3, 1, 2, 1], fingers: [0, 4, 3, 1, 2, 1], baseFret: 1, barre: { fret: 4, fromString: 1 } },
  "D#":   { frets: [-1, -1, 1, 3, 4, 3], fingers: [0, 0, 1, 2, 4, 3], baseFret: 1 },
  "Eb":   { frets: [-1, -1, 1, 3, 4, 3], fingers: [0, 0, 1, 2, 4, 3], baseFret: 1 },
  "F#":   { frets: [2, 2, 4, 4, 4, 2], fingers: [1, 1, 2, 3, 4, 1], barre: { fret: 2, fromString: 0 } },
  "Gb":   { frets: [2, 2, 4, 4, 4, 2], fingers: [1, 1, 2, 3, 4, 1], barre: { fret: 2, fromString: 0 } },
  "G#":   { frets: [4, 4, 6, 6, 6, 4], fingers: [1, 1, 2, 3, 4, 1], barre: { fret: 4, fromString: 0 } },
  "Ab":   { frets: [4, 4, 6, 6, 6, 4], fingers: [1, 1, 2, 3, 4, 1], barre: { fret: 4, fromString: 0 } },
  "A#":   { frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 1, fromString: 1 } },
  "Bb":   { frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 1, fromString: 1 } },

  // ── Minor ────────────────────────────────────────────────────────────
  "Am":   { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
  "Bm":   { frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 2, fromString: 1 } },
  "Cm":   { frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 3, fromString: 1 } },
  "Dm":   { frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
  "Em":   { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
  "Fm":   { frets: [1, 1, 3, 3, 2, 1], fingers: [1, 1, 3, 4, 2, 1], barre: { fret: 1, fromString: 0 } },
  "Gm":   { frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 3, fromString: 0 } },
  "C#m":  { frets: [-1, 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 4, fromString: 1 } },
  "Dbm":  { frets: [-1, 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 4, fromString: 1 } },
  "D#m":  { frets: [-1, -1, 1, 3, 4, 2], fingers: [0, 0, 1, 3, 4, 2], baseFret: 1 },
  "Ebm":  { frets: [-1, -1, 1, 3, 4, 2], fingers: [0, 0, 1, 3, 4, 2], baseFret: 1 },
  "F#m":  { frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 2, fromString: 0 } },
  "Gbm":  { frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 2, fromString: 0 } },
  "G#m":  { frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 4, fromString: 0 } },
  "Abm":  { frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 4, fromString: 0 } },
  "A#m":  { frets: [-1, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 1, fromString: 1 } },
  "Bbm":  { frets: [-1, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 1, fromString: 1 } },

  // ── 7th chords ───────────────────────────────────────────────────────
  "G7":   { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
  "C7":   { frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
  "D7":   { frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
  "E7":   { frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
  "A7":   { frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0] },
  "B7":   { frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4] },
  "F7":   { frets: [1, 1, 2, 1, 1, 1], fingers: [1, 1, 2, 1, 1, 1], barre: { fret: 1, fromString: 0 } },

  // ── Major 7th ────────────────────────────────────────────────────────
  "Cmaj7": { frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0] },
  "Dmaj7": { frets: [-1, -1, 0, 2, 2, 2], fingers: [0, 0, 0, 1, 2, 3] },
  "Emaj7": { frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0] },
  "Fmaj7": { frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 4, 3, 2, 0] },
  "Gmaj7": { frets: [3, 2, 0, 0, 0, 2], fingers: [2, 1, 0, 0, 0, 3] },
  "Amaj7": { frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0] },
  "Bbmaj7":{ frets: [-1, 1, 3, 2, 3, 1], fingers: [0, 1, 3, 2, 4, 1], barre: { fret: 1, fromString: 1 } },

  // ── Minor 7th ────────────────────────────────────────────────────────
  "Am7":  { frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0] },
  "Bm7":  { frets: [-1, 2, 4, 2, 3, 2], fingers: [0, 1, 3, 1, 2, 1], barre: { fret: 2, fromString: 1 } },
  "Cm7":  { frets: [-1, 3, 5, 3, 4, 3], fingers: [0, 1, 3, 1, 2, 1], barre: { fret: 3, fromString: 1 } },
  "Dm7":  { frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1] },
  "Em7":  { frets: [0, 2, 2, 0, 3, 0], fingers: [0, 1, 2, 0, 3, 0] },
  "Fm7":  { frets: [1, 1, 3, 1, 2, 1], fingers: [1, 1, 3, 1, 2, 1], barre: { fret: 1, fromString: 0 } },
  "Gm7":  { frets: [3, 5, 3, 3, 3, 3], fingers: [1, 3, 1, 1, 1, 1], barre: { fret: 3, fromString: 0 } },
  "F#m7": { frets: [2, 4, 2, 2, 2, 2], fingers: [1, 3, 1, 1, 1, 1], barre: { fret: 2, fromString: 0 } },

  // ── Suspended ────────────────────────────────────────────────────────
  "Csus2": { frets: [-1, 3, 0, 0, 1, 3], fingers: [0, 3, 0, 0, 1, 4] },
  "Csus4": { frets: [-1, 3, 3, 0, 1, 1], fingers: [0, 3, 4, 0, 1, 2] },
  "Dsus2": { frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 2, 0] },
  "Dsus4": { frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3] },
  "Esus4": { frets: [0, 2, 2, 2, 0, 0], fingers: [0, 1, 2, 3, 0, 0] },
  "Gsus4": { frets: [3, 3, 0, 0, 1, 3], fingers: [2, 3, 0, 0, 1, 4] },
  "Asus2": { frets: [-1, 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0] },
  "Asus4": { frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0] },

  // ── Add9 / Add2 ──────────────────────────────────────────────────────
  "Cadd9": { frets: [-1, 3, 2, 0, 3, 0], fingers: [0, 3, 2, 0, 4, 0] },
  "Dadd9": { frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 3, 0] },
  "Gadd9": { frets: [3, 0, 0, 0, 3, 3], fingers: [2, 0, 0, 0, 3, 4] },

  // ── Diminished / Half-dim ─────────────────────────────────────────────
  "Bdim":  { frets: [-1, 2, 3, 4, 3, -1], fingers: [0, 1, 2, 4, 3, 0] },
  "Edim":  { frets: [0, 1, 2, 3, 2, 0], fingers: [0, 1, 2, 4, 3, 0] },
  "Adim":  { frets: [-1, 0, 1, 2, 1, -1], fingers: [0, 0, 1, 3, 2, 0] },

  // ── Augmented ────────────────────────────────────────────────────────
  "Caug":  { frets: [-1, 3, 2, 1, 1, 0], fingers: [0, 4, 3, 1, 2, 0] },
  "Eaug":  { frets: [0, 3, 2, 1, 1, 0], fingers: [0, 4, 3, 1, 2, 0] },
  "Gaug":  { frets: [3, 2, 1, 0, 0, 3], fingers: [3, 2, 1, 0, 0, 4] },
};

// Enharmonic flat → sharp map for shape lookup.
// Shapes are stored under sharp spellings; transpose may emit flats.
const FLAT_TO_SHARP = {
  "Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#",
  "Dbm": "C#m", "Ebm": "D#m", "Gbm": "F#m", "Abm": "G#m", "Bbm": "A#m",
  "Dbsus2": "C#sus2", "Ebsus2": "D#sus2", "Gbsus2": "F#sus2", "Absus2": "G#sus2", "Bbsus2": "A#sus2",
  "Dbsus4": "C#sus4", "Ebsus4": "D#sus4", "Gbsus4": "F#sus4", "Absus4": "G#sus4", "Bbsus4": "A#sus4",
};

/**
 * Normalise a chord root to the sharp spelling used in CHORD_SHAPES.
 * e.g. "Eb" → "D#", "Dbm" → "C#m", "Abmaj7" → "G#maj7"
 */
function normaliseRoot(root) {
  return FLAT_TO_SHARP[root] || root;
}

/**
 * Look up the shape for a chord, stripping the bass note (e.g. "Am/E" → "Am").
 * Handles both sharp and flat spellings — flats are normalised to their enharmonic
 * sharp equivalents before lookup so all registered shapes are found regardless
 * of which spelling `transposeChord` emits.
 * Returns null if no shape is known.
 */
export function getChordShape(chord) {
  if (!chord) return null;
  const root = chord.split("/")[0];
  const normalRoot = normaliseRoot(root);
  return CHORD_SHAPES[normalRoot] || null;
}
