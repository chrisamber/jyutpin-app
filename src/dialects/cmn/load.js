// Module-level promise — concurrent analyzeLine calls share the same in-flight
// import rather than each kicking off a duplicate dict load.
let loadPromise = null;

export function loadPinyin() {
  if (!loadPromise) {
    loadPromise = import('pinyin-pro');
  }
  return loadPromise;
}
