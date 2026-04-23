import { useEffect, useRef } from "react";
import { SongProvider } from "./context/SongContext.jsx";
import { AppProvider } from "./context/AppContext.jsx";
import { useApp } from "./context/AppContext.jsx";
import { useSong } from "./context/SongContext.jsx";
import AppShell from "./components/layout/AppShell.jsx";
import SearchHero from "./components/search/SearchHero.jsx";
import SongHeader from "./components/layout/SongHeader.jsx";
import SongMeta from "./components/song/SongMeta.jsx";
import TabNav from "./components/layout/TabNav.jsx";
import LyricsDisplay from "./components/lyrics/LyricsDisplay.jsx";
import SongBreakdown from "./components/song/SongBreakdown.jsx";
import DangerZones from "./components/song/DangerZones.jsx";
import Drills from "./components/study/Drills.jsx";
import TeleprompterView from "./components/layout/TeleprompterView.jsx";
import ArtistCatalog from "./components/artist/ArtistCatalog.jsx";
import { useSongAnalysis } from "./hooks/useSongAnalysis.js";

function StudyView() {
  const { activeSection, dialectPreference } = useApp();
  const { song, isLoading, error } = useSong();
  const { loadDemoSong } = useSongAnalysis();
  const prevDialect = useRef(dialectPreference);

  // When the dialect switcher changes while a demo is loaded, swap to the
  // matching demo so the button actually does something visible.
  useEffect(() => {
    if (prevDialect.current === dialectPreference) return;
    prevDialect.current = dialectPreference;
    if (song?.isDemo) loadDemoSong(dialectPreference);
  }, [dialectPreference, song?.isDemo, loadDemoSong]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="text-[var(--color-accent)]/60 text-lg mb-2">Analyzing...</div>
          <div className="text-[var(--color-text-secondary)] text-sm">
            Converting lyrics to Jyutping
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 text-center">
        <div className="text-red-400 mb-1">Error</div>
        <div className="text-sm text-slate-500">{error}</div>
      </div>
    );
  }

  if (!song) return null;

  return (
    <>
      <SongHeader />
      <SongMeta />
      <TabNav />
      <div
        id="lyrics-panel"
        role="tabpanel"
        aria-labelledby="lyrics-tab"
        tabIndex={0}
        hidden={activeSection !== "lyrics"}
      >
        <LyricsDisplay />
      </div>
      <div
        id="songBreakdown-panel"
        role="tabpanel"
        aria-labelledby="songBreakdown-tab"
        tabIndex={0}
        hidden={activeSection !== "songBreakdown"}
      >
        <SongBreakdown />
      </div>
      <div
        id="dangerZones-panel"
        role="tabpanel"
        aria-labelledby="dangerZones-tab"
        tabIndex={0}
        hidden={activeSection !== "dangerZones"}
      >
        <DangerZones />
      </div>
      <div
        id="drills-panel"
        role="tabpanel"
        aria-labelledby="drills-tab"
        tabIndex={0}
        hidden={activeSection !== "drills"}
      >
        <Drills />
      </div>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <SongProvider>
        <AppShell
          searchView={<SearchHero />}
          studyView={<StudyView />}
          artistView={<ArtistCatalog />}
          teleprompterView={<TeleprompterView />}
        />
      </SongProvider>
    </AppProvider>
  );
}
