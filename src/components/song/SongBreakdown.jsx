import { useSong } from "../../context/SongContext.jsx";
import { useApp, useAppDispatch } from "../../context/AppContext.jsx";
import { TONE_COLORS } from "../../data/tones.js";
import SongLine from "./SongLine.jsx";

export default function SongBreakdown() {
  const { lines } = useSong();
  const { expandedLine, toneFilter } = useApp();
  const dispatch = useAppDispatch();

  const linesWithDangers = lines.filter(
    (l) => l.dangers && l.dangers.length > 0
  );

  const filtered = toneFilter
    ? linesWithDangers.filter((l) =>
        l.dangers.some(
          (d) =>
            d.tone === toneFilter ||
            (typeof d.tone === "string" &&
              d.tone.includes(String(toneFilter)))
        )
      )
    : linesWithDangers;

  return (
    <div>
      <h2 className="text-xl font-normal mb-2 text-accent/80">
        Line-by-Line Breakdown
      </h2>
      <p className="text-xs text-slate-500 mb-5">
        Tap any line to reveal its pronunciation traps. Words highlighted are
        where non-native delivery is most audible.
      </p>

      <div className="flex gap-1.5 mb-5 flex-wrap">
        <button
          onClick={() => dispatch({ type: "SET_TONE_FILTER", tone: null })}
          className={`text-[11px] font-mono px-3 py-1.5 rounded-full border transition-all ${
            toneFilter === null
              ? "bg-accent/15 border-accent/30 text-[var(--color-text-primary)]"
              : "bg-slate-50 border-slate-200 text-slate-500"
          }`}
        >
          All
        </button>
        {[1, 2, 3, 4, 5, 6].map((t) => (
          <button
            key={t}
            onClick={() => dispatch({ type: "SET_TONE_FILTER", tone: t })}
            className="text-[11px] font-mono px-3 py-1.5 rounded-full border transition-all"
            style={
              toneFilter === t
                ? {
                    backgroundColor: TONE_COLORS[t] + "22",
                    borderColor: TONE_COLORS[t] + "44",
                    color: TONE_COLORS[t],
                  }
                : {
                    backgroundColor: "rgba(0,0,0,0.03)",
                    borderColor: "rgba(0,0,0,0.1)",
                    color: "rgba(0,0,0,0.4)",
                  }
            }
          >
            T{t}
          </button>
        ))}
      </div>

      {filtered.map((line) => {
        const idx = lines.indexOf(line);
        return (
          <SongLine
            key={idx}
            line={line}
            index={idx}
            expanded={expandedLine === idx}
            onToggle={() => dispatch({ type: "TOGGLE_LINE", index: idx })}
          />
        );
      })}
    </div>
  );
}
