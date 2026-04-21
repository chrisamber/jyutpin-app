import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAppDispatch } from "../context/AppContext.jsx";
import { useSong } from "../context/SongContext.jsx";
import { parseLRC, getActiveLyricIndex } from "../services/lrcParser.js";

let ytApiLoaded = false;
let ytApiPromise = null;

/** Track all consumers waiting for the API so multiple hooks don't clobber each other. */
const apiReadyListeners = new Set();

function loadYTApi() {
  if (ytApiLoaded) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    apiReadyListeners.add(resolve);
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => {
      ytApiLoaded = true;
      apiReadyListeners.forEach((cb) => cb());
      apiReadyListeners.clear();
    };
  });
  return ytApiPromise;
}

export function useYouTubePlayer() {
  const { syncedLyrics } = useSong();
  const dispatch = useAppDispatch();
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const intervalRef = useRef(null);
  const prevIndexRef = useRef(-1);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const timestamps = useMemo(() => parseLRC(syncedLyrics), [syncedLyrics]);

  // Poll current time for lyric sync
  useEffect(() => {
    if (!isPlaying || !playerRef.current || timestamps.length === 0) return;
    intervalRef.current = setInterval(() => {
      try {
        const time = playerRef.current.getCurrentTime();
        const index = getActiveLyricIndex(timestamps, time);
        if (index !== prevIndexRef.current) {
          prevIndexRef.current = index;
          dispatch({ type: "SET_ACTIVE_LYRIC", index });
        }
      } catch {
        // player not ready
      }
    }, 200);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, timestamps, dispatch]);

  // Reset active lyric + destroy player on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      dispatch({ type: "SET_ACTIVE_LYRIC", index: -1 });
    };
  }, [dispatch]);

  const initPlayer = useCallback(
    async (elementId, videoId) => {
      await loadYTApi();
      if (playerRef.current) {
        playerRef.current.loadVideoById(videoId);
        return;
      }
      playerRef.current = new window.YT.Player(elementId, {
        videoId,
        height: "200",
        width: "100%",
        playerVars: { autoplay: 0, modestbranding: 1, rel: 0 },
        events: {
          onReady: () => setIsReady(true),
          onStateChange: (e) => {
            setIsPlaying(e.data === window.YT.PlayerState.PLAYING);
          },
        },
      });
    },
    []
  );

  return { initPlayer, containerRef, isReady, isPlaying, timestamps };
}
