# Proposal

## Why

The existing phraser preserves approved speech verbatim but accepts a loosely checked lead-in and has no narration contract. Rich performance needs a stronger boundary for both fields; syntactic prose checks cannot establish whether a new sentence invents mystery facts.

## What Changes

- Depend on `add-stateful-dialogue-engine` and its approved character/content catalogs.
- Add an opt-in structured performance adapter selecting from engine-authorized spoken variants and harmless narration, with exact validation of both strings and their pairing.
- Keep model requests server-only and minimal; reject unknown keys, unapproved text/actions, secret disclosure and invalid contextual selections.
- Fall back to the engine's deterministic structured performance on malformed output, timeout, missing configuration or provider failure.
- Preserve the legacy adapter and HW4/HW5 validator/evidence unchanged for explicit compatibility use; the new stateful path must not accept its free lead-ins as trusted narration.
- Test adversarial narration/speech, prompt minimization and delayed-response non-commit. Document how this narrows issue #3's model-output risk without claiming the issue resolved.
- Phase 2 of three, before cinematic `add-hybrid-dialogue-interface`; no UI or critic in this change.

## Capabilities

### New Capabilities

- `safe-npc-performance`: bounded structured AI performance, exact dual-field validation and safe fallback.

### Modified Capabilities

None in main specs. The new runtime adapter supersedes the old phraser on the stateful path while retaining the historical adapter contract and its independent tests.

## Impact

Expected implementation areas: server-only performance adapter/validator, configured runtime wiring, engine performance seam, fake-provider and concurrency/privacy tests. Reuse the installed SDK and existing timeout; no dependency/model migration, live paid experiment, free-form semantic critic, canonical changes, historical evidence edits or issue closure.
