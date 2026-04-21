/**
 * Guitar chord shape lookup backed by @tombatossals/chords-db.
 * Replaces the hand-crafted 49-entry chordShapes.js with comprehensive coverage
 * (thousands of voicings, every key × every quality).
 *
 * Returns the same shape { frets, fingers, baseFret, barre? } that ChordDiagram.jsx
 * and pdfExport.js already consume, so no render-path changes are needed.
 */

import guitarDb from '@tombatossals/chords-db/lib/guitar.json';

// Maps note names (including enharmonics) to tombatossals chords object keys.
// Tombatossals uses: C, Csharp, D, Eb, E, F, Fsharp, G, Ab, A, Bb, B
const ROOT_TO_DB_KEY = {
  'C': 'C',   'C#': 'Csharp', 'Db': 'Csharp',
  'D': 'D',   'D#': 'Eb',     'Eb': 'Eb',
  'E': 'E',
  'F': 'F',   'F#': 'Fsharp', 'Gb': 'Fsharp',
  'G': 'G',   'G#': 'Ab',     'Ab': 'Ab',
  'A': 'A',   'A#': 'Bb',     'Bb': 'Bb',
  'B': 'B',
};

// Maps the quality suffixes we use in chord strings → tombatossals suffix strings.
// Tombatossals suffixes: major minor dim dim7 sus2 sus4 aug 6 69 7 7b5 aug7 9 9b5
//   aug9 7b9 7#9 11 9#11 13 maj7 maj7b5 maj7#5 maj9 maj11 maj13 m6 m69 m7 m7b5
//   m9 m11 mmaj7 mmaj7b5 mmaj9 mmaj11 add9 madd9 7sus4 ...
const SUFFIX_MAP = {
  '':       'major',
  'm':      'minor',
  '7':      '7',
  'maj7':   'maj7',
  'm7':     'm7',
  'dim':    'dim',
  'dim7':   'dim7',
  'aug':    'aug',
  'aug7':   'aug7',
  'sus2':   'sus2',
  'sus4':   'sus4',
  '7sus4':  '7sus4',
  'add9':   'add9',
  'madd9':  'madd9',
  'm6':     'm6',
  'm9':     'm9',
  'm11':    'm11',
  'maj9':   'maj9',
  'maj11':  'maj11',
  'maj13':  'maj13',
  '6':      '6',
  '69':     '69',
  '9':      '9',
  '11':     '11',
  '13':     '13',
  '7b5':    '7b5',
  '7b9':    '7b9',
  '7#9':    '7#9',
  '9#11':   '9#11',
  'm7b5':   'm7b5',
  'mmaj7':  'mmaj7',
  'mmaj9':  'mmaj9',
  'alt':    'alt',
};

// Graceful degradation chains: if exact suffix not found, try simpler variants.
const SUFFIX_FALLBACKS = {
  'm11':  ['m9', 'm7', 'minor'],
  'm9':   ['m7', 'minor'],
  'mmaj9': ['mmaj7', 'minor'],
  'mmaj11': ['mmaj9', 'mmaj7', 'minor'],
  'maj13': ['maj9', 'maj7', 'major'],
  'maj11': ['maj9', 'maj7', 'major'],
  'maj9':  ['maj7', 'major'],
  '13':    ['9', '7'],
  '11':    ['9', '7'],
  '9':     ['7'],
  '7b5':   ['7'],
  '7b9':   ['7'],
  '7#9':   ['7'],
  '9#11':  ['9', '7'],
  'alt':   ['7'],
  'aug7':  ['aug'],
  '69':    ['6', 'major'],
  'm69':   ['m6', 'minor'],
  'madd9': ['minor'],
};

function parseChordRoot(chord) {
  const m = chord.match(/^([A-G][#b]?)(.*?)(?:\/[A-G][#b]?)?$/);
  return m ? { root: m[1], suffix: m[2] || '' } : null;
}

/**
 * Infer barre details from tombatossals position data.
 * tombatossals provides `barres: [fretNum]` but not which string the barre starts on.
 * We find the lowest string index where frets[i] === barreFret && fingers[i] === 1.
 */
function inferBarre(frets, fingers, barres) {
  if (!barres || !barres.length) return undefined;
  const barreFret = barres[0];
  const fromString = frets.findIndex((f, i) => f === barreFret && fingers[i] === 1);
  return { fret: barreFret, fromString: fromString === -1 ? 0 : fromString };
}

/**
 * Look up the guitar chord shape for the given chord name.
 * Strips slash bass (e.g. "Am/E" → "Am") before lookup.
 * Returns null if no shape is available.
 *
 * Return shape matches what ChordDiagram.jsx and pdfExport.js expect:
 *   { frets: number[], fingers: number[], baseFret: number, barre?: { fret, fromString } }
 */
export function getChordShape(chord) {
  if (!chord) return null;

  const base = chord.split('/')[0]; // strip slash bass
  const parsed = parseChordRoot(base);
  if (!parsed) return null;

  const dbKey = ROOT_TO_DB_KEY[parsed.root];
  if (!dbKey) return null;

  const chordEntries = guitarDb.chords[dbKey];
  if (!chordEntries) return null;

  const normalizedSuffix = SUFFIX_MAP[parsed.suffix] ?? parsed.suffix;
  const candidates = [normalizedSuffix, ...(SUFFIX_FALLBACKS[normalizedSuffix] || [])];

  for (const candidate of candidates) {
    const entry = chordEntries.find(e => e.suffix === candidate);
    if (entry && entry.positions.length) {
      const pos = entry.positions[0]; // first (most common) voicing
      return {
        frets: pos.frets,
        fingers: pos.fingers,
        baseFret: pos.baseFret ?? 1,
        barre: inferBarre(pos.frets, pos.fingers, pos.barres),
      };
    }
  }

  return null;
}
