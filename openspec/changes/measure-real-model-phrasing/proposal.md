# Proposal

## Why

GitHub issue #4 asks whether real model phrasing survives the existing validator and how long it takes. Fake-client tests and game fallbacks cannot answer this.

## What Changes

- Add a manually invoked experiment with exactly 30 sequential attempts, all 18 suspect/topic pairs and 12 predetermined repeats, using the existing prompt and validator.
- Preserve raw output and per-attempt outcomes/latencies; print passed/total, pass rate, p50 and p95.
- Move the existing abort signal into SDK request options and add focused tests.
- Document local execution and evidence; record real results and the roughly 70% decision criterion only after a real run.

## Capabilities

### New Capabilities

None. This is experiment tooling, not a game capability.

### Modified Capabilities

None. The signal correction implements the existing timeout requirement. Use `skip_specs: true`; no game requirements change.

## Impact

One standalone script, focused tests, the signal placement in `src/dialogue-phraser.js`, README, and planning log. No new dependencies, game features, prompt changes, or validator changes. Real calls remain outside `npm test` and require explicit API configuration.
