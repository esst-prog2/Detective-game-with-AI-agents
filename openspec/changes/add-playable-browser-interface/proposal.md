# Proposal

## Why

The existing API supports a complete deterministic case but has no graphical player experience. The first browser release should deliver an illustrated gothic detective game while honestly reflecting the current public data and gameplay limits.

## What Changes

- Add a separate React + Vite plain-JavaScript frontend, styled with CSS and modular local artwork/placeholders, consuming only the existing HTTP API.
- Provide a title menu, illustrated location cards and scene view, portrait-based questioning, an evidence journal, suspect overview, confirmation/cancellation flow and authoritative case conclusion.
- Treat scene choice as presentation navigation, not engine travel. Keep every suspect and clue globally available; show public identities only, with generic Suspect role labels.
- Show inspected versus available-to-inspect clues and actual received conversation history for this browser session, without inventing backend discovery, placement, memory or persistence.
- Add request/revision/session-generation guards, loading indicators, error/expiry recovery, keyboard-accessible responsive navigation and reduced-motion support.
- Add replaceable asset manifests, a dark-academia visual system, automated browser/privacy coverage and a manual end-to-end checklist.

## Capabilities

### New Capabilities

- `browser-investigation`: Illustrated, accessible browser play of the existing case over the approved public API, including honest presentation state and safe error/revision handling.

### Modified Capabilities

- None. Preserve the engine, HTTP contracts, CLI and unarchived foundation capabilities. No new backend gameplay is required for this bounded first release.

## Impact

Proposed implementation adds `web/` with its own package/lockfile, source, local assets and Playwright development tooling; adds root convenience scripts, pure client-state tests, documentation and append-only log entries. Runtime frontend dependencies are React/react-dom, with Vite and the React plugin as build tooling. Preserve root npm start/test, all 59 existing tests and HW4/HW5 evidence. No dependencies are installed in this planning stage. Exclude real travel/discovery mechanics, occupations/private profiles, new characters/cases, relationship/emotion logic, difficulty, Game Master, critic, persistence, publishing and hosting. Plan only; implementation awaits approval and these planning files remain uncommitted.
