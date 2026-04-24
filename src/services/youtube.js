/**
 * Client-side YouTube search. Proxies through `/api/youtube` so the API key
 * stays server-only (YOUTUBE_API_KEY, not VITE_-exposed).
 */

// Assume the proxy is available; the server returns 503 if the key is missing.
export function isYouTubeEnabled() {
  return true;
}

export async function searchYouTube(query, maxResults = 5) {
  const url = `/api/youtube?q=${encodeURIComponent(query)}&maxResults=${maxResults}`;
  const res = await fetch(url);
  // 503 = key not configured; 404 = route not served (e.g. vite dev without vercel dev).
  // Non-JSON responses happen when Vite serves the raw source file for /api/* paths.
  if (res.status === 503 || res.status === 404) return [];
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return [];
  if (!res.ok) throw new Error("YouTube search failed");
  const data = await res.json();
  return data.items || [];
}
