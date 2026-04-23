// English translation service — fetches per-line translations from /api/translate
// (Claude Haiku behind a Vercel Function). Caches results in localStorage so
// repeat loads are instant and free.

const CACHE_PREFIX = "translation:";
const CACHE_VERSION = "v1";

async function sha1Hex(input) {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-1", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function cacheKey(chinese, dialectCode) {
  const h = await sha1Hex(chinese);
  return `${CACHE_PREFIX}${h}:${dialectCode}:${CACHE_VERSION}`;
}

function readCache(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeCache(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // quota exceeded — fail silently, translation just won't persist
  }
}

/**
 * Fetch English translations for each Chinese line.
 * Returns an array of strings aligned with `lines`. A slot is `null` when the
 * line is empty or the API call failed for that line.
 *
 * Hits localStorage first; only misses go to the network. Writes fresh
 * translations back to cache.
 */
export async function fetchTranslations(lines, dialectCode = "yue") {
  if (!Array.isArray(lines) || lines.length === 0) return [];

  const out = new Array(lines.length).fill(null);
  const keys = await Promise.all(
    lines.map((l) => (l && l.trim() ? cacheKey(l, dialectCode) : null))
  );

  const missIndices = [];
  const missLines = [];

  for (let i = 0; i < lines.length; i++) {
    if (!keys[i]) continue; // empty line — no translation needed
    const cached = readCache(keys[i]);
    if (cached) {
      out[i] = cached;
    } else {
      missIndices.push(i);
      missLines.push(lines[i]);
    }
  }

  if (missLines.length === 0) return out;

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines: missLines, dialectCode }),
    });
    if (!res.ok) return out;
    const data = await res.json();
    const fresh = Array.isArray(data?.translations) ? data.translations : [];
    if (fresh.length !== missLines.length) return out;

    for (let j = 0; j < missIndices.length; j++) {
      const idx = missIndices[j];
      const text = fresh[j];
      if (typeof text === "string" && text.length > 0) {
        out[idx] = text;
        if (keys[idx]) writeCache(keys[idx], text);
      }
    }
  } catch {
    // network/offline — leave misses as null; UI degrades gracefully
  }

  return out;
}

/** Clears all cached translations. Useful for debugging or prompt rev bumps. */
export function clearTranslationCache() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(CACHE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // noop
  }
}
