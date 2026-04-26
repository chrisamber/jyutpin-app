const PREFIX = "displayprefs:";

export const DEFAULT_PREFS = Object.freeze({
  jyutping: "all", // "all" | "danger" | "custom"
  size: "m",       // "s" | "m" | "l"
  customVisible: {},
});

export const SIZE_SCALE = { s: 0.75, m: 1, l: 1.4 };

function isPlainObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

function sanitize(parsed) {
  if (!isPlainObject(parsed)) return { ...DEFAULT_PREFS };
  const jyutping = ["all", "danger", "custom"].includes(parsed.jyutping)
    ? parsed.jyutping
    : DEFAULT_PREFS.jyutping;
  const size = ["s", "m", "l"].includes(parsed.size) ? parsed.size : DEFAULT_PREFS.size;
  const customVisible = isPlainObject(parsed.customVisible) ? parsed.customVisible : {};
  return { jyutping, size, customVisible };
}

export function loadDisplayPrefs(storageId) {
  if (!storageId) return { ...DEFAULT_PREFS };
  try {
    const raw = localStorage.getItem(PREFIX + storageId);
    if (!raw) return { ...DEFAULT_PREFS };
    return sanitize(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function saveDisplayPrefs(storageId, prefs) {
  if (!storageId) return;
  try {
    const clean = sanitize(prefs);
    const isDefault =
      clean.jyutping === DEFAULT_PREFS.jyutping &&
      clean.size === DEFAULT_PREFS.size &&
      Object.keys(clean.customVisible).length === 0;
    if (isDefault) {
      localStorage.removeItem(PREFIX + storageId);
    } else {
      localStorage.setItem(PREFIX + storageId, JSON.stringify(clean));
    }
  } catch {
    /* localStorage may be unavailable / quota exceeded; non-fatal */
  }
}

/**
 * Build a Set<"lineIdx:sylIdx"> of danger-zone syllables from analyzed lines.
 * `line.dangers` is an array of { word: string, ... }; a token is a danger
 * zone if its char appears in any danger word for that line.
 */
export function buildDangerSet(lines) {
  const set = new Set();
  if (!Array.isArray(lines)) return set;
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    if (!line?.dangers?.length || !Array.isArray(line.tokens)) continue;
    const dangerChars = new Set();
    for (const d of line.dangers) {
      if (d?.word) for (const ch of d.word) dangerChars.add(ch);
    }
    line.tokens.forEach((t, si) => {
      if (!t.isTrailing && dangerChars.has(t.char)) set.add(`${li}:${si}`);
    });
  }
  return set;
}

export function syllableKey(lineIdx, sylIdx) {
  return `${lineIdx}:${sylIdx}`;
}
