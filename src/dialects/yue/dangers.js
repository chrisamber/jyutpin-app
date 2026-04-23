const dangerPatterns = [
  { chars: ['望', '忘'], note: 'mong6 vs mong4 — aspiration' },
  { chars: ['皮', '比'], note: 'pei4 vs pei2 — rising tone' },
  { chars: ['靠', '考'], note: 'kaau2 vs hau2 — different initials' },
  { chars: ['得', '德'], note: 'dak1 vs dak2 — both common, different tone' },
];

export function detectDangers(tokens) {
  const dangers = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const pattern = dangerPatterns.find(p => p.chars.includes(token.char));

    if (pattern) {
      dangers.push({
        word: token.char,
        roman: token.roman,
        tone: token.tone,
        note: pattern.note,
      });
    }
  }

  return dangers;
}
