import Header from "./Header.jsx";
import TabNav from "./TabNav.jsx";
import { useApp } from "../../context/AppContext.jsx";
import { useSong } from "../../context/SongContext.jsx";

export default function AppShell({ searchView, studyView, artistView, teleprompterView }) {
  const { currentView } = useApp();
  const { song } = useSong();

  if (currentView === "teleprompter") {
    return teleprompterView;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <Header />
      {currentView === "study" && song && <TabNav />}
      <main className="max-w-6xl mx-auto px-5 py-6 pb-16">
        {currentView === "search" && searchView}
        {currentView === "study" && studyView}
        {currentView === "artist" && artistView}
      </main>
    </div>
  );
}
