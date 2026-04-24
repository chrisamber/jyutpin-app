import { useState } from "react";
import { useLyricsFetch } from "../../hooks/useLyricsFetch.js";
import { useSongAnalysis } from "../../hooks/useSongAnalysis.js";
import SearchResults from "./SearchResults.jsx";

const PREVIEW_TOKENS = [
  { char: "麻", roman: "maa4", tone: 4 },
  { char: "煩", roman: "faan4", tone: 4 },
  { char: "各", roman: "gok3", tone: 3 },
  { char: "位", roman: "wai6", tone: 6 },
  { char: "都", roman: "dou1", tone: 1 },
  { char: "不", roman: "bat1", tone: 1 },
  { char: "望", roman: "mong6", tone: 6 },
  { char: "我", roman: "ngo5", tone: 5 },
];

function PreviewAnnotation({ char, roman, tone }) {
  const toneColor = `var(--color-tone-${tone})`;
  return (
    <ruby className="mx-1 inline-flex flex-col-reverse items-center">
      <span className="text-2xl leading-tight font-light cjk" style={{ color: toneColor }}>
        {char}
      </span>
      <rp>(</rp>
      <rt className="font-mono text-[11px] leading-none tracking-tight mb-0.5" style={{ color: toneColor }}>
        {roman}
      </rt>
      <rp>)</rp>
    </ruby>
  );
}

export default function SearchHero() {
  const [query, setQuery] = useState("");
  const { results, isSearching, searchError, search, clearResults } = useLyricsFetch();
  const { loadDemoSong, loadFromSearch } = useSongAnalysis();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) search(query);
  };

  const handleSelect = (result) => {
    loadFromSearch(result);
    clearResults();
  };

  return (
    <div>
      <section className="flex flex-col items-center pt-[var(--space-10)] pb-[var(--space-8)]">
        {/* Hero headline + tagline */}
        <h2 className="text-center text-3xl sm:text-4xl font-light tracking-tight leading-[1.15] mb-3">
          Sing what you{" "}
          <span className="text-[var(--color-accent)] font-normal italic">speak.</span>
        </h2>
        <p className="text-center text-[var(--color-text-secondary)] text-base sm:text-lg font-light leading-snug mb-6 max-w-md mx-auto">
          Jyutping lyrics and chords for Cantopop songs.
        </p>

        {/* Search form */}
        <form onSubmit={handleSearch} className="w-full max-w-lg mb-3" data-touch-targets>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a song or artist… or 中文"
              className="w-full input focus-ring rounded-xl text-base h-12 pl-4 pr-28"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-md btn-primary disabled:opacity-40"
            >
              {isSearching ? "…" : "Search"}
            </button>
          </div>
        </form>

        {searchError && (
          <p className="text-red-400/80 text-xs mb-3 font-mono">{searchError}</p>
        )}

        {results.length > 0 && (
          <SearchResults results={results} onSelect={handleSelect} />
        )}

        {/* Single demo link */}
        <div className="mt-3 text-center" data-touch-targets>
          <button
            onClick={() => loadDemoSong("yue")}
            className="text-sm font-mono text-[var(--color-accent)]/70 hover:text-[var(--color-accent)] transition-colors underline underline-offset-4 decoration-[var(--color-accent)]/20 hover:decoration-[var(--color-accent)]/50"
          >
            Try the demo: <span className="cjk">背脊唱情歌</span>
          </button>
        </div>

        {/* Visual preview — tone-coloured Jyutping over a Cantonese lyric */}
        <div className="mt-10 px-4 py-5 w-full max-w-xl text-center">
          <div className="flex flex-wrap justify-center items-end leading-loose gap-0.5">
            {PREVIEW_TOKENS.map((t, i) => (
              <PreviewAnnotation key={i} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* Below the fold — "What is this?" collapsible */}
      <section className="max-w-xl mx-auto px-[var(--space-4)] pb-[var(--space-12)]">
        <details className="group pt-4">
          <summary className="cursor-pointer list-none flex items-center justify-between text-sm font-mono text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors focus-ring rounded">
            <span>What is this?</span>
            <span
              className="text-[var(--color-text-muted)] transition-transform duration-200 group-open:rotate-45"
              aria-hidden="true"
            >
              +
            </span>
          </summary>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)] font-light">
            <p>
              WaaPou helps you sing along to Cantonese songs. Paste or search a song and
              it comes back with the lyrics, a romanized pronunciation guide for every
              syllable, and colour-coded hints so you can hear the melody of the words.
            </p>
            <p>
              You can mark up the song with chords, practice with the on-screen prompter,
              and print a clean page to take to rehearsal.
            </p>
            <p>
              It&apos;s an early prototype — for now the experience is best on the sample
              song. Search works for any track, but the extras shine on the demo.
            </p>
          </div>
        </details>
      </section>
    </div>
  );
}
