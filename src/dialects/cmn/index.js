import { loadPinyin } from './load.js';
import { pinyinToZhuyin } from './zhuyin.js';
import { detectDangers } from './dangers.js';

const CJK_RE = /[\u4e00-\u9fff\u3400-\u4dbf]/;

function parsePinyin(py) {
  if (!py) return { roman: '', tone: 0 };
  const normalized = py.trim().replace(/v/g, 'ü');
  const m = normalized.match(/^([a-züÜ\u00fc]+?)([0-5])?$/i);
  if (!m) return { roman: normalized, tone: 0 };
  return { roman: m[1], tone: m[2] ? parseInt(m[2], 10) : 0 };
}

export const engine = {
  code: 'cmn',
  displayName: 'Mandarin',
  romanizationName: 'Hanyu Pinyin',
  alternates: ['zhuyin'],
  toneCount: 4,

  async load() {
    await loadPinyin();
  },

  async analyzeLine(text) {
    const { pinyin } = await loadPinyin();
    const tokens = [];

    for (const char of [...text]) {
      if (!char.trim()) continue;

      const isCJK = CJK_RE.test(char);
      if (!isCJK) {
        tokens.push({ char, roman: '', tone: 0, alternates: { zhuyin: '' } });
        continue;
      }

      let py = pinyin(char, { toneType: 'num' });
      if (!py || py === char) {
        tokens.push({ char, roman: '', tone: 0, alternates: { zhuyin: '' } });
        continue;
      }

      if (Array.isArray(py)) {
        py = py[0];
      }

      const { roman, tone } = parsePinyin(py);
      const zy = pinyinToZhuyin(py);
      tokens.push({ char, roman, tone, raw: py, alternates: { zhuyin: zy } });
    }

    return tokens;
  },

  detectDangers(tokens) {
    return detectDangers(tokens);
  },

  // T1→slot1, T2→slot2, T3→slot3, T4→slot4, neutral(5)→slot6
  toneColor(tone) {
    if (tone === 5) return 'tone-6';
    if (tone >= 1 && tone <= 4) return `tone-${tone}`;
    return '';
  },
};
