import { useMemo } from "react";
import { useSong } from "../../context/SongContext.jsx";
import { useApp } from "../../context/AppContext.jsx";
import { useChordEditor } from "../../hooks/useChordEditor.js";
import { TONE_COLORS, TONE_NAMES } from "../../data/tones.js";
import { transposeChord } from "../../services/transpose.js";
import PrintButton from "./PrintButton.jsx";
import ChordDiagram from "../chords/ChordDiagram.jsx";

const BEATS_PER_BAR = 4;

/**
 * Compact chord-bar row rendered above a lyric line.
 * Mirrors the `ChordBarsLine` pattern from LyricsLine.jsx.
 */
function ChordBarRow({ barGrid, beatsPerBar = BEATS_PER_BAR, transpose = 0 }) {
  if (!barGrid || !barGrid.length) return null;
  return (
    <div className="font-mono text-[13px] text-accent/80 mb-0.5 ml-6 select-none">
      {barGrid.map((bar, bi) => (
        <span key={bi}>
          <span className="text-accent/30">|</span>
          {bar.slice(0, beatsPerBar).map((beat, pi) => (
            <span key={pi} className="inline-block min-w-[2rem] px-1 text-center">
              {beat === "." ? (
                <span className="text-slate-300">·</span>
              ) : beat === "-" ? (
                <span className="text-slate-300">–</span>
              ) : (
                <span className="font-bold">{transposeChord(beat, transpose)}</span>
              )}
            </span>
          ))}
        </span>
      ))}
      <span className="text-accent/30">|</span>
    </div>
  );
}

export default function LeadsheetView() {
  const { song, lines, storageId } = useSong();
  const { transpose } = useApp();
  const { usedChords } = useChordEditor(storageId, BEATS_PER_BAR);

  const stats = useMemo(() => {
    let total = 0, entering = 0;
    for (const line of lines) {
      for (const t of line.tokens) {
        if (t.jyutping && t.tone) {
          total++;
          if (/[ptk]\d$/.test(t.jyutping)) entering++;
        }
      }
    }
    return { total, entering, lines: lines.length };
  }, [lines]);

  // Transposed used-chord list for the chord-sheet section
  const transposedChords = useMemo(
    () => usedChords.map((c) => transposeChord(c, transpose)),
    [usedChords, transpose]
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 print:hidden">
        <h2 className="text-xl font-normal text-accent/80">Export Leadsheet</h2>
        <PrintButton />
      </div>

      {/* Screen preview info */}
      <div className="print:hidden mb-6 pb-4 border-b border-slate-200">
        <div className="text-xs font-mono text-slate-400 mb-2">
          Preview — exports as A4 PDF with embedded metadata
        </div>
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5, 6].map((t) => (
            <span key={t} className="text-[9px] font-mono" style={{ color: TONE_COLORS[t] }}>
              T{t} {TONE_NAMES[t]}
            </span>
          ))}
        </div>
      </div>

      {/* Print-media header */}
      <div className="hidden print:block mb-6 pb-4 border-b-2 border-black">
        <h1 className="text-2xl font-bold text-black cjk">{song?.title}</h1>
        <div className="flex items-baseline justify-between mt-1">
          <div className="text-sm text-gray-600">{song?.artist}</div>
          <div className="text-[9px] font-mono text-gray-400">
            {stats.lines} lines · {stats.total} syllables · {stats.entering} entering tones
          </div>
        </div>
        <div className="flex gap-3 mt-3">
          {[1, 2, 3, 4, 5, 6].map((t) => (
            <span key={t} className="text-[8px] font-mono" style={{ color: TONE_COLORS[t] }}>
              <span className="font-semibold">T{t}</span> {TONE_NAMES[t]}
            </span>
          ))}
        </div>
      </div>

      {/* Lyric lines */}
      <div className="space-y-0 print:space-y-0">
        {lines.map((line, i) => {
          const isEmpty = line.tokens.every((t) => !t.jyutping || t.char.trim() === "");
          if (isEmpty) return <div key={i} className="h-3 print:h-2" />;
          return (
            <div
              key={i}
              className="py-2 print:py-1 border-b border-slate-50 print:border-gray-100 flex flex-col gap-0.5"
            >
              {/* Chord bar row above each lyric line */}
              {line.barGrid && (
                <ChordBarRow barGrid={line.barGrid} transpose={transpose} />
              )}

              <div className="flex items-start gap-2">
                <span className="font-mono text-[10px] text-slate-300 print:text-gray-300 min-w-5 pt-2 select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 flex flex-wrap items-end leading-loose tracking-wide">
                  {line.tokens.map((t, ti) => {
                    if (!t.jyutping || t.char.trim() === "")
                      return (
                        <span key={ti} className="text-slate-300 mx-0.5 text-lg print:text-base">
                          {t.char}
                        </span>
                      );
                    const color = t.tone ? TONE_COLORS[t.tone] : "#334155";
                    const isEntering = /[ptk]\d$/.test(t.jyutping);
                    return (
                      <ruby key={ti} className="mx-0.5 print:mx-0">
                        <rb
                          className={`text-lg print:text-sm leading-tight ${isEntering ? "font-semibold" : ""}`}
                          style={{ color }}
                        >
                          {t.char}
                        </rb>
                        <rp>(</rp>
                        <rt
                          className="text-[9px] print:text-[7px] font-mono leading-none"
                          style={{ color, opacity: 0.75 }}
                        >
                          {t.jyutping}
                        </rt>
                        <rp>)</rp>
                      </ruby>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Screen-only chord-sheet reference panel */}
      {transposedChords.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-100 print:hidden">
          <div className="text-[10px] font-mono text-[var(--color-text-muted)] tracking-[0.2em] uppercase mb-4">
            Chord Sheet
          </div>
          <div className="flex flex-wrap gap-6">
            {transposedChords.map((chord) => (
              <ChordDiagram key={chord} chord={chord} />
            ))}
          </div>
        </div>
      )}

      {/* Print-only chord-sheet page */}
      {transposedChords.length > 0 && (
        <div className="hidden print:block mt-12 pt-6 border-t-2 border-black">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-black cjk">Chord Sheet</h2>
            <div className="text-xs font-mono text-gray-400 mt-1">Guitar fingerings</div>
          </div>
          <div className="flex flex-wrap gap-8">
            {transposedChords.map((chord) => (
              <ChordDiagram key={chord} chord={chord} />
            ))}
          </div>
        </div>
      )}

      <div className="hidden print:block mt-8 pt-3 border-t border-gray-200 text-[8px] font-mono text-gray-400 text-center">
        華譜 WaaPou · waapou.app · An Amber Audio product
      </div>
    </div>
  );
}
