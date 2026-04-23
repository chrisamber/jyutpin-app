import { createContext, useContext, useReducer } from "react";

const SongContext = createContext(null);
const SongDispatchContext = createContext(null);

const initialState = {
  song: null,
  lines: [],
  syncedLyrics: null,
  isLoading: false,
  error: null,
  lyricsSource: null,
  lyricsIncomplete: false,
  dialectCode: "yue",
};

function songReducer(state, action) {
  switch (action.type) {
    case "LOAD_START":
      return {
        ...state,
        isLoading: true,
        error: null,
        dialectCode: action.dialectCode ?? state.dialectCode,
      };
    case "LOAD_SUCCESS":
      return {
        ...state,
        song: action.song,
        lines: action.lines,
        syncedLyrics: action.syncedLyrics || null,
        isLoading: false,
        lyricsSource: action.source,
        lyricsIncomplete: action.lyricsIncomplete || false,
        dialectCode: action.dialectCode ?? state.dialectCode,
      };
    case "LOAD_ERROR":
      return { ...state, isLoading: false, error: action.error };
    case "UPDATE_LINES":
      return { ...state, lines: action.lines, lyricsIncomplete: false };
    case "UPDATE_SONG":
      return { ...state, song: { ...state.song, ...action.updates } };
    case "CLEAR":
      return initialState;
    default:
      return state;
  }
}

export function SongProvider({ children }) {
  const [state, dispatch] = useReducer(songReducer, initialState);
  return (
    <SongContext.Provider value={state}>
      <SongDispatchContext.Provider value={dispatch}>
        {children}
      </SongDispatchContext.Provider>
    </SongContext.Provider>
  );
}

export function useSong() {
  const state = useContext(SongContext);
  const storageId =
    state.song?.isDemo    ? "demo"
    : state.song?.isCustom  ? `custom:${state.song.id}`
    : state.song?.id        ? `lrclib:${state.song.id}`
    : null;
  return { ...state, storageId };
}

export function useSongDispatch() {
  return useContext(SongDispatchContext);
}
