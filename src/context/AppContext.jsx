import { createContext, useContext, useReducer } from "react";

const AppContext = createContext(null);
const AppDispatchContext = createContext(null);

const STORAGE_KEY_DIALECT = "waapou:dialect";

function readDialectPreference() {
  try {
    const v = localStorage.getItem(STORAGE_KEY_DIALECT);
    if (v === "yue" || v === "cmn" || v === "nan") return v;
  } catch {}
  return "yue";
}

const initialState = {
  currentView: "search",
  activeSection: "lyrics",
  expandedLine: null,
  toneFilter: null,
  romanization: "jyutping", // "jyutping" | "yale" | "none"
  chordEditMode: false,
  chordDisplay: "above", // "above" | "bars"
  activeLyricIndex: -1,
  currentArtist: null, // { artist, artistEn }
  transpose: 0, // semitones, -6 to +6
  dialectPreference: readDialectPreference(), // 'yue' | 'cmn' | 'nan'
};

function appReducer(state, action) {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, currentView: action.view };
    case "SET_SECTION":
      return { ...state, activeSection: action.section };
    case "TOGGLE_LINE":
      return {
        ...state,
        expandedLine: state.expandedLine === action.index ? null : action.index,
      };
    case "SET_TONE_FILTER":
      return {
        ...state,
        toneFilter: state.toneFilter === action.tone ? null : action.tone,
      };
    case "SET_ROMANIZATION":
      return { ...state, romanization: action.romanization };
    case "SET_ACTIVE_LYRIC":
      return { ...state, activeLyricIndex: action.index };
    case "TOGGLE_CHORD_EDIT":
      return { ...state, chordEditMode: !state.chordEditMode };
    case "SET_CHORD_DISPLAY":
      return { ...state, chordDisplay: action.display };
    case "SET_ARTIST":
      return { ...state, currentView: "artist", currentArtist: action.artist };
    case "SET_TRANSPOSE":
      return { ...state, transpose: Math.max(-6, Math.min(6, action.semitones)) };
    case "SET_DIALECT": {
      const code =
        action.dialectCode === "yue" ||
        action.dialectCode === "cmn" ||
        action.dialectCode === "nan"
          ? action.dialectCode
          : "yue";
      try { localStorage.setItem(STORAGE_KEY_DIALECT, code); } catch {}
      return { ...state, dialectPreference: code };
    }
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

export function useAppDispatch() {
  return useContext(AppDispatchContext);
}
