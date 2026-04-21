import { useState, useEffect, useRef, useCallback } from "react";
import { useSong } from "../../context/SongContext.jsx";

const KEYS = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const ENHARMONIC = { "C#": "Db", "D#": "Eb", "G#": "Ab", "A#": "Bb" };
const normalizeKey = (k) => k ? (ENHARMONIC[k] || ENHARMONIC[k.replace("m","")] ? (ENHARMONIC[k] || ENHARMONIC[k.replace("m","")]+(k.endsWith("m")?"m":"")) : k) : k;
const CAPOS = Array.from({ length: 13 }, (_, i) => i);
const STORAGE_KEY = (id) => `songmeta:${id}`;
const DEFAULT_META = { bpm: "", key: "", capo: "", genre: "", description: "", beatsPerBar: "4" };

function loadMeta(storageId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(storageId));
    return raw ? { ...DEFAULT_META, ...JSON.parse(raw) } : { ...DEFAULT_META };
  } catch { return { ...DEFAULT_META }; }
}

function saveMeta(storageId, meta) {
  try { localStorage.setItem(STORAGE_KEY(storageId), JSON.stringify(meta)); } catch {}
}

export function loadMetaForSong(storageId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(storageId));
    return raw ? { ...DEFAULT_META, ...JSON.parse(raw) } : { ...DEFAULT_META };
  } catch { return { ...DEFAULT_META }; }
}

export default function SongMeta() {
  const { song, storageId } = useSong();
  const [open, setOpen] = useState(false);
  const [meta, setMeta] = useState(() => loadMeta(storageId || ""));
  const tapTimestamps = useRef([]);

  // Sync state when song changes
  useEffect(() => {
    if (!storageId) return;
    setMeta(loadMeta(storageId));
  }, [storageId]);

  const update = useCallback((key, value) => {
    setMeta((prev) => {
      const next = { ...prev, [key]: value };
      if (storageId) saveMeta(storageId, next);
      return next;
    });
  }, [storageId]);

  // Tap tempo: compute BPM from last 4 tap intervals
  const handleTap = useCallback(() => {
    const now = Date.now();
    tapTimestamps.current = [...tapTimestamps.current.slice(-7), now];
    const taps = tapTimestamps.current;
    if (taps.length < 2) return;
    const intervals = taps.slice(1).map((t, i) => t - taps[i]);
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const bpm = Math.round(60000 / avg);
    if (bpm >= 20 && bpm <= 300) update("bpm", String(bpm));
  }, [update]);

  if (!song) return null;

  const hasData = meta.bpm || meta.key || meta.capo || meta.genre || meta.beatsPerBar;

  return (
    <div className="mb-6 print:mb-4">
      {/* Summary bar (always visible) */}
      <div className="flex items-center gap-3 flex-wrap">
        {meta.bpm && (
          <span className="text-xs font-mono text-text-secondary">
            BPM <span className="text-text-primary">{meta.bpm}</span>
          </span>
        )}
        {meta.key && (
          <span className="text-xs font-mono text-text-secondary">
            Key: <span className="text-text-primary">{normalizeKey(meta.key)}</span>
          </span>
        )}
        {meta.capo !== "" && meta.capo !== "0" && meta.capo !== 0 && (
          <span className="text-xs font-mono text-text-secondary">
            Capo <span className="text-text-primary">{meta.capo}</span>
          </span>
        )}
        {meta.genre && (
          <span className="text-xs font-mono text-text-secondary">
            <span className="text-text-primary">{meta.genre}</span>
          </span>
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-[11px] font-mono text-slate-400 hover:text-slate-600 transition-colors ml-auto print:hidden"
        >
          {open ? "▲ close" : (hasData ? "✎ edit" : "+ add details")}
        </button>
      </div>

      {/* Expandable editor */}
      {open && (
        <div className="mt-4 bg-bg-surface border border-border-subtle rounded-xl p-6 print:hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
            {/* BPM + tap tempo */}
            <div>
              <label htmlFor="bpm" className="text-xs font-mono text-text-muted uppercase tracking-wider block mb-2">BPM</label>
              <div className="flex gap-2">
                <input
                  id="bpm"
                  type="number"
                  min="20" max="300"
                  value={meta.bpm}
                  onChange={(e) => update("bpm", e.target.value)}
                  placeholder="—"
                  className="w-16 bg-bg-primary border border-border-subtle rounded px-3 py-2 text-base font-mono text-text-primary focus:outline-none focus:border-accent/40"
                />
                <button
                  onClick={handleTap}
                  aria-label="Tap to detect BPM"
                  className="px-3 py-2 text-xs font-mono bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded text-accent/70 transition-colors select-none"
                >
                  tap
                </button>
              </div>
            </div>

            {/* Key */}
            <div>
              <label htmlFor="key" className="text-xs font-mono text-text-muted uppercase tracking-wider block mb-2">Key</label>
              <select
                id="key"
                value={meta.key}
                onChange={(e) => update("key", e.target.value)}
                className="bg-bg-primary border border-border-subtle rounded px-3 py-2 text-base font-mono text-text-primary focus:outline-none focus:border-accent/40 w-full"
              >
                <option value="">—</option>
                {KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
                {KEYS.map((k) => <option key={`${k}m`} value={`${k}m`}>{k}m</option>)}
              </select>
            </div>

            {/* Capo */}
            <div>
              <label htmlFor="capo" className="text-xs font-mono text-text-muted uppercase tracking-wider block mb-2">Capo</label>
              <select
                id="capo"
                value={meta.capo}
                onChange={(e) => update("capo", e.target.value)}
                className="bg-bg-primary border border-border-subtle rounded px-3 py-2 text-base font-mono text-text-primary focus:outline-none focus:border-accent/40 w-full"
              >
                <option value="">—</option>
                {CAPOS.map((c) => <option key={c} value={c}>{c === 0 ? "Open" : c}</option>)}
              </select>
            </div>

            {/* Genre */}
            <div>
              <label htmlFor="genre" className="text-xs font-mono text-text-muted uppercase tracking-wider block mb-2">Genre</label>
              <input
                id="genre"
                type="text"
                value={meta.genre}
                onChange={(e) => update("genre", e.target.value)}
                placeholder="Cantopop…"
                className="w-full bg-bg-primary border border-border-subtle rounded px-3 py-2 text-base font-mono text-text-primary focus:outline-none focus:border-accent/40"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="text-xs font-mono text-text-muted uppercase tracking-wider block mb-2">Description</label>
            <textarea
              id="description"
              value={meta.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Notes about the song…"
              rows={2}
              className="w-full bg-bg-primary border border-border-subtle rounded px-4 py-3 text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
