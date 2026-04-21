import { useState, useCallback, useRef } from "react";
import { synthesize, isConfigured } from "../services/tts.js";

/**
 * Manages Google TTS playback for lyric lines.
 * One audio instance at a time — starting a new line stops the current one.
 */
export function useTTS() {
  const [playingKey, setPlayingKey] = useState(null);
  const [loadingKey, setLoadingKey] = useState(null);
  const audioRef = useRef(null);
  const playingKeyRef = useRef(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    playingKeyRef.current = null;
    setPlayingKey(null);
    setLoadingKey(null);
  }, []);

  const play = useCallback(
    async (text, key) => {
      // Toggle off if this line is already playing (check via ref to avoid stale closure)
      if (audioRef.current?._playingKey === key) {
        stop();
        return;
      }

      stop();

      if (!isConfigured()) {
        console.warn("WaaPou: VITE_GOOGLE_TTS_API_KEY is not set.");
        return;
      }

      setLoadingKey(key);
      playingKeyRef.current = key;

      try {
        const url = await synthesize(text);

        const audio = new Audio(url);
        audio._playingKey = key;
        audioRef.current = audio;

        audio.onended = () => {
          playingKeyRef.current = null;
          setPlayingKey(null);
          audioRef.current = null;
        };
        audio.onerror = () => {
          playingKeyRef.current = null;
          setPlayingKey(null);
          setLoadingKey(null);
          audioRef.current = null;
        };

        await audio.play();
        setLoadingKey(null);
        setPlayingKey(key);
      } catch (err) {
        console.error("TTS error:", err);
        setLoadingKey(null);
        playingKeyRef.current = null;
        setPlayingKey(null);
      }
    },
    [stop] // stop is stable; only recreated if its own deps change
  );

  return {
    play,
    stop,
    playingKey,
    loadingKey,
    configured: isConfigured(),
  };
}
