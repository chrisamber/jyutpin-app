import { useState, useEffect, useId } from "react";
import { useSong } from "../../context/SongContext.jsx";
import { isYouTubeEnabled, searchYouTube } from "../../services/youtube.js";
import { useYouTubePlayer } from "../../hooks/useYouTubePlayer.js";

const EXPAND_KEY = "waapou:yt-expanded";

function readExpanded() {
  try { return sessionStorage.getItem(EXPAND_KEY) === "1"; } catch { return false; }
}
function writeExpanded(v) {
  try { sessionStorage.setItem(EXPAND_KEY, v ? "1" : "0"); } catch (e) { void e; }
}

export default function YouTubePlayer() {
  const { song } = useSong();
  const { initPlayer } = useYouTubePlayer();
  const [results, setResults] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [error, setError] = useState(null);
  const [searching, setSearching] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [expanded, setExpanded] = useState(readExpanded);
  const playerId = useId().replace(/:/g, "_");

  const enabled = isYouTubeEnabled();

  useEffect(() => {
    if (!enabled || !song) return;
    setSelectedVideo(null);
    setResults([]);
    setError(null);
    setSearching(true);
    searchYouTube(`${song.title} ${song.artist}`)
      .then((items) => {
        setResults(items);
        if (items.length > 0) setSelectedVideo(items[0].videoId);
      })
      .catch((e) => setError(e.message))
      .finally(() => setSearching(false));
  }, [enabled, song?.title, song?.artist]);

  useEffect(() => {
    if (!selectedVideo) return;
    initPlayer(`yt-player-${playerId}`, selectedVideo);
  }, [selectedVideo, initPlayer, playerId]);

  const toggleExpanded = () => {
    setExpanded((v) => {
      const next = !v;
      writeExpanded(next);
      return next;
    });
  };

  if (!enabled) return null;

  const alternatives = results.filter((r) => r.videoId !== selectedVideo);

  // Collapsed default: narrow strip (max-w-md ~ 448px). Expanded: fills column.
  const wrapperCls = expanded
    ? "w-full"
    : "w-full max-w-md";

  return (
    <div className="mb-6 print:hidden">
      {searching && (
        <div className="h-10 flex items-center gap-2 text-xs font-mono text-[var(--color-text-muted)]">
          <svg className="animate-spin w-3 h-3" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="14 8" strokeLinecap="round" />
          </svg>
          Finding video…
        </div>
      )}

      {!searching && error && (
        <div className="text-xs font-mono text-[var(--color-text-muted)] mb-3">YouTube: {error}</div>
      )}

      {selectedVideo && (
        <div className={wrapperCls}>
          <div className="relative rounded-xl overflow-hidden aspect-video bg-black/5">
            <div id={`yt-player-${playerId}`} className="absolute inset-0 w-full h-full [&>iframe]:w-full [&>iframe]:h-full" />
            <button
              onClick={toggleExpanded}
              className="absolute top-2 right-2 z-10 text-[10px] font-mono px-2 py-1 rounded-md bg-black/60 text-white/90 hover:bg-black/80 transition-colors backdrop-blur-sm"
              aria-label={expanded ? "Collapse video" : "Expand video"}
              aria-pressed={expanded}
              title={expanded ? "Collapse video" : "Expand video"}
            >
              {expanded ? "↙ collapse" : "↗ expand"}
            </button>
          </div>
        </div>
      )}

      {selectedVideo && alternatives.length > 0 && (
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => setShowAlternatives((s) => !s)}
            className="text-[10px] font-mono text-[var(--color-text-muted)] hover:text-accent transition-colors"
          >
            {showAlternatives ? "▲ hide" : "▼ other videos"}
          </button>
          {showAlternatives && (
            <div className="flex gap-2 overflow-x-auto">
              {alternatives.map((r) => (
                <button
                  key={r.videoId}
                  onClick={() => { setSelectedVideo(r.videoId); setShowAlternatives(false); }}
                  className="flex-shrink-0 flex items-center gap-2 px-2 py-1 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] hover:border-accent/30 text-left group transition-colors"
                >
                  <img src={r.thumbnail} alt={r.title} className="w-14 h-9 object-cover rounded" />
                  <span className="text-[10px] font-mono text-[var(--color-text-secondary)] group-hover:text-accent line-clamp-2 max-w-[10rem] transition-colors">
                    {r.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
