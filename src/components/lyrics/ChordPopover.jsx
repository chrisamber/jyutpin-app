import { useState, useRef, useEffect } from "react";
import ChordDiagram from "../chords/ChordDiagram.jsx";
import { getChordShape } from "../../data/chordShapes.js";

/**
 * Chord-editing popover.
 *
 * Required props:
 *   currentChord: string|null
 *   usedChords:   string[]
 *   onConfirm:    (chord:string|null) => void  // commit + close
 *   onCancel:     () => void                    // close without commit
 *
 * Optional bar-context props (for orientation in bar notation):
 *   barIndex:     number
 *   beatIndex:    number
 *   beatsPerBar:  number
 *   barChords:    { [beatIndex:string]: string }  // current bar's beats
 */
export default function ChordPopover({
  currentChord,
  usedChords,
  onConfirm,
  onCancel,
  barIndex,
  beatIndex,
  beatsPerBar = 4,
  barChords,
}) {
  const [value, setValue] = useState(currentChord || "");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const confirm = (chord) => {
    const trimmed = (chord ?? value).trim();
    onConfirm(trimmed || null);
  };

  const handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === "Enter") { e.preventDefault(); confirm(); }
    if (e.key === "Escape") { e.preventDefault(); onCancel(); }
    if (e.key === "Backspace" && value === "") { e.preventDefault(); onConfirm(null); }
  };

  const previewShape = value && value !== "." && value !== "-" ? getChordShape(value) : null;
  const showBarContext = typeof barIndex === "number" && typeof beatIndex === "number";

  return (
    <div
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-50 flex flex-col items-center"
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-label="Edit chord"
    >
      <div className="bg-bg-surface border border-border rounded-lg shadow-lg p-2 flex flex-col gap-1.5 min-w-[11rem]">
        {/* Bar/beat context */}
        {showBarContext && (
          <div className="flex items-center gap-1 text-[9px] font-mono text-text-muted uppercase tracking-wider">
            <span>Bar {barIndex + 1}</span>
            <span className="opacity-40">·</span>
            <span>Beat {beatIndex + 1}/{beatsPerBar}</span>
          </div>
        )}

        {/* Chord input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Chord (e.g. Am, G7)"
          aria-label="Chord name"
          className="w-full font-mono text-accent text-sm bg-transparent border-b border-border outline-none px-1 py-1 placeholder:text-text-muted focus-visible:border-accent"
        />

        {/* Diagram preview + beat-grid quick actions */}
        <div className="flex items-start gap-2">
          <div className="flex-1 flex flex-col gap-1">
            {/* Sustain / Rest / Clear quick buttons */}
            <div className="flex gap-1" role="group" aria-label="Beat actions">
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); confirm("."); }}
                title="Sustain (hold previous chord)"
                aria-label="Sustain"
                className="flex-1 text-[11px] font-mono px-2 py-1 rounded bg-bg-elevated text-text-secondary hover:bg-accent-dim hover:text-accent transition-colors"
              >
                · sustain
              </button>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); confirm("-"); }}
                title="Rest / no chord"
                aria-label="Rest"
                className="flex-1 text-[11px] font-mono px-2 py-1 rounded bg-bg-elevated text-text-secondary hover:bg-accent-dim hover:text-accent transition-colors"
              >
                – rest
              </button>
            </div>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onConfirm(null); }}
              aria-label="Clear chord"
              className="text-[10px] font-mono px-2 py-1 rounded border border-border text-text-muted hover:text-accent hover:border-accent transition-colors"
            >
              ✕ clear
            </button>
          </div>

          {/* Live diagram preview */}
          {previewShape && (
            <div className="shrink-0 border border-border rounded p-1 bg-bg-primary">
              <ChordDiagram chord={value} size={1} />
            </div>
          )}
        </div>

        {/* Quick-pick pills */}
        {usedChords.length > 0 && (
          <div className="pt-1 border-t border-border">
            <div className="text-[9px] font-mono text-text-muted uppercase tracking-wider mb-1">Used</div>
            <div className="flex flex-wrap gap-1">
              {usedChords.slice(0, 8).map((c) => (
                <button
                  key={c}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); confirm(c); }}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent-dim text-accent cursor-pointer hover:bg-accent/20 transition-colors"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Current bar mini-map (visual orientation only; not interactive) */}
        {showBarContext && barChords && (
          <div className="pt-1 border-t border-border">
            <div className="text-[9px] font-mono text-text-muted uppercase tracking-wider mb-1">Bar {barIndex + 1}</div>
            <div className="flex gap-0.5 font-mono text-[10px]">
              {Array.from({ length: beatsPerBar }).map((_, i) => {
                const v = barChords[String(i)];
                const isCurrent = i === beatIndex;
                return (
                  <span
                    key={i}
                    className={`flex-1 text-center px-1 py-0.5 rounded ${
                      isCurrent
                        ? "bg-accent text-bg-primary font-bold"
                        : v && v !== "." && v !== "-"
                        ? "bg-accent-dim text-accent"
                        : "bg-bg-elevated text-text-muted"
                    }`}
                  >
                    {v && v !== "." && v !== "-" ? v : v || "·"}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Commit bar */}
        <div className="flex justify-end gap-1 pt-1">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onCancel(); }}
            className="text-[10px] font-mono px-2 py-0.5 rounded text-text-muted hover:text-text-primary transition-colors"
          >
            cancel
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); confirm(); }}
            className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent text-bg-primary hover:bg-accent-hover transition-colors"
          >
            save
          </button>
        </div>
      </div>
      {/* Caret */}
      <div className="w-2 h-2 bg-bg-surface border-r border-b border-border rotate-45 -mt-[5px]" />
    </div>
  );
}
