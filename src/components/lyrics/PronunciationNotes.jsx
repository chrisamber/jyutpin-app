import { useMemo } from "react";
import { useSong } from "../../context/SongContext.jsx";
import { TONE_COLORS } from "../../data/tones.js";
import { detectPronunciationNotes } from "../../services/pronunciationNotes.js";

function groupDangers(lines) {
  const categories = new Map();
  for (const line of lines) {
    if (!line.dangers) continue;
    for (const d of line.dangers) {
      const key =
        typeof d.tone === "number"
          ? `Tone ${d.tone}`
          : d.tone?.includes("→")
            ? "Tone Transitions"
            : "Key Words";
      if (!categories.has(key)) categories.set(key, []);
      categories.get(key).push(d);
    }
  }
  return [...categories.entries()].map(([category, dangers]) => ({
    category,
    words: dangers.map((d) => ({
      char: d.word,
      jyutping: d.jyutping,
      tone: d.tone,
    })),
    tip: dangers[0].note,
  }));
}

export default function PronunciationNotes() {
  const { song, lines } = useSong();

  const notes = useMemo(() => {
    if (song?.isDemo) {
      return groupDangers(lines);
    }
    return detectPronunciationNotes(lines);
  }, [song, lines]);

  if (notes.length === 0) return null;

  return (
    <div className="space-y-4 print:hidden">
      <h3 className="text-sm font-mono text-accent/60 tracking-widest uppercase">
        Pronunciation Notes
      </h3>

      {notes.map((note, i) => (
        <div
          key={i}
          className="bg-bg-surface border border-border-default rounded-lg p-3.5"
        >
          <div className="text-xs font-semibold text-accent/80 mb-2">
            {note.category}
          </div>

          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {note.words.map((w, wi) => (
              <span
                key={wi}
                className="inline-flex items-center gap-1 text-sm bg-bg-elevated rounded px-2 py-0.5"
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
                <span className="text-[10px] font-mono text-text-muted">
                  {w.jyutping}
                </span>
              </span>
            ))}
          </div>

          <p className="text-[11px] leading-relaxed text-text-secondary">
            {note.tip}
          </p>
        </div>
      ))}
    </div>
  );
}
