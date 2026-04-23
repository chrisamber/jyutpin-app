import { useApp, useAppDispatch } from "../../context/AppContext.jsx";
import { useSongAnalysis } from "../../hooks/useSongAnalysis.js";
import { DIALECTS } from "../../dialects/index.js";
import ThemeToggle from "./ThemeToggle.jsx";

function DialectSwitcher() {
  const { dialectPreference } = useApp();
  const dispatch = useAppDispatch();

  const handleKeyDown = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const i = DIALECTS.findIndex((d) => d.code === dialectPreference);
    const next =
      e.key === "ArrowRight"
        ? DIALECTS[(i + 1) % DIALECTS.length]
        : DIALECTS[(i - 1 + DIALECTS.length) % DIALECTS.length];
    dispatch({ type: "SET_DIALECT", dialectCode: next.code });
  };

  return (
    <div
      role="tablist"
      aria-label="Dialect"
      onKeyDown={handleKeyDown}
      className="flex items-center rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-0.5"
    >
      {DIALECTS.map((d) => {
        const active = d.code === dialectPreference;
        return (
          <button
            key={d.code}
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => dispatch({ type: "SET_DIALECT", dialectCode: d.code })}
            title={`${d.displayName} (${d.romanizationName})`}
            className={`text-[10px] font-mono tracking-[0.12em] uppercase px-2.5 py-1 rounded-sm transition-colors ${
              active
                ? "bg-[var(--color-bg-base)] text-[var(--color-accent)] shadow-sm"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {d.code}
          </button>
        );
      })}
    </div>
  );
}

export default function Header() {
  const { currentView } = useApp();
  const { clearSong } = useSongAnalysis();

  return (
    <header
      className="border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-base)]/95 backdrop-blur-sm sticky top-0 z-50 print:hidden"
    >
      <div className="max-w-6xl mx-auto px-[var(--space-6)] py-[var(--space-3.5)] flex items-center justify-between">
        <div className="flex items-center gap-[var(--space-4)]">
          {/* Wordmark */}
          <div className="flex items-baseline gap-[var(--space-2)]">
            <span className="text-base font-semibold tracking-tight text-[var(--color-text-primary)] cjk leading-none">
              華譜
            </span>
            <span className="text-[10px] font-mono text-accent/50 tracking-[0.25em] uppercase leading-none">
              WaaPou
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DialectSwitcher />
          <ThemeToggle />
          {currentView === "study" && (
            <button
              onClick={clearSong}
              className="text-[10px] font-mono text-[var(--color-text-secondary)] hover:text-accent transition-colors px-3 py-1.5 rounded-md hover:bg-[var(--color-bg-elevated)] border border-transparent hover:border-[var(--color-border-subtle)]"
            >
              ← New Song
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
