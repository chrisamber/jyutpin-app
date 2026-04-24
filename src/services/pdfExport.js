/**
 * Export a leadsheet as a PDF with embedded metadata.
 * Builds an off-screen render target, captures it with html2canvas,
 * then saves via jsPDF. Lazy-loaded to avoid blocking initial render.
 */

import { TONE_COLORS, TONE_NAMES } from "../data/tones.js";
import { transposeChord } from "./transpose.js";
import { getChordShape } from "./chordLookup.js";
import { collectUsedChords } from "./chordStorage.js";

function toneColor(tone) {
  return TONE_COLORS[tone] || "#334155";
}

// Chord-row helper: renders a bar-grid as compact monospace text above a lyric line.
// Inline styles (not CSS classes) so html2canvas captures them reliably.
function buildChordRow(barGrid, beatsPerBar, transpose) {
  if (!barGrid || !barGrid.length) return null;
  const row = document.createElement("div");
  Object.assign(row.style, {
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    fontSize: "11px",
    color: "#d97706",
    marginBottom: "2px",
    paddingLeft: "28px",
    lineHeight: "1.2",
    whiteSpace: "nowrap",
  });
  const mkBracket = () => {
    const s = document.createElement("span");
    s.textContent = "|";
    s.style.color = "rgba(217, 119, 6, 0.3)";
    return s;
  };
  for (let bi = 0; bi < barGrid.length; bi++) {
    row.appendChild(mkBracket());
    const beats = barGrid[bi];
    for (let pi = 0; pi < beatsPerBar; pi++) {
      const beat = beats[pi];
      const span = document.createElement("span");
      Object.assign(span.style, {
        display: "inline-block",
        minWidth: "18px",
        textAlign: "center",
      });
      if (beat === ".") {
        span.textContent = "·";
        span.style.color = "#cbd5e1";
      } else if (beat === "-") {
        span.textContent = "–";
        span.style.color = "#cbd5e1";
      } else if (beat) {
        span.textContent = transposeChord(beat, transpose);
        span.style.fontWeight = "700";
      } else {
        span.innerHTML = "&nbsp;";
      }
      row.appendChild(span);
    }
  }
  row.appendChild(mkBracket());
  return row;
}

// Per-token chord row: fallback for lines without a barGrid but with chords
// attached directly to tokens (non-yue dialects and user edits).
function buildTokenChordRow(tokens, transpose) {
  if (!tokens.some((t) => t.chord)) return null;
  const row = document.createElement("div");
  Object.assign(row.style, {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-end",
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    fontSize: "11px",
    fontWeight: "700",
    color: "#d97706",
    marginBottom: "2px",
    marginLeft: "28px",
    lineHeight: "1.2",
  });
  for (const t of tokens) {
    const cell = document.createElement("span");
    Object.assign(cell.style, {
      display: "inline-block",
      minWidth: "20px",
      textAlign: "center",
      margin: "0 2px",
    });
    cell.textContent = t.chord ? transposeChord(t.chord, transpose) : "\u00a0";
    row.appendChild(cell);
  }
  return row;
}

// Chord-sheet page: all used-chord diagrams on a fresh page.
// `beatsPerBar` is accepted for signature coherence with `buildChordRow` /
// `buildContainer`; it isn't read inside this function today.
function buildChordSheetPage(chordMap, beatsPerBar, transpose) {
  void beatsPerBar;
  const usedChords = collectUsedChords(chordMap);
  if (!usedChords.length) return null;

  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  Object.assign(el.style, {
    position: "absolute",
    left: "-9999px",
    top: "0",
    width: "794px",
    backgroundColor: "#ffffff",
    padding: "56px",
    fontFamily: "Inter, system-ui, sans-serif",
    color: "#0f172a",
    boxSizing: "border-box",
  });

  // Page header
  const header = document.createElement("div");
  Object.assign(header.style, { marginBottom: "32px", paddingBottom: "16px", borderBottom: "2px solid #000" });
  const heading = document.createElement("div");
  heading.textContent = "Chord Sheet";
  Object.assign(heading.style, {
    fontSize: "20px", fontWeight: "700", color: "#000",
    fontFamily: "'Noto Serif SC', 'Songti SC', Georgia, serif",
  });
  header.appendChild(heading);
  const sub = document.createElement("div");
  sub.textContent = "Guitar fingerings";
  Object.assign(sub.style, { fontSize: "11px", color: "#64748b", marginTop: "4px" });
  header.appendChild(sub);
  el.appendChild(header);

  // Grid: 4 per row
  const grid = document.createElement("div");
  Object.assign(grid.style, { display: "flex", flexWrap: "wrap", gap: "24px" });

  const svgW = 74, svgH = 72, ml = 14, mt = 16, ss = 10, fs = 11, nutH = 3;
  const mkSvg = () => document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const ns = (_el, t) => document.createElementNS("http://www.w3.org/2000/svg", t);
  const attr = (el2, k, v) => el2.setAttribute(k, v);

  for (const rawChord of usedChords) {
    const transposed = transposeChord(rawChord, transpose);
    const shape = getChordShape(transposed);
    const label = transposed.split("/")[0];

    if (!shape) {
      const pill = document.createElement("div");
      Object.assign(pill.style, {
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "1px solid #e2e8f0", backgroundColor: "#f1f5f9",
        color: "#d97706", fontFamily: "JetBrains Mono, monospace",
        fontWeight: "700", fontSize: "11px", borderRadius: "4px",
        width: "74px", height: "72px",
      });
      pill.textContent = label;
      grid.appendChild(pill);
      continue;
    }

    const { frets, barre, baseFret = 1 } = shape;
    const isOpen = baseFret === 1;

    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, { display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" });

    const nameEl = document.createElement("span");
    nameEl.textContent = label;
    Object.assign(nameEl.style, {
      fontSize: "10px", fontFamily: "JetBrains Mono, monospace",
      fontWeight: "700", color: "#d97706", lineHeight: "1", marginBottom: "2px",
    });
    wrapper.appendChild(nameEl);

    const svg = mkSvg();
    svg.setAttribute("width", svgW);
    svg.setAttribute("height", svgH);
    svg.style.overflow = "visible";

    if (isOpen) {
      const nut = ns(svg, "rect");
      attr(nut, "x", ml); attr(nut, "y", mt - nutH);
      attr(nut, "width", 5 * ss); attr(nut, "height", nutH);
      attr(nut, "fill", "#636370"); attr(nut, "rx", "1");
      svg.appendChild(nut);
    } else {
      const fl = ns(svg, "text");
      attr(fl, "x", ml - 3); attr(fl, "y", mt + fs * 0.6);
      attr(fl, "font-size", "7"); attr(fl, "fill", "#636370");
      attr(fl, "font-family", "JetBrains Mono, monospace"); attr(fl, "text-anchor", "end");
      fl.textContent = baseFret + "fr";
      svg.appendChild(fl);
    }

    for (let fi = 0; fi <= 4; fi++) {
      const l = ns(svg, "line");
      attr(l, "x1", ml); attr(l, "y1", mt + fi * fs);
      attr(l, "x2", ml + 5 * ss); attr(l, "y2", mt + fi * fs);
      attr(l, "stroke", "#ffffff18"); attr(l, "stroke-width", "1");
      svg.appendChild(l);
    }
    for (let si = 0; si < 6; si++) {
      const l = ns(svg, "line");
      attr(l, "x1", ml + si * ss); attr(l, "y1", mt);
      attr(l, "x2", ml + si * ss); attr(l, "y2", mt + 4 * fs);
      attr(l, "stroke", "#ffffff30"); attr(l, "stroke-width", "1");
      svg.appendChild(l);
    }

    if (barre) {
      const by = mt + (barre.fret - baseFret) * fs - fs / 2;
      const bx = ml + barre.fromString * ss;
      const bEl = ns(svg, "rect");
      attr(bEl, "x", bx - 4); attr(bEl, "y", by - 4);
      attr(bEl, "width", 5 * ss - bx + ml + 8); attr(bEl, "height", 8);
      attr(bEl, "rx", "4"); attr(bEl, "fill", "#F59E0B"); attr(bEl, "opacity", "0.8");
      svg.appendChild(bEl);
    }

    frets.forEach((fret, si) => {
      const sx = ml + si * ss;
      if (fret === -1) {
        const t = ns(svg, "text");
        attr(t, "x", sx); attr(t, "y", mt - nutH - 2);
        attr(t, "font-size", "7"); attr(t, "fill", "#636370");
        attr(t, "text-anchor", "middle"); attr(t, "font-family", "JetBrains Mono, monospace");
        t.textContent = "×";
        svg.appendChild(t);
      } else if (fret === 0) {
        const c = ns(svg, "circle");
        attr(c, "cx", sx); attr(c, "cy", mt - nutH - 4);
        attr(c, "r", "3"); attr(c, "fill", "none");
        attr(c, "stroke", "#636370"); attr(c, "stroke-width", "1");
        svg.appendChild(c);
      } else {
        if (barre && fret === barre.fret && si >= barre.fromString) return;
        const cy = mt + (fret - baseFret + 0.5) * fs;
        const d = ns(svg, "circle");
        attr(d, "cx", sx); attr(d, "cy", cy);
        attr(d, "r", "4"); attr(d, "fill", "#F59E0B");
        svg.appendChild(d);
      }
    });

    wrapper.appendChild(svg);
    grid.appendChild(wrapper);
  }

  el.appendChild(grid);
  return el;
}

function buildContainer(song, lines, { beatsPerBar = 4, transpose = 0, chordMap = {} } = {}) {
  void chordMap;
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  Object.assign(el.style, {
    position: "absolute",
    left: "-9999px",
    top: "0",
    width: "794px",
    backgroundColor: "#ffffff",
    padding: "56px",
    fontFamily: "Inter, system-ui, sans-serif",
    color: "#0f172a",
    boxSizing: "border-box",
  });

  // ── Header ──
  const header = document.createElement("div");
  Object.assign(header.style, {
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "2px solid #000",
  });

  const title = document.createElement("div");
  title.textContent = song?.title || "";
  Object.assign(title.style, {
    fontSize: "24px",
    fontWeight: "700",
    color: "#000",
    fontFamily: "'Noto Serif SC', 'Songti SC', Georgia, serif",
  });
  header.appendChild(title);

  const meta = document.createElement("div");
  Object.assign(meta.style, {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: "4px",
  });
  const artistEl = document.createElement("div");
  artistEl.textContent = [song?.artist, song?.album].filter(Boolean).join(" · ");
  Object.assign(artistEl.style, { fontSize: "13px", color: "#4b5563" });

  let total = 0, entering = 0;
  for (const line of lines) {
    for (const t of line.tokens) {
      const rom = t.jyutping || t.roman;
      if (rom && t.tone) {
        total++;
        if (/[ptk]\d$/.test(rom)) entering++;
      }
    }
  }
  const statsEl = document.createElement("div");
  statsEl.textContent = `${lines.length} lines · ${total} syllables · ${entering} entering tones`;
  Object.assign(statsEl.style, { fontSize: "9px", fontFamily: "monospace", color: "#9ca3af" });
  meta.appendChild(artistEl);
  meta.appendChild(statsEl);
  header.appendChild(meta);

  const legend = document.createElement("div");
  Object.assign(legend.style, { display: "flex", gap: "12px", marginTop: "12px" });
  for (let t = 1; t <= 6; t++) {
    const span = document.createElement("span");
    span.innerHTML = `<strong>T${t}</strong> ${TONE_NAMES[t]}`;
    Object.assign(span.style, {
      fontSize: "8px",
      fontFamily: "monospace",
      color: toneColor(t),
    });
    legend.appendChild(span);
  }
  header.appendChild(legend);
  el.appendChild(header);

  // ── Lines ──
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isEmpty = line.tokens.every((t) => {
      const rom = t.jyutping || t.roman;
      return !rom || t.char.trim() === "";
    });

    if (isEmpty) {
      const gap = document.createElement("div");
      gap.style.height = "10px";
      el.appendChild(gap);
      continue;
    }

    // Chord row above the lyric line: prefer barGrid (yue curated), fall back
    // to per-token chords (non-yue dialects and user edits).
    if (line.barGrid) {
      const chordRow = buildChordRow(line.barGrid, beatsPerBar, transpose);
      if (chordRow) el.appendChild(chordRow);
    } else {
      const tokenChordRow = buildTokenChordRow(line.tokens, transpose);
      if (tokenChordRow) el.appendChild(tokenChordRow);
    }

    const row = document.createElement("div");
    Object.assign(row.style, {
      display: "flex",
      alignItems: "flex-start",
      gap: "8px",
      paddingTop: "6px",
      paddingBottom: "6px",
      borderBottom: "1px solid #f1f5f9",
    });

    const num = document.createElement("span");
    num.textContent = String(i + 1).padStart(2, "0");
    Object.assign(num.style, {
      fontFamily: "monospace",
      fontSize: "10px",
      color: "#cbd5e1",
      minWidth: "20px",
      paddingTop: "8px",
      userSelect: "none",
      flexShrink: "0",
    });
    row.appendChild(num);

    const tokenWrap = document.createElement("div");
    Object.assign(tokenWrap.style, {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "flex-end",
      flex: "1",
    });

    for (const t of line.tokens) {
      const rom = t.jyutping || t.roman;
      if (!rom || t.char.trim() === "") {
        const sp = document.createElement("span");
        sp.textContent = t.char;
        Object.assign(sp.style, {
          color: "#cbd5e1",
          margin: "0 2px",
          fontSize: "18px",
          alignSelf: "flex-end",
          paddingBottom: "2px",
        });
        tokenWrap.appendChild(sp);
        continue;
      }

      const color = toneColor(t.tone);
      const isEntering = /[ptk]\d$/.test(rom);

      // Stacked column: romanization above, character below.
      // Avoids <ruby>/<rb>, which html2canvas 1.4.x fails to rasterize
      // (default display: ruby-base isn't supported by the renderer).
      const stack = document.createElement("span");
      Object.assign(stack.style, {
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        margin: "0 2px 6px",
        lineHeight: "1",
      });

      const rt = document.createElement("span");
      rt.textContent = rom;
      Object.assign(rt.style, {
        fontSize: "9px",
        fontFamily: "'JetBrains Mono', monospace",
        lineHeight: "1",
        color,
        opacity: "0.85",
        marginBottom: "2px",
        whiteSpace: "nowrap",
      });

      const rb = document.createElement("span");
      rb.textContent = t.char;
      Object.assign(rb.style, {
        fontSize: "18px",
        lineHeight: "1.1",
        fontWeight: isEntering ? "600" : "400",
        color,
        fontFamily: "'Noto Serif SC', 'Songti SC', Georgia, serif",
      });

      stack.appendChild(rt);
      stack.appendChild(rb);
      tokenWrap.appendChild(stack);
    }

    row.appendChild(tokenWrap);
    el.appendChild(row);
  }

  // ── Footer ──
  const footer = document.createElement("div");
  footer.textContent = "華譜 WaaPou · waapou.app · An Amber Audio product";
  Object.assign(footer.style, {
    marginTop: "32px",
    paddingTop: "12px",
    borderTop: "1px solid #e5e7eb",
    fontSize: "8px",
    fontFamily: "monospace",
    color: "#9ca3af",
    textAlign: "center",
  });
  el.appendChild(footer);

  return el;
}

export async function exportLeadsheetPdf(song, lines, opts = {}) {
  const { beatsPerBar = 4, transpose = 0, chordMap = {} } = opts;
    const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  const container = buildContainer(song, lines, { beatsPerBar, transpose, chordMap });
  document.body.appendChild(container);

  try {
    await document.fonts.ready;

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    pdf.setProperties({
      title: song?.title || "Leadsheet",
      author: song?.artist || "",
      subject: [song?.title, song?.artist, song?.album].filter(Boolean).join(" · "),
      keywords: "Cantonese, Jyutping, tones, leadsheet, WaaPou, Amber Audio",
      creator: "WaaPou · waapou.app · An Amber Audio product",
    });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height * pageW) / canvas.width;

    let y = 0;
    while (y < imgH) {
      if (y > 0) pdf.addPage();
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, -y, imgW, imgH);
      y += pageH;
    }

    // Chord sheet as a new page
    const chordSheetEl = buildChordSheetPage(chordMap, beatsPerBar, transpose);
    if (chordSheetEl) {
      document.body.appendChild(chordSheetEl);
      try {
        await document.fonts.ready;
        const csCanvas = await html2canvas(chordSheetEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        });
        pdf.addPage();
        const csImgW = pageW;
        const csImgH = (csCanvas.height * pageW) / csCanvas.width;
        let csY = 0;
        while (csY < csImgH) {
          if (csY > 0) pdf.addPage();
          pdf.addImage(csCanvas.toDataURL("image/png"), "PNG", 0, -csY, csImgW, csImgH);
          csY += pageH;
        }
      } finally {
        document.body.removeChild(chordSheetEl);
      }
    }

    const raw = `${song?.title || "leadsheet"}${song?.artist ? " - " + song.artist : ""}`;
    pdf.save(raw.replace(/[/\\?%*:|"<>]/g, "-") + ".pdf");
  } finally {
    document.body.removeChild(container);
  }
}