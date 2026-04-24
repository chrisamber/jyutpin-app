import { useEffect, useMemo, useRef } from "react";
import { useSong } from "../../context/SongContext.jsx";
import { useApp, useAppDispatch } from "../../context/AppContext.jsx";
import LyricsLine from "../lyrics/LyricsLine.jsx";

export default function TeleprompterView() {
  const { song, lines } = useSong();
  const { activeLyricIndex, toneFilter } = useApp();
  const dispatch = useAppDispatch();
  const scrollContainerRef = useRef(null);

  const filteredLines = useMemo(
    () => toneFilter ? lines.filter((l) => l.tokens.some((t) => t.tone === toneFilter)) : lines,
    [lines, toneFilter]
  );
  
  const lineIndexMap = useMemo(() => new Map(lines.map((l, i) => [l, i])), [lines]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        dispatch({ type: "SET_VIEW", view: "study" });
        return;
      }
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      
      const realIndices = filteredLines.map((l) => lineIndexMap.get(l));
      const pos = realIndices.indexOf(activeLyricIndex);
      
      let next = -1;
      if (activeLyricIndex === -1) {
        next = realIndices[0] || 0;
      } else {
        next = e.key === "ArrowDown"
          ? realIndices[Math.min(pos + 1, realIndices.length - 1)]
          : realIndices[Math.max(pos - 1, 0)];
      }

      if (next !== undefined && next !== -1) {
        dispatch({ type: "SET_ACTIVE_LYRIC", index: next });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeLyricIndex, filteredLines, lineIndexMap, dispatch]);

  // Auto-scroll to active line
  useEffect(() => {
    if (activeLyricIndex < 0) return;
    const el = document.querySelector(`[data-teleprompter-line="${activeLyricIndex}"]`);
    if (el && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const targetScroll = el.offsetTop - container.offsetHeight / 2 + el.offsetHeight / 2;
        container.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  }, [activeLyricIndex]);

  return (
    <div className="fixed inset-0 bg-[var(--color-bg-base)] z-50 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100 shrink-0">
        <div>
          <h2 className="text-xl font-medium tracking-wider text-slate-800">{song?.title}</h2>
          <div className="text-xs text-slate-400 font-mono">Use ↑↓ to scroll • Esc to exit</div>
        </div>
        <button
          onClick={() => dispatch({ type: "SET_VIEW", view: "study" })}
          aria-label="Exit stage mode"
          className="inline-flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-mono rounded-lg transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          <span className="hidden sm:inline">Exit</span>
        </button>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-8 md:px-16"
      >
        <div className="max-w-4xl mx-auto pt-[30vh] pb-[60vh]">
          {filteredLines.map((line) => {
            const realIndex = lineIndexMap.get(line);
            const isActive = activeLyricIndex === realIndex || activeLyricIndex === -1;
            const isTargeted = activeLyricIndex === realIndex;
            return (
              <div 
                key={realIndex} 
                data-teleprompter-line={realIndex}
                className={`transition-all duration-300 transform mb-6 ${isTargeted ? "scale-125 origin-left" : isActive ? "scale-100" : "opacity-30 scale-100"}`}
                onClick={() => dispatch({ type: "SET_ACTIVE_LYRIC", index: realIndex })}
              >
                <div className="pointer-events-none origin-left" style={{ transform: 'scale(1.2)' }}>
                  <LyricsLine
                    line={line}
                    index={realIndex}
                    isActive={false}
                    onClick={() => {}}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
