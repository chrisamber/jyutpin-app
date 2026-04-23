import { getChordShape } from "../../services/chordLookup.js";

const STRING_COUNT = 6;
const FRET_COUNT = 4;
const STRING_SPACING = 10;
const FRET_SPACING = 11;
const MARGIN_LEFT = 14;
const MARGIN_TOP = 16;

const W = MARGIN_LEFT + (STRING_COUNT - 1) * STRING_SPACING + 10;
const H = MARGIN_TOP + FRET_COUNT * FRET_SPACING + 8;

export default function ChordDiagram({ chord, size = 1 }) {
  const shape = getChordShape(chord);
  const label = chord.split("/")[0]; // strip bass for display

  if (!shape) {
    // No shape known — render name-only pill
    return (
      <div
        className="flex items-center justify-center rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] text-accent font-mono font-bold text-[11px]"
        style={{ width: W * size, height: H * size, fontSize: 11 * size }}
      >
        {label}
      </div>
    );
  }

  const { frets, barre, baseFret = 1 } = shape;
  const scaledW = W * size;
  const scaledH = H * size;
  const ml = MARGIN_LEFT * size;
  const mt = MARGIN_TOP * size;
  const ss = STRING_SPACING * size;
  const fs = FRET_SPACING * size;
  const dotR = 4 * size;
  const nutH = 3 * size;
  const isOpenPosition = baseFret === 1;

  const ariaLabel = `${chord} chord diagram: frets [${frets.map(f => f === -1 ? 'x' : f).join(', ')}]`;

  return (
    <div className="flex flex-col items-center gap-0.5">
      {/* Chord name */}
      <span className="text-[10px] font-mono font-bold text-accent leading-none mb-1">
        {label}
      </span>

      <svg 
        width={scaledW} 
        height={scaledH} 
        className="overflow-visible" 
        role="img" 
        aria-label={ariaLabel}
      >
        <title>{ariaLabel}</title>
        
        {/* Nut (thick top bar for open-position chords) */}
        {isOpenPosition && (
          <rect
            x={ml}
            y={mt - nutH}
            width={(STRING_COUNT - 1) * ss}
            height={nutH}
            fill="#636370"
            rx={1}
          />
        )}

        {/* Fret position label (e.g. "4fr") for barre chords up the neck */}
        {!isOpenPosition && (
          <text
            x={ml - 3 * size}
            y={mt + fs * 0.6}
            fontSize={7 * size}
            fill="#636370"
            fontFamily="JetBrains Mono, monospace"
            textAnchor="end"
          >
            {baseFret}fr
          </text>
        )}

        {/* Horizontal fret lines */}
        {Array.from({ length: FRET_COUNT + 1 }).map((_, fi) => (
          <line
            key={fi}
            x1={ml}
            y1={mt + fi * fs}
            x2={ml + (STRING_COUNT - 1) * ss}
            y2={mt + fi * fs}
            stroke="#FFFFFF18"
            strokeWidth={size}
          />
        ))}

        {/* Vertical string lines */}
        {Array.from({ length: STRING_COUNT }).map((_, si) => (
          <line
            key={si}
            x1={ml + si * ss}
            y1={mt}
            x2={ml + si * ss}
            y2={mt + FRET_COUNT * fs}
            stroke="#FFFFFF30"
            strokeWidth={size}
          />
        ))}

        {/* Barre indicator */}
        {barre && (() => {
          const barreY = mt + (barre.fret - baseFret) * fs - fs / 2;
          const fromX = ml + barre.fromString * ss;
          const toX = ml + (STRING_COUNT - 1) * ss;
          return (
            <rect
              key="barre"
              x={fromX - dotR}
              y={barreY - dotR}
              width={toX - fromX + dotR * 2}
              height={dotR * 2}
              rx={dotR}
              fill="#F59E0B"
              opacity={0.8}
            />
          );
        })()}

        {/* Per-string markers */}
        {frets.map((fret, si) => {
          const x = ml + si * ss;

          if (fret === -1) {
            // Muted string — X above nut
            return (
              <text
                key={si}
                x={x}
                y={mt - nutH - 2 * size}
                fontSize={7 * size}
                fill="#636370"
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
              >
                ×
              </text>
            );
          }

          if (fret === 0) {
            // Open string — circle above nut
            return (
              <circle
                key={si}
                cx={x}
                cy={mt - nutH - 4 * size}
                r={3 * size}
                fill="none"
                stroke="#636370"
                strokeWidth={size}
              />
            );
          }

          // Skip dots that are part of a barre (already drawn)
          if (barre && fret === barre.fret && si >= barre.fromString) {
            return null;
          }

          const adjustedFret = fret - baseFret + 1;
          const cy = mt + (adjustedFret - 0.5) * fs;
          return (
            <circle key={si} cx={x} cy={cy} r={dotR} fill="#F59E0B" />
          );
        })}
      </svg>
    </div>
  );
}