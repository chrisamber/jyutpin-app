# Chord Format Migration — Exit Plan

**Status: Complete** · Decided: 2026-04-19

## Decision

The migration from OLD char-index format to NEW beat-grid format is **finished**. No further migration work is needed.

## What was done

`chordStorage.js` was updated to write NEW format only. The upgrade path is:

1. `loadChords()` — reads from localStorage, auto-upgrades any OLD format on read via `upgradeChordFormat()`. The upgraded data is **not** written back immediately — it stays in memory as the NEW shape.
2. `saveChords()` — always writes NEW format. Old data is left in localStorage but will be upgraded on the next load.
3. `mergeChords()` — handles both formats. OLD format hits the fallback branch, which is marked "should rarely hit."
4. `upgradeChordFormat()` / `upgradeLineFormat()` — stateless conversion functions. Idempotent: safe to call on data already in NEW format.

## Old format

```json
{ "lineIndex": { "charIndex": "Am" } }
```

Still readable for backward compatibility. Will be silently upgraded on load and written as NEW on next save. No new writes in OLD format.

## New format

```json
{ "lineIndex": { "barIndex": { "beatIndex": "Am" } } }
```

`"."` = sustain, `"-"` = rest/NC. Default 4 beats per bar (4/4 time).

## Cleanup criteria

- No code path writes OLD format: ✅ done
- `mergeChords` handles both formats: ✅ done
- `upgradeChordFormat` is idempotent: ✅ done
- No new OLD format data can be written: ✅ (enforced by `saveChords` writing only new shape)

The old format safety net in `mergeChords` and `collectUsedChords` should be removed in a future cleanup pass once localStorage has had time to flush. No urgency — it only costs a few extra lines of dead-branch code.

## Owner

Chris — no further action required unless a future feature needs to re-read raw OLD format from storage.