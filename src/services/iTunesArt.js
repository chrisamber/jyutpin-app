// iTunes Search API — album art and artist images.
// No auth required. Results cached in localStorage to avoid redundant fetches.

const ART_PREFIX = "albumArt:";
const ARTIST_PREFIX = "artistImg:";
const BASE = "https://itunes.apple.com/search";

async function itunesSearch(params) {
  const qs = new URLSearchParams({ country: "HK", ...params }).toString();
  const res = await fetch(`${BASE}?${qs}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.results?.[0] ?? null;
}

function upscale(url) {
  // iTunes returns 100x100bb — swap for 600x600bb
  return url.replace(/\d+x\d+bb/, "600x600bb");
}

/** Returns a high-res album art URL for the given song, or null. */
export async function getAlbumArt(title, artist) {
  const key = `${ART_PREFIX}${title}:${artist}`;
  const cached = localStorage.getItem(key);
  if (cached) return cached;

  try {
    const hit = await itunesSearch({
      term: `${title} ${artist}`,
      entity: "song",
      limit: "5",
    });
    if (!hit?.artworkUrl100) return null;
    const url = upscale(hit.artworkUrl100);
    localStorage.setItem(key, url);
    return url;
  } catch {
    return null;
  }
}

/**
 * Returns an artist portrait URL via Wikipedia REST API.
 * Falls back to iTunes album art if Wikipedia has no image.
 * @param {string} artistName  — Chinese name (used as cache key)
 * @param {string} [wikiTitle] — English Wikipedia article title (e.g. "Eason Chan")
 */
export async function getArtistImage(artistName, wikiTitle) {
  const key = `${ARTIST_PREFIX}${artistName}`;
  const cached = localStorage.getItem(key);
  if (cached) return cached;

  // 1. Try Wikipedia for a proper portrait
  if (wikiTitle) {
    try {
      const slug = encodeURIComponent(wikiTitle.replace(/ /g, "_"));
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`
      );
      if (res.ok) {
        const data = await res.json();
        const url = data.thumbnail?.source ?? data.originalimage?.source ?? null;
        if (url) {
          localStorage.setItem(key, url);
          return url;
        }
      }
    } catch {
      // fall through to iTunes
    }
  }

  // 2. Fallback: iTunes album art as proxy
  try {
    const hit = await itunesSearch({
      term: wikiTitle ?? artistName,
      entity: "album",
      limit: "1",
    });
    if (!hit?.artworkUrl100) return null;
    const url = upscale(hit.artworkUrl100);
    localStorage.setItem(key, url);
    return url;
  } catch {
    return null;
  }
}

/** Clears all cached art from localStorage (useful for debugging). */
export function clearArtCache() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(ART_PREFIX) || k.startsWith(ARTIST_PREFIX))
    .forEach((k) => localStorage.removeItem(k));
}
