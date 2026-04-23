function hasCJK(str) {
  return str && /[\u4e00-\u9fff\u3400-\u4dbf\uff00-\uffef]/.test(str);
}

function formatDuration(secs) {
  if (!secs) return null;
  const m = Math.floor(secs / 60);
  const s = String(Math.floor(secs % 60)).padStart(2, "0");
  return `${m}:${s}`;
}

export default function SearchResults({ results, onSelect }) {
  if (!results.length) return null;

  return (
    <div className="w-full max-w-lg space-y-2">
      <div className="text-xs font-mono text-[var(--color-text-secondary)] mb-2">
        {results.length} result{results.length !== 1 && "s"} found
      </div>
      {results.slice(0, 15).map((r) => (
        <button
          key={r.id}
          onClick={() => onSelect(r)}
          disabled={!r.hasLyrics}
          className="w-full text-left bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] border border-slate-200 hover:border-accent/20 rounded-lg px-4 py-3 transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-accent transition-colors truncate">
                {r.title}
              </div>
              <div className="text-xs text-[var(--color-text-secondary)] mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>{r.artist}</span>
                {r.album && (
                  <span className="text-slate-400">({r.album})</span>
                )}
                {formatDuration(r.duration) && (
                  <span className="text-slate-400 font-mono">{formatDuration(r.duration)}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 mt-0.5">
              {hasCJK(r.title) && (
                <span className="text-[10px] font-mono text-blue-400/60 bg-blue-400/8 px-1.5 py-0.5 rounded">
                  粵
                </span>
              )}
              {r.hasSyncedLyrics && (
                <span className="text-[10px] font-mono text-cyan-400/60 bg-cyan-400/8 px-1.5 py-0.5 rounded">
                  sync
                </span>
              )}
              {r.hasLyrics ? (
                <span className="text-[10px] font-mono text-accent/50 bg-accent/8 px-1.5 py-0.5 rounded">
                  lyrics
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  no lyrics
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
