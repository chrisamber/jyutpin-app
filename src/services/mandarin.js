/**
 * Lazy-loaded Mandarin Hanyu Pinyin conversion via pinyin-pro.
 * Handles both Traditional and Simplified Chinese.
 */

let pinyinFn = null;

async function loadPinyin() {
  if (!pinyinFn) {
    const mod = await import("pinyin-pro");
    pinyinFn = mod.pinyin;
  }
  return pinyinFn;
}

export async function toPinyinArray(text) {
  if (!text || !/[\u4e00-\u9fff\u3400-\u4dbf]/.test(text)) return Array.from(text).map(() => "");
  try {
    const fn = await loadPinyin();
    return fn(text, { toneType: "symbol", type: "array" });
  } catch {
    return Array.from(text).map(() => "");
  }
}

