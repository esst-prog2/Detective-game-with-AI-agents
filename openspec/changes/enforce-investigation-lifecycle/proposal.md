# Proposal

## Why

The CLI exits after a confirmed accusation, but the engine does not remember that the investigation ended. Other callers can continue questioning, inspect evidence or obtain contradictory accusation results on the same investigation.

## What Changes

- Track active/ended state per investigation, with one stored final result and detached lifecycle reads.
- End only on the first confirmed accusation of a valid suspect; cancellation and invalid active accusations leave the investigation active.
- **BREAKING for post-game engine callers:** reject further questioning, evidence inspection and accusation commands, including cached questions and canceled or invalid post-game accusations. Preserve active command results.
- Keep the first final result stable and expose only safe status/result information through the public view.
- Route CLI evidence inspection through the engine; retain its current menus, confirmation wording and cancellation/end behavior.
- Adjust incompatible test assumptions, add lifecycle and in-flight dialogue tests, and preserve all HW4/HW5 evidence and test coverage.

## Capabilities

### New Capabilities

- `investigation-lifecycle`: Engine-owned active/ended state, single resolution, stable final results and command rejection after ending.

### Modified Capabilities

- `investigation-public-view`: Add safe lifecycle projection and lifecycle-aware inspection rejection. This capability exists in the unarchived safe-view change rather than main specs; use additive requirements under its established path, with explicit precedence described in design.md.

## Impact

Depends on completed `expose-safe-investigation-view`. Future implementation touches `src/game.js`, the CLI evidence integration and ended-entry handling, lifecycle tests, the existing accusation test, exact public-view expectations, README and the append-only planning log. No dependencies, API calls, HTTP server, browser UI, persistence, restart-in-place, case edits or dialogue-validator changes. This request creates planning artifacts only; implementation awaits approval.
