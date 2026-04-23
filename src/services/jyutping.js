// Engine dispatcher. Previously a Jyutping-only analyzer; now routes each
// request to the right dialect engine (yue/cmn/nan) from src/dialects/.
//
// For dialect='yue' the returned tokens are bridged back to the legacy shape
// { char, jyutping, tone, isEnteringTone, pinyin, chord } so all existing
// consumers (JyutpingAnnotation, ToneAnalytics, drillGenerator, etc.) keep
// working unchanged. Non-yue dialects pass through { char, roman, tone,
// alternates, chord } and rely on the dialect switcher to hide Cantonese-only
// UI panels.
//
// Line analysis runs sequentially (not Promise.all) to keep dict access
// ordered — concurrent engine.analyzeLine calls on a cold dict triggered
// duplicate imports in the previous implementation.

import { toPinyinArray } from "./mandarin.js";
import { getEngine } from "../dialects/index.js";

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

function jyutpingFromEngineToken(token) {
  // The yue engine attaches the original jyutping string (with tone digit) as
  // token.raw. Fall back to reconstructing from roman+tone if missing.
  if (token.raw) return token.raw;
  if (token.roman && token.tone) return `${token.roman}${token.tone}`;
  return null;
}

function placeChord(tokens, chords) {
  let cjkIdx = 0;
  return tokens.map((t) => {
    const chordObj = chords.find((c) => c.position === cjkIdx);
    cjkIdx += 1;
    return chordObj ? { ...t, chord: chordObj.chord } : { ...t, chord: null };
  });
}

// Legacy token shape used throughout the app for Cantonese (yue).
// Preserves: jyutping, tone, isEnteringTone, pinyin, chord.
async function bridgeYueTokens(engineTokens, cleanText, chords) {
  const pinyinArr = await toPinyinArray(cleanText);

  const bridged = engineTokens.map((t, i) => {
    const jp = jyutpingFromEngineToken(t);
    let py = pinyinArr[i] || "";
    if (py === t.char && !/[\u4e00-\u9fff\u3400-\u4dbf]/.test(t.char)) {
      py = null;
    }
    return {
      char: t.char,
      jyutping: jp,
      tone: jp ? parseInt(jp.slice(-1)) || null : null,
      isEnteringTone: jp ? /[ptk]\d$/.test(jp) : false,
      pinyin: py || null,
      alternates: t.alternates,
      chord: null,
    };
  });

  return placeChord(bridged, chords);
}

function passthroughTokens(engineTokens, chords) {
  // cmn/nan engines already produce { char, roman, tone, alternates, … }.
  // Attach chord positions keyed by character index (same rule the legacy
  // analyzer used for yue).
  return placeChord(engineTokens.map((t) => ({ ...t })), chords);
}

export async function analyzeLine(rawLine, dialectCode = "yue") {
  const { cleanText, chords } = extractChords(rawLine);
  const engine = await getEngine(dialectCode);
  if (!engine) throw new Error(`Unknown dialect: ${dialectCode}`);
  await engine.load();
  const engineTokens = await engine.analyzeLine(cleanText);

  if (dialectCode === "yue") {
    return bridgeYueTokens(engineTokens, cleanText, chords);
  }
  return passthroughTokens(engineTokens, chords);
}

export async function analyzeFullLyrics(lyricsText, dialectCode = "yue") {
  const lines = lyricsText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const engine = await getEngine(dialectCode);
  if (!engine) throw new Error(`Unknown dialect: ${dialectCode}`);
  await engine.load();

  // Sequential, not Promise.all — concurrent dict access on a cold engine
  // triggered duplicate imports in earlier versions.
  const results = [];
  for (const line of lines) {
    const { cleanText, chords } = extractChords(line);
    const engineTokens = await engine.analyzeLine(cleanText);
    const tokens =
      dialectCode === "yue"
        ? await bridgeYueTokens(engineTokens, cleanText, chords)
        : passthroughTokens(engineTokens, chords);
    results.push({
      chinese: line,
      tokens,
      jyutpingText:
        dialectCode === "yue"
          ? tokens
              .map((t) => t.jyutping)
              .filter(Boolean)
              .join(" ")
          : "",
    });
  }

  return results;
}
