import { useMemo, useState } from "react";
import { TONE_COLORS } from "../../data/tones.js";
import { useApp } from "../../context/AppContext.jsx";
import { jyutpingToYale } from "../../services/yale.js";
import ChordPopover from "./ChordPopover.jsx";

export default function JyutpingAnnotation({ char, jyutping, tone, pinyin, chord, hasDanger, chordEditMode, onChordEdit, usedChords, isTrailing, barIndex, beatIndex, beatsPerBar, barChords }) {
  const { romanization } = useApp();
  const [editing, setEditing] = useState(false);

  const color = useMemo(() => tone ? TONE_COLORS[tone] : undefined, [tone]);
  const isEnteringTone = useMemo(() => jyutping && /[ptk]\d$/.test(jyutping), [jyutping]);
  const isNgInitial = useMemo(() => jyutping && /^ng/.test(jyutping), [jyutping]);
  const stressed = hasDanger || isEnteringTone || isNgInitial;

  const displayRomanization = useMemo(() => {
    if (romanization === "yale") return jyutpingToYale(jyutping) || jyutping;
    if (romanization === "pinyin") return pinyin;
    return jyutping;
  }, [romanization, jyutping, pinyin]);

  const isClickable = chordEditMode && !isTrailing;

  const handleClick = (e) => {
    if (!isClickable) return;
    e.stopPropagation();
    setEditing(true);
  };

  let content = null;

  if (isTrailing) {
    content = <span className="inline-block min-w-[1rem]" />;
  } else if (!(jyutping || pinyin) || char.trim() === "") {
    // Whitespace / punctuation: in chord edit mode use an invisible clickable spacer
    if (chordEditMode && char.trim() === "") {
      content = <span className="mx-0.5 inline-block w-4 h-6" />;
    } else {
      content = (
        <span className={`mx-0.5 text-xl leading-none select-none ${char.trim() === "" ? "min-w-[0.5rem] inline-block" : "text-slate-300"}`}>
          {char}
        </span>
      );
    }
  } else {
    content = (
      <ruby
        className={`mx-1 inline-flex flex-col items-center ${stressed ? "rounded px-1 pb-0.5" : ""}`}
        style={
          stressed
            ? {
                backgroundColor: color ? color + "12" : "rgba(0,0,0,0.04)",
                borderBottom: `2px solid ${color || "rgba(0,0,0,0.15)"}`,
              }
            : undefined
        }
      >
        <rb
          className={`text-xl leading-tight ${stressed ? "font-semibold" : "font-normal"}`}
          style={color ? { color } : { color: "#1e293b" }}
        >
          {char}
        </rb>
        {romanization !== "none" && (
          <>
            <rp>(</rp>
            <rt
              className="font-mono font-normal text-[10px] leading-none"
              style={color ? { color, opacity: 0.85 } : { color: "#94a3b8" }}
            >
              {displayRomanization}
            </rt>
            <rp>)</rp>
          </>
        )}
      </ruby>
    );
  }

  // In non-edit mode with no chord, skip the wrapper entirely
  if (!chordEditMode && !chord) return content;

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-end min-w-[1rem] group ${
        isClickable ? "cursor-pointer hover:ring-1 hover:ring-accent/40 hover:rounded hover:bg-accent/5 transition-all" : ""
      }`}
      onClick={handleClick}
    >
      {editing && (
        <ChordPopover
          currentChord={chord}
          usedChords={usedChords || []}
          onConfirm={(v) => { setEditing(false); onChordEdit?.(v); }}
          onCancel={() => setEditing(false)}
          barIndex={barIndex}
          beatIndex={beatIndex}
          beatsPerBar={beatsPerBar}
          barChords={barChords}
        />
      )}

      {/* Fixed-height chord area — keeps all tokens at the same height in edit mode */}
      <div className="h-5 flex items-end justify-center mb-0.5">
        {chord && !editing && (
          <span className="text-accent font-bold text-[15px] font-mono tracking-tighter whitespace-nowrap">
            {chord}
          </span>
        )}
        {chordEditMode && !chord && !editing && isClickable && (
          <span className="text-accent/30 text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity select-none">
            +
          </span>
        )}
      </div>

      {content}
    </div>
  );
}
