import { JINYULIANHEREN_CHORDS } from "./jinyulianheren-chords.js";
import { saveChords } from "../../services/chordStorage.js";

// Converts "Emaj7 | G#m C#m" → beat-grid format { barIndex: { beatIndex: chord } }
function parseChordString(str, beatsPerBar = 4) {
  const bars = str.split("|").map((b) => b.trim().split(/\s+/).filter(Boolean));
  const out = {};
  bars.forEach((chords, bi) => {
    if (!chords.length) return;
    const barObj = {};
    if (chords.length === 1) {
      barObj["0"] = chords[0];
    } else {
      const step = Math.floor(beatsPerBar / chords.length);
      chords.forEach((ch, i) => { barObj[String(step * i)] = ch; });
    }
    out[String(bi)] = barObj;
  });
  return out;
}

const CURATED_SONGS = {
  jinyulianheren: {
    title: "緊急聯絡人",
    artist: "Gareth.T",
    chords: JINYULIANHEREN_CHORDS,
  },
};

// Call after a song loads from LRCLIB — storageId is "lrclib:{numeric_id}"
export function initializeCuratedSongData(songKey, storageId) {
  const song = CURATED_SONGS[songKey];
  if (!song?.chords?.lines || !storageId) return;
  try {
    const chordMap = {};
    song.chords.lines.forEach((line, i) => {
      if (!line.chords) return;
      chordMap[String(i)] = parseChordString(line.chords);
    });
    saveChords(storageId, chordMap);
  } catch (err) {
    console.error(`Failed to initialize chords for ${songKey}:`, err);
  }
}

export function getChordsForSong(songKey) {
  return CURATED_SONGS[songKey]?.chords || null;
}
