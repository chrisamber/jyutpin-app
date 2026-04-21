import { TONE_COLORS } from "../../data/tones.js";

export default function ToneBadge({ tone }) {
  const t = parseInt(tone);
  if (!TONE_COLORS[t]) return null;
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-mono text-[10px] font-bold w-5 h-5"
      style={{ backgroundColor: TONE_COLORS[t] + "22", color: TONE_COLORS[t] }}
    >
      {t}
    </span>
  );
}
