import { useCallback } from "react";
import { useSongDispatch } from "../context/SongContext.jsx";
import { useAppDispatch } from "../context/AppContext.jsx";
import { analyzeFullLyrics } from "../services/jyutping.js";
import { fetchLyrics, fetchLyricsByTitleArtist } from "../services/lyrics/index.js";
import { DEFAULT_SONG, SONG_LINES, FULL_LYRICS_TEXT } from "../data/defaultSong.js";
import { addRecentSong } from "../services/recentSongs.js";
import { getCustomSongLyrics } from "../services/customSongs.js";
import { initializeCuratedSongData } from "../data/songs/index.js";

export function useSongAnalysis() {
  const songDispatch = useSongDispatch();
  const appDispatch = useAppDispatch();

  const loadDemoSong = useCallback(async () => {
    songDispatch({ type: "LOAD_START" });
    try {
      // Build a lookup map from curated data keyed by normalized Chinese text
      const curatedMap = new Map(
        SONG_LINES.map((l) => [l.chinese.replace(/\s/g, ""), l])
      );

      let lyricsText = null;
      let syncedLyrics = null;

      // Fetch full lyrics from LRCLIB (gets all repeated sections)
      try {
        const lyricsData = await fetchLyricsByTitleArtist(DEFAULT_SONG.title, DEFAULT_SONG.artist);
        if (lyricsData?.plainLyrics) {
          lyricsText = lyricsData.plainLyrics;
          syncedLyrics = lyricsData.syncedLyrics || null;
        }
      } catch (_) {
        // Network unavailable — fall back to curated lines
      }

      // Fall back to embedded full lyrics (with both choruses) if LRCLIB unreachable
      if (!lyricsText) {
        lyricsText = FULL_LYRICS_TEXT;
      }

      const analyzed = await analyzeFullLyrics(lyricsText);
      const lines = analyzed.map((line) => {
        const key = line.chinese.replace(/\s/g, "");
        const curated = curatedMap.get(key);
        let tokens = line.tokens;
        if (curated?.jyutping) {
          const curatedJpArr = curated.jyutping.split(/\s+/).filter(Boolean);
          const chineseTokens = line.tokens.filter((t) => t.jyutping !== null);
          if (curatedJpArr.length === chineseTokens.length) {
            let jpIdx = 0;
            tokens = line.tokens.map((t) => {
              if (t.jyutping === null) return t;
              const jp = curatedJpArr[jpIdx++];
              return { ...t, jyutping: jp, tone: parseInt(jp.slice(-1)) || t.tone, isEnteringTone: /[ptk]\d$/.test(jp) };
            });
          }
        }
        return {
          ...line,
          tokens,
          jyutping: curated?.jyutping ?? line.jyutpingText,
          translation: curated?.translation ?? null,
          dangers: curated?.dangers ?? [],
        };
      });

      songDispatch({
        type: "LOAD_SUCCESS",
        song: DEFAULT_SONG,
        lines,
        syncedLyrics,
        source: "demo",
      });
      addRecentSong(DEFAULT_SONG); // only on success
      appDispatch({ type: "SET_VIEW", view: "study" });
      appDispatch({ type: "SET_SECTION", section: "lyrics" });
    } catch (err) {
      songDispatch({ type: "LOAD_ERROR", error: err.message });
    }
  }, [songDispatch, appDispatch]);

  const loadFromSearch = useCallback(
    async (searchResult) => {
      songDispatch({ type: "LOAD_START" });
      try {
        const lyricsData = searchResult.id
          ? await fetchLyrics(searchResult.id)
          : await fetchLyricsByTitleArtist(searchResult.title, searchResult.artist);
        if (!lyricsData?.plainLyrics) {
          songDispatch({ type: "LOAD_ERROR", error: "No lyrics found" });
          return;
        }
        const analyzed = await analyzeFullLyrics(lyricsData.plainLyrics);
        const lines = analyzed.map((line) => ({
          ...line,
          translation: null,
          dangers: [],
        }));
        const nonEmptyLines = lyricsData.plainLyrics.split("\n").filter((l) => l.trim()).length;
        const songObj = {
          id: searchResult.id ?? lyricsData.id,
          title: searchResult.title,
          artist: searchResult.artist,
          album: searchResult.album,
          isDemo: false,
        };
        songDispatch({
          type: "LOAD_SUCCESS",
          song: songObj,
          lines,
          syncedLyrics: lyricsData.syncedLyrics || null,
          source: lyricsData.source,
          lyricsIncomplete: nonEmptyLines < 15,
        });
        addRecentSong(songObj);

        // Initialize curated song data (chords, annotations, etc.)
        if (searchResult.title === "緊急聯絡人" && searchResult.artist === "Gareth.T") {
          initializeCuratedSongData("jinyulianheren", `lrclib:${songObj.id}`);
        }

        appDispatch({ type: "SET_VIEW", view: "study" });
        appDispatch({ type: "SET_SECTION", section: "lyrics" });
      } catch (err) {
        songDispatch({ type: "LOAD_ERROR", error: err.message });
      }
    },
    [songDispatch, appDispatch]
  );

  const loadCustomSong = useCallback(
    async (songId) => {
      try {
        // Prefer user-edited version if it exists
        const edited = localStorage.getItem(`editedlyrics:custom:${songId}`);
        const text = edited || getCustomSongLyrics(songId);
        if (!text) {
          songDispatch({ type: "LOAD_ERROR", error: "Lyrics not found for this song." });
          return;
        }
        const analyzed = await analyzeFullLyrics(text);
        const lines = analyzed.map((line) => ({ ...line, translation: null, dangers: [] }));
        const song = { id: songId, title: "Custom Song", artist: "", source: "custom" };
        songDispatch({
          type: "LOAD_SUCCESS",
          song,
          lines,
          syncedLyrics: null,
          source: "custom",
          lyricsIncomplete: lines.length < 15,
        });
        addRecentSong(song);
        appDispatch({ type: "SET_VIEW", view: "study" });
        appDispatch({ type: "SET_SECTION", section: "lyrics" });
      } catch (err) {
        songDispatch({ type: "LOAD_ERROR", error: err.message });
      }
    },
    [songDispatch, appDispatch]
  );

  const clearSong = useCallback(() => {
    songDispatch({ type: "CLEAR" });
    appDispatch({ type: "SET_VIEW", view: "search" });
  }, [songDispatch, appDispatch]);

  const updateLyrics = useCallback(async (rawText, storageId) => {
    try {
      const analyzed = await analyzeFullLyrics(rawText);
      const lines = analyzed.map((line) => ({ ...line, translation: null, dangers: [] }));
      songDispatch({ type: "UPDATE_LINES", lines });
      if (storageId) {
        try { localStorage.setItem(`editedlyrics:${storageId}`, rawText); } catch {}
      }
    } catch (err) {
      console.error("Failed to re-analyze lyrics:", err);
    }
  }, [songDispatch]);

  return { loadDemoSong, loadFromSearch, loadCustomSong, clearSong, updateLyrics };
}
