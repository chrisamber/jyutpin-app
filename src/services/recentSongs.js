const STORAGE_KEY = "jyutpin:recent";
const MAX_RECENT = 8;

export function getRecentSongs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentSong(song) {
  if (!song?.title) return;
  try {
    const existing = getRecentSongs();
    // Deduplicate: for demos, dedupe per dialectCode so yue/cmn/nan demos
    // don't evict each other. For real songs, dedupe by id.
    const filtered = existing.filter((s) => {
      if (song.isDemo) {
        return !(s.isDemo && (s.dialectCode ?? "yue") === (song.dialectCode ?? "yue"));
      }
      return s.id !== song.id;
    });
    const entry = {
      id: song.id || null,
      title: song.title,
      artist: song.artist || "",
      album: song.album || "",
      isDemo: !!song.isDemo,
      dialectCode: song.dialectCode ?? "yue",
      timestamp: Date.now(),
    };
    const updated = [entry, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}
