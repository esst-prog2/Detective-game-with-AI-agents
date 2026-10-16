# Design

## Context

See proposal.md for motivation. The CLI lowercases/trims input and passes `confirmation === 'yes'` into `resolveAccusation`. Its `running` loop stops on `result.ended`. The engine currently recomputes each accusation independently, returns raw evidence without lifecycle checks, and may await a phraser before caching dialogue. CLI inspection bypasses that method by reading `investigation.data.evidence` directly.

`test/game.test.js` currently expects correct and incorrect resolutions from the same investigation. `test/public-view.test.js` asserts an exact overview shape with no lifecycle field. HW4/HW5 tests do not depend on post-game play and need no changes. The current baseline is the previously verified 22-test suite; planning does not execute new lifecycle tests or modify code.

## Goals / Non-Goals

**Goals:** One authoritative, irreversible transition per engine instance; stable player-visible result; deterministic post-game rejection; minimal CLI integration; detached safe lifecycle reads.

**Non-Goals:** Persistence, reset/restart commands, event sourcing, a general command bus, request queues, HTTP, browser UI, new NPC state, schema expansion or changes to model prompts/validators. Trusted raw `data` access remains internal and is not a security boundary against code already holding the case.

## Decisions

### Private state and first resolution

Add closure-owned `status = 'active'` and `finalResult = null` in `createInvestigation`. Add `getLifecycle()` returning a fresh `{ status, finalResult }`, with a fresh final-result object when present. The stored final result has the existing `{ ended: true, result: 'correct' | 'incorrect', text }` shape, contains only scalar display fields and is never returned by reference.

In `resolveAccusation`, check ended state first. While active, only `confirmed === true` authorizes resolution; other values take the existing cancellation path. Unknown confirmed suspect IDs retain the existing invalid result and leave state active. For a valid confirmation, compute/store the result and set status to ended synchronously before returning a copy. No await or model call occurs. Separate invocations in this process therefore cannot both resolve successfully. A Boolean derived from absence of a result would work, but explicit status makes the contract clear without introducing a state-machine library.

### Deterministic rejection with stable result retrieval

Use `{ kind: 'error', code: 'investigation_ended', text: 'The investigation has ended.' }` for ended questioning and inspection. Ended accusation responses additionally contain `ended: true, result: 'rejected'`, preserving the CLI's termination signal while distinguishing rejection from a newly resolved outcome. The stored final result is retrieved through `getLifecycle()` or public view; do not return another successful resolution on retries.

Guard `askSuspect`, `inspectEvidence` and `resolveAccusation` before ID validation, topic classification, cached answers or cancellation handling. `inspectPublicEvidence` explicitly forwards only the safe rejection fields instead of treating an error object as an evidence record. Active return shapes remain unchanged, including null for unknown evidence. This deliberately changes post-game contracts; returning null would hide the distinction between an unknown item and a closed investigation, and throwing would disrupt the existing result-oriented interface.

Keep `getPublicView`, `getLifecycle`, `getPublicSuspect`, `listEvidence` and trusted identity lookup available as read-only queries. They cannot reveal a new evidence description. Check state again after the phraser's try/catch and before any cache write or answer return. If the game ended during the await, return the ended error. Do not add model-call cancellation infrastructure: a request already running may finish and incur cost, but its late answer is discarded on both success and failure paths.

### Safe lifecycle projection

Add `lifecycle: getLifecycle()` to the overview. While active it is `{ status: 'active', finalResult: null }`; after ending it is `{ status: 'ended', finalResult: { ended: true, result, text } }`. Only copy these fields. Existing wrong-accusation text names the accused innocent suspect, not the actual murderer; preserve this behavior. Caller mutation of the initial resolution, lifecycle reads or nested public snapshots cannot change the stored outcome.

### CLI integration

Keep the existing numbered menus and yes/no confirmation conversion. Have CLI inspection select an ID from `listEvidence()` and call `inspectEvidence(id)`, handling either a display record, null, or the ended error. At entry, if an injected investigation is already ended, print its stored final text and return without asking for input. Normal fresh-investigation interaction and ending text remain unchanged. Quitting remains a UI exit without a fabricated resolution or a new engine transition.

### Required test adjustments and new coverage

- `test/game.test.js`, accusation test: keep cancellation followed by successful resolution on one instance, but test incorrect resolution on a separate instance. Replace the contradictory second-success assumption with a rejection/stable-result assertion. Coverage for both outcomes is preserved rather than removed.
- `test/public-view.test.js`: add the exact active lifecycle object to both the main expected overview and alternate-data expected overview. Extend mutation/privacy checks for nested lifecycle/finalResult, preserving the current canary and aliasing assertions.
- Existing CLI session: retain its help/evidence/cancellation/confirmation checks and strengthen it to show no further input is requested after ending. Add incorrect-ending and already-ended-entry cases, and verify inspection uses the engine through an injected spy rather than raw descriptions.
- New `test/investigation-lifecycle.test.js`: independently specified active state, cancellation, explicit confirmation, invalid active suspect, correct/incorrect endings, separate-instance isolation, repeated/same/different/invalid/canceled accusations after ending, cached/uncached/unsupported/invalid questions after ending, both evidence paths with known/unknown IDs, stable result under caller mutation, safe public lifecycle, and deferred phraser success/failure across ending. Use fake adapters; no network calls. Verify post-game reads/commands do not invoke the phraser or expose evidence/answer data.
- Keep HW4/HW5 test files, saved measurements and RED/GREEN/manual evidence unchanged and run them in the full suite during implementation verification.

### OpenSpec compatibility

Main specs remain empty. The original `accusation-resolution`, `npc-interrogation` and `evidence-inspection` requirements live in the unarchived MVP change; the approved public contract lives in `expose-safe-investigation-view`. Add the lifecycle capability and additive public-lifecycle requirements without editing those historical artifacts or inventing a MODIFIED baseline.

For the combined implementation, older gameplay guarantees apply while active. The new lifecycle restrictions explicitly take precedence after ending, including repeat-answer caching, unrestricted evidence inspection and the old public-inspection null contract. The public overview allowlist is extended only by the new lifecycle field, so the earlier exact-field requirement is read with this extension. During a later authorized archive/sync, establish the earlier baseline first, then reconcile these stated extensions into main specs. No sync/archive is performed in this planning milestone.

## Risks / Trade-offs

- [Raw internal case access remains possible] -> Route the CLI through commands; document trusted access and keep future network adapters on public projections. This is engine API enforcement, not isolation from malicious in-process code.
- [Accusation rejection differs from stored outcome] -> Give rejection an explicit code and preserve the final result through a separate getter/public projection.
- [Late model requests still incur cost] -> Discard late content before return/cache; defer cancellation machinery and server serialization to later work.
- [Changed public shape and inspection errors affect consumers] -> Update exact-shape tests and README, preserve all active return contracts, and exercise CLI paths with fake I/O.

## Migration Plan

After approval, implement engine state and guard tests, add safe lifecycle reads, make the minimal CLI integration, adjust the identified tests without losing assertions, update documentation and append decisions/results to the planning log. Run `npm.cmd test`, strict validation of this change and `git diff --check`. No data migration or dependency installation is needed. Reverting the milestone restores the previous stateless behavior, so revert code, tests and docs together if necessary. Keep HW4/HW5 artifacts unchanged; do not push or merge without review.
