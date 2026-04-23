# WaaPou — Sprint Runbook (Human-in-the-Loop)

> **This file is for you, the human operator — not Claude.** Claude reads [CLAUDE.md](CLAUDE.md) and the `docs/claude-context/` set for spec. You read this file to orchestrate sprints: which one is open, what to paste, how to know it's done.
>
> Strategic view lives in [product-roadmap.md](product-roadmap.md). This file is the *execution loop* that drives the roadmap forward one sprint at a time.

## Operator rules

1. **One sprint open at a time.** Close S(n) fully before opening S(n+1).
2. **Gate before next.** Do not paste the next sprint's prompt until every box in the current sprint's **Gate** is ticked.
3. **Demos are the source of truth.** Before closing, load the curated demo (背脊唱情歌) *and* one custom/LRCLIB song, click through the affected flows.
4. **Log as you go.** When Claude finishes a sprint, append an entry to §Sprint log at the bottom of this file. Next session reads that entry to rehydrate — no re-briefing needed.
5. **2× budget = stop.** If a sprint blows past double its hour budget, halt and use the **Emergency override** section.

## Commit hygiene

One commit per sprint sub-item. A sprint with 4 sub-items produces 4 commits. This keeps `git revert` surgical if one sub-item breaks something and the others are fine.

---

## Model routing

| Sprint | Model | Why |
|---|---|---|
| S1 · Accessibility Critical | **Sonnet** | Clear scope — one token change + ARIA patterns. Low architectural risk. |
| S2 · Beat-Grid Chord System | **Opus** | Nested data migration touches persistence. Ripples to PDF export + future sync layer. |
| S3 · Accessibility Sprint 2 | **Sonnet** | Feature-shaped cleanup, clear acceptance per item. |
| S4 · Docs & backlog groom | **Haiku** | Categorization, doc edits, no code. |

Verification passes / QA-CHECKLIST.md run-throughs → **Haiku**.

On Claude Max x5 the budget lets you waste a few tokens, but match model to shape anyway: Opus on a typo is latency tax, Haiku on a storage migration is risk.

---

## S1 — Accessibility Critical (Tier 1)

**Why this exists:** A WCAG 2.1 AA audit (see `product-roadmap.md` Theme B) found 4 critical blockers for keyboard and screen reader users. One is a single-token fix that cascades to dozens of components; the other three are well-known ARIA patterns. High leverage, low risk.

**Budget:** 3–5 hours total. If you're past 10 hours, stop.

**Scope (four sub-items, one commit each):**

| ID | What | Files |
|---|---|---|
| A1.1 | Darken `--color-text-muted` | `src/index.css` |
| A1.2 | Modal focus trap + dialog role | `src/components/AddSongModal.jsx` |
| A1.3 | ARIA tabs pattern | `src/components/TabNav.jsx` |
| A1.4 | SVG chord diagram accessibility | `src/components/ChordDiagram.jsx` |

### Paste-ready prompt

```
Start S1 — Accessibility Critical. Sonnet-grade.

Context you need (read before editing):
1. CLAUDE.md (routing), docs/claude-context/design-system.md (tokens), docs/claude-context/architecture.md (component conventions).
2. product-roadmap.md — Theme B "Accessibility Sprint 1 (Critical)" table. That table IS the spec for this sprint.
3. Current state of these files:
   - src/index.css (token definitions; find --color-text-muted)
   - src/components/AddSongModal.jsx (modal that currently lacks role/focus trap)
   - src/components/TabNav.jsx (tabs currently rendered as divs/buttons without aria)
   - src/components/ChordDiagram.jsx (SVG without role/label)

Plan as a TodoList with exactly 4 items (A1.1–A1.4) before editing. One commit per item.

A1.1 — Darken --color-text-muted
- Change the token from #94A3B8 to #6B7280 in src/index.css.
- Visually spot-check: load the demo song, check section labels, timestamps, metadata rows. They should remain legible on white AND not appear too dark on the amber accent backgrounds.
- Acceptance: contrast against white ≥ 4.5:1 (WCAG AA body text).

A1.2 — Modal focus trap + dialog role
- Add role="dialog", aria-modal="true", aria-labelledby pointing to the modal's title id.
- Trap Tab and Shift+Tab within the modal (cycle between first and last focusable elements).
- On open, move focus to the first input. On close, return focus to the element that opened the modal.
- Escape closes.
- Acceptance: keyboard-only, open modal → Tab cycles inside → Escape closes → focus returns to trigger.

A1.3 — ARIA tabs pattern
- Wrap the tab row in role="tablist". Each tab gets role="tab", aria-selected, aria-controls pointing to its panel. Panels get role="tabpanel" with aria-labelledby.
- ArrowLeft / ArrowRight move focus between tabs (roving tabindex: selected tab has tabindex=0, others -1).
- Enter/Space activates the focused tab.
- Acceptance: screen reader announces "tab, N of M, selected". Arrow keys move between tabs.

A1.4 — SVG chord diagram accessibility
- Every <svg> in ChordDiagram.jsx gets role="img" and aria-label describing the chord (e.g. "C major chord diagram: 0-3-2-0-1-0 from low to high").
- Add a <title> child as the first element so tooltip-capable tech shows it.
- If ChordDiagram is reused via props, derive the label from the chord prop, not hardcoded.
- Acceptance: screen reader announces the chord name and shape when the SVG gets focus or is read in order.

After all four items:
- npm run build → 0
- npm run lint → 0
- npm test → 0 (no new tests required for this sprint; existing tests must still pass)
- Walk QA-CHECKLIST.md rows for keyboard nav + screen reader on the demo song.
- Report pass/fail per acceptance. Stop. Do NOT start S2.
```

### Gate (all must pass before S2 opens)

- [ ] A1.1 — muted text legible on white; demo song visually unchanged in feel
- [ ] A1.2 — keyboard-only: modal opens, Tab cycles, Escape closes, focus returns
- [ ] A1.3 — ArrowLeft/Right moves between tabs, aria-selected updates, screen reader announces position
- [ ] A1.4 — chord diagram SVGs each announce their chord name to a screen reader
- [ ] `npm run build` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm test` exits 0
- [ ] QA-CHECKLIST.md rows #9 (keyboard), #10 (screen reader) pass on the demo
- [ ] Four separate commits, one per sub-item

### Regression check before closing

- Tone colors (T1–T6) still distinguishable on lyrics rows.
- Leadsheet PDF export visually unchanged.
- Recent songs list still renders timestamps clearly.
- No new console warnings on demo load.

---

## S2 — Beat-Grid Chord System (Tier 2)

**Why this exists:** The current chord system attaches chords to character positions. The beat-grid upgrade moves to bar/beat notation (`| Am . F . | G . C . |`) — the industry-standard leadsheet shape. This is the live WIP from the Apr 13 handover.

**Budget:** 6–10 hours total. If you're past 16 hours, stop.

**Scope (five sub-items, commit grouping noted):**

| ID | What | Files |
|---|---|---|
| B2.1 | New nested chord data format | `src/services/chordStorage.js` |
| B2.2 | `ChordBarsLine` beat renderer | `src/components/lyrics/LyricsLine.jsx` |
| B2.3 | Beat selector in `ChordPopover` | `src/components/chords/ChordPopover.jsx` |
| B2.4 | Update `handleChordEdit` | `src/components/lyrics/LyricsDisplay.jsx` |
| B2.5 | Time signature field in `SongMeta` | `src/components/song/SongMeta.jsx` |

### Paste-ready prompt

```
Start S2 — Beat-Grid Chord System. Opus-grade.

Context you MUST read first, in this order:
1. docs/claude-context/architecture.md — §storageId and §chord formats. Persistence conventions.
2. docs/claude-context/chord-migration.md — the full migration plan. This sprint executes it.
3. product-roadmap.md — Theme A "Beat-Grid Chord System" table. That table IS the spec.
4. Current state of:
   - src/services/chordStorage.js (today's char-index format — you'll replace it)
   - src/components/lyrics/LyricsLine.jsx (sequential chord renderer — you'll add ChordBarsLine)
   - src/components/chords/ChordPopover.jsx (chord picker — you'll add beat selector)
   - src/components/lyrics/LyricsDisplay.jsx (handleChordEdit)
   - src/components/song/SongMeta.jsx (metadata editor)

Plan as a TodoList with exactly 5 items (B2.1–B2.5) before editing. One commit per item.

B2.1 — Nested chord data format
- New shape: { [lineIndex]: { [barIndex]: { [beatIndex]: "Am" } } }.
- Migration: on read, if the stored blob is old char-index shape, discard and return {} (per chord-migration.md, no real user data at risk yet).
- Write a new `chords:{storageId}` key only when the new shape is produced — do not silently overwrite old blobs.
- Add vitest coverage: old-format → empty new-format; new-format round-trip preserves data; quota exceeded throws a typed error (do NOT swallow).

B2.2 — ChordBarsLine beat renderer
- New component in LyricsLine.jsx (or a sibling file) rendering `| Am . F . | G . C . |` style bars.
- `.` renders a sustainer, `-` renders a rest (empty beat slot).
- Reads beatsPerBar from SongMeta (default 4).

B2.3 — Beat selector in ChordPopover
- Add a "Beat: [1] [2] [3] [4]" row (dynamic based on beatsPerBar).
- Saves { chord, bar, beat } into the new nested structure.

B2.4 — handleChordEdit rewrite
- Write path goes through chordStorage.js's new API. No direct localStorage writes from the component.
- Acceptance: clicking a beat in ChordBarsLine opens the popover → selecting a chord → the chord appears at that beat → reload preserves it.

B2.5 — Time signature in SongMeta
- Add a beatsPerBar field: select 3, 4, or 6 (default 4).
- Persist alongside other SongMeta fields under the existing storage key.
- Acceptance: switching 4 → 3 re-renders ChordBarsLine with 3 beat slots per bar.

After all five items:
- npm run build, lint, test → all 0.
- Load demo → place chords at bar 1 beat 1, bar 2 beat 3 → reload → chords persist.
- Change beatsPerBar 4 → 3 → existing bars re-render without loss (beats 4+ drop; this is acceptable per chord-migration.md).
- Export PDF → chord notation reflects bar/beat positions.
- Walk QA-CHECKLIST.md rows #3 (chord editing), #5 (PDF), #6 (transpose).
- Report pass/fail. Stop. Do NOT start S3.
```

### Gate (all must pass before S3 opens)

- [ ] B2.1 — old-format read returns {}; new-format round-trips; vitest passes for chordStorage
- [ ] B2.2 — ChordBarsLine renders `.` sustainers and `-` rests correctly
- [ ] B2.3 — beat selector appears in ChordPopover and saves to the right path
- [ ] B2.4 — chord edit flow end-to-end works on demo and persists across reload
- [ ] B2.5 — beatsPerBar switch 4→3→6 re-renders without crashing
- [ ] `npm run build` / `lint` / `test` all exit 0
- [ ] PDF export includes bar/beat chord notation
- [ ] Five separate commits

### Regression check before closing

- Transpose still works on new-format chords (+2, −3, 0).
- Custom songs without any chords still render lyrics normally.
- Leadsheet teleprompter mode still scrolls without layout break.
- Chord diagrams still look up correctly for all new chords set in the grid.

---

## S3 — Accessibility Sprint 2 (Tier 3)

**Why this exists:** Remaining WCAG items from the audit — form labels, toggle `aria-pressed`, touch target minimums, tone-color contrast for T2/T3/T4. Together these close the major/serious items below S1's critical bar.

**Budget:** 4–7 hours total.

**Scope:** See `product-roadmap.md` Next table row "Accessibility Sprint 2". Expand into sub-items A3.1–A3.4 when opening the sprint.

### Paste-ready prompt template

```
Start S3 — Accessibility Sprint 2. Sonnet-grade.

Context: read product-roadmap.md "Accessibility Sprint 2" row + docs/claude-context/design-system.md (tokens).

[Expand sub-items A3.1–A3.4 here when opening. Model acceptance per S1 style.]
```

### Gate (fill in per sub-item when opened)

- [ ] Each sub-item's acceptance passes
- [ ] `npm run build` / `lint` / `test` all exit 0
- [ ] QA-CHECKLIST.md rows #9, #10 still pass

---

## S4 — Docs & Backlog Groom (Tier 4)

**Why this exists:** After shipping S1–S3, the roadmap and backlog drift from reality. Also a moment to audit CLAUDE.md routing and prune stale docs/claude-context entries.

**Budget:** 1–2 hours.

**Scope:**
- Re-read `product-roadmap.md`. Move shipped items to ✅. Promote one Next item into a new sprint candidate.
- Re-read `BACKLOG.md`. Categorize any stuck items that accumulated during S1–S3.
- Verify every `docs/claude-context/*.md` file is still accurate against the current code (spot check architecture.md state shapes especially).
- Update `CHANGELOG.md` [Unreleased] section with what S1–S3 shipped.

### Paste-ready prompt

```
Start S4 — Docs & backlog groom. Haiku-grade, no code.

Read: product-roadmap.md, BACKLOG.md, CHANGELOG.md, docs/claude-context/architecture.md, SPRINTS.md (especially the Sprint log at the bottom).

Tasks:
1. Update product-roadmap.md: move shipped items from Now to ✅. List the top 3 Next candidates.
2. Update BACKLOG.md: categorize any SPRINTS.md emergency-override items under Stuck.
3. Update CHANGELOG.md [Unreleased]: add bullets for each sprint that shipped since the last tagged entry. Group under Added / Changed / Fixed.
4. Spot-check architecture.md vs current code (SongContext shape, chord storage format). Flag mismatches as bullets.

Output: a single diff summary. No commits until I review.
```

### Gate

- [ ] Roadmap Now reflects what's actually in-flight
- [ ] CHANGELOG [Unreleased] lists every committed feature since last release
- [ ] architecture.md matches code (or mismatches flagged)

---

## Emergency override — sprint stuck at 2× budget

When to use: Claude has been iterating for > 2× the sprint's hour budget and the Gate isn't close to green.

1. **Stop.** Do not paste another fix prompt. Halting prevents the sunk-cost spiral.
2. **Write a "what went wrong" note** in the Sprint log entry: which sub-item blocked, last error seen, what was tried.
3. **Move unfinished sub-items to BACKLOG.md** under "Stuck items" with a `stuck:SN.X` tag.
4. **Commit whatever is working** — partial credit is better than a lost afternoon.
5. **Close the sprint partially** and open the next one (or pause entirely if several consecutive sprints have needed override — that's a signal to reassess, not push harder).

---

## Sprint log

Append one entry per sprint close, newest at the bottom. Next session's first read.

Format:

```
### YYYY-MM-DD · S{N} — {title}
- Model: {Sonnet|Opus|Haiku}
- Outcome: {shipped|partial|aborted}
- Gate passed: {list ticked items, or "all"}
- Commits: {short hashes}
- Follow-ups: {bullets moved to BACKLOG, or "none"}
- Notes: {anything next-session should know}
```

<!-- entries start below -->
