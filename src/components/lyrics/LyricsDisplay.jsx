import { useMemo, useState, useEffect, useCallback, useRef } from "react";
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
import DisplayPrefsPanel from "./DisplayPrefsPanel.jsx";
import {
  loadDisplayPrefs,
  saveDisplayPrefs,
  buildDangerSet,
  syllableKey,
  SIZE_SCALE,
  DEFAULT_PREFS,
} from "../../services/displayPrefs.js";

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

function Menu({ trigger, children, align = "left" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const close = () => setOpen(false);
  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger(open)}</div>
      {open && (
        <div className={`absolute z-20 mt-1 min-w-[160px] rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shadow-lg py-1 ${align === "right" ? "right-0" : "left-0"}`}>
          {typeof children === "function" ? children({ close }) : children}
        </div>
      )}
    </div>
  );
}

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
  const [displayPrefs, setDisplayPrefs] = useState(() => ({ ...DEFAULT_PREFS }));

  // Load beatsPerBar first so useChordEditor gets the right value
  useEffect(() => {
    if (!storageId) return;
    setSectionMap(loadSections(storageId));
    const meta = loadMetaForSong(storageId);
    setBeatsPerBar(Number(meta.beatsPerBar) || 4);
    setDisplayPrefs(loadDisplayPrefs(storageId));
  }, [storageId]);

  const updateDisplayPrefs = useCallback((next) => {
    setDisplayPrefs(next);
    if (storageId) saveDisplayPrefs(storageId, next);
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

  // Per-syllable danger set: "lineIdx:sylIdx" → true
  const dangerSet = useMemo(() => buildDangerSet(linesWithChords), [linesWithChords]);

  // If the user picked "danger" but the song has no danger zones, fall through to "all"
  const effectiveJyutping =
    displayPrefs.jyutping === "danger" && dangerSet.size === 0 ? "all" : displayPrefs.jyutping;

  const isSyllableVisible = useCallback((li, si) => {
    if (effectiveJyutping === "all") return true;
    const key = syllableKey(li, si);
    if (effectiveJyutping === "danger") return dangerSet.has(key);
    return Boolean(displayPrefs.customVisible?.[key]);
  }, [effectiveJyutping, dangerSet, displayPrefs.customVisible]);

  const handleSyllableToggle = useCallback((li, si) => {
    if (displayPrefs.jyutping !== "custom") return;
    const key = syllableKey(li, si);
    const next = { ...(displayPrefs.customVisible || {}) };
    if (next[key]) delete next[key];
    else next[key] = true;
    updateDisplayPrefs({ ...displayPrefs, customVisible: next });
  }, [displayPrefs, updateDisplayPrefs]);

  // Switching INTO custom seeds the visible set from the current dangers, so
  // the user starts with the algorithm's opinion and edits from there.
  const handleDisplayPrefsChange = useCallback((next) => {
    if (next.jyutping === "custom" && displayPrefs.jyutping !== "custom") {
      const hasExisting = Object.keys(next.customVisible || {}).length > 0;
      if (!hasExisting) {
        const seed = {};
        for (const key of dangerSet) seed[key] = true;
        next = { ...next, customVisible: seed };
      }
    }
    updateDisplayPrefs(next);
  }, [displayPrefs.jyutping, dangerSet, updateDisplayPrefs]);

  const resetCustomToDangers = useCallback(() => {
    const seed = {};
    for (const key of dangerSet) seed[key] = true;
    updateDisplayPrefs({ ...displayPrefs, customVisible: seed });
  }, [dangerSet, displayPrefs, updateDisplayPrefs]);

  const showAllCustom = useCallback(() => {
    const all = {};
    linesWithChords.forEach((line, li) => {
      line.tokens.forEach((t, si) => {
        if (!t.isTrailing && (t.jyutping || t.pinyin || t.roman)) all[syllableKey(li, si)] = true;
      });
    });
    updateDisplayPrefs({ ...displayPrefs, customVisible: all });
  }, [linesWithChords, displayPrefs, updateDisplayPrefs]);

  const hideAllCustom = useCallback(() => {
    updateDisplayPrefs({ ...displayPrefs, customVisible: {} });
  }, [displayPrefs, updateDisplayPrefs]);

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

      {/* Toolbar — Display (romanization) | Output (stage, export). Authoring is in the overflow menu. */}
      <div className="mb-6 print:hidden" data-touch-targets>
        <div className="flex flex-wrap items-center gap-2">
          {/* Overflow menu: edit lyrics, sections */}
          <Menu
            trigger={(open) => (
              <button
                type="button"
                className={`text-xs font-mono px-3 py-1.5 rounded border transition-all ${
                  open
                    ? "bg-accent/15 border-accent/30 text-accent"
                    : "bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
                aria-haspopup="menu"
                aria-expanded={open}
                title="More"
              >
                ⋯
              </button>
            )}
          >
            {({ close }) => (
              <div role="menu">
                <button
                  type="button"
                  role="menuitem"
                  className="block w-full text-left text-xs font-mono px-3 py-2 text-[var(--color-text-secondary)] hover:bg-accent/8 hover:text-[var(--color-text-primary)] transition-colors"
                  onClick={() => { setShowEditor(true); close(); }}
                >
                  ✎ edit lyrics
                </button>
                <button
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={editSections}
                  className={`block w-full text-left text-xs font-mono px-3 py-2 transition-colors hover:bg-accent/8 ${
                    editSections ? "text-accent" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                  onClick={() => { setEditSections((s) => !s); close(); }}
                >
                  § sections{editSections ? " ✓" : ""}
                </button>
                <div className="my-1 border-t border-[var(--color-border-subtle)]" role="separator" />
                <button
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={chordEditMode}
                  className={`block w-full text-left text-xs font-mono px-3 py-2 transition-colors hover:bg-accent/8 ${
                    chordEditMode ? "text-accent" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                  onClick={() => { dispatch({ type: "TOGGLE_CHORD_EDIT" }); close(); }}
                >
                  ♫ edit chords{chordEditMode ? " ✓" : ""}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="block w-full text-left text-xs font-mono px-3 py-2 text-[var(--color-text-secondary)] hover:bg-accent/8 hover:text-[var(--color-text-primary)] transition-colors"
                  onClick={() => { dispatch({ type: "SET_CHORD_DISPLAY", display: chordDisplay === "above" ? "bars" : "above" }); close(); }}
                >
                  {chordDisplay === "above" ? "| | switch to bar notation" : "A̲ switch to above-lyrics"}
                </button>
              </div>
            )}
          </Menu>

          {/* Display preferences (Jyutping visibility + size) */}
          <Menu
            align="right"
            trigger={(open) => (
              <button
                type="button"
                className={`text-xs font-mono px-3 py-1.5 rounded border transition-all ${
                  open
                    ? "bg-accent/15 border-accent/30 text-accent"
                    : "bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
                aria-haspopup="menu"
                aria-expanded={open}
                title="Display preferences"
              >
                ⚙ display
              </button>
            )}
          >
            <DisplayPrefsPanel
              prefs={displayPrefs}
              onChange={handleDisplayPrefsChange}
            />
          </Menu>

          {/* Romanization dropdown */}
          <Menu
            trigger={(open) => {
              const options = ROMANIZATION_OPTIONS_BY_DIALECT[dialectCode ?? "yue"] ?? ROMANIZATION_OPTIONS_BY_DIALECT.yue;
              const current = options.find((o) => o.value === romanization) ?? options[0];
              return (
                <button
                  type="button"
                  className={`text-xs font-mono px-3 py-1.5 rounded border transition-all inline-flex items-center gap-1.5 ${
                    open
                      ? "bg-accent/15 border-accent/30 text-accent"
                      : "bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                  aria-haspopup="listbox"
                  aria-expanded={open}
                >
                  {current.label}
                  <span aria-hidden="true" className="opacity-60">▾</span>
                </button>
              );
            }}
          >
            {({ close }) => {
              const options = ROMANIZATION_OPTIONS_BY_DIALECT[dialectCode ?? "yue"] ?? ROMANIZATION_OPTIONS_BY_DIALECT.yue;
              return (
                <div role="listbox">
                  {options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={romanization === opt.value}
                      className={`block w-full text-left text-xs font-mono px-3 py-2 transition-colors hover:bg-accent/8 ${
                        romanization === opt.value ? "text-accent" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                      }`}
                      onClick={() => { dispatch({ type: "SET_ROMANIZATION", romanization: opt.value }); close(); }}
                    >
                      {opt.label}{romanization === opt.value ? " ✓" : ""}
                    </button>
                  ))}
                </div>
              );
            }}
          </Menu>

          {hasAnyChords && (
            <div className="flex items-center border border-[var(--color-border-subtle)] rounded-lg overflow-hidden" title="Transpose chords">
              <button
                onClick={() => dispatch({ type: "SET_TRANSPOSE", semitones: transpose - 1 })}
                aria-label="Transpose down one semitone"
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
                aria-label="Transpose up one semitone"
                className="text-xs font-mono px-3 py-1.5 min-w-[40px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-all"
              >
                +
              </button>
            </div>
          )}

          {/* Divider */}
          <span className="w-px h-4 bg-[var(--color-border-subtle)] mx-1" aria-hidden="true" />

          {/* Output */}
          <button
            onClick={() => dispatch({ type: "SET_VIEW", view: "teleprompter" })}
            className="text-xs font-mono px-3 py-1.5 rounded border transition-all bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            title="Teleprompter mode"
          >
            ⛶ stage
          </button>
          <PrintButton />
        </div>
      </div>

      {/* Three-column layout: lyrics | right rail (tone/pronunciation) | chord diagrams */}
      {/* md+: right rail appears. xl: chord diagram column added. */}
      <div className={`grid gap-6 print:block ${isYue ? "xl:grid-cols-[1fr_216px_200px] md:grid-cols-[1fr_216px]" : ""}`}>

        {/* Centre: lyrics — first in DOM for mobile/accessibility */}
        <div style={{ "--lyrics-scale": SIZE_SCALE[displayPrefs.size] ?? 1 }}>
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
                  isSyllableVisible={isSyllableVisible}
                  customMode={displayPrefs.jyutping === "custom"}
                  onSyllableToggle={handleSyllableToggle}
                />
              </div>
            );
          })}

          {/* Keyboard-nav hint — only while a line is focused */}
          {activeLyricIndex >= 0 && (
            <div className="mt-3 text-xs font-mono text-[var(--color-text-muted)] print:hidden">
              ↑↓ navigate · Esc clear
            </div>
          )}

          {/* Tone tools fallback: shown below lyrics on small screens (<md) */}
          {isYue && (
            <div className="md:hidden mt-6 pt-5 border-t border-[var(--color-border-subtle)] space-y-4">
              <PronunciationNotes />
              <ToneAnalytics />
            </div>
          )}
        </div>

        {/* Right rail: pronunciation notes + tone reference + analytics (md+). */}
        {/* Cantonese-specific — hidden for cmn/nan until per-dialect content lands. */}
        <div className="hidden md:flex flex-col gap-6 sticky top-4 self-start min-w-0 w-full">
          {isYue && <PronunciationNotes />}
          {isYue && <ToneReference />}
          {isYue && <ToneAnalytics />}
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
