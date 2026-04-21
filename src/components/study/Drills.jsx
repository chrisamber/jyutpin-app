import { useMemo } from "react";
import { useSong } from "../../context/SongContext.jsx";
import { generateDrills } from "../../services/drillGenerator.js";

export default function Drills() {
  const { lines, song } = useSong();
  const drills = useMemo(() => generateDrills(lines), [lines]);

  return (
    <div>
      <h2 className="text-xl font-normal mb-2 text-accent/80">
        Practice Drills for {song?.title || "This Song"}
      </h2>
      <p className="text-[13px] leading-relaxed text-slate-500 mb-6">
        Auto-generated drills based on the pronunciation challenges found in
        this song.
      </p>

      {drills.length === 0 ? (
        <div className="bg-slate-100 rounded-xl p-6 text-center text-slate-400 text-sm">
          Not enough tonal variety detected for drill generation.
        </div>
      ) : (
        <div className="space-y-5">
          {drills.map((drill, i) => (
            <div
              key={i}
              className="bg-slate-50 rounded-xl p-5"
              style={{ borderLeft: `3px solid ${drill.color}` }}
            >
              <div
                className="text-sm font-semibold mb-3.5"
                style={{ color: drill.color }}
              >
                {drill.title}
              </div>
              <div className="text-[13px] leading-relaxed text-slate-600 space-y-1.5">
                {drill.steps.map((step, si) => (
                  <div key={si} className="flex gap-2.5">
                    <span className="text-slate-300 font-mono text-[11px] min-w-4 pt-0.5">
                      {si + 1}.
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
