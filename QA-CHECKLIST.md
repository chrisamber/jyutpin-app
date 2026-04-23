# QA Checklist — Pre-Release

> Tick this table before every release or significant merge to `main`. ~10–15 min end-to-end.
>
> This is the **working checklist**. For *why each item matters* and deeper per-area guidance, see [docs/claude-context/qa-checklist.md](docs/claude-context/qa-checklist.md).

**Legend:** ✅ PASS · ❌ FAIL · 📱 NEEDS-DEVICE · ⏭ N/A

Duplicate and date the table per release (keep the previous run as a diff reference).

---

## Run — `YYYY-MM-DD` · v{version or commit}

| # | Check | Demo (背脊唱情歌) | Custom song | Notes |
|---|---|---|---|---|
| 1 | Search → results appear for typical query | | | |
| 2 | Click song → study view loads in ~2 s | | | |
| 3 | Jyutping auto-populated on every Chinese char | | | |
| 4 | Tone colors (T1–T6) visibly distinguishable | | | |
| 5 | Romanization toggle cycles Jyutping → Yale → None | | | |
| 6 | Chord edit mode: click beat/char → popover → saves → reload persists | | | |
| 7 | Transpose ±N updates chords on screen *and* in PDF | | | |
| 8 | PDF export: title, artist, lyrics, chords, sections — no A4 overflow | | | |
| 9 | Keyboard-only: Tab reaches every interactive element; focus-visible ring shows | | | |
| 10 | Screen reader: lyrics read in order; modal has dialog role; tabs announce position | | | |
| 11 | Teleprompter mode: full-screen, arrow-key scroll, Escape exits | | | |
| 12 | Offline: previously loaded demo opens without network; PDF export works offline | 📱 | 📱 | Device-only |
| 13 | PWA: install works; opens standalone; SW updates apply on next reload | 📱 | | Device-only |
| 14 | `npm run build` exits 0 | | | CI |
| 15 | `npm run lint` exits 0 | | | CI |
| 16 | `npm test` exits 0 | | | CI |

### Open items / follow-ups

*List items that failed, need a device, or got deferred. Move each to [BACKLOG.md](BACKLOG.md) or open a new sprint in [SPRINTS.md](SPRINTS.md) before the next release.*

- _none yet_

---

## Smoke test — before closing any sprint

Cut-down version for mid-sprint Gate checks (not releases). Covers what most sprints touch.

- [ ] `npm run build` clean
- [ ] `npm run lint` clean
- [ ] `npm test` clean
- [ ] Demo loads and renders Jyutping + tone colors
- [ ] One affected flow (the sprint's acceptance criteria) walks through end-to-end
- [ ] No new console errors on demo load

---

*Device columns (📱) are expected to run on real hardware — don't mark ✅ from DevTools simulation. If you can't run a device check this release, mark 📱 and note the skip in release notes.*
