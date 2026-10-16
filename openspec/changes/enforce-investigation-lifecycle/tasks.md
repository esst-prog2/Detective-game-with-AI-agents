# Tasks

## 1. Engine lifecycle

- [x] 1.1 Add private active/ended state, detached getLifecycle() snapshots and a single synchronous final-result transition on explicit valid confirmation; verify initial state, cancellation, invalid/non-Boolean confirmation, correct/incorrect outcomes, instance isolation and result mutation resistance with offline lifecycle tests.
- [x] 1.2 Reject all ended accusations, questions and both evidence inspection paths before normal processing; verify repeated/same/different/unknown/canceled accusations, cached/uncached/unsupported/invalid questions, known/unknown evidence, no post-game generation or content disclosure, and unchanged stored final result.
- [x] 1.3 Recheck state after asynchronous phraser completion and before caching/returning an answer; verify deferred success and failure across ending return only ended errors, while existing active cache/fallback/timeout tests still pass.

## 2. Public projection and CLI compatibility

- [x] 2.1 Add only the allowlisted lifecycle field to getPublicView() and safely project inspection rejections; update both exact overview expectations in test/public-view.test.js and verify active/ended JSON shapes, nested mutation isolation, private-marker exclusion and no murderer disclosure after a wrong accusation.
- [x] 2.2 Route CLI evidence lookup through engine inspection and return the stored result without gameplay prompts for an already-ended investigation; retain menus/confirmation/result wording and verify correct/incorrect CLI endings, cancellation/continued play, guarded evidence integration, quit without resolution and no input requests after ending with fake I/O.
- [x] 2.3 Adjust the existing accusation test in test/game.test.js to use separate investigations for correct and incorrect successful resolutions and explicitly assert rejection/stability on repeat; verify both original outcome branches remain covered and all HW4/HW5 test files and evidence are unchanged.

## 3. Documentation and final verification

- [x] 3.1 Update README for lifecycle snapshots, final-result access, active versus ended return contracts, trusted internal access and the late-request cost limitation; append implementation decisions/results to PLANNING_LOG.md and verify documentation matches the implemented API without rewriting historical entries.
- [x] 3.2 Run npm.cmd test, openspec.cmd validate enforce-investigation-lifecycle --strict and git diff --check; record actual outputs/status summaries, inspect the final scope, and confirm no HW4/HW5 evidence edits, new dependencies, real API calls, HTTP/browser work, push or merge.
