import { loadJyutping } from './load.js';
import { jyutpingToYale } from './yale.js';
import { detectDangers } from './dangers.js';

function parseJyutping(jp) {
  if (!jp) return { roman: '', tone: 0 };
  const match = jp.match(/^([a-z]+?)([1-6])$/i);
  if (!match) return { roman: jp, tone: 0 };
  return { roman: match[1], tone: parseInt(match[2], 10) };
}

export const engine = {
  code: 'yue',
  displayName: 'Cantonese',
  romanizationName: 'Jyutping',
  alternates: ['yale'],
  toneCount: 6,

  async load() {
    await loadJyutping();
  },

  async analyzeLine(text) {
    const ToJyutping = await loadJyutping();
    const getList = ToJyutping.getJyutpingList ?? ToJyutping.default?.getJyutpingList;
    const pairs = getList(text);

    return pairs.map(([char, jp]) => {
      if (jp == null) {
        return { char, roman: '', tone: 0, alternates: { yale: '' } };
      }
      const syllables = jp.split(/\s+/);
      const parsed = syllables.map(parseJyutping);
      const roman = parsed.map((p) => p.roman).join(' ');
      const tone = parsed[0]?.tone ?? 0;
      const yale = syllables.map((s) => jyutpingToYale(s)).join(' ');
      // Preserve the raw jyutping syllable(s) with tone digits so the bridge
      // adapter in services/jyutping.js can reconstruct the legacy token shape.
      return { char, roman, tone, raw: jp, alternates: { yale } };
    });
  },

  detectDangers(tokens) {
    return detectDangers(tokens);
  },

  toneColor(tone) {
    return `tone-${tone}`;
  },
};
