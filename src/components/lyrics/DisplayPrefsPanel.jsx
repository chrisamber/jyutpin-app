function Segment({ value, options, onChange, ariaLabel }) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex rounded border border-[var(--color-border-subtle)] overflow-hidden"
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={`text-xs font-mono px-3 py-1.5 transition-colors ${
              selected
                ? "bg-accent/15 text-accent"
                : "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function DisplayPrefsPanel({ prefs, onChange }) {
  return (
    <div className="px-3 py-3 min-w-[260px] space-y-4">
      {/* Size */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">
          Size
        </div>
        <Segment
          ariaLabel="Lyric size"
          value={prefs.size}
          onChange={(v) => onChange({ ...prefs, size: v })}
          options={[
            { value: "s", label: "S" },
            { value: "m", label: "M" },
            { value: "l", label: "L" },
          ]}
        />
      </div>
    </div>
  );
}
