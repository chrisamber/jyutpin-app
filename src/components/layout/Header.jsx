import { useApp } from "../../context/AppContext.jsx";
import { useSongAnalysis } from "../../hooks/useSongAnalysis.js";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Header() {
  const { currentView } = useApp();
  const { clearSong } = useSongAnalysis();

  return (
    <header className="border-b border-border-subtle bg-bg-primary/95 backdrop-blur-sm sticky top-0 z-50 print:hidden">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Wordmark */}
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold tracking-tight text-text-primary cjk leading-none">
              華譜
            </span>
            <span className="text-[10px] font-mono text-accent/50 tracking-[0.25em] uppercase leading-none">
              WaaPou
            </span>
          </div>

        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {currentView === "study" && (
            <button
              onClick={clearSong}
              className="text-[11px] font-mono text-text-secondary hover:text-accent transition-colors px-3 py-1.5 rounded-md hover:bg-bg-elevated border border-transparent hover:border-border-subtle"
            >
              ← New Song
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
