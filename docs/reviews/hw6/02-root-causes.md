# Review 2: Root causes versus accumulated patches

## Scope and method

Re-examined the whole repository through ownership and lifecycle boundaries: all runtime source, browser state/client/components, tests, scripts, dependency entry points, specifications, authored catalogs and documentation/evidence. Traced each mutation and cache write rather than restricting review to recently changed code. Compared the current architecture to the stateful-dialogue and HTTP designs; used the completed 228-test baseline to check the traced paths. No review ran concurrently.

## Findings and disposition

No new actionable root-cause defect confirmed. No refactor made solely to reduce apparent special cases.

- **Repetition and emotion:** `src/dialogue-state.js:75` clones the entire next state before tag application. Core-level discussion handles text/choice repeats consistently; clarification avoids hostile-repeat tagging, first evidence and respectful-topic tags are applied once, and all dimensions clamp to 0-4. `src/authored-performances.js:73` filters recent actual speech before consulting permission-keyed caches. The Alice motive single-utterance exception is a content-preservation requirement, not a workaround to remove.
- **Cache authority:** `src/game.js:160` revalidates cached structured pairs against current permissions; `src/dialogue-state.js:118` caps caches at 64. Permission hashes encode current speech/gesture eligibility. A cache hit still prepares the turn and processes demeanor; it cannot bypass presence or commit checks. Deleting only an invalid candidate cache entry is local staged repair, not an authoritative-state mutation.
- **Lifecycle/stale work:** `src/game.js:57` centralizes invalidation; `src/game.js:213` checks a single-use engine candidate again before synchronous installation. Room epoch catches away-and-back movement; engine generation catches other mutations; `src/investigation-sessions.js:55` separately checks transport identity/reservation/revision. These guards protect different owners and should not be merged into a single HTTP-only check. Abort saves work; generation checks establish correctness even if abort is ignored.
- **Provider failure:** configured performer deadline/abort race (`src/npc-performance.js:57`) settles a non-cooperative provider; the engine chooses an authorized deterministic pair and still applies stale guards. Legacy injected phrasing remains a deliberately separate compatibility path, covered by historical tests; replacing it would violate the preservation requirement.
- **Browser recovery:** `web/src/api/investigation-client.js:108` owns receipt generation and mutation gate; reducer history deduplicates committed server turn IDs (`web/src/state/investigation-state.js:7`). Keeping received notes separate from the bounded server window is required for lost-reply reconciliation and local history, not competing game authority.

## Evidence quality, verification and limits

Read the barrier-driven stale-success/stale-failure matrix in `test/stateful-dialogue.test.js:302`, provider valid/invalid/failure matrix in `test/npc-performance.test.js:278`, session release tests in `test/investigation-sessions.test.js:36`, and real HTTP race/projection tests in `test/http-api.test.js:643`. They assert entire diagnostics/cache/emotion immutability, not merely an error string. Fixed barriers establish ordering independently of wall-clock timing. Baseline: 228 passing tests; no code change required another identical run here.

Informational limits retained: arbitrary trusted injected adapters can ignore deadlines; synchronous non-dialogue internal operations are not a general transaction system; in-process callers can mutate trusted case references. These are documented trust boundaries, not externally exposed bypasses. Known Alice/issue #3 findings carry forward from review 1. Unexpected-error observability is examined separately in review 4.
