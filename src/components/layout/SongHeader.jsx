import { useState, useEffect, useCallback } from "react";
import { useSong, useSongDispatch } from "../../context/SongContext.jsx";
import { useAppDispatch } from "../../context/AppContext.jsx";
import { toPinyinArray } from "../../services/mandarin.js";
import { CATALOG_BY_ARTIST } from "../../data/catalog.js";
import { getAlbumArt } from "../../services/iTunesArt.js";
import { updateCustomSongMeta } from "../../services/customSongs.js";
import { TONE_COLORS } from "../../data/tones.js";

function HeroLine({ tokens }) {
  if (!tokens?.length) return null;
  const visible = tokens.filter((t) => t.char && t.char.trim());
  if (!visible.length) return null;
  return (
    <div className="flex flex-wrap gap-x-2 gap-y-1 mt-3 mb-1 print:hidden" aria-hidden="true">
      {visible.map((t, i) => {
        const color = t.tone ? TONE_COLORS[t.tone] : "#94a3b8";
        return (
          <span key={i} className="inline-flex flex-col items-center gap-0.5">
            <span className="text-base font-light cjk leading-none" style={{ color }}>
              {t.char}
            </span>
            {t.jyutping && (
              <span className="text-[9px] font-mono leading-none" style={{ color, opacity: 0.65 }}>
                {t.jyutping}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

const LANGUAGES = [
  { value: "cantonese", label: "Cantonese" },
  { value: "mandarin",  label: "Mandarin" },
  { value: "mixed",     label: "Mixed" },
];

async function toMandarinPinyin(text) {
  const arr = await toPinyinArray(text);
  return arr.join(" ");
}

function hasChinese(str) {
  return str && /[\u4e00-\u9fff\u3400-\u4dbf]/.test(str);
}

function MetaEditor({ song, onSave, onCancel }) {
  const [fields, setFields] = useState({
    title:      song.title || "",
    artist:     song.artist || "",
    album:      song.album || "",
    language:   song.language || "cantonese",
    youtubeUrl: song.youtubeUrl || "",
  });

  const set = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }));

  const inputCls = "w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-lg px-3 py-1.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-accent/40 transition-colors";

  const handleSave = (e) => {
    e.preventDefault();
    if (!fields.title.trim()) return;
    onSave(fields);
  };

  return (
    <form onSubmit={handleSave} className="mt-4 p-4 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-xl space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[9px] font-mono text-[var(--color-text-muted)] tracking-[0.15em] uppercase block mb-1">Title</label>
          <input type="text" value={fields.title} onChange={set("title")} className={inputCls} />
        </div>
        <div>
          <label className="text-[9px] font-mono text-[var(--color-text-muted)] tracking-[0.15em] uppercase block mb-1">Artist</label>
          <input type="text" value={fields.artist} onChange={set("artist")} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[9px] font-mono text-[var(--color-text-muted)] tracking-[0.15em] uppercase block mb-1">Album</label>
          <input type="text" value={fields.album} onChange={set("album")} className={inputCls} />
        </div>
        <div>
          <label className="text-[9px] font-mono text-[var(--color-text-muted)] tracking-[0.15em] uppercase block mb-1">Language</label>
          <select value={fields.language} onChange={set("language")} className={inputCls}>
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="text-[9px] font-mono text-[var(--color-text-muted)] tracking-[0.15em] uppercase block mb-1">YouTube URL</label>
        <input type="url" value={fields.youtubeUrl} onChange={set("youtubeUrl")} placeholder="https://youtube.com/watch?v=..." className={inputCls} />
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          className="text-[11px] font-mono bg-accent hover:bg-accent/90 text-[var(--color-bg-base)] font-medium px-4 py-1.5 rounded-lg transition-colors"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-[11px] font-mono text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--color-bg-elevated)]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function SongHeader() {
  const { song, lines } = useSong();
  const songDispatch = useSongDispatch();
  const dispatch = useAppDispatch();
  const [pinyin, setPinyin] = useState("");
  const [albumArt, setAlbumArt] = useState(null);
  const [editingMeta, setEditingMeta] = useState(false);

  useEffect(() => {
    if (!song?.title) { setPinyin(""); return; }
    if (!hasChinese(song.title)) { setPinyin(""); return; }
    toMandarinPinyin(song.title).then(setPinyin);
  }, [song?.title]);

  useEffect(() => {
    if (!song?.title || !song?.artist) return;
    let cancelled = false;
    getAlbumArt(song.title, song.artist).then((url) => {
      if (!cancelled) setAlbumArt(url);
    });
    return () => { cancelled = true; };
  }, [song?.title, song?.artist]);

  // Close editor when song changes
  useEffect(() => { setEditingMeta(false); }, [song?.id]);

  const handleSaveMeta = useCallback((updates) => {
    updateCustomSongMeta(song.id, updates);
    songDispatch({ type: "UPDATE_SONG", updates });
    setEditingMeta(false);
  }, [song?.id, songDispatch]);

  if (!song) return null;

  const titleIsChinese = hasChinese(song.title);
  const inCatalog = CATALOG_BY_ARTIST.has(song.artist);

  return (
    <div className="mb-6 print:mb-4">
      <div className="flex items-start gap-4">
        {/* Album art */}
        {albumArt ? (
          <img
            src={albumArt}
            alt={song.title}
            className="w-16 h-16 rounded-xl object-cover shadow-lg ring-1 ring-[var(--color-border-subtle)] flex-shrink-0 mt-1 print:hidden"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-[var(--color-bg-surface)] ring-1 ring-[var(--color-border-subtle)] flex items-center justify-center flex-shrink-0 mt-1 print:hidden">
            <span className="text-2xl cjk text-[var(--color-text-muted)]">{song.title?.[0]}</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start gap-2">
            <h1 className="text-2xl font-light tracking-widest text-[var(--color-text-primary)] leading-tight cjk print:text-2xl print:text-black flex-1 min-w-0">
              {song.title}
            </h1>
            {song.isCustom && (
              <button
                onClick={() => setEditingMeta((v) => !v)}
                className={`shrink-0 mt-1 w-6 h-6 flex items-center justify-center rounded-md transition-colors print:hidden ${
                  editingMeta
                    ? "bg-accent/15 text-accent"
                    : "text-[var(--color-text-muted)] hover:text-accent hover:bg-[var(--color-bg-elevated)]"
                }`}
                aria-label="Edit song metadata"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 2L11 4L4.5 10.5L2 11L2.5 8.5L9 2Z" />
                </svg>
              </button>
            )}
          </div>

          {/* Pinyin */}
          {titleIsChinese && pinyin && (
            <div className="text-[11px] font-mono text-[var(--color-text-secondary)] tracking-wide mt-1 print:text-gray-600">
              {pinyin}
            </div>
          )}

          {/* Artist / album row */}
          <div className="flex items-center gap-2.5 mt-1.5 text-xs text-[var(--color-text-secondary)] font-mono flex-wrap">
            {inCatalog ? (
              <button
                onClick={() => dispatch({ type: "SET_ARTIST", artist: CATALOG_BY_ARTIST.get(song.artist) })}
                className="hover:text-accent transition-colors print:pointer-events-none"
              >
                {song.artist}
              </button>
            ) : (
              <span>{song.artist}</span>
            )}
            {song.album && (
              <>
                <span className="text-[var(--color-text-muted)]">·</span>
                <span className="text-[var(--color-text-secondary)]">{song.album}</span>
              </>
            )}
            {song.language && song.language !== "cantonese" && (
              <>
                <span className="text-[var(--color-text-muted)]">·</span>
                <span className="text-[var(--color-text-muted)] capitalize">{song.language}</span>
              </>
            )}
            {song.isDemo && (
              <span className="text-[9px] font-mono text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)] px-1.5 py-0.5 rounded border border-[var(--color-border-subtle)]">
                demo
              </span>
            )}
            {song.isCustom && (
              <span className="text-[9px] font-mono text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)] px-1.5 py-0.5 rounded border border-[var(--color-border-subtle)]">
                custom
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Inline metadata editor — custom songs only */}
      {song.isCustom && editingMeta && (
        <MetaEditor
          song={song}
          onSave={handleSaveMeta}
          onCancel={() => setEditingMeta(false)}
        />
      )}

      {/* Back to search */}
      <button
        onClick={() => dispatch({ type: "SET_VIEW", view: "search" })}
        className="mt-4 text-[11px] text-[var(--color-text-secondary)] hover:text-accent transition-colors font-mono print:hidden"
      >
        ← back to search
      </button>
    </div>
  );
}
