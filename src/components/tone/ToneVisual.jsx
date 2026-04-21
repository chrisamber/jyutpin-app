import { TONE_COLORS } from "../../data/tones.js";

const PATHS = {
  1: "M 5 15 L 55 15",
  2: "M 5 45 Q 30 40 55 10",
  3: "M 5 30 L 55 30",
  4: "M 5 35 Q 30 42 55 50",
  5: "M 5 45 Q 30 42 55 30",
  6: "M 5 48 L 55 48",
};

export default function ToneVisual({ tone, size = 60 }) {
  const t = parseInt(tone);
  if (!PATHS[t]) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      className="inline-block align-middle"
    >
      <rect
        x="0" y="0" width="60" height="60" rx="8"
        className="fill-bg-surface stroke-white/10"
      />
      {[10, 20, 30, 40, 50].map((y, i) => (
        <line
          key={i} x1="5" y1={y} x2="55" y2={y}
          className="stroke-white/5" strokeWidth="0.5"
        />
      ))}
      <path
        d={PATHS[t]} fill="none"
        stroke={TONE_COLORS[t]} strokeWidth="3" strokeLinecap="round"
      />
      <text
        x="30" y="58" textAnchor="middle"
        className="fill-white/40 font-mono" fontSize="8"
      >
        T{t}
      </text>
    </svg>
  );
}
