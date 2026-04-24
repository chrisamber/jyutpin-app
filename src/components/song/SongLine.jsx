import { TONE_COLORS } from "../../data/tones.js";
import ToneVisual from "../tone/ToneVisual.jsx";

export default function SongLine({ line, index, expanded, onToggle }) {
  const dangers = line.dangers || [];

  return (
    <div
      className={`mb-3 rounded-xl overflow-hidden transition-all border ${
        expanded
          ? "bg-[var(--color-bg-surface)] border-accent/20"
          : "bg-[var(--color-bg-base)] border-[var(--color-border-default)] hover:border-[var(--color-border-strong)]"
      }`}
    >
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className="px-4 py-3.5 flex items-start gap-3.5 w-full text-left"
      >
        <span className="font-mono text-[11px] text-accent/40 min-w-6 pt-1">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex-1">
          <div className="text-lg tracking-wider text-[var(--color-text-primary)] font-medium leading-relaxed">
            {line.chinese}
          </div>
          <div className="text-xs text-accent/50 font-mono mt-1 leading-relaxed break-all">
            {line.jyutping || line.jyutpingText}
          </div>
          {line.translation && (
            <div className="text-xs text-[var(--color-text-muted)] mt-1 italic">
              {line.translation}
            </div>
          )}
        </div>
        {dangers.length > 0 && (
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full whitespace-nowrap ${
              dangers.length > 1
                ? "text-red-400 bg-red-500/10"
                : "text-amber-400 bg-amber-500/10"
            }`}
          >
            {dangers.length} {dangers.length === 1 ? "trap" : "traps"}
          </span>
        )}
      </button>
      {expanded && dangers.length > 0 && (
        <div className="px-4 pb-4 pl-14 space-y-2.5">
          {dangers.map((d, di) => (
            <div
              key={di}
              className="bg-[var(--color-bg-elevated)] rounded-xl p-4"
              style={{
                borderLeft: `3px solid ${
                  typeof d.tone === "number"
                    ? TONE_COLORS[d.tone]
                    : "#FFAA44"
                }`,
              }}
            >
              <div className="flex items-center gap-3 mb-2.5">
                <span className="text-[28px] font-bold text-[var(--color-text-primary)]">
                  {d.word}
                </span>
                <span className="font-mono text-[13px] text-accent/70 bg-accent/8 px-2.5 py-0.5 rounded-md">
                  {d.jyutping}
                </span>
                {typeof d.tone === "number" && (
                  <ToneVisual tone={d.tone} size={48} />
                )}
                {typeof d.tone === "string" && (
                  <span className="font-mono text-[11px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md">
                    {d.tone}
                  </span>
                )}
              </div>
              <div className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                {d.note}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
