import { TONE_COLORS, TONE_CONTOURS } from "../../data/tones.js";
import { useApp } from "../../context/AppContext.jsx";

const TONE_SHORT = {
  1: "High Level",
  2: "High Rising",
  3: "Mid Level",
  4: "Low Falling",
  5: "Low Rising",
  6: "Low Level",
};

const TONE_NUMBERS = {
  1: "55", 2: "25", 3: "33", 4: "21", 5: "23", 6: "22",
};

export default function ToneReference() {
  const { activeLyricIndex } = useApp();

  return (
    <div className="flex flex-col gap-0.5 select-none opacity-60 hover:opacity-100 transition-opacity">
      <div className="text-2xs font-mono text-[var(--color-text-muted)] tracking-[0.2em] uppercase mb-1.5">
        Tones
      </div>

      {[1, 2, 3, 4, 5, 6].map((t) => (
        <div key={t} className="flex items-center gap-1.5 px-1 py-1">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: TONE_COLORS[t] }}
          />
          <span
            className="font-mono text-2xs w-3.5 text-center flex-shrink-0"
            style={{ color: TONE_COLORS[t] }}
          >
            {TONE_CONTOURS[t]}
          </span>
          <span className="flex flex-col">
            <span className="text-2xs font-mono leading-none" style={{ color: TONE_COLORS[t] }}>
              T{t}
            </span>
            <span className="text-2xs text-[var(--color-text-muted)] leading-none mt-0.5 whitespace-nowrap">
              {TONE_SHORT[t]} · {TONE_NUMBERS[t]}
            </span>
          </span>
        </div>
      ))}

      {/* Keyboard shortcuts — shown when a line is active */}
      {activeLyricIndex >= 0 && (
        <>
          <div className="border-t border-[var(--color-border-subtle)] my-3" />
          <div className="text-2xs font-mono text-[var(--color-text-muted)] tracking-[0.2em] uppercase mb-1">
            Keys
          </div>
          {[{ key: "↑↓", label: "Navigate" }, { key: "Esc", label: "Clear" }].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2 px-2">
              <span className="font-mono text-2xs bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] rounded px-1.5 py-0.5 text-[var(--color-text-secondary)]">
                {key}
              </span>
              <span className="text-2xs text-[var(--color-text-muted)]">{label}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
