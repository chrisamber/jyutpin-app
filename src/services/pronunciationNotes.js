// Auto-detect pronunciation challenges from analyzed lyrics

function collectUnique(lines, predicate) {
  const seen = new Map();
  for (const line of lines) {
    for (const t of line.tokens) {
      if (t.jyutping && predicate(t) && !seen.has(t.char)) {
        seen.set(t.char, { char: t.char, jyutping: t.jyutping, tone: t.tone });
      }
    }
  }
  return [...seen.values()];
}

export function detectPronunciationNotes(lines) {
  const notes = [];

  // 1. Entering tones (-p/-t/-k finals)
  const entering = collectUnique(lines, (t) => t.isEnteringTone);
  if (entering.length > 0) {
    notes.push({
      category: "Entering Tones",
      words: entering.slice(0, 8),
      tip: "These syllables end with unreleased -p, -t, or -k. Close your lips/tongue but release no air after the stop.",
    });
  }

  // 2. ng- initials
  const ng = collectUnique(lines, (t) => /^ng/.test(t.jyutping));
  if (ng.length > 0) {
    notes.push({
      category: "ng- Initials",
      words: ng.slice(0, 8),
      tip: "Start with a nasal hum (back of tongue against soft palate) before opening to the vowel. Dropping this marks you as non-native instantly.",
    });
  }

  // 3. T4/T6 words (easily confused)
  const t4 = collectUnique(lines, (t) => t.tone === 4);
  const t6 = collectUnique(lines, (t) => t.tone === 6);
  if (t4.length > 0 && t6.length > 0) {
    notes.push({
      category: "T4 vs T6",
      words: [...t4.slice(0, 4), ...t6.slice(0, 4)],
      tip: "Both are low register. T4 falls from low to lower (sigh). T6 stays flat and low (hum). Mixing them changes meaning.",
    });
  }

  // 4. T2/T5 words (scoop calibration)
  const t2 = collectUnique(lines, (t) => t.tone === 2);
  const t5 = collectUnique(lines, (t) => t.tone === 5);
  if (t2.length > 0 && t5.length > 0) {
    notes.push({
      category: "T2 vs T5",
      words: [...t2.slice(0, 4), ...t5.slice(0, 4)],
      tip: "T2 rises dramatically (low→high). T5 rises gently (low→mid). Over-scooping T5 to match T2 is a common error.",
    });
  }

  // 5. Aspirated initials
  const aspirated = collectUnique(
    lines,
    (t) => /^[ct](?!s)/.test(t.jyutping) && !/^ng/.test(t.jyutping)
  );
  if (aspirated.length >= 2) {
    notes.push({
      category: "Aspiration",
      words: aspirated.slice(0, 6),
      tip: "c- and t- initials are aspirated (puff of air). Hold your palm near your lips — you should feel air. Under-aspirating changes the word.",
    });
  }

  return notes;
}
