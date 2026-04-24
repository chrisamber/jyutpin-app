import { useMemo, useState, useEffect, useCallback } from "react";
import { useSong } from "../../context/SongContext.jsx";
import { useApp, useAppDispatch } from "../../context/AppContext.jsx";
import LyricsLine from "./LyricsLine.jsx";
import { loadMetaForSong } from "../../components/song/SongMeta.jsx";
import LyricsEditor from "./LyricsEditor.jsx";
import PronunciationNotes from "./PronunciationNotes.jsx";
import ToneAnalytics from "./ToneAnalytics.jsx";
import PrintButton from "../print/PrintButton.jsx";
import YouTubePlayer from "../youtube/YouTubePlayer.jsx";
import SectionLabel from "./SectionLabel.jsx";
import ToneReference from "./ToneReference.jsx";
import { useChordEditor } from "../../hooks/useChordEditor.js";
import { mergeChords } from "../../services/chordStorage.js";
import { DEFAULT_SECTIONS } from "../../data/defaultSong.js";
import { transposeChord, transposeLabel, capoFret } from "../../services/transpose.js";
import ChordSheet from "../chords/ChordSheet.jsx";

const ROMANIZATION_OPTIONS_BY_DIALECT = {
  yue: [
    { value: "jyutping", label: "Jyutping" },
    { value: "yale", label: "Yale" },
    { value: "pinyin", label: "Pinyin" },
    { value: "none", label: "None" },
  ],
  cmn: [
    { value: "pinyin", label: "Pinyin" },
    { value: "yale", label: "Zhuyin" }, // 'yale' slot renders alternates.zhuyin via JyutpingAnnotation fallback
    { value: "none", label: "None" },
  ],
  nan: [
    { value: "pinyin", label: "POJ" }, // 'pinyin' slot falls through to primary roman (POJ)
    { value: "yale", label: "Tâi-lô" }, // 'yale' slot renders alternates.tailo
    { value: "none", label: "None" },
  ],
};

const SECTION_LABELS = ["Intro", "Verse", "Pre-Chorus", "Chorus", "Music Break", "Bridge", "Outro"];
const SECTIONS_KEY = (id) => `sections:${id}`;

function loadSections(storageId) {
  try {
    const raw = localStorage.getItem(SECTIONS_KEY(storageId));
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveSections(storageId, map) {
  try { localStorage.setItem(SECTIONS_KEY(storageId), JSON.stringify(map)); } catch {}
}

export default function LyricsDisplay() {
  const { song, lines, lyricsIncomplete, storageId, dialectCode } = useSong();
  const { romanization, activeLyricIndex, chordEditMode, chordDisplay, transpose } = useApp();
  const isYue = (dialectCode ?? "yue") === "yue";
  const dispatch = useAppDispatch();
  const [editSections, setEditSections] = useState(false);
  const [sectionMap, setSectionMap] = useState({});
  const [showEditor, setShowEditor] = useState(false);
  const [beatsPerBar, setBeatsPerBar] = useState(4);

  // Load beatsPerBar first so useChordEditor gets the right value
  useEffect(() => {
    if (!storageId) return;
    setSectionMap(loadSections(storageId));
    const meta = loadMetaForSong(storageId);
    setBeatsPerBar(Number(meta.beatsPerBar) || 4);
  }, [storageId]);

  const { chordMap, usedChords, setChordAtChar, setChordAt } =
    useChordEditor(storageId, beatsPerBar);

  const updateSection = (lineIndex, label) => {
    setSectionMap((prev) => {
      const next = label ? { ...prev, [lineIndex]: label } : Object.fromEntries(Object.entries(prev).filter(([k]) => Number(k) !== lineIndex));
      if (storageId) saveSections(storageId, next);
      return next;
    });
  };

  const handleChordEdit = useCallback(
    (lineIndex, charIndex, chord) => setChordAtChar(lineIndex, charIndex, chord),
    [setChordAtChar]
  );

  // Merge user chords onto analyzed lines
  const linesWithChords = useMemo(() => mergeChords(lines, chordMap, beatsPerBar), [lines, chordMap, beatsPerBar]);

  // True when any chord is visible — either user-stored or inline [chord] notation
  const hasAnyChords = useMemo(
    () => usedChords.length > 0 || linesWithChords.some(l => l.barGrid || l.tokens.some(t => t.chord)),
    [usedChords, linesWithChords]
  );

  // All unique inline chords (for diagram sheet, alongside user-stored ones)
  const allVisibleChords = useMemo(() => {
    const seen = new Set(usedChords.map(c => transposeChord(c, transpose)));
    for (const line of linesWithChords) {
      for (const t of line.tokens) {
        if (t.chord) seen.add(transposeChord(t.chord, transpose));
      }
      if (line.barGrid) {
        for (const bar of line.barGrid) {
          for (const beat of bar) {
            if (beat && beat !== "." && beat !== "-") seen.add(transposeChord(beat, transpose));
          }
        }
      }
    }
    return [...seen];
  }, [usedChords, linesWithChords, transpose]);

  // Seed default section labels for the demo song when localStorage has none yet
  useEffect(() => {
    if (storageId !== "demo" || linesWithChords.length === 0) return;
    const existing = localStorage.getItem(SECTIONS_KEY(storageId));
    if (existing) return; // user has already customised sections — don't overwrite
    const seeded = {};
    linesWithChords.forEach((line, i) => {
      const label = DEFAULT_SECTIONS[line.chinese];
      if (label) seeded[i] = label;
    });
    if (Object.keys(seeded).length > 0) {
      saveSections(storageId, seeded);
      setSectionMap(seeded);
    }
  }, [storageId, linesWithChords]);

  // Keyboard navigation through lines
  const handleLineClick = useCallback((realIndex) => {
    dispatch({
      type: "SET_ACTIVE_LYRIC",
      index: activeLyricIndex === realIndex ? -1 : realIndex,
    });
  }, [dispatch, activeLyricIndex]);

  useEffect(() => {
    if (activeLyricIndex < 0) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        dispatch({ type: "SET_ACTIVE_LYRIC", index: -1 });
        return;
      }
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      const next = e.key === "ArrowDown"
        ? Math.min(activeLyricIndex + 1, linesWithChords.length - 1)
        : Math.max(activeLyricIndex - 1, 0);
      dispatch({ type: "SET_ACTIVE_LYRIC", index: next });
      document.querySelector(`[data-line-index="${next}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeLyricIndex, linesWithChords.length, dispatch]);

  return (
    <div>
      {showEditor && <LyricsEditor onClose={() => setShowEditor(false)} />}

      {/* YouTube player */}
      <YouTubePlayer />

      {/* Incompleteness banner */}
      {lyricsIncomplete && (
        <div className="mb-6 flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-xl px-6 py-4 print:hidden">
          <span className="text-amber-600 text-sm flex-1">
            Lyrics may be incomplete — fewer than 15 lines detected.
          </span>
          <button
            onClick={() => setShowEditor(true)}
            className="text-sm font-mono px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
          >
            Paste full lyrics
          </button>
        </div>
      )}

      {/* Unified toolbar — three groups: Content | View | Output */}
      <div className="mb-6 print:hidden" data-touch-targets>
        <div className="flex flex-wrap items-center gap-2">
          {/* Group 1 — Content */}
          <button
            onClick={() => setShowEditor(true)}
            className="text-xs font-mono px-3 py-1.5 rounded border transition-all bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            ✎ edit lyrics
          </button>
          <button
            onClick={() => setEditSections((s) => !s)}
            className={`text-xs font-mono px-3 py-1.5 rounded border transition-all ${
              editSections
                ? "bg-accent/15 border-accent/30 text-accent"
                : "bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            § sections
          </button>

          {/* Divider */}
          <span className="w-px h-4 bg-[var(--color-border-subtle)] mx-1" aria-hidden="true" />

          {/* Group 2 — View: romanization + chords + transpose */}
          <div className="flex border border-[var(--color-border-subtle)] rounded-lg overflow-hidden">
            {(ROMANIZATION_OPTIONS_BY_DIALECT[dialectCode ?? "yue"] ?? ROMANIZATION_OPTIONS_BY_DIALECT.yue).map((opt) => (
              <button
                key={opt.value}
                onClick={() => dispatch({ type: "SET_ROMANIZATION", romanization: opt.value })}
                className={`text-xs font-mono px-3 py-1.5 transition-all border-r border-[var(--color-border-subtle)] last:border-r-0 ${
                  romanization === opt.value
                    ? "bg-accent/15 text-accent"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className={`flex items-center border rounded-lg overflow-hidden transition-colors ${chordEditMode ? "border-accent/40" : "border-[var(--color-border-subtle)]"}`}>
            <button
              onClick={() => dispatch({ type: "TOGGLE_CHORD_EDIT" })}
              className={`text-xs font-mono px-3 py-1.5 transition-all ${
                chordEditMode
                  ? "bg-accent-dim text-accent font-medium"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
              aria-pressed={chordEditMode}
              title={chordEditMode ? "Exit chord edit mode" : "Enter chord edit mode"}
            >
              ♫ chords
            </button>
            <button
              onClick={() => dispatch({ type: "SET_CHORD_DISPLAY", display: chordDisplay === "above" ? "bars" : "above" })}
              className={`text-xs font-mono px-3 py-1.5 min-w-[40px] border-l border-[var(--color-border-subtle)] transition-all ${
                chordDisplay === "bars"
                  ? "bg-accent/15 text-accent"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              }`}
              title={chordDisplay === "above" ? "Switch to bar notation" : "Switch to above-lyrics"}
            >
              {chordDisplay === "above" ? "A̲" : "| |"}
            </button>
          </div>

          {hasAnyChords && (
            <div className="flex items-center border border-[var(--color-border-subtle)] rounded-lg overflow-hidden" title="Transpose chords">
              <button
                onClick={() => dispatch({ type: "SET_TRANSPOSE", semitones: transpose - 1 })}
                className="text-xs font-mono px-3 py-1.5 min-w-[40px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-all"
              >
                −
              </button>
              <span className={`text-xs font-mono px-2 py-1.5 min-w-[2.5rem] text-center border-x border-[var(--color-border-subtle)] ${transpose !== 0 ? "text-accent bg-accent/10" : "text-[var(--color-text-muted)]"}`}>
                {transposeLabel(transpose)}
                {transpose !== 0 && capoFret(transpose) > 0 && (
                  <span className="block text-xs leading-none text-accent/70">capo {capoFret(transpose)}</span>
                )}
              </span>
              <button
                onClick={() => dispatch({ type: "SET_TRANSPOSE", semitones: transpose + 1 })}
                className="text-xs font-mono px-3 py-1.5 min-w-[40px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-all"
              >
                +
              </button>
            </div>
          )}

          {/* Divider */}
          <span className="w-px h-4 bg-[var(--color-border-subtle)] mx-1" aria-hidden="true" />

          {/* Group 3 — Output */}
          <button
            onClick={() => dispatch({ type: "SET_VIEW", view: "teleprompter" })}
            className="text-xs font-mono px-3 py-1.5 rounded border transition-all bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            title="Teleprompter mode"
          >
            ⛶ stage
          </button>
          <PrintButton />
          {activeLyricIndex >= 0 && (
            <span className="ml-auto text-xs font-mono text-[var(--color-text-muted)] bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded px-3 py-1.5">
              ↑↓ navigate · Esc clear
            </span>
          )}
        </div>
      </div>

      {/* Three-column layout: lyrics | right rail (tone/pronunciation) | chord diagrams */}
      {/* md+: right rail appears. xl: chord diagram column added. */}
      <div className={`grid gap-6 print:block ${isYue ? "xl:grid-cols-[1fr_216px_200px] md:grid-cols-[1fr_216px]" : ""}`}>

        {/* Centre: lyrics — first in DOM for mobile/accessibility */}
        <div>
          <div className="section-label mb-4">Annotated Lyrics</div>
          {linesWithChords.map((line, realIndex) => {
            const sectionLabel = sectionMap[realIndex];
            return (
              <div key={realIndex}>
                <SectionLabel
                  label={sectionLabel}
                  editing={editSections}
                  options={SECTION_LABELS}
                  onChange={(label) => updateSection(realIndex, label)}
                />
                <LyricsLine
                  line={line}
                  index={realIndex}
                  isActive={activeLyricIndex === realIndex}
                  onClick={() => handleLineClick(realIndex)}
                  chordEditMode={chordEditMode}
                  chordDisplay={chordDisplay}
                  onChordEdit={chordEditMode ? handleChordEdit : undefined}
                  onChordEditBeat={chordEditMode ? setChordAt : undefined}
                  usedChords={usedChords}
                  beatsPerBar={beatsPerBar}
                  transpose={transpose}
                />
              </div>
            );
          })}

          {/* Tone tools fallback: shown below lyrics on small screens (<md) */}
          {isYue && (
            <div className="md:hidden mt-6 pt-5 border-t border-[var(--color-border-subtle)] space-y-4">
              <ToneAnalytics />
              <PronunciationNotes />
            </div>
          )}
        </div>

        {/* Right rail: tone reference + analytics + pronunciation notes (md+). */}
        {/* Cantonese-specific — hidden for cmn/nan until per-dialect content lands. */}
        <div className="hidden md:flex flex-col gap-6 sticky top-4 self-start min-w-0 w-full">
          {isYue && <ToneReference />}
          {isYue && <ToneAnalytics />}
          {isYue && <PronunciationNotes />}
        </div>

        {/* Far right: chord diagrams — xl only (third column) */}
        <div className="hidden xl:block xl:sticky xl:top-4 xl:self-start">
          <ChordSheet usedChords={allVisibleChords} />
        </div>
      </div>

      {/* Print-only footer for leadsheet */}
      <div className="hidden print:block mt-12 pt-6 border-t border-[var(--color-border-default)] text-center text-xs text-slate-500 font-mono">
        華譜 WaaPou — waapou.app. An Amber Audio product.
      </div>
    </div>
  );
}
