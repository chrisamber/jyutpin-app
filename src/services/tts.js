// Google Cloud Text-to-Speech — Cantonese (yue-HK)
// Requires: VITE_GOOGLE_TTS_API_KEY in your .env

const API_KEY = import.meta.env.VITE_GOOGLE_TTS_API_KEY;
const ENDPOINT = "https://texttospeech.googleapis.com/v1/text:synthesize";

export function isConfigured() {
  return Boolean(API_KEY);
}

// In-memory cache: text → blob URL (survives re-renders, cleared on page reload)
const cache = new Map();

/**
 * Synthesizes `text` in Cantonese and returns a playable blob URL.
 * Results are cached in-memory so repeated plays don't re-fetch.
 *
 * @param {string} text — The Chinese lyric line to synthesize
 * @returns {Promise<string>} A blob URL pointing to an MP3
 */
export async function synthesize(text) {
  if (!API_KEY) throw new Error("VITE_GOOGLE_TTS_API_KEY is not set");
  if (cache.has(text)) return cache.get(text);

  const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: "yue-HK",
        name: "yue-HK-Standard-A", // Standard-A (F) / B (M) / C (F) / D (M)
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: 0.9, // Slightly slower — easier for learners
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Google TTS error ${res.status}`);
  }

  const { audioContent } = await res.json();

  // Decode base64 → Uint8Array → Blob → object URL
  const bytes = Uint8Array.from(atob(audioContent), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: "audio/mpeg" });
  const url = URL.createObjectURL(blob);

  cache.set(text, url);
  return url;
}
