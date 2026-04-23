// Mandarin danger-zone heuristics.
// Flags tone sandhi patterns that trip up non-native singers.

export function detectDangers(tokens) {
  const dangers = [];

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const next = tokens[i + 1];

    // T3+T3 sandhi: first T3 → T2 in fluent speech (e.g. 你好 nǐhǎo → níhǎo)
    if (t.tone === 3 && next?.tone === 3) {
      dangers.push({
        word: t.char + next.char,
        roman: t.roman + next.roman,
        tone: 3,
        note: 'T3+T3 sandhi: first syllable rises to T2 in speech (e.g. nǐhǎo → níhǎo)',
      });
    }

    // 不 (bù, T4) before T4 → becomes T2 (bú) in speech
    if (t.char === '不' && next?.tone === 4) {
      dangers.push({
        word: '不' + next.char,
        roman: 'bu ' + next.roman,
        tone: 4,
        note: '不 before T4: 不 changes to T2 in speech (bú, not bù)',
      });
    }

    // 一 (yī, T1) changes tone based on what follows:
    //   before T4 → T2 (yí gè)
    //   before T1/T2/T3 → T4 (yì tiān)
    if (t.char === '一' && next?.tone && next.tone !== 0) {
      const note =
        next.tone === 4
          ? '一 before T4: changes to T2 (yí)'
          : '一 before T1/T2/T3: changes to T4 (yì)';
      dangers.push({
        word: '一' + next.char,
        roman: 'yi ' + next.roman,
        tone: 1,
        note,
      });
    }
  }

  return dangers;
}
