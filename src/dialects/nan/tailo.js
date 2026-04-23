// POJ (Pe̍h-ōe-jī) → Tâi-lô (臺羅) converter. Pure function.
// Symbol substitutions only — tone diacritics pass through unchanged since
// both schemes use the same acute / grave / circumflex / macron / vertical-line
// marks over the same vowels (tones 1, 4 unmarked; 2 ´; 3 `; 5 ˆ; 7 ¯; 8 ̍).
//
// Differences we handle:
//   POJ chh → TL tsh        POJ eng → TL ing
//   POJ ch  → TL ts         POJ ek  → TL ik
//   POJ oa  → TL ua         POJ o·  → TL oo   (o with middle-dot or combining dot)
//   POJ oe  → TL ue         POJ ⁿ   → TL nn   (nasal)

const ORDER = [
  // Do digraphs/trigraphs first so shorter rules don't preempt longer ones.
  ['chh', 'tsh'],
  ['Chh', 'Tsh'],
  ['CHH', 'TSH'],
  ['ch', 'ts'],
  ['Ch', 'Ts'],
  ['CH', 'TS'],
  ['eng', 'ing'],
  ['Eng', 'Ing'],
  ['ek', 'ik'],
  ['Ek', 'Ik'],
  ['oa', 'ua'],
  ['Oa', 'Ua'],
  ['oe', 'ue'],
  ['Oe', 'Ue'],
];

// Middle-dot notations for o·: U+00B7 middle dot, U+0358 combining dot above right,
// and the ASCII compatibility form o".
const DOT_RE = /(?:o\u00B7|o\u0358|o")/g;
const DOT_UPPER_RE = /(?:O\u00B7|O\u0358|O")/g;
const NASAL_RE = /\u207F/g; // ⁿ

export function pojToTailo(poj) {
  if (!poj) return '';
  let out = poj;

  for (const [from, to] of ORDER) {
    if (out.includes(from)) out = out.split(from).join(to);
  }

  out = out.replace(DOT_RE, 'oo').replace(DOT_UPPER_RE, 'Oo');
  out = out.replace(NASAL_RE, 'nn');

  return out;
}

// Strip tone diacritics and append the tone digit (POJ numeric / TLPA-like).
const TONE_MARK_MAP = {
  '\u0301': 2, // ´
  '\u0300': 3, // `
  '\u0302': 5, // ˆ
  '\u0304': 7, // ¯
  '\u030D': 8, // ̍  (vertical line)
};

// Precomposed POJ tone-bearing letters (NFC forms).
const PRECOMPOSED = {
  'á': ['a', 2], 'à': ['a', 3], 'â': ['a', 5], 'ā': ['a', 7],
  'é': ['e', 2], 'è': ['e', 3], 'ê': ['e', 5], 'ē': ['e', 7],
  'í': ['i', 2], 'ì': ['i', 3], 'î': ['i', 5], 'ī': ['i', 7],
  'ó': ['o', 2], 'ò': ['o', 3], 'ô': ['o', 5], 'ō': ['o', 7],
  'ú': ['u', 2], 'ù': ['u', 3], 'û': ['u', 5], 'ū': ['u', 7],
  'ḿ': ['m', 2], 'm̄': ['m', 7],
  'ń': ['n', 2], 'ǹ': ['n', 3], 'n̂': ['n', 5], 'n̄': ['n', 7],
};

export function pojNumeric(poj, tone) {
  if (!poj) return '';
  const normalized = poj.normalize('NFD');
  let body = '';
  let detected = 0;
  for (const ch of normalized) {
    if (TONE_MARK_MAP[ch]) {
      detected = TONE_MARK_MAP[ch];
      continue;
    }
    body += ch;
  }
  body = body.normalize('NFC');
  const finalTone = tone ?? detected;
  return finalTone ? body + String(finalTone) : body;
}

// Exposed for tests / future alternate schemes.
export { PRECOMPOSED };
