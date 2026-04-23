# Changelog

All notable changes to WaaPou are listed here. Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/).

Commit hashes reference `main`. For pre-`[Unreleased]` history, `git log` is authoritative.

---

## [Unreleased] — 2026-04-23

### Added

- **PM runbook files.** `SPRINTS.md` (one-sprint-at-a-time operator runbook with paste-ready prompts, Gates, model routing, Sprint log), `BACKLOG.md` (Polish / Phase 2 / Horizon 3 / risk register / stuck-items), `QA-CHECKLIST.md` (working pre-release table with demo + custom-song columns). Modeled on amberaud.io's solo-operator workflow.
- **Test harness.** Vitest with `jsdom`, `@testing-library/react`, and `@testing-library/jest-dom`. Seed tests for `transpose.js` (F#m +2, Bbm −1, C/G +5, identity, and canonical flat preference) and `jyutping.js` (smoke). `npm test` / `npm run test:watch` scripts added.
- **Translation service** with Upstash Redis caching (commit `31dbd7d`). `/api/translate` calls Claude Haiku for English gloss of Chinese lines; results cached per-line. Optional `KV_REST_API_URL` + `KV_REST_API_TOKEN` env vars for shared cache.
- **Auto-slide preview banner** across Cantonese / Mandarin / Hokkien dialect previews (commit `0170ccf`).

### Fixed

- Tone colors and slide animation in preview banner (commit `66662a6`).

### Changed

- `CLAUDE.md` "Where to go next" table gains rows for SPRINTS / BACKLOG / CHANGELOG / QA-CHECKLIST; Quickstart block adds `npm test`.
- `product-roadmap.md` "Now" section now points to `SPRINTS.md` for active execution (roadmap = strategic; SPRINTS = execution).
- `docs/claude-context/qa-checklist.md` cross-links to the root working checklist.

---

<!--
## [0.1.0] — YYYY-MM-DD

Cut the first tagged release when the next sprint Gate closes. Move Unreleased → 0.1.0 with the date and commit-hash range.

### Added
### Changed
### Deprecated
### Removed
### Fixed
### Security
-->
