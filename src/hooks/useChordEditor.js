import { useState, useEffect, useCallback, useMemo } from "react";
import {
  loadChords,
  saveChords,
  collectUsedChords,
} from "../services/chordStorage.js";

/**
 * Owns chord-map state for the current song.
 *
 * @param {string|null} storageId  — key under which chords are persisted
 * @param {number} beatsPerBar    — 4 by default
 * @returns {{
 *   chordMap: object,
 *   usedChords: string[],
 *   setChordAt: (lineIndex:number, barIndex:number|string, beatIndex:number|string, chord:string|null) => void,
 *   setChordAtChar: (lineIndex:number, charIndex:number, chord:string|null) => void,
 *   clearLine: (lineIndex:number) => void,
 *   getBeat: (lineIndex:number, barIndex:number|string, beatIndex:number|string) => string|null,
 * }}
 */
export function useChordEditor(storageId, beatsPerBar = 4) {
  const [chordMap, setChordMap] = useState({});

  useEffect(() => {
    if (!storageId) return;
    setChordMap(loadChords(storageId, beatsPerBar));
  }, [storageId, beatsPerBar]);

  /** Set/delete a chord at an explicit (barIndex, beatIndex) slot. */
  const setChordAt = useCallback(
    (lineIndex, barIndex, beatIndex, chord) => {
      const bi = String(barIndex);
      const pi = String(beatIndex);
      setChordMap((prev) => {
        const next = { ...prev };
        if (chord) {
          const lineBars = { ...(next[lineIndex] || {}) };
          lineBars[bi] = { ...(lineBars[bi] || {}), [pi]: chord };
          next[lineIndex] = lineBars;
        } else {
          // Delete path — keep structure clean
          if (!next[lineIndex]?.[bi]) return prev;
          const { [pi]: _, ...restBeats } = next[lineIndex][bi];
          if (Object.keys(restBeats).length) {
            next[lineIndex] = { ...next[lineIndex], [bi]: restBeats };
          } else {
            const { [bi]: __, ...restBars } = next[lineIndex];
            if (Object.keys(restBars).length) {
              next[lineIndex] = restBars;
            } else {
              const { [lineIndex]: ___, ...restLines } = next;
              if (storageId) saveChords(storageId, restLines);
              return restLines;
            }
          }
        }
        if (storageId) saveChords(storageId, next);
        return next;
      });
    },
    [storageId]
  );

  /** Convenience: set a chord from a character index (maps to bar/beat). */
  const setChordAtChar = useCallback(
    (lineIndex, charIndex, chord) => {
      const barIndex = Math.floor(charIndex / beatsPerBar);
      const beatIndex = charIndex % beatsPerBar;
      setChordAt(lineIndex, barIndex, beatIndex, chord);
    },
    [setChordAt, beatsPerBar]
  );

  /** Remove all chords for a line. */
  const clearLine = useCallback(
    (lineIndex) => {
      setChordMap((prev) => {
        if (!prev[lineIndex]) return prev;
        const { [lineIndex]: _, ...rest } = prev;
        if (storageId) saveChords(storageId, rest);
        return rest;
      });
    },
    [storageId]
  );

  const getBeat = useCallback(
    (lineIndex, barIndex, beatIndex) => {
      return chordMap[lineIndex]?.[String(barIndex)]?.[String(beatIndex)] || null;
    },
    [chordMap]
  );

  const usedChords = useMemo(() => collectUsedChords(chordMap), [chordMap]);

  return {
    chordMap,
    usedChords,
    setChordAt,
    setChordAtChar,
    clearLine,
    getBeat,
  };
}
