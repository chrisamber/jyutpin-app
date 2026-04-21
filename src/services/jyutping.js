import { toPinyinArray } from "./mandarin.js";

let ToJyutping = null;

async function load() {
  if (!ToJyutping) {
    const mod = await import("to-jyutping");
    ToJyutping = mod.default || mod;
  }
  return ToJyutping;
}

function extractChords(line) {
  let text = "";
  const chords = [];
  const regex = /\[(.*?)\]/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(line)) !== null) {
      const rawTextBefore = line.slice(lastIndex, match.index);
      text += rawTextBefore;
      chords.push({ position: text.length, chord: match[1] });
      lastIndex = regex.lastIndex;
  }
  text += line.slice(lastIndex);
  return { cleanText: text, chords };
}

export async function analyzeLine(rawLine) {
  const { cleanText: chineseLine, chords } = extractChords(rawLine);
  const tj = await load();
  const pairs = tj.getJyutpingList(chineseLine);
  const pinyinArr = await toPinyinArray(chineseLine);

  return pairs.map(([char, jp], i) => {
    let py = pinyinArr[i] || "";
    if (py === char && !/[\u4e00-\u9fff\u3400-\u4dbf]/.test(char)) {
      py = null;
    }

    // Find if there's a chord precisely at this character index
    const chordObj = chords.find(c => c.position === i);

    return {
      char,
      jyutping: jp,
      tone: jp ? parseInt(jp.slice(-1)) : null,
      isEnteringTone: jp ? /[ptk]\d$/.test(jp) : false,
      pinyin: py || null,
      chord: chordObj ? chordObj.chord : null,
    };
  });
}

export async function analyzeFullLyrics(lyricsText) {
  const lines = lyricsText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Kick off the heavy async work (lazy pinyin-pro load) for all lines in parallel
  const lineDataPairs = await Promise.all(
    lines.map(async (line) => {
      const tokens = await analyzeLine(line);
      return { line, tokens };
    })
  );

  return lineDataPairs.map(({ line, tokens }) => ({
    chinese: line,
    tokens,
    jyutpingText: ToJyutping ? ToJyutping.getJyutpingText(line) : "",
  }));
}
