import ToneVisual from "../tone/ToneVisual.jsx";
import { TONE_COLORS, TONE_NAMES } from "../../data/tones.js";

const TONE_DESCRIPTIONS = {
  1: "Like singing and holding a high note. Think the top of your comfortable range. Example: 歌 go1 (song), 心 sam1 (heart).",
  2: "Your dramatic scoop — starts low, rises high. It's the question-mark tone. Example: 揀 gaan2 (choose), 裸 lo2 (naked).",
  3: "Your comfortable speaking pitch. Not high, not low. Most consonant-heavy words land here. Example: 唱 coeng3 (sing), 痛 tung3 (pain).",
  4: "Starts low and sinks lower. Like a disappointed sigh. Example: 情 cing4 (emotion), 忘 mong4 (forget). Confused constantly with T6.",
  5: "The gentle rise — NOT as dramatic as T2. Rises from low to mid only. Think: resigned acceptance that lifts slightly. Example: 眼 ngaan5 (eye), 我 ngo5 (I/me).",
  6: "The basement. Flat and low. Don't let it creep up. Example: 望 mong6 (gaze), 靜 zing6 (silent). Often confused with T4.",
};

export default function ToneSystem() {
  return (
    <div>
      <h2 className="text-xl font-normal mb-2 text-accent/80">
        The Six Tones for Singers
      </h2>
      <p className="text-[13px] leading-relaxed text-slate-500 mb-6">
        Forget the "nine tones" debate. For singing, you need six pitch contours
        plus awareness that entering tones (-p, -t, -k finals) are shortened
        versions of tones 1, 3, and 6. The mnemonic: 風水到時我哋 (fung1 seoi2
        dou3 si4 ngo5 dei6).
      </p>

      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((t) => (
          <div
            key={t}
            className="flex items-center gap-4 bg-slate-50 rounded-xl px-4 py-3.5"
            style={{ border: `1px solid ${TONE_COLORS[t]}22` }}
          >
            <ToneVisual tone={t} size={56} />
            <div>
              <div
                className="text-sm font-semibold"
                style={{ color: TONE_COLORS[t] }}
              >
                Tone {t} — {TONE_NAMES[t]}
              </div>
              <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                {TONE_DESCRIPTIONS[t]}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-500/4 border border-blue-500/15 rounded-xl p-5 mt-6">
        <div className="text-xs font-mono text-blue-400/70 tracking-widest mb-3">
          ENTERING TONES IN SINGING
        </div>
        <div className="text-[13px] leading-relaxed text-slate-600">
          Syllables ending in -p, -t, -k carry "entering tones" — they share
          the pitch of tones 1, 3, or 6 but are{" "}
          <strong className="text-[var(--color-text-primary)]">cut short</strong> by the
          unreleased stop. In singing, this creates staccato moments within
          legato phrases. Words like 畢 (bat1), 失 (sat1), 脊 (zek3), 戳
          (coek3) are rhythmic punctuation marks. The stop consonant must close
          WITHOUT releasing air. In this song alone, there are 10+ entering-tone
          words at critical emotional moments.
        </div>
      </div>
    </div>
  );
}
