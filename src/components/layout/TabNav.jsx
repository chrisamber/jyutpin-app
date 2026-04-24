import { useRef, useCallback } from "react";
import { useApp, useAppDispatch } from "../../context/AppContext.jsx";
import { useSong } from "../../context/SongContext.jsx";

const ALL_TABS = [
  { id: "lyrics",        label: "Lyrics" },
  // V1X-S1.3 — Breakdown is gated to demo songs (requires hand-authored
  // `line.dangers` metadata). Re-enable for other songs once the danger
  // annotation pipeline covers LRCLIB/custom tracks.
  { id: "songBreakdown", label: "Breakdown", demoOnly: true },
  { id: "dangerZones",   label: "Danger Zones" },
  { id: "drills",        label: "Drills" },
];

export default function TabNav() {
  const { activeSection } = useApp();
  const { song } = useSong();
  const dispatch = useAppDispatch();
  const tabRefs = useRef([]);

  const TABS = ALL_TABS.filter((t) => !t.demoOnly || song?.isDemo);

  const activate = useCallback((id) => {
    dispatch({ type: "SET_SECTION", section: id });
  }, [dispatch]);

  const handleKeyDown = useCallback((e, index) => {
    let next = index;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next = (index + 1) % TABS.length;
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      next = (index - 1 + TABS.length) % TABS.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      next = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      next = TABS.length - 1;
    } else {
      return;
    }
    activate(TABS[next].id);
    tabRefs.current[next]?.focus();
  }, [activate]);

  return (
    <div
      role="tablist"
      aria-label="Song sections"
      className="flex gap-1 border-b border-[var(--color-border-subtle)] mb-6 print:hidden"
      data-touch-targets
    >
      {TABS.map((tab, i) => {
        const active = activeSection === tab.id;
        return (
          <button
            key={tab.id}
            id={`${tab.id}-tab`}
            ref={(el) => { tabRefs.current[i] = el; }}
            role="tab"
            aria-selected={active}
            aria-controls={`${tab.id}-panel`}
            tabIndex={active ? 0 : -1}
            onClick={() => activate(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={`px-4 py-2 text-xs font-mono tracking-wide border-b-2 -mb-px transition-colors ${
              active
                ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-default)]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
