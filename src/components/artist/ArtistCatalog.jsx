import { useState, useEffect } from "react";
import { useApp, useAppDispatch } from "../../context/AppContext.jsx";
import { useSongAnalysis } from "../../hooks/useSongAnalysis.js";
import { CATALOG_BY_ARTIST } from "../../data/catalog.js";
import { getAlbumArt, getArtistImage } from "../../services/iTunesArt.js";

function AlbumThumb({ title, artist }) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    let cancelled = false;
    getAlbumArt(title, artist).then((url) => { if (!cancelled) setSrc(url); });
    return () => { cancelled = true; };
  }, [title, artist]);

  if (!src) {
    return (
      <div className="w-9 h-9 rounded-md bg-[var(--color-bg-elevated)] flex items-center justify-center flex-shrink-0">
        <span className="text-[var(--color-text-muted)] text-xs">♪</span>
      </div>
    );
  }
  return <img src={src} alt={title} className="w-9 h-9 rounded-md object-cover flex-shrink-0" />;
}

function ArtistBanner({ artist, artistEn, wikipedia }) {
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getArtistImage(artist, wikipedia).then((url) => { if (!cancelled) setImgSrc(url); });
    return () => { cancelled = true; };
  }, [artist, wikipedia]);

  return (
    <div className="relative mb-8 rounded-2xl overflow-hidden">
      {/* Blurred backdrop */}
      {imgSrc && (
        <div
          className="absolute inset-0 scale-110"
          style={{
            backgroundImage: `url(${imgSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            filter: "blur(24px) brightness(0.25) saturate(1.4)",
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-bg-base)]/80" />

      {/* Content */}
      <div className="relative flex items-end gap-5 px-6 pt-10 pb-6">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={artist}
            className="w-20 h-20 rounded-xl object-cover shadow-2xl ring-1 ring-[#FFFFFF12] flex-shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-[var(--color-bg-elevated)] flex items-center justify-center flex-shrink-0 ring-1 ring-[var(--color-border-subtle)]">
            <span className="text-3xl cjk text-[var(--color-text-secondary)]">{artist[0]}</span>
          </div>
        )}
        <div>
          <h1 className="text-3xl font-light tracking-widest text-[var(--color-text-primary)] cjk leading-tight">
            {artist}
          </h1>
          {artistEn && artistEn !== artist && (
            <p className="text-sm text-[var(--color-text-secondary)] font-mono mt-0.5">{artistEn}</p>
          )}
          <p className="text-xs font-mono text-[var(--color-text-muted)] mt-1.5">
            {CATALOG_BY_ARTIST.get(artist)?.songs.length ?? 0} songs
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ArtistCatalog() {
  const { currentArtist } = useApp();
  const dispatch = useAppDispatch();
  const { loadFromSearch } = useSongAnalysis();
  const [loading, setLoading] = useState(null);

  const entry = currentArtist ? CATALOG_BY_ARTIST.get(currentArtist.artist) : null;

  const handleSongClick = async (song) => {
    setLoading(song.title);
    await loadFromSearch({
      title: song.title,
      artist: currentArtist.artist,
      album: song.album,
    });
    setLoading(null);
  };

  if (!entry) {
    return (
      <div className="text-center py-20 text-[var(--color-text-secondary)] text-sm font-mono">
        Artist not found in catalog.
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => dispatch({ type: "SET_VIEW", view: "search" })}
        className="mb-5 text-[11px] font-mono text-[var(--color-text-secondary)] hover:text-accent transition-colors"
      >
        ← back
      </button>

      <ArtistBanner
        artist={entry.artist}
        artistEn={entry.artistEn}
        wikipedia={entry.wikipedia}
      />

      <div className="text-[10px] font-mono text-[var(--color-text-muted)] tracking-[0.2em] uppercase mb-3">
        Songs
      </div>

      <div className="space-y-0.5">
        {entry.songs.map((song, i) => (
          <button
            key={i}
            onClick={() => handleSongClick(song)}
            disabled={loading === song.title}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-[var(--color-bg-elevated)] transition-colors group disabled:opacity-40"
          >
            <AlbumThumb title={song.title} artist={entry.artist} />

            <div className="flex-1 min-w-0">
              <div className="text-sm cjk text-[var(--color-text-primary)] group-hover:text-accent transition-colors truncate">
                {song.title}
              </div>
              {song.album && (
                <div className="text-[11px] text-[var(--color-text-secondary)] font-mono truncate mt-0.5">
                  {song.album}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {song.year && (
                <span className="text-[11px] font-mono text-[var(--color-text-muted)]">{song.year}</span>
              )}
              {loading === song.title ? (
                <span className="text-xs text-accent/60 font-mono">…</span>
              ) : (
                <span className="text-[var(--color-text-muted)] group-hover:text-accent/50 transition-colors text-xs opacity-0 group-hover:opacity-100">▶</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
