import { useMemo } from "react";
import { useSong } from "../../context/SongContext.jsx";
import { TONE_COLORS, TONE_NAMES } from "../../data/tones.js";

export default function ToneAnalytics() {
  const { lines } = useSong();

  const stats = useMemo(() => {
    const tones = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    let entering = 0;
    let ngInitial = 0;
    let total = 0;

    for (const line of lines) {
      for (const t of line.tokens) {
        if (!t.jyutping || !t.tone) continue;
        total++;
        tones[t.tone]++;
        if (/[ptk]\d$/.test(t.jyutping)) entering++;
        if (/^ng/.test(t.jyutping)) ngInitial++;
      }
    }

    const maxCount = Math.max(...Object.values(tones), 1);
    const dominant = Object.entries(tones).sort((a, b) => b[1] - a[1])[0];

    return { tones, entering, ngInitial, total, maxCount, dominant };
  }, [lines]);

  if (stats.total === 0) return null;

  return (
    <div className="space-y-4 mb-6 print:hidden">
      <h3 className="text-sm font-mono text-accent/60 tracking-widest uppercase">
        Tone Profile
      </h3>

      {/* Distribution bars */}
      <div className="space-y-1.5">
        {[1, 2, 3, 4, 5, 6].map((t) => {
          const count = stats.tones[t];
          const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
          const barWidth = (count / stats.maxCount) * 100;
          return (
            <div key={t} className="flex items-center gap-2">
              <span
                className="text-2xs font-mono w-5 text-right font-medium"
                style={{ color: TONE_COLORS[t] }}
              >
                T{t}
              </span>
              <div className="flex-1 h-4 bg-[var(--color-bg-surface)] rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all duration-500"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: TONE_COLORS[t] + "30",
                    borderLeft: `2px solid ${TONE_COLORS[t]}`,
                    minWidth: count > 0 ? "4px" : "0",
                  }}
                />
              </div>
              <span className="text-2xs font-mono text-[var(--color-text-muted)] w-10 text-right">
                {count > 0 ? `${Math.round(pct)}%` : "—"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-[var(--color-bg-surface)] rounded-lg py-2 px-1">
          <div className="text-lg font-light text-[var(--color-text-primary)] leading-none">
            {stats.total}
          </div>
          <div className="text-2xs font-mono text-[var(--color-text-muted)] mt-1">
            syllables
          </div>
        </div>
        <div className="bg-[var(--color-bg-surface)] rounded-lg py-2 px-1">
          <div className="text-lg font-light text-[var(--color-text-primary)] leading-none">
            {stats.entering}
          </div>
          <div className="text-2xs font-mono text-[var(--color-text-muted)] mt-1">
            entering
          </div>
        </div>
        <div className="bg-[var(--color-bg-surface)] rounded-lg py-2 px-1">
          <div className="text-lg font-light text-[var(--color-text-primary)] leading-none">
            {stats.ngInitial}
          </div>
          <div className="text-2xs font-mono text-[var(--color-text-muted)] mt-1">
            ng-initial
          </div>
        </div>
      </div>

    </div>
  );
}
