import { useState, useEffect, useRef, useCallback } from "react";
import { saveCustomSong } from "../../services/customSongs.js";
import { useSongAnalysis } from "../../hooks/useSongAnalysis.js";

const LANGUAGES = [
  { value: "cantonese", label: "Cantonese" },
  { value: "mandarin",  label: "Mandarin" },
  { value: "mixed",     label: "Mixed" },
];

const EMPTY = { title: "", artist: "", album: "", language: "cantonese", youtubeUrl: "", lyrics: "" };

export default function AddSongModal({ onClose }) {
  const [fields, setFields] = useState(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loadCustomSong } = useSongAnalysis();
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  // Close on Escape and Focus Trap
  useEffect(() => {
    const trigger = document.activeElement;
    firstInputRef.current?.focus();

    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const focusable = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { last.focus(); e.preventDefault(); }
        } else {
          if (document.activeElement === last) { first.focus(); e.preventDefault(); }
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      trigger?.focus();
    };
  }, [onClose]);

  const set = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!fields.title.trim()) { setError("Title is required."); return; }
    if (!fields.lyrics.trim()) { setError("Lyrics are required."); return; }
    setError("");
    setLoading(true);
    try {
      const saved = saveCustomSong(fields, fields.lyrics.trim());
      await loadCustomSong(saved);
      onClose();
    } catch (err) {
      setError("Something went wrong: " + err.message);
      setLoading(false);
    }
  }, [fields, loadCustomSong, onClose]);

  const inputCls = "w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-accent/40 transition-colors";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-song-title"
        className="relative w-full max-w-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <div>
            <h2 id="add-song-title" className="text-sm font-medium text-[var(--color-text-primary)]">Add your own song</h2>
            <p className="text-[11px] text-[var(--color-text-secondary)] font-mono mt-0.5">Paste lyrics to get Jyutping annotations</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--color-bg-elevated)]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2 L12 12 M12 2 L2 12" />
            </svg>
          </button>
        </div>

        <form id="add-song-form" onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="title-input" className="text-[10px] font-mono text-[var(--color-text-muted)] tracking-[0.15em] uppercase block mb-1.5">
                Title <span className="text-accent">*</span>
              </label>
              <input
                id="title-input"
                ref={firstInputRef}
                type="text"
                value={fields.title}
                onChange={set("title")}
                placeholder="歌曲名稱"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="artist-input" className="text-[10px] font-mono text-[var(--color-text-muted)] tracking-[0.15em] uppercase block mb-1.5">Artist</label>
              <input
                id="artist-input"
                type="text"
                value={fields.artist}
                onChange={set("artist")}
                placeholder="歌手"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="album-input" className="text-[10px] font-mono text-[var(--color-text-muted)] tracking-[0.15em] uppercase block mb-1.5">Album</label>
              <input
                id="album-input"
                type="text"
                value={fields.album}
                onChange={set("album")}
                placeholder="專輯"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="lang-select" className="text-[10px] font-mono text-[var(--color-text-muted)] tracking-[0.15em] uppercase block mb-1.5">Language</label>
              <select id="lang-select" value={fields.language} onChange={set("language")} className={inputCls}>
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="yt-input" className="text-[10px] font-mono text-[var(--color-text-muted)] tracking-[0.15em] uppercase block mb-1.5">YouTube URL</label>
            <input
              id="yt-input"
              type="url"
              value={fields.youtubeUrl}
              onChange={set("youtubeUrl")}
              placeholder="https://youtube.com/watch?v=..."
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="lyrics-input" className="text-[10px] font-mono text-[var(--color-text-muted)] tracking-[0.15em] uppercase block mb-1.5">
              Lyrics <span className="text-accent">*</span>
            </label>
            <textarea
              id="lyrics-input"
              value={fields.lyrics}
              onChange={set("lyrics")}
              placeholder={"Paste lyrics here — one line per row.\\n如果那兩個字\\n沒有互相擁有\\n在最美麗的時刻\\n分開了也可以\\n道謝"}
              className={`${inputCls} resize-none h-44 leading-relaxed font-mono text-xs`}
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 font-mono">{error}</p>
          )}
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border-subtle)]">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors px-4 py-2 rounded-lg hover:bg-[var(--color-bg-elevated)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-song-form"
            disabled={loading}
            className="text-xs font-mono bg-accent hover:bg-accent/90 text-[var(--color-bg-base)] font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Analysing…" : "Add song"}
          </button>
        </div>
      </div>
    </div>
  );
}