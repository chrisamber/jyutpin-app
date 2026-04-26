import { useMemo, useState } from "react";
import { TONE_COLORS } from "../../data/tones.js";
import { useApp } from "../../context/AppContext.jsx";
import { jyutpingToYale } from "../../services/yale.js";
import ChordPopover from "./ChordPopover.jsx";

export default function JyutpingAnnotation({ char, jyutping, roman, tone, pinyin, alternates, chord, hasDanger, chordEditMode, onChordEdit, usedChords, isTrailing, barIndex, beatIndex, beatsPerBar, barChords, showAnnotation = true, customMode = false, onSyllableClick }) {
  const { romanization } = useApp();
  const [editing, setEditing] = useState(false);

  // Non-yue dialects (cmn/nan) pass `roman` instead of `jyutping`. Use it as
  // the fallback display string so existing rendering stays unchanged.
  const primaryRoman = jyutping ?? roman ?? null;

  const color = useMemo(() => tone ? TONE_COLORS[tone] : undefined, [tone]);
  const isEnteringTone = useMemo(() => jyutping && /[ptk]\d$/.test(jyutping), [jyutping]);
  const isNgInitial = useMemo(() => jyutping && /^ng/.test(jyutping), [jyutping]);
  const stressed = hasDanger || isEnteringTone || isNgInitial;

  const displayRomanization = useMemo(() => {
    if (romanization === "yale") {
      // Jyutping→Yale only applies to yue. For cmn/nan, use the engine's
      // alternate (zhuyin / tailo) if present, else fall back to primary.
      if (jyutping) return jyutpingToYale(jyutping) || jyutping;
      const alt = alternates ? Object.values(alternates).find(Boolean) : null;
      return alt || primaryRoman;
    }
    if (romanization === "pinyin") return pinyin ?? primaryRoman;
    return primaryRoman;
  }, [romanization, jyutping, pinyin, primaryRoman, alternates]);

  const isClickable = chordEditMode && !isTrailing;

  const handleClick = (e) => {
    if (!isClickable) return;
    e.stopPropagation();
    setEditing(true);
  };

  let content = null;

  const charSizeStyle = { fontSize: "calc(1.25rem * var(--lyrics-scale, 1))" };
  const jyutSizeStyle = { fontSize: "calc(11px * var(--lyrics-scale, 1))" };

  if (isTrailing) {
    content = <span className="inline-block min-w-[1rem]" />;
  } else if (!(jyutping || pinyin || roman) || char.trim() === "") {
    // Whitespace / punctuation: in chord edit mode use an invisible clickable spacer
    if (chordEditMode && char.trim() === "") {
      content = <span className="mx-0.5 inline-block w-4 h-6" />;
    } else {
      content = (
        <span
          className={`mx-0.5 leading-none select-none ${char.trim() === "" ? "min-w-[0.5rem] inline-block" : "text-slate-300"}`}
          style={charSizeStyle}
        >
          {char}
        </span>
      );
    }
  } else {
    const romanizationOff = romanization === "none";
    const hidden = !showAnnotation;
    const hiddenInCustom = customMode && hidden;
    content = (
      <ruby
        className={`mx-1 inline-flex flex-col-reverse items-center ${stressed ? "rounded px-1 pb-0.5" : ""}`}
        style={
          stressed
            ? {
                backgroundColor: color ? color + "12" : "rgba(0,0,0,0.04)",
              }
            : undefined
        }
      >
        <rb
          className={`leading-tight ${stressed ? "font-semibold" : "font-normal"}${!color ? " text-[var(--color-text-primary)]" : ""}${hiddenInCustom ? " underline decoration-dotted decoration-[var(--color-text-muted)] underline-offset-4" : ""}`}
          style={{ ...charSizeStyle, ...(color ? { color } : null) }}
        >
          {char}
        </rb>
        {!romanizationOff && (
          <>
            <rp>(</rp>
            <rt
              className={`lyrics-rt font-mono font-normal leading-none mb-0.5${!color ? " text-[var(--color-text-muted)]" : ""}${hidden ? " lyrics-rt-hidden" : ""}`}
              style={{ ...jyutSizeStyle, ...(color ? { color, opacity: 0.85 } : null) }}
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
  if (!chordEditMode && !chord) {
    if (onSyllableClick && !isTrailing) {
      return (
        <span
          role="button"
          tabIndex={0}
          aria-label={showAnnotation ? `Hide Jyutping for ${char}` : `Show Jyutping for ${char}`}
          onClick={(e) => { e.stopPropagation(); onSyllableClick(); }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onSyllableClick();
            }
          }}
          className="cursor-pointer rounded hover:bg-accent/8 transition-colors"
        >
          {content}
        </span>
      );
    }
    return content;
  }

  return (
    <div
      className={`relative inline-flex flex-col items-center self-stretch justify-between min-w-[1rem] group ${
        isClickable ? "cursor-pointer hover:bg-accent/8 hover:rounded transition-colors" : ""
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
          <span
            className="text-accent font-bold font-mono tracking-tighter whitespace-nowrap"
            style={{ fontSize: "calc(15px * var(--lyrics-scale, 1))" }}
          >
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
