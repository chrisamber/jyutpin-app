import { TONE_COLORS } from "../data/tones.js";

function dedup(arr) {
  return [...new Map(arr.map((e) => [e.char, e])).values()];
}

function formatWords(words, limit) {
  const shown = words.slice(0, limit).map((e) => `${e.char} ${e.jyutping}`).join(", ");
  return words.length > limit ? shown + "…" : shown;
}

// Auto-generate practice drills from analyzed song lines
export function generateDrills(lines) {
  const drills = [];

  // Collect all categories in a single pass
  const entering = [], ng = [], t4 = [], t6 = [], t2 = [], t5 = [], aspirated = [];
  let richLine = null;

  for (const line of lines) {
    if (!richLine && line.tokens.filter((t) => t.tone).length >= 5) richLine = line;
    for (const t of line.tokens) {
      if (!t.jyutping) continue;
      const w = { char: t.char, jyutping: t.jyutping };
      if (t.isEnteringTone) entering.push(w);
      if (/^ng/.test(t.jyutping)) ng.push(w);
      if (t.tone === 4) t4.push(w);
      if (t.tone === 6) t6.push(w);
      if (t.tone === 2) t2.push(w);
      if (t.tone === 5) t5.push(w);
      if (/^[ct](?!s)/.test(t.jyutping)) aspirated.push(w);
    }
  }

  const uEntering = dedup(entering);
  const uNg = dedup(ng);
  const uT4 = dedup(t4);
  const uT6 = dedup(t6);
  const uT2 = dedup(t2);
  const uT5 = dedup(t5);
  const uAspirated = dedup(aspirated);

  if (uEntering.length > 0) {
    drills.push({
      title: `Unreleased Stops (${uEntering.length} words found)`,
      color: TONE_COLORS[1],
      steps: [
        `This song has ${uEntering.length} entering-tone words: ${formatWords(uEntering, 8)}`,
        "Say each slowly. At the final -p/-t/-k, your tongue/lips CLOSE but produce ZERO sound after.",
        "Test: hold a tissue in front of your mouth. The tissue should NOT move on the stop consonant.",
        `Chain them in rhythm: ${uEntering.slice(0, 6).map((e) => e.jyutping).join(" → ")}. Speed up gradually.`,
        "Sing them on a single pitch. The stops create natural staccato — lean into it.",
      ],
    });
  }

  if (uNg.length > 0) {
    drills.push({
      title: `ng- Initial Practice (${uNg.length} words)`,
      color: TONE_COLORS[4],
      steps: [
        `Words with ng- onset: ${formatWords(uNg, 8)}`,
        "Hum 'ng' (like the end of 'sing'), then open into the vowel WITHOUT moving your tongue first.",
        "Record yourself saying each word. If you can't hear the nasal onset before the vowel, you're skipping it.",
        "Sing these words ascending in pitch — the ng- must be audible on every one.",
      ],
    });
  }

  if (uT4.length > 0 && uT6.length > 0) {
    drills.push({
      title: "Tone 4 vs Tone 6 Separator",
      color: TONE_COLORS[6],
      steps: [
        `Tone 4 (low falling): ${formatWords(uT4, 5)}`,
        `Tone 6 (low level): ${formatWords(uT6, 5)}`,
        "T6 = flat and low, like humming at your bottom range. T4 = starts low and drops LOWER, like a sigh.",
        "Alternate between a T4 and T6 word. Exaggerate the difference, then reduce to natural level.",
      ],
    });
  }

  if (uT2.length > 0 && uT5.length > 0) {
    drills.push({
      title: "Tone 2 vs Tone 5 Scoop Calibrator",
      color: TONE_COLORS[2],
      steps: [
        `Tone 2 (high rising, big scoop): ${formatWords(uT2, 5)}`,
        `Tone 5 (low rising, gentle lift): ${formatWords(uT5, 5)}`,
        "T2 rises from LOW to HIGH — dramatic. T5 rises from LOW to MID — restrained.",
        "Alternate T2 and T5 words. The T2 ceiling must be noticeably higher than T5.",
      ],
    });
  }

  if (richLine) {
    const toneSeq = richLine.tokens.filter((t) => t.tone).map((t) => t.tone).join("-");
    drills.push({
      title: "Full Phrase Contour Reading",
      color: TONE_COLORS[3],
      steps: [
        `Take this line: ${richLine.chinese}`,
        `Tone sequence: ${toneSeq}`,
        "SPEAK it in exaggerated tonal contour — melodic reading, don't sing yet.",
        "Hum the contour without words — just pitch. Does your hum match the melody?",
        "Now sing with lyrics. If it sounds wrong, your tones are off.",
      ],
    });
  }

  if (uAspirated.length >= 2) {
    drills.push({
      title: "Aspiration Pairs",
      color: TONE_COLORS[5],
      steps: [
        `Aspirated words in this song: ${formatWords(uAspirated, 6)}`,
        "Hold your palm 2 inches from your lips. On aspirated initials (c-, t-, p-, k-) you should feel a puff of air.",
        "Sing these words in sequence, focusing only on the aspiration. Light but present.",
      ],
    });
  }

  return drills;
}
