import { SINGING_RULES } from "../../data/defaultSong.js";

export default function SingingRules() {
  return (
    <div>
      <h2 className="text-xl font-normal mb-5 text-accent/80">
        The Rules of Cantopop Singing
      </h2>

      <div className="space-y-3.5">
        {SINGING_RULES.map((rule, i) => (
          <div
            key={i}
            className="bg-[var(--color-bg-surface)] rounded-xl p-5"
            style={{ borderLeft: `3px solid ${rule.color}` }}
          >
            <div
              className="text-sm font-semibold mb-2.5"
              style={{ color: rule.color }}
            >
              {rule.title}
            </div>
            <div className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
              {rule.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
