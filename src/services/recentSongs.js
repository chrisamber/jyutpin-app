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
    // Deduplicate by id (or title+artist for demo)
    const key = song.isDemo ? "demo" : song.id;
    const filtered = existing.filter((s) =>
      s.isDemo ? !song.isDemo : s.id !== key
    );
    const entry = {
      id: song.id || null,
      title: song.title,
      artist: song.artist || "",
      album: song.album || "",
      isDemo: !!song.isDemo,
      timestamp: Date.now(),
    };
    const updated = [entry, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}
