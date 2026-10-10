# Design

## Context

See proposal.md for the HW4 finding. `createOpenAIDialoguePhraser(...).phrase()` currently trims output, checks a 500-character maximum and exact approved-content suffix, and validates a 2-80-character lead-in with an allowed-character regex. It has no immersion check and accepts all three human-defined candidates. `createInvestigation()` already catches adapter errors and caches the selected local fallback. Existing adapter tests inject a fake `responses.create()` client.

The MVP's `npc-interrogation` specification exists only in its unarchived change. Use that same capability path and ADDED requirements for these new concerns; do not invent a main-spec baseline or archive either earlier change.

## Goals / Non-Goals

**Goals:** Keep production validation localized to the adapter, demonstrate failures against independent human expectations, and preserve actual evidence before and after the fix.

**Non-Goals:** Semantic guarantees for all possible dialogue, new API calls, a critic model, new dependencies, changes to approved case content, or reinterpreting the HW4 acceptance metrics.

## Decisions

- After existing structural validation, add a small case-insensitive phrase check only to `leadIn`, covering "approved statement", "approved text", and "my statement is" with word boundaries. Throw an adapter validation error on a match. Checking the lead-in avoids interpreting engine-approved factual content as a delivery instruction. Do not ban all first-person introductions: "I hesitated" must remain valid. A prompt-only change cannot reliably enforce rejection; a second model would expand scope and require network-dependent verification. Leave the production prompt and game core unchanged for the smallest fix.
- Put the user's exact three examples into separate Node tests in `test/dialogue-immersion.test.js`, using fake clients and the existing public `phrase()` method. A and B use `assert.rejects`; C asserts the unchanged returned string. Separate tests ensure both failures and the acceptance control are visible in one run. Expected values originate from the user's manual judgment recorded before execution, never from current behavior.
- Use `node --test --test-reporter=tap test/dialogue-immersion.test.js` for both RED and GREEN. Append the complete captured output, command, and actual exit code to `PLANNING_LOG.md`; do not replace evidence with a summary. Later, verify the other documented phrases/capitalization and existing fallback, and run `npm.cmd test` for regressions. No automated test uses the configured SDK client.
- Before the later real game use, separately record an offline scenario and expected outcome in the planning log, clear API configuration in the session, then actually play the CLI and retain its transcript. This proves offline usability; the fake-client tests establish generated-output rejection. Record actual results afterward rather than claiming a mocked test was a real game use.
- Current authorization covers documentation, the three-case test, and RED only. GREEN, regression execution, and game use remain pending approval. Prepare a local PR description later with the problem, behavioral change, human-defined oracle, and red/green/regression/game evidence; do not commit, push, merge, or publish a PR without authorization.

## Risks / Trade-offs

- [Other immersion-breaking phrases remain possible] -> Describe this as a bounded check of known internal language; retain fallback and leave broader semantic validation for later work.
- [Evidence confused with HW4] -> Append HW5 evidence to the planning log and leave the spike files and existing OpenSpec changes untouched.
- [Archive order matters with no main specs] -> Keep the additive delta separate and defer synchronization/archive until the MVP baseline and HW5 implementation are reviewed.

## Migration Plan

Create and strictly validate artifacts, run the three-case test before touching production, then stop at RED. After separate approval, implement the localized check and rerun the identical test, verify regressions, and document real offline gameplay. No data migration is needed; reverting the localized check restores the previous acceptance behavior.
