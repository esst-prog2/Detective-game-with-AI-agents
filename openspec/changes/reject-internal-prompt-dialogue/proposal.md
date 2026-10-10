# Proposal

## Why

The HW4 spike accepted all 30 gpt-6-luna outputs (p50 2249.9 ms, p95 4300.6 ms), but the teacher's manual review reported immersion-breaking introductions such as "Approved statement", "My statement is", and "Here is the approved text", reportedly in all ten Ben Carter outputs. Passing structural validation does not establish that dialogue is usable within the detective game.

## What Changes

- Reject known internal prompt language in generated dialogue lead-ins while retaining existing structural validation and approved content verbatim.
- Accept natural lead-ins such as "I hesitated" when existing format rules pass; reuse the existing prewritten fallback on rejection.
- Add offline fake-client tests using the user's independently specified REJECT, REJECT, ACCEPT expectations; preserve actual red and later green evidence.
- Plan regression verification and one offline game use with a separate expected outcome recorded before execution.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `npc-interrogation`: Add explicit acceptance and rejection scenarios for generated lead-ins. This capability currently exists in the unarchived `build-mvp-detective-game` change, not in main specs. This change adds requirements under the same capability path; it does not modify or archive the MVP change.

## Impact

Targets `src/dialogue-phraser.js`, a focused Node built-in test file, and planning-log evidence. No new dependencies, game logic changes, real API calls, or multi-agent critic architecture. Preserve the HW4 spike and its evidence. This approved stage creates documentation and the red test only; production changes, green verification, game use, and publishing await later approval.
