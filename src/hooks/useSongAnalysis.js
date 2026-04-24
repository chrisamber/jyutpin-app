import { useCallback } from "react";
import { useSongDispatch } from "../context/SongContext.jsx";
import { useApp, useAppDispatch } from "../context/AppContext.jsx";
import { analyzeFullLyrics } from "../services/jyutping.js";
import { fetchLyrics, fetchLyricsByTitleArtist } from "../services/lyrics/index.js";
import { DEFAULT_SONG, SONG_LINES, FULL_LYRICS_TEXT } from "../data/defaultSong.js";
import { demoCmn } from "../data/demos/cmn-yueliang.js";
import { demoNan } from "../data/demos/nan-aimai.js";
import { addRecentSong } from "../services/recentSongs.js";
import { getCustomSongLyrics } from "../services/customSongs.js";
import { initializeCuratedSongData } from "../data/songs/index.js";
import { fetchTranslations } from "../services/translation.js";

/**
 * Kick off background translation for lines missing an English gloss.
 * Dispatches UPDATE_TRANSLATIONS when results arrive. Fires and forgets —
 * callers don't await this.
 */
function backgroundTranslate(lines, dialectCode, song, dispatch) {
  const missing = lines
    .map((l, i) => ({ i, chinese: l.chinese }))
    .filter(({ i, chinese }) => lines[i].translation == null && chinese && chinese.trim());
  if (missing.length === 0) return;

  const songKey = `${song.title}|${song.artist}|${dialectCode}`;
  const texts = missing.map((m) => m.chinese);
  fetchTranslations(texts, dialectCode).then((results) => {
    const map = {};
    missing.forEach((m, j) => {
      if (results[j]) map[m.i] = results[j];
    });
    if (Object.keys(map).length > 0) {
      dispatch({ type: "UPDATE_TRANSLATIONS", translations: map, songKey });
    }
  }).catch(() => { /* non-blocking */ });
}

// Default romanization toggle per dialect. cmn songs show Pinyin natively, so
// the toggle should reflect that on load rather than stay on "jyutping".
const DEFAULT_ROMANIZATION = {
  yue: "jyutping",
  cmn: "pinyin",
  nan: "pinyin", // POJ lives in primaryRoman; toggle label isn't perfect for nan yet
};

export function useSongAnalysis() {
  const songDispatch = useSongDispatch();
  const appDispatch = useAppDispatch();
  const { dialectPreference } = useApp();

  const setDefaultRomanization = (dialectCode) => {
    const scheme = DEFAULT_ROMANIZATION[dialectCode] ?? "jyutping";
    appDispatch({ type: "SET_ROMANIZATION", romanization: scheme });
  };

  const loadDemoSong = useCallback(async (dialectCode = "yue") => {
    songDispatch({ type: "LOAD_START", dialectCode });
    try {
      if (dialectCode === "yue") {
        // Legacy yue demo: fetch from LRCLIB, fall back to embedded FULL_LYRICS_TEXT,
        // merge hand-curated Jyutping / dangers over analyzer output.
        const curatedMap = new Map(
          SONG_LINES.map((l) => [l.chinese.replace(/\s/g, ""), l])
        );

        let lyricsText = null;
        let syncedLyrics = null;

        try {
          const lyricsData = await fetchLyricsByTitleArtist(DEFAULT_SONG.title, DEFAULT_SONG.artist);
          if (lyricsData?.plainLyrics) {
            lyricsText = lyricsData.plainLyrics;
            syncedLyrics = lyricsData.syncedLyrics || null;
          }
        } catch (_) {
          // Network unavailable — fall back to embedded lyrics.
        }

        if (!lyricsText) lyricsText = FULL_LYRICS_TEXT;

        const analyzed = await analyzeFullLyrics(lyricsText, "yue");
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

        const songObj = { ...DEFAULT_SONG, dialectCode: "yue" };
        songDispatch({
          type: "LOAD_SUCCESS",
          song: songObj,
          lines,
          syncedLyrics,
          source: "demo",
          dialectCode: "yue",
        });
        addRecentSong(songObj);
        backgroundTranslate(lines, "yue", songObj, songDispatch);
      } else {
        // New multi-dialect demo path: cmn/nan demos are self-contained (no LRCLIB).
        const demo = dialectCode === "cmn" ? demoCmn : demoNan;
        const lyricsText = demo.lines.map((l) => l.text).join("\n");
        const analyzed = await analyzeFullLyrics(lyricsText, dialectCode);
        const lines = analyzed.map((line) => ({
          ...line,
          translation: null,
          dangers: [],
        }));
        const songObj = {
          id: demo.storageId,
          title: demo.meta.title,
          artist: demo.meta.artist,
          album: demo.meta.album,
          isDemo: true,
          dialectCode,
        };
        songDispatch({
          type: "LOAD_SUCCESS",
          song: songObj,
          lines,
          syncedLyrics: null,
          source: "demo",
          dialectCode,
        });
        addRecentSong(songObj);
        backgroundTranslate(lines, dialectCode, songObj, songDispatch);
      }

      setDefaultRomanization(dialectCode);
      appDispatch({ type: "SET_DIALECT", dialectCode });
      appDispatch({ type: "SET_VIEW", view: "study" });
      appDispatch({ type: "SET_SECTION", section: "lyrics" });
    } catch (err) {
      songDispatch({ type: "LOAD_ERROR", error: err.message });
    }
  }, [songDispatch, appDispatch]);

  const loadFromSearch = useCallback(
    async (searchResult) => {
      const dialectCode = searchResult.dialectCode ?? dialectPreference ?? "yue";
      songDispatch({ type: "LOAD_START", dialectCode });
      try {
        const lyricsData = searchResult.id
          ? await fetchLyrics(searchResult.id)
          : await fetchLyricsByTitleArtist(searchResult.title, searchResult.artist);
        if (!lyricsData?.plainLyrics) {
          songDispatch({ type: "LOAD_ERROR", error: "No lyrics found" });
          return;
        }
        const analyzed = await analyzeFullLyrics(lyricsData.plainLyrics, dialectCode);
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
          dialectCode,
        };
        songDispatch({
          type: "LOAD_SUCCESS",
          song: songObj,
          lines,
          syncedLyrics: lyricsData.syncedLyrics || null,
          source: lyricsData.source,
          lyricsIncomplete: nonEmptyLines < 15,
          dialectCode,
        });
        addRecentSong(songObj);
        backgroundTranslate(lines, dialectCode, songObj, songDispatch);

        // Initialize curated song data (chords, annotations, etc.)
        if (searchResult.title === "緊急聯絡人" && searchResult.artist === "Gareth.T") {
          initializeCuratedSongData("jinyulianheren", `lrclib:${songObj.id}`);
        }

        setDefaultRomanization(dialectCode);
        appDispatch({ type: "SET_DIALECT", dialectCode });
        appDispatch({ type: "SET_VIEW", view: "study" });
        appDispatch({ type: "SET_SECTION", section: "lyrics" });
      } catch (err) {
        songDispatch({ type: "LOAD_ERROR", error: err.message });
      }
    },
    [songDispatch, appDispatch, dialectPreference]
  );

  const loadCustomSong = useCallback(
    async (songId) => {
      const dialectCode = dialectPreference ?? "yue";
      try {
        const edited = localStorage.getItem(`editedlyrics:custom:${songId}`);
        const text = edited || getCustomSongLyrics(songId);
        if (!text) {
          songDispatch({ type: "LOAD_ERROR", error: "Lyrics not found for this song." });
          return;
        }
        songDispatch({ type: "LOAD_START", dialectCode });
        const analyzed = await analyzeFullLyrics(text, dialectCode);
        const lines = analyzed.map((line) => ({ ...line, translation: null, dangers: [] }));
        const song = { id: songId, title: "Custom Song", artist: "", source: "custom", dialectCode };
        songDispatch({
          type: "LOAD_SUCCESS",
          song,
          lines,
          syncedLyrics: null,
          source: "custom",
          lyricsIncomplete: lines.length < 15,
          dialectCode,
        });
        addRecentSong(song);
        backgroundTranslate(lines, dialectCode, song, songDispatch);
        setDefaultRomanization(dialectCode);
        appDispatch({ type: "SET_DIALECT", dialectCode });
        appDispatch({ type: "SET_VIEW", view: "study" });
        appDispatch({ type: "SET_SECTION", section: "lyrics" });
      } catch (err) {
        songDispatch({ type: "LOAD_ERROR", error: err.message });
      }
    },
    [songDispatch, appDispatch, dialectPreference]
  );

  const clearSong = useCallback(() => {
    songDispatch({ type: "CLEAR" });
    appDispatch({ type: "SET_VIEW", view: "search" });
  }, [songDispatch, appDispatch]);

  const updateLyrics = useCallback(async (rawText, storageId, dialectCode = "yue", song = null) => {
    try {
      const analyzed = await analyzeFullLyrics(rawText, dialectCode);
      const lines = analyzed.map((line) => ({ ...line, translation: null, dangers: [] }));
      songDispatch({ type: "UPDATE_LINES", lines });
      if (storageId) {
        try { localStorage.setItem(`editedlyrics:${storageId}`, rawText); } catch {}
      }
      if (song) backgroundTranslate(lines, dialectCode, song, songDispatch);
    } catch (err) {
      console.error("Failed to re-analyze lyrics:", err);
    }
  }, [songDispatch]);

  return { loadDemoSong, loadFromSearch, loadCustomSong, clearSong, updateLyrics };
}
