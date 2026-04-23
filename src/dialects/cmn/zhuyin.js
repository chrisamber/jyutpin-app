// Pure function: Mandarin pinyin syllable → Zhuyin (Bopomofo).
// Input: syllable with optional tone number, e.g. "zhong1", "yue4", "de5", "yi"
// Output: Zhuyin + tone mark, e.g. "ㄓㄨㄥ", "ㄩㄝˋ", "ㄉㄜ˙"
//
// Tone marks: T1 = none (high level, default pitch), T2 = ˊ, T3 = ˇ, T4 = ˋ, neutral = ˙

const TONE_MARKS = ['', '', 'ˊ', 'ˇ', 'ˋ', '˙'];

const SYLLABIC = {
  zhi: 'ㄓ', chi: 'ㄔ', shi: 'ㄕ', ri: 'ㄖ',
  zi: 'ㄗ', ci: 'ㄘ', si: 'ㄙ',
};

// Longer prefixes first to avoid partial matches (zh before z, etc.)
const INITIALS = [
  ['zh', 'ㄓ'], ['ch', 'ㄔ'], ['sh', 'ㄕ'],
  ['b', 'ㄅ'], ['p', 'ㄆ'], ['m', 'ㄇ'], ['f', 'ㄈ'],
  ['d', 'ㄉ'], ['t', 'ㄊ'], ['n', 'ㄋ'], ['l', 'ㄌ'],
  ['g', 'ㄍ'], ['k', 'ㄎ'], ['h', 'ㄏ'],
  ['j', 'ㄐ'], ['q', 'ㄑ'], ['x', 'ㄒ'],
  ['r', 'ㄖ'], ['z', 'ㄗ'], ['c', 'ㄘ'], ['s', 'ㄙ'],
];

// Longer finals first to avoid partial matches
const FINALS = [
  ['iong', 'ㄩㄥ'], ['iang', 'ㄧㄤ'], ['uang', 'ㄨㄤ'], ['ueng', 'ㄨㄥ'],
  ['üan', 'ㄩㄢ'], ['ian', 'ㄧㄢ'], ['uan', 'ㄨㄢ'],
  ['ing', 'ㄧㄥ'], ['ang', 'ㄤ'], ['ong', 'ㄨㄥ'], ['eng', 'ㄥ'],
  ['iao', 'ㄧㄠ'], ['iou', 'ㄧㄡ'], ['uai', 'ㄨㄞ'], ['uei', 'ㄨㄟ'], ['uen', 'ㄨㄣ'],
  ['üe', 'ㄩㄝ'], ['ün', 'ㄩㄣ'],
  ['ia', 'ㄧㄚ'], ['ie', 'ㄧㄝ'], ['iu', 'ㄧㄡ'],
  ['ua', 'ㄨㄚ'], ['uo', 'ㄨㄛ'], ['ui', 'ㄨㄟ'], ['un', 'ㄨㄣ'],
  ['ai', 'ㄞ'], ['ei', 'ㄟ'], ['ao', 'ㄠ'], ['ou', 'ㄡ'],
  ['an', 'ㄢ'], ['en', 'ㄣ'], ['in', 'ㄧㄣ'],
  ['er', 'ㄦ'], ['ê', 'ㄝ'],
  ['a', 'ㄚ'], ['o', 'ㄛ'], ['e', 'ㄜ'],
  ['ü', 'ㄩ'], ['i', 'ㄧ'], ['u', 'ㄨ'],
];

// j/q/x + u actually means ü in Mandarin phonology
const JQX_U_MAP = { u: 'ü', ue: 'üe', uan: 'üan', un: 'ün' };

// Strip y/w spelling conventions (these are glide spellings, not initials in Zhuyin)
function normalizeYW(syl) {
  if (syl.startsWith('y')) {
    const rest = syl.slice(1);
    // yu / yue / yuan / yun → ü family
    if (rest === 'u' || rest === 'ue' || rest === 'uan' || rest === 'un') {
      return rest.replace(/^u/, 'ü');
    }
    // yi / yin / ying already start with i
    if (rest.startsWith('i')) return rest;
    // ya / ye / yao / you / yan / yang / yong → prepend medial i
    return 'i' + rest;
  }
  if (syl.startsWith('w')) {
    const rest = syl.slice(1);
    // wu → u
    if (rest === 'u' || rest === '') return 'u';
    // wa→ua, wo→uo, wei→uei, wen→uen, wang→uang, weng→ueng
    return rest.startsWith('u') ? rest : 'u' + rest;
  }
  return syl;
}

export function pinyinToZhuyin(py) {
  if (!py) return '';

  const m = py.match(/^([a-züÜv\u00fc]+?)([0-5])?$/i);
  if (!m) return py;
  const tone = m[2] ? parseInt(m[2], 10) : 0;
  let syl = m[1].toLowerCase().replace(/v/g, 'ü'); // lv → lü normalisation

  if (SYLLABIC[syl]) return SYLLABIC[syl] + (TONE_MARKS[tone] ?? '');

  syl = normalizeYW(syl);

  let zInitial = '';
  let initial = '';
  for (const [pin, zy] of INITIALS) {
    if (syl.startsWith(pin)) {
      initial = pin;
      zInitial = zy;
      syl = syl.slice(pin.length);
      break;
    }
  }

  if ('jqx'.includes(initial) && JQX_U_MAP[syl]) {
    syl = JQX_U_MAP[syl];
  }

  let zFinal = '';
  for (const [pin, zy] of FINALS) {
    if (syl === pin) { zFinal = zy; break; }
  }

  if (!zFinal) return py; // unknown syllable — pass original pinyin through

  return zInitial + zFinal + (TONE_MARKS[tone] ?? '');
}
