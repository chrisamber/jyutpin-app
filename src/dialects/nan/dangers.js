// Hokkien danger-zone heuristics.
// Uses citationTone so the flags reflect underlying structure, not surface sandhi.

const STOPPED_FINAL = /(p|t|k|h)$/i;

export function detectDangers(tokens) {
  const dangers = [];

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const next = tokens[i + 1];

    // 1. Entering tones (入聲) — tones 4 and 8 end in a stopped final (-p/-t/-k/-h).
    //    Non-native singers tend to drag them or drop the glottal stop.
    const underlying = t.citationTone ?? t.tone;
    if ((underlying === 4 || underlying === 8) && t.roman && STOPPED_FINAL.test(t.roman)) {
      const ending = t.roman.match(STOPPED_FINAL)?.[1] ?? '?';
      dangers.push({
        word: t.char,
        roman: t.roman,
        tone: underlying,
        note: `Entering tone (${underlying}) with stopped -${ending} — clip it short, don't sustain.`,
      });
    }

    // 2. Syllabic-nasal onsets (m-, ng-, n̂g-). Non-native speakers tend to
    //    devoice or insert a vowel.
    if (t.roman && /^(ng|m̄|m̀|ḿ|m̂|m̄|n̂g)/.test(t.roman)) {
      dangers.push({
        word: t.char,
        roman: t.roman,
        tone: underlying,
        note: `Syllabic nasal onset — hum the consonant; no vowel before it.`,
      });
    }

    // 3. Tone 2 ↔ 5 adjacent pairs. Both rise, but from different registers;
    //    easy to blur into one contour.
    if (next) {
      const u1 = t.citationTone ?? t.tone;
      const u2 = next.citationTone ?? next.tone;
      if ((u1 === 2 && u2 === 5) || (u1 === 5 && u2 === 2)) {
        dangers.push({
          word: t.char + next.char,
          roman: `${t.roman} ${next.roman}`,
          tone: u1,
          note: `Tone 2 vs 5 adjacent — both rise, but T2 starts mid, T5 starts low. Keep them distinct.`,
        });
      }
    }
  }

  return dangers;
}
