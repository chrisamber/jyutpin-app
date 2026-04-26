const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export function isYouTubeEnabled() {
  return !!API_KEY;
}

export async function searchYouTube(query, maxResults = 5) {
  if (!API_KEY) return [];
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", String(Math.min(maxResults, 10)));
  url.searchParams.set("key", API_KEY);

  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items || []).map((item) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.default.url,
    channel: item.snippet.channelTitle,
  }));
}
