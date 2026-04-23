export default function Overview() {
  return (
    <div>
      <h2 className="text-xl font-normal mb-5 text-accent/80">
        Why This Method Exists
      </h2>
      <p className="text-sm leading-relaxed text-slate-600 mb-5">
        Unlike Mandarin pop — where the melody can override tones and context
        fills the gaps — Cantopop demands that the melody{" "}
        <em>follows</em> the tones. Research shows that modern Cantopop
        achieves near-perfect tone-melody matching, with mismatches appearing in
        fewer than 2% of lyrics across sampled songs. This means:{" "}
        <strong className="text-[var(--color-text-primary)]">
          if you get the tone wrong, you're not just mispronouncing — you're
          singing the wrong melody.
        </strong>
      </p>
      <p className="text-sm leading-relaxed text-slate-600 mb-5">
        Cantopop songwriters use an ordinal mapping system: a syllable with Tone
        1 must be higher in melodic pitch than one with Tone 3. Tone 3 must be
        higher than Tone 6. This relative ordering IS the melody. Your job as a
        singer is to internalize this ordering so deeply that tonal accuracy
        becomes melodic accuracy.
      </p>

      <div className="bg-accent/4 border border-accent/15 rounded-xl p-5 mb-6">
        <div className="text-xs font-mono text-accent/60 tracking-widest mb-3">
          YOUR PROFILE
        </div>
        <div className="text-[13px] leading-relaxed text-slate-600 space-y-1">
          <div>
            <span className="text-green-400">&#10003;</span> Understands
            Jyutping romanization
          </div>
          <div>
            <span className="text-green-400">&#10003;</span> Can "scoop" tones 2
            and 5 (rising tones)
          </div>
          <div>
            <span className="text-amber-400">&#9651;</span> Moderate consonant
            delivery
          </div>
          <div>
            <span className="text-red-400">&#10007;</span> Telltale non-native
            markers remain
          </div>
        </div>
      </div>

      <div className="bg-red-500/4 border border-red-500/15 rounded-xl p-5">
        <div className="text-xs font-mono text-red-500/60 tracking-widest mb-3">
          THE THREE TELLTALE MARKERS
        </div>
        <div className="text-[13px] leading-relaxed text-slate-600 space-y-4">
          <div>
            <strong className="text-red-400">
              1. Releasing stop consonants.
            </strong>{" "}
            English speakers add a burst of air after -p, -t, -k. In Cantonese,
            these are unreleased. Your tongue/lips close but no air escapes.
            This is the #1 giveaway in singing.
          </div>
          <div>
            <strong className="text-red-400">
              2. Missing ng- initials.
            </strong>{" "}
            The velar nasal onset (as in 我 ngo5, 眼 ngaan5, 捱 ngaai4) doesn't
            exist in English word-initially. Dropping it marks you as non-native
            within the first syllable.
          </div>
          <div>
            <strong className="text-red-400">
              3. Tone 4 vs Tone 6 collapse.
            </strong>{" "}
            Both are low-register. Tone 4 falls (21), Tone 6 sits flat (22).
            Non-native ears often hear them as identical. In this song, 望
            (mong6, gaze) vs 忘 (mong4, forget) — same sounds, different tones —
            is the emotional pivot.
          </div>
        </div>
      </div>
    </div>
  );
}
