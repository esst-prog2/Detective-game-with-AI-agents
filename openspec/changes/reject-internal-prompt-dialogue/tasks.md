# Tasks

## 1. Documentation and RED (authorized stage)

- [x] 1.1 Create proposal, design, and additive npc-interrogation scenarios; verify `openspec.cmd validate reject-internal-prompt-dialogue --strict` exits zero.
- [x] 1.2 Add three separate fake-client tests targeting `createOpenAIDialoguePhraser(...).phrase()` with the user's exact candidates and REJECT, REJECT, ACCEPT expectations; verify the test file preserves the pre-execution human oracle.
- [x] 1.3 Run `node --test --test-reporter=tap test/dialogue-immersion.test.js` against unchanged production code; append the actual full output, command, exit status, and expected-versus-actual explanation to PLANNING_LOG.md. Verify A and B fail for missing rejection and C passes, then stop for GREEN approval.

## 2. GREEN and regression verification (authorized stage)

- [x] 2.1 Add the localized case-insensitive lead-in check described in design.md without changing structural checks or game logic; rerun the identical three-case command and preserve complete passing output and exit status in PLANNING_LOG.md.
- [x] 2.2 Verify statement-announcement and capitalization rejection plus the existing fallback path with offline fake-client tests; run `npm.cmd test` and preserve command, output, exit status, and regression conclusion in PLANNING_LOG.md.

## 3. Real game use and evidence (user completed)

- [x] 3.1 Before execution, append a separate offline gameplay scenario, input sequence, and expected visible results to PLANNING_LOG.md; verify the expectation predates the session and real API calls are disabled.
- [x] 3.2 Actually use the CLI game once with that scenario; preserve the user-reported observations and exact output excerpts and append expected-versus-actual results in PLANNING_LOG.md, distinguishing gameplay evidence from mocked validation tests.

## 4. Review preparation (authorized stage)

- [x] 4.1 Prepare a local PR title and description covering the immersion defect, bounded fix, independent human oracle, and red/green/regression/game evidence; verify the final diff leaves HW4 evidence untouched and strict OpenSpec validation passes. Do not commit, push, merge, or publish without authorization.
