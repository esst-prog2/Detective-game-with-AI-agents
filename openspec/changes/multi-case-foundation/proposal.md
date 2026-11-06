# Proposal

## Why
The engine can already construct separate investigations, but startup and sessions assume Ashcroft. Milestone A needs an explicit safe case boundary before later Greyhaven mechanics.

## What Changes
- Add validated private full-case packages and an explicit published registry; adapt unchanged Ashcroft modules.
- Bind fresh session state permanently to one case and publish minimal selection metadata.
- Extend creation optionally, retain default requests, and support CLI/browser selection with identity guards.
- Prove isolation with unrelated test-only packages and retain all existing authorization/lifecycle protections.
- Implement A only. No Greyhaven content, disclosure, clarification, new verdict behavior or later milestone.

## Capabilities
### New Capabilities
- `multi-case-investigations`: validated case selection, immutable identity, isolation and compatible public interfaces.
### Modified Capabilities
None. Existing dialogue, nested view, verdict and lifecycle requirements remain in force; the new selection contract is additive.

## Impact
Server case/session/API/startup modules, CLI entry, browser client/menu, isolation tests, API documentation and privacy checks. No new dependencies or canonical synchronization. Planning checkpoint 0b36bf1 remains the historical baseline.
