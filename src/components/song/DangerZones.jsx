import { useMemo } from "react";
import { useSong } from "../../context/SongContext.jsx";
import { DANGER_WORDS } from "../../data/defaultSong.js";
import { detectPronunciationNotes } from "../../services/pronunciationNotes.js";
import { TONE_COLORS } from "../../data/tones.js";

function DemoToneTraps() {
  return (
    <div className="space-y-4">
      {DANGER_WORDS.map((item, i) => (
        <div
          key={i}
          className={`flex gap-4 p-4 rounded-xl border ${
            i < 3
              ? "bg-red-50 border-red-200"
              : "bg-slate-50 border-slate-200"
          }`}
        >
          <div
            className={`text-2xl font-bold font-mono min-w-8 ${
              i < 3 ? "text-red-300" : "text-slate-300"
            }`}
          >
            {item.rank}
          </div>
          <div>
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-[22px] font-semibold text-text-primary">
                {item.word}
              </span>
              <span className="font-mono text-xs text-accent/70">
                {item.jp}
              </span>
            </div>
            <div className="text-[13px] leading-relaxed text-slate-600">
              {item.why}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AutoToneTraps({ notes }) {
  if (notes.length === 0) {
    return (
      <div className="bg-slate-100 rounded-xl p-6 text-center text-slate-400 text-sm">
        No significant tone traps detected in this song.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note, i) => (
        <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-semibold text-accent/80 mb-2 font-mono uppercase tracking-wider">
            {note.category}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {note.words.map((w, wi) => (
              <span
                key={wi}
                className="inline-flex items-center gap-1 text-sm bg-white border border-slate-200 rounded px-2 py-0.5"
              >
                <span
                  className="font-medium"
                  style={
                    typeof w.tone === "number" && TONE_COLORS[w.tone]
                      ? { color: TONE_COLORS[w.tone] }
                      : undefined
                  }
                >
                  {w.char}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {w.jyutping}
                </span>
              </span>
            ))}
          </div>
          <p className="text-[12px] leading-relaxed text-slate-500">{note.tip}</p>
        </div>
      ))}
    </div>
  );
}

export default function DangerZones() {
  const { song, lines } = useSong();

  const autoNotes = useMemo(
    () => (!song?.isDemo ? detectPronunciationNotes(lines) : []),
    [song, lines]
  );

  return (
    <div>
      <h2 className="text-xl font-normal mb-2 text-accent/80">
        Tone Traps
      </h2>
      <p className="text-[13px] leading-relaxed text-slate-500 mb-6">
        {song?.isDemo
          ? "The highest-stakes words in this song. Get these right and native listeners will believe you."
          : "Auto-detected pronunciation challenges in this song based on tone analysis."}
      </p>

      {song?.isDemo ? <DemoToneTraps /> : <AutoToneTraps notes={autoNotes} />}
    </div>
  );
}
