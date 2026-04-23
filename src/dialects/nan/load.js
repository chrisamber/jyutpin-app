// Module-level promise. Hokkien has no npm dict; we ship a curated JSON keyed
// by single CJK char. Concurrent analyzeLine calls share the same in-flight
// import rather than each fetching a duplicate.
let loadPromise = null;

export function loadCurated() {
  if (!loadPromise) {
    loadPromise = import('./curated.json').then((m) => m.default ?? m);
  }
  return loadPromise;
}
