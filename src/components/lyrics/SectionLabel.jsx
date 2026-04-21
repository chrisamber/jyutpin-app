/**
 * Shows a section label pill above a lyric line.
 * In edit mode, renders a dropdown to assign/clear the label.
 */
export default function SectionLabel({ label, editing, options, onChange }) {
  if (!editing && !label) return null;

  if (editing) {
    return (
      <div className="mt-3 mb-0.5">
        <select
          value={label || ""}
          onChange={(e) => onChange(e.target.value)}
          className="text-[10px] font-mono bg-bg-surface border border-border-default rounded px-2 py-0.5 text-text-secondary focus:outline-none focus:border-accent/40 hover:border-border-strong transition-colors"
        >
          <option value="">— no section —</option>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="mt-4 mb-0.5 print:mt-5">
      <span className="text-[10px] font-mono uppercase tracking-widest text-accent/50 bg-accent/8 border border-accent/15 px-2.5 py-0.5 rounded-full print:text-gray-500 print:bg-gray-100 print:border-gray-300">
        {label}
      </span>
    </div>
  );
}
