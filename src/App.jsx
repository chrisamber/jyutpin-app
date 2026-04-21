import { SongProvider } from "./context/SongContext.jsx";
import { AppProvider } from "./context/AppContext.jsx";
import { useApp } from "./context/AppContext.jsx";
import { useSong } from "./context/SongContext.jsx";
import AppShell from "./components/layout/AppShell.jsx";
import SearchHero from "./components/search/SearchHero.jsx";
import SongHeader from "./components/layout/SongHeader.jsx";
import SongMeta from "./components/song/SongMeta.jsx";
import LyricsDisplay from "./components/lyrics/LyricsDisplay.jsx";
import SongBreakdown from "./components/song/SongBreakdown.jsx";
import DangerZones from "./components/song/DangerZones.jsx";
import Drills from "./components/study/Drills.jsx";
import TeleprompterView from "./components/layout/TeleprompterView.jsx";
import ArtistCatalog from "./components/artist/ArtistCatalog.jsx";

function StudyView() {
  const { activeSection } = useApp();
  const { song, isLoading, error } = useSong();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="text-accent/60 text-lg mb-2">Analyzing...</div>
          <div className="text-text-secondary text-sm">
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
      {activeSection === "lyrics" && <LyricsDisplay />}
      {activeSection === "songBreakdown" && <SongBreakdown />}
      {activeSection === "dangerZones" && <DangerZones />}
      {activeSection === "drills" && <Drills />}
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
