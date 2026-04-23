// Cache the import *promise*, not the resolved module.
// Concurrent callers share the same in-flight import rather than each kicking
// off a duplicate dict load.
let loadPromise = null;

export function loadJyutping() {
  if (!loadPromise) {
    loadPromise = import('to-jyutping');
  }
  return loadPromise;
}
