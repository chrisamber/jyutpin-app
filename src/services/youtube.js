const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export function isYouTubeEnabled() {
  return Boolean(API_KEY);
}

export async function searchYouTube(query, maxResults = 5) {
  if (!API_KEY) throw new Error("YouTube API key not configured");
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", String(maxResults));
  url.searchParams.set("key", API_KEY);

  const res = await fetch(url);
  if (!res.ok) throw new Error("YouTube search failed");
  const data = await res.json();
  return data.items.map((item) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.default.url,
    channel: item.snippet.channelTitle,
  }));
}
