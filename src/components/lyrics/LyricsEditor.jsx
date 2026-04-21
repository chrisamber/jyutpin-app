import { useState, useEffect } from "react";
import { useSong } from "../../context/SongContext.jsx";
import { useSongAnalysis } from "../../hooks/useSongAnalysis.js";

export default function LyricsEditor({ onClose }) {
  const { lines, storageId } = useSong();
  const { updateLyrics } = useSongAnalysis();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Try to restore previously edited lyrics, fallback to current lines
    if (storageId) {
      try {
        const saved = localStorage.getItem(`editedlyrics:${storageId}`);
        if (saved) { setText(saved); return; }
      } catch {}
    }
    setText(lines.map((l) => l.chinese || l.tokens?.map((t) => t.char).join("") || "").join("\n"));
  }, [storageId]);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    await updateLyrics(text, storageId);
    setSaving(false);
    onClose();
  };

  const lineCount = text.split("\n").filter((l) => l.trim()).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm print:hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Edit Lyrics</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              One line per row · Chinese characters only · Jyutping auto-generated on save
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none px-2 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Textarea */}
        <div className="flex-1 overflow-hidden p-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-full min-h-[320px] bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-text-primary leading-relaxed resize-none focus:outline-none focus:border-accent/40 font-sans"
            placeholder={"麻煩各位都不望我\n我怎麼敢去唱情歌\n..."}
            spellCheck={false}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200">
          <span className="text-xs text-slate-400 font-mono">{lineCount} lines</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="text-sm px-4 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !text.trim()}
              className="text-sm px-4 py-1.5 rounded-lg bg-accent text-white font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {saving ? "Analyzing…" : "Save & Analyze"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
