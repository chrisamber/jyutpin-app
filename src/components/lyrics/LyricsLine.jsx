import { useMemo, useState } from "react";
import JyutpingAnnotation from "./JyutpingAnnotation.jsx";
import ChordPopover from "./ChordPopover.jsx";
import { transposeChord } from "../../services/transpose.js";

function PlayButton({ isPlaying, isLoading, onClick }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-slate-400 hover:text-accent hover:bg-accent/10"
      aria-label={isPlaying ? "Stop" : "Play line"}
    >
      {isLoading ? (
        <svg className="animate-spin" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="14 8" strokeLinecap="round" />
        </svg>
      ) : isPlaying ? (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <rect x="1" y="1" width="8" height="8" rx="1.5" />
        </svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <path d="M2 1.5 L9 5 L2 8.5 Z" />
        </svg>
      )}
    </button>
  );
}

function TrailingChordSlot({ chordEditMode, onAdd, usedChords }) {
  const [editing, setEditing] = useState(false);
  if (!chordEditMode) return null;
  return (
    <div
      className="relative inline-flex flex-col items-center justify-end min-w-[1.5rem] cursor-pointer ml-1"
      onClick={(e) => { e.stopPropagation(); setEditing(true); }}
    >
      {editing && (
        <ChordPopover
          currentChord={null}
          usedChords={usedChords || []}
          onConfirm={(v) => { setEditing(false); if (v) onAdd(v); }}
          onCancel={() => setEditing(false)}
        />
      )}
      {!editing && (
        <div className="w-5 h-5 rounded border border-dashed border-accent/30 flex items-center justify-center text-accent/40 text-xs hover:border-accent/60 hover:text-accent/70 transition-colors">
          +
        </div>
      )}
    </div>
  );
}

function generateEmptyGrid(tokenCount, beatsPerBar) {
  const numBars = Math.max(1, Math.ceil(tokenCount / beatsPerBar));
  return Array.from({ length: numBars }, () => Array(beatsPerBar).fill("."));
}

function ChordBarsLine({ barGrid, beatsPerBar = 4, transpose = 0, chordEditMode, onEditBeat, usedChords }) {
  const [editing, setEditing] = useState(null); // { bar, beat }

  if (!barGrid || !barGrid.length) return null;

  return (
    <div className="font-mono text-[13px] text-accent/80 mb-1 ml-6 select-none flex flex-wrap items-center gap-y-1">
      {barGrid.map((bar, bi) => (
        <span key={bi} className="inline-flex items-center">
          <span className="text-accent/30">|</span>
          {Array.from({ length: beatsPerBar }, (_, pi) => {
            const beat = bar[pi];
            const isEmpty = !beat || beat === "." || beat === "-";
            const isThisEditing = editing?.bar === bi && editing?.beat === pi;
            const displayChord = isEmpty ? null : transposeChord(beat, transpose);

            return (
              <span
                key={pi}
                className={`relative inline-flex items-center justify-center min-w-[2rem] px-1 h-5 ${
                  chordEditMode
                    ? "cursor-pointer rounded hover:bg-accent/10 transition-colors"
                    : ""
                }`}
                onClick={chordEditMode ? (e) => { e.stopPropagation(); setEditing({ bar: bi, beat: pi }); } : undefined}
              >
                {isThisEditing && (
                  <ChordPopover
                    currentChord={displayChord}
                    usedChords={usedChords || []}
                    onConfirm={(v) => { setEditing(null); onEditBeat?.(bi, pi, v || null); }}
                    onCancel={() => setEditing(null)}
                  />
                )}
                {isEmpty ? (
                  chordEditMode
                    ? <span className="text-accent/25 text-[11px]">·</span>
                    : <span className="text-slate-300">{beat === "-" ? "–" : "·"}</span>
                ) : (
                  <span className={`font-bold text-accent ${chordEditMode ? "hover:text-accent/70" : ""}`}>
                    {displayChord}
                  </span>
                )}
              </span>
            );
          })}
        </span>
      ))}
      <span className="text-accent/30">|</span>
    </div>
  );
}

export default function LyricsLine({ line, index, isActive, onClick, onPlay, playingKey, loadingKey, chordEditMode, onChordEdit, onChordEditBeat, usedChords, chordDisplay, beatsPerBar = 4, transpose = 0 }) {
  const lineKey = `line-${index}`;
  const isPlaying = playingKey === lineKey;
  const isLoading = loadingKey === lineKey;

  const dangerChars = useMemo(() => {
    const set = new Set();
    if (line.dangers) {
      for (const d of line.dangers) {
        for (const ch of d.word) set.add(ch);
      }
    }
    return set;
  }, [line.dangers]);

  const realTokenCount = useMemo(
    () => line.tokens.filter(t => !t.isTrailing).length,
    [line.tokens]
  );

  const trailingCount = useMemo(
    () => line.tokens.filter(t => t.isTrailing).length,
    [line.tokens]
  );

  // Bars mode: show bar grid whenever chordDisplay === "bars"
  const showBars = chordDisplay === "bars";

  // In bars edit mode, generate an empty grid if line has no chords yet
  const displayBarGrid = useMemo(() => {
    if (!showBars) return null;
    if (line.barGrid) return line.barGrid;
    if (chordEditMode) return generateEmptyGrid(realTokenCount, beatsPerBar);
    return null;
  }, [showBars, line.barGrid, chordEditMode, realTokenCount, beatsPerBar]);

  // In bars mode, characters aren't chord-editable (editing happens in the bar grid)
  const charChordEditMode = showBars ? false : chordEditMode;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      data-line-index={index}
      className={`w-full text-left py-3.5 border-b border-slate-100 last:border-0 transition-all select-none print:select-auto print:cursor-auto group ${
        isActive
          ? "bg-accent/8 border-l-[3px] border-l-accent/50 pl-3 -ml-3 rounded-r-lg"
          : "hover:bg-slate-50/60"
      }`}
    >
      <div className="flex items-start gap-4">
        <span className="font-mono text-[10px] text-slate-300 min-w-5 pt-3 select-none leading-none">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex-1">
          {/* Bar grid — shown in bars display mode (read-only or editable) */}
          {displayBarGrid && (
            <ChordBarsLine
              barGrid={displayBarGrid}
              beatsPerBar={beatsPerBar}
              transpose={transpose}
              chordEditMode={chordEditMode}
              onEditBeat={(barIdx, beatIdx, chord) => onChordEditBeat?.(index, barIdx, beatIdx, chord)}
              usedChords={usedChords}
            />
          )}

          <div className={`flex flex-wrap ${charChordEditMode ? "items-start" : "items-end"} leading-loose`}>
            {line.tokens.map((t, i) => {
              const barIndex = Math.floor(i / beatsPerBar);
              const beatIndex = i % beatsPerBar;
              const barChords = charChordEditMode && line.barGrid
                ? Object.fromEntries(
                    (line.barGrid[barIndex] || []).map((beat, pi) => [String(pi), beat])
                  )
                : undefined;
              return (
                <JyutpingAnnotation
                  key={i}
                  char={t.char}
                  jyutping={t.jyutping}
                  tone={t.tone}
                  pinyin={t.pinyin}
                  chord={showBars ? null : transposeChord(t.chord, transpose)}
                  hasDanger={dangerChars.has(t.char)}
                  chordEditMode={charChordEditMode}
                  onChordEdit={charChordEditMode ? (v) => onChordEdit(index, i, v) : undefined}
                  usedChords={usedChords}
                  isTrailing={t.isTrailing}
                  barIndex={barIndex}
                  beatIndex={beatIndex}
                  beatsPerBar={beatsPerBar}
                  barChords={barChords}
                />
              );
            })}
            {/* Trailing slot only in above-lyrics edit mode */}
            {!showBars && (
              <TrailingChordSlot
                chordEditMode={chordEditMode}
                usedChords={usedChords}
                onAdd={(chord) => onChordEdit?.(index, realTokenCount + trailingCount, chord)}
              />
            )}
          </div>
          {line.translation && (
            <div className="text-xs text-slate-400 italic mt-1.5 pl-1">
              {line.translation}
            </div>
          )}
        </div>
        {onPlay && (
          <div className="pt-3">
            <PlayButton
              isPlaying={isPlaying}
              isLoading={isLoading}
              onClick={() => onPlay(line.chinese, lineKey)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
