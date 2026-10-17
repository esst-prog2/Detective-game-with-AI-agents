# Review 6: Dangerous defaults and hidden assumptions

## Scope and method

Whole repository default/coercion audit: environment/configuration, engine data/catalog initialization, evidence/testimony IDs, classifier, lifecycle/session options, API body validation, browser projections/reducer/art fallbacks, scripts, test fixtures, manifests, specs and docs. Traced `??`, `||`, optional fields and numeric comparisons to distinguish intentional offline defaults from missing required invariants.

## Confirmed finding and fix

**Medium, fixed: invalid session resource configuration silently bypassed bounds.** `src/investigation-sessions.js:11` accepted arbitrary `maxSessions`, `maxQuestions` and `idleMs` overrides without validation. Comparisons against `NaN` always fail, so `maxSessions:NaN` disables the session cap, `maxQuestions:NaN` disables the concurrent-question cap, and `idleMs:NaN` prevents idle pruning. Infinity likewise removes the intended bound. A malformed trusted configuration could therefore undermine resource guarantees without a startup error. HTTP cannot set these options, so this is configuration hardening, not a remote input exploit.

The constructor now requires positive safe integer limits and fails with a fixed message before creating a store. Defaults remain 100 sessions, four questions and 30 minutes. Existing intentional bounded overrides such as a one-session test store still work. No new environment settings or package dependencies.

## Intentional defaults preserved

- Missing key/model means offline play; no model name is guessed (`src/npc-performance.js:76`, `.env.example:1`). Server port is explicitly checked (`src/server.js:8`); browser proxy defaults are local tooling, not public deployment configuration.
- NPC emotion baselines/deltas come from the validated catalog. Missing unrelated-case dialogue yields empty public conversations and guidance rather than silently borrowing testimony (`src/data/dialogue-catalog.js:131`, `test/stateful-dialogue.test.js:65`). The current Ashcroft default is recognized by its title/IDs; callers editing its semantic content should provide an explicit matching catalog. Trusted mutable case references remain an existing limitation.
- Missing evidence IDs never resolve to the first clue; unknown suspects cannot end the case; only literal Boolean true confirms at the engine boundary. HTTP requires exact fields, safe nonnegative revisions and bounded slugs/text (`src/http-api.js:44`). No truthy-string confirmation or client-supplied state is accepted.
- Browser artwork fallback is cosmetic; missing received evidence descriptions are not invented from inspected IDs (`web/src/components/EvidenceJournal.jsx:10`). Missing dialogue options produce free-text access without inventing choices. Unknown private metadata is discarded at explicit projections.
- `validateCase` retains its original three-suspect MVP expectations as a case-specific test helper, while spatial/dialogue validation supports synthetic 8/12-NPC configurations. Applying the MVP check to every investigation would break an explicit extensibility contract.

## Verification and evidence quality

New independent invalid-configuration matrix in `test/investigation-sessions.test.js:11`: each of the three limits rejects NaN, infinity, zero, negative/fractional values, string coercion, null and unsafe integers. Before fix: missing expected exception. After fix: **5/5 session-store tests pass**, including default capacity/expiry, collision retries, pinning and release. Run with `node --test --test-isolation=none test/investigation-sessions.test.js`; no subprocess permission was needed. Final full Node/HTTP suite will verify callers. No testimony, murderer, evidence or historical expected values changed.
