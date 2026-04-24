/**
 * YouTube search proxy. Keeps the API key server-side and avoids exposing it
 * to the client bundle. The client calls `/api/youtube?q=...`.
 */

const API_KEY = process.env.YOUTUBE_API_KEY;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!API_KEY) {
    res.status(503).json({ error: "YouTube API key not configured" });
    return;
  }

  const query = (req.query.q || "").trim();
  if (!query) {
    res.status(400).json({ error: "Missing query parameter 'q'" });
    return;
  }
  const maxResults = Math.min(Number(req.query.maxResults) || 5, 10);

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", String(maxResults));
  url.searchParams.set("key", API_KEY);

  const upstream = await fetch(url);
  if (!upstream.ok) {
    res.status(upstream.status).json({ error: "YouTube search failed" });
    return;
  }
  const data = await upstream.json();
  const items = (data.items || []).map((item) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.default.url,
    channel: item.snippet.channelTitle,
  }));

  res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
  res.status(200).json({ items });
}
