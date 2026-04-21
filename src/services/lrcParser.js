// Parse LRC (synced lyrics) format into timestamp array

export function parseLRC(syncedLyrics) {
  if (!syncedLyrics) return [];
  return syncedLyrics
    .split("\n")
    .map((line) => {
      const match = line.match(/^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)$/);
      if (!match) return null;
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const frac = parseInt(match[3].padEnd(3, "0")) / 1000;
      return { time: minutes * 60 + seconds + frac, text: match[4].trim() };
    })
    .filter(Boolean);
}

export function getActiveLyricIndex(timestamps, currentTime) {
  for (let i = timestamps.length - 1; i >= 0; i--) {
    if (currentTime >= timestamps[i].time) return i;
  }
  return -1;
}
