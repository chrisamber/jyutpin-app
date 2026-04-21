// Custom songs — stored entirely in localStorage, no backend needed.

const CUSTOM_KEY = "jyutpin:custom";
const LYRICS_KEY = (id) => `customlyrics:${id}`;

function load() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
  } catch {
    return [];
  }
}

function save(songs) {
  try {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(songs));
  } catch {}
}

/** Returns all custom song metadata objects, newest first. */
export function getCustomSongs() {
  return load().sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Creates a new custom song. Generates a UUID, persists metadata + raw lyrics.
 * @param {{ title, artist, album, language, youtubeUrl }} meta
 * @param {string} lyricsText — plain text, one lyric line per \n
 * @returns {object} the saved song metadata object (with id, isCustom, etc.)
 */
export function saveCustomSong(meta, lyricsText) {
  const id = crypto.randomUUID();
  const song = {
    id,
    title: meta.title.trim(),
    artist: (meta.artist || "").trim(),
    album: (meta.album || "").trim(),
    language: meta.language || "cantonese",
    youtubeUrl: (meta.youtubeUrl || "").trim(),
    isCustom: true,
    isDemo: false,
    createdAt: Date.now(),
  };

  const songs = load();
  songs.push(song);
  save(songs);

  try {
    localStorage.setItem(LYRICS_KEY(id), lyricsText);
  } catch {}

  return song;
}

/**
 * Updates metadata fields for an existing custom song.
 * Only whitelisted fields are merged (not id/isCustom/isDemo/createdAt).
 */
export function updateCustomSongMeta(id, updates) {
  const songs = load();
  const idx = songs.findIndex((s) => s.id === id);
  if (idx === -1) return;

  const allowed = ["title", "artist", "album", "language", "youtubeUrl"];
  const merged = { ...songs[idx] };
  for (const key of allowed) {
    if (key in updates) merged[key] = (updates[key] ?? "").toString().trim();
  }
  songs[idx] = merged;
  save(songs);
  return merged;
}

/** Returns the raw lyrics text for a custom song, or null if not found. */
export function getCustomSongLyrics(id) {
  try {
    return localStorage.getItem(LYRICS_KEY(id));
  } catch {
    return null;
  }
}

/** Removes a custom song's metadata and lyrics from localStorage. */
export function deleteCustomSong(id) {
  const songs = load().filter((s) => s.id !== id);
  save(songs);
  try {
    localStorage.removeItem(LYRICS_KEY(id));
    localStorage.removeItem(`editedlyrics:custom:${id}`);
    localStorage.removeItem(`sections:custom:${id}`);
  } catch {}
}
