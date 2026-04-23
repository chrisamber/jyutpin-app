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
    <div className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
      <Header />
      
      {/* Main content wrapper with consistent padding using design system tokens */}
      <main 
        className={`max-w-6xl mx-auto px-[var(--space-6)] pb-[var(--space-16)] ${
          currentView === "study" ? "" : "py-[var(--space-6)]"
        }`}
      >
        {currentView === "search" && searchView}
        {currentView === "study" && studyView}
        {currentView === "artist" && artistView}
      </main>
    </div>
  );
}
