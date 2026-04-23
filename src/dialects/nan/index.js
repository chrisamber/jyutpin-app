// Hokkien (Taiwanese) DialectEngine. No npm dict — reads from curated.json.
//
// Sandhi v1: one line = one sandhi run. All CJK syllables except the last in
// the line use their sandhi_tone; the final syllable keeps its citation_tone.
// Real Taiwanese sandhi respects phrase boundaries mid-line (pauses, particles)
// which the curated JSON doesn't encode. Deliberate simplification — accurate
// enough for drills and honest for a v1 demo engine.

import { loadCurated } from './load.js';
import { pojToTailo } from './tailo.js';
import { detectDangers } from './dangers.js';

const CJK_RE = /[\u4e00-\u9fff\u3400-\u4dbf]/;

export const engine = {
  code: 'nan',
  displayName: 'Hokkien',
  romanizationName: 'POJ',
  alternates: ['tailo'],
  toneCount: 8,

  async load() {
    await loadCurated();
  },

  async analyzeLine(text) {
    const dict = await loadCurated();
    const raw = [];

    for (const char of [...text]) {
      if (!char.trim()) continue;

      if (!CJK_RE.test(char)) {
        raw.push({ char, roman: '', tone: 0, citationTone: 0, alternates: { tailo: '' } });
        continue;
      }

      const entries = dict[char];
      if (!entries || entries.length === 0) {
        raw.push({ char, roman: null, tone: null, citationTone: null, alternates: {}, flagged: true });
        continue;
      }
      const entry = entries[0];
      const tailo = entry.tailo || pojToTailo(entry.poj);
      raw.push({
        char,
        roman: entry.poj,
        citationTone: entry.citation_tone,
        sandhiTone: entry.sandhi_tone,
        tone: entry.citation_tone, // placeholder — resolved below
        alternates: { tailo },
      });
    }

    // Apply line-level sandhi: last CJK syllable keeps citation; others shift to sandhi_tone.
    let lastCjkIdx = -1;
    for (let i = raw.length - 1; i >= 0; i--) {
      if (!raw[i].flagged && raw[i].citationTone != null) {
        lastCjkIdx = i;
        break;
      }
    }
    for (let i = 0; i < raw.length; i++) {
      const t = raw[i];
      if (t.flagged || t.citationTone == null) continue;
      t.tone = i === lastCjkIdx ? t.citationTone : (t.sandhiTone ?? t.citationTone);
      delete t.sandhiTone;
    }

    return raw;
  },

  detectDangers(tokens) {
    return detectDangers(tokens);
  },

  // Slots 1-6 are shared; 7 and 8 are Hokkien-specific additions in index.css.
  toneColor(tone) {
    if (tone >= 1 && tone <= 8) return `tone-${tone}`;
    return '';
  },
};
