const PREFIX = "chords:";

/**
 * Returns true if `lineChords` is in the NEW beat-grid format
 *   NEW: { barIndex: { beatIndex: chord } }
 *   OLD: { charIndex: chord }
 */
export function isNewFormat(lineChords) {
  if (!lineChords) return true;
  const first = Object.values(lineChords)[0];
  return typeof first === "object" && first !== null;
}

/**
 * Convert OLD char-indexed chord map for a single line to NEW beat-grid format.
 *   { "0": "Am", "5": "F" } → { "0": { "0": "Am" }, "1": { "1": "F" } }   (beatsPerBar = 4)
 */
export function upgradeLineFormat(lineChords, beatsPerBar = 4) {
  if (isNewFormat(lineChords)) return lineChords;
  const out = {};
  for (const [ci, chord] of Object.entries(lineChords)) {
    if (!chord) continue;
    const barIndex = String(Math.floor(Number(ci) / beatsPerBar));
    const beatIndex = String(Number(ci) % beatsPerBar);
    out[barIndex] = { ...(out[barIndex] || {}), [beatIndex]: chord };
  }
  return out;
}

/**
 * Upgrade an entire chordMap (all lines) from OLD → NEW format. Idempotent —
 * lines already in NEW format pass through unchanged.
 */
export function upgradeChordFormat(chordMap, beatsPerBar = 4) {
  if (!chordMap) return {};
  const out = {};
  for (const [li, lineChords] of Object.entries(chordMap)) {
    if (!lineChords || typeof lineChords !== "object") continue;
    out[li] = upgradeLineFormat(lineChords, beatsPerBar);
  }
  return out;
}

export function loadChords(storageId, beatsPerBar = 4) {
  try {
    const raw = localStorage.getItem(PREFIX + storageId);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Auto-upgrade OLD format on read. Do not persist until next saveChords.
    return upgradeChordFormat(parsed, beatsPerBar);
  } catch {
    return {};
  }
}

export function saveChords(storageId, chordMap) {
  // Remove empty entries — handles new format: { lineIndex: { barIndex: { beatIndex: chord } } }
  const clean = {};
  for (const [line, bars] of Object.entries(chordMap)) {
    const cleanBars = {};
    for (const [bi, beats] of Object.entries(bars)) {
      if (typeof beats !== "object" || beats === null) continue;
      const cleanBeats = {};
      for (const [pi, chord] of Object.entries(beats)) {
        if (chord && chord !== "." && chord !== "-") cleanBeats[pi] = chord;
      }
      if (Object.keys(cleanBeats).length) cleanBars[bi] = cleanBeats;
    }
    if (Object.keys(cleanBars).length) clean[line] = cleanBars;
  }
  if (Object.keys(clean).length) {
    localStorage.setItem(PREFIX + storageId, JSON.stringify(clean));
  } else {
    localStorage.removeItem(PREFIX + storageId);
  }
}

export function mergeChords(lines, chordMap, beatsPerBar = 4) {
  if (!chordMap || !Object.keys(chordMap).length) return lines;
  return lines.map((line, li) => {
    const lineChords = chordMap[li];
    if (!lineChords) return line;

    if (isNewFormat(lineChords)) {
      // Build barGrid from new chordMap structure
      // lineChords structure: { barIndex: { beatIndex: chordString } }
      const maxBar = Math.max(...Object.keys(lineChords).map(Number));
      const barGrid = Array.from({ length: maxBar + 1 }, (_, bi) => {
        const barData = lineChords[bi] || {};
        return Array.from({ length: beatsPerBar }, (_, pi) => barData[String(pi)] || ".");
      });
      // Also populate token-level chords for "above" display mode
      const tokens = line.tokens.map((t, ci) => {
        const bi = String(Math.floor(ci / beatsPerBar));
        const pi = String(ci % beatsPerBar);
        const chord = lineChords[bi]?.[pi];
        if (chord && chord !== "." && chord !== "-") return { ...t, chord };
        if (t.chord) return { ...t, chord: null };
        return t;
      });
      return { ...line, barGrid, tokens };
    }

    // OLD format fallback (should rarely hit because loadChords auto-upgrades)
    const tokens = line.tokens.map((t, ci) => {
      const chord = lineChords[ci];
      return chord ? { ...t, chord } : t.chord ? { ...t, chord: null } : t;
    });
    const trailing = Object.entries(lineChords)
      .filter(([ci, chord]) => chord && Number(ci) >= line.tokens.length)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([, chord]) => ({ char: " ", jyutping: null, tone: null, pinyin: null, chord, isTrailing: true }));
    return { ...line, tokens: trailing.length ? [...tokens, ...trailing] : tokens };
  });
}

export function collectUsedChords(chordMap) {
  const set = new Set();
  for (const lineChords of Object.values(chordMap)) {
    if (!lineChords) continue;
    if (isNewFormat(lineChords)) {
      for (const beats of Object.values(lineChords)) {
        for (const chord of Object.values(beats)) {
          if (chord && chord !== "." && chord !== "-") set.add(chord);
        }
      }
    } else {
      // OLD format safety net
      for (const chord of Object.values(lineChords)) {
        if (chord && chord !== "." && chord !== "-") set.add(chord);
      }
    }
  }
  return [...set];
}
