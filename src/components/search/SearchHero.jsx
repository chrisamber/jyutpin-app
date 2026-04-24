import { useState, useEffect } from "react";
import { useLyricsFetch } from "../../hooks/useLyricsFetch.js";
import { useSongAnalysis } from "../../hooks/useSongAnalysis.js";
import { useAppDispatch } from "../../context/AppContext.jsx";
import SearchResults from "./SearchResults.jsx";
import AddSongModal from "./AddSongModal.jsx";
import ToneSystem from "../study/ToneSystem.jsx";
import SingingRules from "../study/SingingRules.jsx";
import { getRecentSongs } from "../../services/recentSongs.js";
import { CATALOG } from "../../data/catalog.js";
import { getArtistImage } from "../../services/iTunesArt.js";

const SLIDES = [
  {
    label: "背脊唱情歌",
    subtitle: "Cantonese · Jyutping",
    text: "麻煩各位都不望我",
    tokens: [
      { char: "麻", roman: "maa4", tone: 4 },
      { char: "煩", roman: "faan4", tone: 4 },
      { char: "各", roman: "gok3", tone: 3 },
      { char: "位", roman: "wai6", tone: 6 },
      { char: "都", roman: "dou1", tone: 1 },
      { char: "不", roman: "bat1", tone: 1, entering: true },
      { char: "望", roman: "mong6", tone: 6 },
      { char: "我", roman: "ngo5", tone: 5 },
    ],
  },
  {
    label: "月亮代表我的心",
    subtitle: "Mandarin · Pinyin",
    text: "你问我爱你有多深",
    tokens: [
      { char: "你", roman: "nǐ", tone: 3 },
      { char: "问", roman: "wèn", tone: 4 },
      { char: "我", roman: "wǒ", tone: 3 },
      { char: "爱", roman: "ài", tone: 4 },
      { char: "你", roman: "nǐ", tone: 3 },
      { char: "有", roman: "yǒu", tone: 3 },
      { char: "多", roman: "duō", tone: 1 },
      { char: "深", roman: "shēn", tone: 1 },
    ],
  },
  {
    label: "愛拼才會贏",
    subtitle: "Hokkien · POJ",
    text: "愛拼才會贏",
    tokens: [
      { char: "愛", roman: "ài",    tone: 2 },
      { char: "拼", roman: "piàⁿ", tone: 2 },
      { char: "才", roman: "chiah", tone: 4, entering: true },
      { char: "會", roman: "ē",    tone: 3 },
      { char: "贏", roman: "iâⁿ",  tone: 5 },
    ],
  },
];

function PreviewAnnotation({ char, roman, tone, entering }) {
  const toneColor = `var(--color-tone-${tone})`;
  return (
    <ruby
      className={`mx-1.5 inline-flex flex-col-reverse items-center ${entering ? "rounded px-1 pb-0.5" : ""}`}
      style={
        entering
          ? { backgroundColor: `color-mix(in srgb, ${toneColor} 12%, transparent)`, borderBottom: `2px solid ${toneColor}` }
          : undefined
      }
    >
      <span className="text-2xl leading-tight font-light cjk" style={{ color: toneColor }}>
        {char}
      </span>
      <rp>(</rp>
      <rt className="font-mono text-[11px] leading-none tracking-tight mb-0.5" style={{ color: toneColor }}>
        {roman}
      </rt>
      <rp>)</rp>
    </ruby>
  );
}

function RecentSongs({ onSelectRecent, onLoadDemo, onSelectCustom }) {
  const [recent, setRecent] = useState([]);
  useEffect(() => { setRecent(getRecentSongs()); }, []);
  if (recent.length === 0) return null;

  return (
    <div className="w-full max-w-lg mt-[var(--space-8)]">
      <div className="text-[10px] font-mono text-[var(--color-text-muted)] tracking-[0.2em] uppercase mb-[var(--space-3)]">
        Recent
      </div>
      <div className="space-y-[var(--space-0.5)]">
        {recent.map((song, i) => (
          <button
            key={song.isDemo ? `demo:${song.dialectCode ?? "yue"}` : song.id || i}
            onClick={() => {
              if (song.isDemo) onLoadDemo(song.dialectCode ?? "yue");
              else if (song.isCustom) onSelectCustom(song);
              else onSelectRecent(song);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-[var(--color-bg-elevated)] transition-colors group"
          >
            <span className="text-sm cjk text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors leading-none">
              {song.title}
            </span>
            <span className="text-xs text-[var(--color-text-secondary)] font-mono truncate">
              {song.artist}
            </span>
            {song.isDemo && (
              <span className="text-[9px] font-mono text-[var(--color-accent)]/40 bg-[var(--color-bg-sunken)] px-1.5 py-0.5 rounded border border-[var(--color-accent)]/10 ml-auto flex-shrink-0">
                demo
              </span>
            )}
            {song.isCustom && (
              <span className="text-[9px] font-mono text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)] px-1.5 py-0.5 rounded border border-[var(--color-border-subtle)] ml-auto flex-shrink-0">
                ✎ custom
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function ArtistCard({ entry, onSelect }) {
  const [img, setImg] = useState(null);
  useEffect(() => {
    let cancelled = false;
    getArtistImage(entry.artist, entry.wikipedia).then((url) => {
      if (!cancelled) setImg(url);
    });
    return () => { cancelled = true; };
  }, [entry.artist, entry.wikipedia]);

  return (
    <button
      onClick={() => onSelect(entry)}
      className="flex flex-col items-center gap-2.5 group"
    >
      <div className="relative">
        {img ? (
          <img
            src={img}
            alt={entry.artist}
            className="w-14 h-14 rounded-full object-cover ring-[var(--color-border-subtle)]/1 group-hover:ring-[var(--color-accent)]/30 group-hover:scale-105 transition-all duration-200"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-[var(--color-bg-elevated)] ring-[var(--color-border-subtle)] flex items-center justify-center group-hover:ring-[var(--color-accent)]/30 group-hover:scale-105 transition-all duration-200">
            <span className="text-lg cjk text-[var(--color-text-secondary)]">{entry.artist[0]}</span>
          </div>
        )}
      </div>
      <span className="text-[11px] cjk text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors text-center leading-tight">
        {entry.artist}
      </span>
    </button>
  );
}

function ArtistGrid({ onSelectArtist }) {
  return (
    <div className="w-full max-w-lg mt-[var(--space-10)]">
      <div className="text-[10px] font-mono text-[var(--color-text-muted)] tracking-[0.2em] uppercase mb-5">
        Artists
      </div>
      <div className="grid grid-cols-6 gap-x-4 gap-y-6">
        {CATALOG.map((entry) => (
          <ArtistCard key={entry.artist} entry={entry} onSelect={onSelectArtist} />
        ))}
      </div>
    </div>
  );
}

export default function SearchHero() {
  const [query, setQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => {
      setSlideIdx(i => (i + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(tick);
  }, []);
  const { results, isSearching, searchError, search, clearResults } = useLyricsFetch();
  const { loadDemoSong, loadFromSearch, loadCustomSong } = useSongAnalysis();
  const dispatch = useAppDispatch();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) search(query);
  };

  const handleSelect = (result) => {
    loadFromSearch(result);
    clearResults();
  };

  const handleSelectRecent = (song) => {
    loadFromSearch({ id: song.id, title: song.title, artist: song.artist, album: song.album, dialectCode: song.dialectCode });
  };

  const handleSelectCustom = (song) => {
    loadCustomSong(song);
  };

  const handleSelectArtist = (entry) => {
    dispatch({ type: "SET_ARTIST", artist: entry });
  };

  return (
    <div className="space-y-12">
      {/* ── Hero section – centered, full‑screen friendly ─────────────── */}
      <section className="flex flex-col items-center justify-center min-h-[52vh] pt-[var(--space-8)] pb-[var(--space-6)]">
        {/* Heading */}
        <div className="text-center mb-10 max-w-xl mx-auto">
          <h2 className="text-5xl font-light tracking-tight mb-4 leading-[1.1]">
            Sing what you{" "}
            <span className="text-[var(--color-accent)] font-normal italic">speak.</span>
          </h2>
          <p className="text-[var(--color-text-secondary)] text-sm max-w-md mx-auto leading-relaxed font-light">
            Search any Chinese song — instant Jyutping annotations, tone colours, PDF export.
          </p>
        </div>

        {/* Floating annotation preview — auto-slides between Cantonese / Mandarin / Hokkien */}
        <div className="mb-10 px-6 py-5 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-2xl text-center w-full max-w-xl overflow-hidden">
          <div
            key={slideIdx}
            style={{ animation: "slide-in-right 480ms cubic-bezier(0.2, 0, 0, 1) both" }}
          >
            <div className="text-[9px] font-mono text-[var(--color-text-muted)] tracking-[0.2em] uppercase mb-4">
              Preview — {SLIDES[slideIdx].label}
              <span className="ml-2 opacity-50 normal-case">{SLIDES[slideIdx].subtitle}</span>
            </div>
            <div className="flex flex-wrap justify-center items-end leading-loose gap-0.5">
              {SLIDES[slideIdx].tokens.map((t, i) => (
                <PreviewAnnotation key={i} {...t} />
              ))}
            </div>
            <div className="mt-3 text-[11px] text-[var(--color-text-secondary)] font-mono tracking-wide cjk">
              {SLIDES[slideIdx].text}
            </div>
          </div>
          <div className="flex gap-1.5 justify-center mt-4">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                  i === slideIdx
                    ? "bg-[var(--color-accent)]"
                    : "bg-[var(--color-text-muted)]/30 hover:bg-[var(--color-text-muted)]/60"
                }`}
                aria-label={SLIDES[i].label}
              />
            ))}
          </div>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="w-full max-w-lg mb-3">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a song or artist… or 中文"
              className="w-full input focus-ring rounded-xl text-base py-3.5 px-4"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-sm btn-primary disabled:opacity-40"
            >
              {isSearching ? "…" : "Search"}
            </button>
          </div>
        </form>

        {searchError && (
          <p className="text-red-400/80 text-xs mb-3 font-mono">{searchError}</p>
        )}

        {results.length > 0 && (
          <SearchResults results={results} onSelect={handleSelect} />
        )}

        {/* Helper links */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center">
          <span className="text-[var(--color-text-muted)] text-xs font-mono">demos</span>
          <button
            onClick={() => loadDemoSong("yue")}
            className="text-xs font-mono text-[var(--color-accent)]/60 hover:text-[var(--color-accent)] transition-colors underline underline-offset-4 decoration-[var(--color-accent)]/20 hover:decoration-[var(--color-accent)]/50"
          >
            <span className="text-[9px] tracking-[0.15em] mr-1 text-[var(--color-text-muted)]">yue</span>
            背脊唱情歌
          </button>
          <span className="text-[var(--color-text-muted)] text-xs font-mono">·</span>
          <button
            onClick={() => loadDemoSong("cmn")}
            className="text-xs font-mono text-[var(--color-accent)]/60 hover:text-[var(--color-accent)] transition-colors underline underline-offset-4 decoration-[var(--color-accent)]/20 hover:decoration-[var(--color-accent)]/50"
          >
            <span className="text-[9px] tracking-[0.15em] mr-1 text-[var(--color-text-muted)]">cmn</span>
            月亮代表我的心
          </button>
          <span className="text-[var(--color-text-muted)] text-xs font-mono">·</span>
          <button
            onClick={() => loadDemoSong("nan")}
            className="text-xs font-mono text-[var(--color-accent)]/60 hover:text-[var(--color-accent)] transition-colors underline underline-offset-4 decoration-[var(--color-accent)]/20 hover:decoration-[var(--color-accent)]/50"
          >
            <span className="text-[9px] tracking-[0.15em] mr-1 text-[var(--color-text-muted)]">nan</span>
            愛拼才會贏
          </button>
          <span className="text-[var(--color-text-muted)] text-xs font-mono">·</span>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs font-mono text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors flex items-center gap-1"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M5.5 1 V10 M1 5.5 H10" />
            </svg>
            Add your own song
          </button>
        </div>

        {/* Recent songs list */}
        <RecentSongs
          onSelectRecent={handleSelectRecent}
          onLoadDemo={loadDemoSong}
          onSelectCustom={handleSelectCustom}
        />
        {/* Artist grid */}
        <ArtistGrid onSelectArtist={handleSelectArtist} />
      </section>

      {/* ── Reference section – full width but constrained max-width ───── */}
      <section className="mt-24 space-y-16 max-w-3xl mx-auto px-6">
        <ToneSystem />
        <SingingRules />
      </section>

      {showAddModal && <AddSongModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
