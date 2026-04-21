// Chord transposition utility
// Shifts chord names up/down by semitones, preserving quality (m, maj7, sus4, etc.)
//
// Uses canonical music-theory root spelling sourced from ChordMiniApp/keySignatureUtils.ts:
//   CANONICAL_MAJOR_ROOTS — 7 flat keys (Db Eb Ab Bb) + 5 sharp/natural (F# rest natural)
// This aligns with the @tombatossals/chords-db key set and avoids double-accidentals.

// One canonical spelling per pitch class (C=0 … B=11).
// Matches standard Western notation convention used by @tombatossals/chords-db.
const CANONICAL_ROOTS = [
  'C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B',
];

// Chromatic index lookup — supports both sharp and flat input spellings.
const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLATS  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

function noteIndex(note) {
  let idx = SHARPS.indexOf(note);
  if (idx === -1) idx = FLATS.indexOf(note);
  return idx;
}

function shiftNote(note, semitones) {
  const idx = noteIndex(note);
  if (idx === -1) return note;
  const newIdx = ((idx + semitones) % 12 + 12) % 12;
  return CANONICAL_ROOTS[newIdx];
}

// Regex to capture root (e.g. C, F#, Bb) + quality + optional slash bass note
const ROOT_RE = /^([A-G][#b]?)(.*?)(?:\/([A-G][#b]?))?$/;

/**
 * Transpose a chord string by the given number of semitones.
 * Returns the original string unchanged if it can't be parsed or semitones is falsy.
 *
 * Examples:
 *   transposeChord("Am", 2)      → "Bm"
 *   transposeChord("F#maj7", -1) → "Fmaj7"
 *   transposeChord("G/B", 3)     → "Bb/D"
 *   transposeChord("Am", 1)      → "Bbm"  (canonical: Bb not A#)
 */
export function transposeChord(chord, semitones) {
  if (!chord || !semitones) return chord;

  const match = chord.match(ROOT_RE);
  if (!match) return chord;

  const [, root, quality, bass] = match;
  const newRoot = shiftNote(root, semitones);
  const newBass = bass ? shiftNote(bass, semitones) : null;

  return newBass ? `${newRoot}${quality}/${newBass}` : `${newRoot}${quality}`;
}

/**
 * Given a transpose offset, return which capo fret a guitarist would use
 * so they can play in the original chord shapes in the new key.
 * e.g. transpose +2 → Capo 2 (play shapes as if no capo, sounds +2 semitones)
 */
export function capoFret(semitones) {
  const n = ((semitones % 12) + 12) % 12;
  return n <= 6 ? n : n - 12;
}

/**
 * Human-readable key offset label: "+2", "−3", "0"
 */
export function transposeLabel(semitones) {
  if (semitones === 0) return "0";
  return semitones > 0 ? `+${semitones}` : `${semitones}`;
}
