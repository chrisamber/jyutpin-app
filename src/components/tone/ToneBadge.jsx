export default function ToneBadge({ tone }) {
  const t = parseInt(tone);
  if (!t || t < 1 || t > 6) return null;
  return (
    <span
      className="inline-flex items-center justify-center rounded font-mono text-[10px] font-bold w-5 h-5"
      style={{ backgroundColor: `color-mix(in srgb, var(--color-tone-${t}) 15%, transparent)`, color: `var(--color-tone-${t})`, borderColor: `color-mix(in srgb, var(--color-tone-${t}) 25%, transparent)` }}
    >
      {t}
    </span>
  );
}
