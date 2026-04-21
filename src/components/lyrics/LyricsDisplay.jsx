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
import { useTTS } from "../../hooks/useTTS.js";
import { useChordEditor } from "../../hooks/useChordEditor.js";
import { mergeChords } from "../../services/chordStorage.js";
import { DEFAULT_SECTIONS } from "../../data/defaultSong.js";
import { transposeChord, transposeLabel, capoFret } from "../../services/transpose.js";
import ChordSheet from "../chords/ChordSheet.jsx";

const ROMANIZATION_OPTIONS = [
  { value: "jyutping", label: "Jyutping" },
  { value: "yale", label: "Yale" },
  { value: "pinyin", label: "Pinyin" },
  { value: "none", label: "None" },
];

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
  const { song, lines, lyricsIncomplete, storageId } = useSong();
  const { romanization, activeLyricIndex, chordEditMode, chordDisplay, transpose } = useApp();
  const dispatch = useAppDispatch();
  const { play, playingKey, loadingKey } = useTTS();
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
      <div className="mb-6 print:hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-normal text-accent/80">
            Annotated Lyrics
          </h2>
          {activeLyricIndex >= 0 && (
            <span className="text-xs font-mono text-text-muted bg-bg-surface border border-border-subtle rounded px-3 py-1.5">
              ↑↓ navigate · Esc clear
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Group 1 — Content */}
          <button
            onClick={() => setShowEditor(true)}
            className="text-xs font-mono px-3 py-1.5 rounded border transition-all bg-bg-surface border-border-subtle text-text-secondary hover:text-text-primary"
          >
            ✎ edit lyrics
          </button>
          <button
            onClick={() => setEditSections((s) => !s)}
            className={`text-xs font-mono px-3 py-1.5 rounded border transition-all ${
              editSections
                ? "bg-accent/15 border-accent/30 text-accent"
                : "bg-bg-surface border-border-subtle text-text-secondary hover:text-text-primary"
            }`}
          >
            § sections
          </button>

          {/* Divider */}
          <span className="w-px h-4 bg-border-subtle mx-1" aria-hidden="true" />

          {/* Group 2 — View: romanization + chords + transpose */}
          <div className="flex border border-border-subtle rounded-lg overflow-hidden">
            {ROMANIZATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => dispatch({ type: "SET_ROMANIZATION", romanization: opt.value })}
                className={`text-xs font-mono px-3 py-1.5 transition-all border-r border-border-subtle last:border-r-0 ${
                  romanization === opt.value
                    ? "bg-accent/15 text-accent"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className={`flex items-center border rounded-lg overflow-hidden transition-colors ${chordEditMode ? "border-accent/40" : "border-border-subtle"}`}>
            <button
              onClick={() => dispatch({ type: "TOGGLE_CHORD_EDIT" })}
              className={`text-xs font-mono px-3 py-1.5 transition-all ${
                chordEditMode
                  ? "bg-accent-dim text-accent font-medium"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              aria-pressed={chordEditMode}
              title={chordEditMode ? "Exit chord edit mode" : "Enter chord edit mode"}
            >
              ♫ chords
            </button>
            <button
              onClick={() => dispatch({ type: "SET_CHORD_DISPLAY", display: chordDisplay === "above" ? "bars" : "above" })}
              className={`text-xs font-mono px-2.5 py-1.5 border-l border-border-subtle transition-all ${
                chordDisplay === "bars"
                  ? "bg-accent/15 text-accent"
                  : "text-text-muted hover:text-text-secondary"
              }`}
              title={chordDisplay === "above" ? "Switch to bar notation" : "Switch to above-lyrics"}
            >
              {chordDisplay === "above" ? "A̲" : "| |"}
            </button>
          </div>

          {hasAnyChords && (
            <div className="flex items-center border border-border-subtle rounded-lg overflow-hidden" title="Transpose chords">
              <button
                onClick={() => dispatch({ type: "SET_TRANSPOSE", semitones: transpose - 1 })}
                className="text-xs font-mono px-2 py-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-all"
              >
                −
              </button>
              <span className={`text-xs font-mono px-2 py-1.5 min-w-[2.5rem] text-center border-x border-border-subtle ${transpose !== 0 ? "text-accent bg-accent/10" : "text-text-muted"}`}>
                {transposeLabel(transpose)}
                {transpose !== 0 && capoFret(transpose) > 0 && (
                  <span className="block text-xs leading-none text-accent/70">capo {capoFret(transpose)}</span>
                )}
              </span>
              <button
                onClick={() => dispatch({ type: "SET_TRANSPOSE", semitones: transpose + 1 })}
                className="text-xs font-mono px-2 py-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-all"
              >
                +
              </button>
            </div>
          )}

          {/* Divider */}
          <span className="w-px h-4 bg-border-subtle mx-1" aria-hidden="true" />

          {/* Group 3 — Output */}
          <button
            onClick={() => dispatch({ type: "SET_VIEW", view: "teleprompter" })}
            className="text-xs font-mono px-3 py-1.5 rounded border transition-all bg-bg-surface border-border-subtle text-text-secondary hover:text-text-primary"
            title="Teleprompter mode"
          >
            ⛶ stage
          </button>
          <PrintButton />
        </div>
      </div>

      {/* Three-column layout: left rail (tone/pronunciation) | lyrics | chord diagrams */}
      {/* md+: left rail appears. xl: wider left rail. */}
      <div className="grid xl:grid-cols-[220px_1fr_200px] md:grid-cols-[180px_1fr] gap-6 print:block">

        {/* Left rail: tone reference + pronunciation notes (md+) */}
        <div className="hidden md:flex flex-col gap-6 sticky top-4 self-start">
          <ToneReference />
          <ToneAnalytics />
          <PronunciationNotes />
        </div>

        {/* Centre: lyrics */}
        <div>
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
                  onPlay={play}
                  playingKey={playingKey}
                  loadingKey={loadingKey}
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
          <div className="md:hidden mt-6 pt-5 border-t border-slate-100 space-y-4">
            <ToneAnalytics />
            <PronunciationNotes />
          </div>
        </div>

        {/* Right: chord diagrams — xl only (third column) */}
        <div className="hidden xl:block xl:sticky xl:top-4 xl:self-start">
          <ChordSheet usedChords={allVisibleChords} />
        </div>
      </div>

      {/* Print-only footer for leadsheet */}
      <div className="hidden print:block mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-500 font-mono">
        華譜 WaaPou — waapou.app. An Amber Audio product.
      </div>
    </div>
  );
}
