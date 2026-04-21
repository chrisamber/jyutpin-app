const BASE_URL = "https://lrclib.net/api";

export async function searchLyrics(query) {
  const res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`LRCLIB error ${res.status}`);
  const data = await res.json();
  return data.map((item) => ({
    id: item.id,
    title: item.trackName,
    artist: item.artistName,
    album: item.albumName,
    duration: item.duration,
    hasLyrics: !!item.plainLyrics,
    hasSyncedLyrics: !!item.syncedLyrics,
  }));
}

export async function getLyrics(title, artist) {
  const params = new URLSearchParams({
    track_name: title,
    artist_name: artist,
  });
  const res = await fetch(`${BASE_URL}/get?${params}`);
  if (!res.ok) return null;
  const data = await res.json();
  return {
    id: data.id,
    plainLyrics: data.plainLyrics,
    syncedLyrics: data.syncedLyrics,
    source: "lrclib",
  };
}

export async function getLyricsById(id) {
  const res = await fetch(`${BASE_URL}/get/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return {
    title: data.trackName,
    artist: data.artistName,
    album: data.albumName,
    plainLyrics: data.plainLyrics,
    syncedLyrics: data.syncedLyrics,
    source: "lrclib",
  };
}
