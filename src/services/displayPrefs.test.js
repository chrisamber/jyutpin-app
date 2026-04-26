import { describe, it, expect, beforeEach } from "vitest";
import {
  loadDisplayPrefs,
  saveDisplayPrefs,
  buildDangerSet,
  DEFAULT_PREFS,
  syllableKey,
} from "./displayPrefs.js";

const KEY = (id) => `displayprefs:${id}`;

beforeEach(() => {
  localStorage.clear();
});

describe("loadDisplayPrefs", () => {
  it("returns defaults when key missing", () => {
    expect(loadDisplayPrefs("demo:yue")).toEqual(DEFAULT_PREFS);
  });

  it("returns defaults when storageId is falsy", () => {
    expect(loadDisplayPrefs(null)).toEqual(DEFAULT_PREFS);
    expect(loadDisplayPrefs("")).toEqual(DEFAULT_PREFS);
  });

  it("returns defaults on malformed JSON", () => {
    localStorage.setItem(KEY("demo:yue"), "{not-json");
    expect(loadDisplayPrefs("demo:yue")).toEqual(DEFAULT_PREFS);
  });

  it("round-trips a valid prefs object", () => {
    const prefs = { jyutping: "danger", size: "l", customVisible: { "0:1": true } };
    saveDisplayPrefs("demo:yue", prefs);
    expect(loadDisplayPrefs("demo:yue")).toEqual(prefs);
  });

  it("sanitises unknown enum values back to defaults", () => {
    localStorage.setItem(
      KEY("demo:yue"),
      JSON.stringify({ jyutping: "weird", size: 99, customVisible: "nope" }),
    );
    expect(loadDisplayPrefs("demo:yue")).toEqual(DEFAULT_PREFS);
  });
});

describe("saveDisplayPrefs", () => {
  it("removes the key when prefs are default", () => {
    localStorage.setItem(KEY("demo:yue"), JSON.stringify({ jyutping: "danger", size: "m", customVisible: {} }));
    saveDisplayPrefs("demo:yue", DEFAULT_PREFS);
    expect(localStorage.getItem(KEY("demo:yue"))).toBeNull();
  });

  it("namespaces keys per storageId", () => {
    saveDisplayPrefs("demo:yue", { jyutping: "danger", size: "m", customVisible: {} });
    saveDisplayPrefs("lrclib:42", { jyutping: "all", size: "l", customVisible: {} });
    expect(loadDisplayPrefs("demo:yue").jyutping).toBe("danger");
    expect(loadDisplayPrefs("lrclib:42").size).toBe("l");
  });

  it("is a no-op when storageId is falsy", () => {
    saveDisplayPrefs(null, { jyutping: "danger", size: "l", customVisible: {} });
    expect(localStorage.length).toBe(0);
  });
});

describe("buildDangerSet", () => {
  it("returns empty set for empty / nullish input", () => {
    expect(buildDangerSet([]).size).toBe(0);
    expect(buildDangerSet(null).size).toBe(0);
  });

  it("flags syllables whose char appears in any danger word for that line", () => {
    const lines = [
      {
        dangers: [{ word: "三" }],
        tokens: [
          { char: "你", isTrailing: false },
          { char: "好", isTrailing: false },
          { char: "三", isTrailing: false },
        ],
      },
      {
        dangers: [{ word: "唔該" }],
        tokens: [
          { char: "唔", isTrailing: false },
          { char: "該", isTrailing: false },
          { char: "！", isTrailing: false },
        ],
      },
    ];
    const set = buildDangerSet(lines);
    expect(set.has(syllableKey(0, 2))).toBe(true);
    expect(set.has(syllableKey(0, 0))).toBe(false);
    expect(set.has(syllableKey(1, 0))).toBe(true);
    expect(set.has(syllableKey(1, 1))).toBe(true);
    expect(set.has(syllableKey(1, 2))).toBe(false);
  });

  it("ignores trailing tokens", () => {
    const lines = [
      {
        dangers: [{ word: "X" }],
        tokens: [
          { char: "X", isTrailing: true },
          { char: "X", isTrailing: false },
        ],
      },
    ];
    const set = buildDangerSet(lines);
    expect(set.has(syllableKey(0, 0))).toBe(false);
    expect(set.has(syllableKey(0, 1))).toBe(true);
  });
});
