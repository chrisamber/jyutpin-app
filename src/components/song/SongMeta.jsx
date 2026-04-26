import { useState, useEffect } from "react";
import { useSong } from "../../context/SongContext.jsx";

const ENHARMONIC = { "C#": "Db", "D#": "Eb", "G#": "Ab", "A#": "Bb" };
const normalizeKey = (k) => k ? (ENHARMONIC[k] || ENHARMONIC[k.replace("m","")] ? (ENHARMONIC[k] || ENHARMONIC[k.replace("m","")]+(k.endsWith("m")?"m":"")) : k) : k;
const STORAGE_KEY = (id) => `songmeta:${id}`;
const DEFAULT_META = { bpm: "", key: "", capo: "", genre: "", description: "", beatsPerBar: "4" };

function loadMeta(storageId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(storageId));
    return raw ? { ...DEFAULT_META, ...JSON.parse(raw) } : { ...DEFAULT_META };
  } catch { return { ...DEFAULT_META }; }
}

export function loadMetaForSong(storageId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(storageId));
    return raw ? { ...DEFAULT_META, ...JSON.parse(raw) } : { ...DEFAULT_META };
  } catch { return { ...DEFAULT_META }; }
}

export default function SongMeta() {
  const { song, storageId } = useSong();
  const [meta, setMeta] = useState(() => loadMeta(storageId || ""));

  // Sync state when song changes
  useEffect(() => {
    if (!storageId) return;
    setMeta(loadMeta(storageId));
  }, [storageId]);

  if (!song) return null;

  const hasData = meta.bpm || meta.key || (meta.capo !== "" && meta.capo !== "0" && meta.capo !== 0) || meta.genre;
  if (!hasData) return null;

  return (
    <div className="mb-6 print:mb-4">
      <div className="flex items-center gap-3 flex-wrap">
        {meta.bpm && (
          <span className="text-xs font-mono text-[var(--color-text-secondary)]">
            BPM <span className="text-[var(--color-text-primary)]">{meta.bpm}</span>
          </span>
        )}
        {meta.key && (
          <span className="text-xs font-mono text-[var(--color-text-secondary)]">
            Key: <span className="text-[var(--color-text-primary)]">{normalizeKey(meta.key)}</span>
          </span>
        )}
        {meta.capo !== "" && meta.capo !== "0" && meta.capo !== 0 && (
          <span className="text-xs font-mono text-[var(--color-text-secondary)]">
            Capo <span className="text-[var(--color-text-primary)]">{meta.capo}</span>
          </span>
        )}
        {meta.genre && (
          <span className="text-xs font-mono text-[var(--color-text-secondary)]">
            <span className="text-[var(--color-text-primary)]">{meta.genre}</span>
          </span>
        )}
      </div>
    </div>
  );
}
