import { searchLyrics as lrclibSearch, getLyricsById, getLyrics } from "./lrclib.js";

export async function searchSongs(query) {
  const results = await lrclibSearch(query);
  return results;
}

export async function fetchLyrics(id) {
  const result = await getLyricsById(id);
  if (result?.plainLyrics) return result;
  return null;
}

export async function fetchLyricsByTitleArtist(title, artist) {
  const result = await getLyrics(title, artist);
  if (result?.plainLyrics) return result;
  return null;
}
