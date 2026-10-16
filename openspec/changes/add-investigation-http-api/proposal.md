# Proposal

## Why

The deterministic engine now has safe public views and an authoritative lifecycle, but only the CLI exposes a playable investigation. A small local HTTP adapter will let a future illustrated browser client play the same case without receiving raw case data or controlling engine internals.

## What Changes

- Add an import-safe Node HTTP server and separate launch command while preserving `npm start` and the complete existing test suite.
- Add independent in-memory investigation sessions and endpoints for creation, public state, typed questions, evidence inspection and explicitly confirmed/canceled accusations.
- Serialize only allowlisted public state and engine display results, with consistent JSON envelopes and structured errors.
- Validate routes, methods, session/entity IDs, JSON bodies and command revisions; bound request size, session lifetime/capacity and overlapping work.
- Reject same-session overlapping commands and stale revisions; retain engine lifecycle guards and discard stale asynchronous results before sending them.
- Keep configuration and optional dialogue generation server-side; support a complete case offline without credentials.
- Document local React/Vite proxy integration, session bearer-token handling, error/retry rules and in-memory limitations.

## Capabilities

### New Capabilities

- `investigation-http-api`: Session HTTP contract, validation, public serialization, lifecycle integration, concurrency and local-service boundaries.

### Modified Capabilities

- None. Reuse `investigation-public-view`, `investigation-lifecycle`, `npc-interrogation`, `evidence-inspection` and `accusation-resolution` from their unarchived changes. Keep their engine/CLI behavior and historical artifacts unchanged.

## Impact

Depends on completed `expose-safe-investigation-view` and `enforce-investigation-lifecycle`. Proposed additions are HTTP/session modules, a standalone server entry point, HTTP/session tests, an additional npm launch script, README and append-only planning records. Use built-in Node modules and existing dialogue configuration; add no framework or database. This request writes planning artifacts only. Do not implement the API or browser UI, expand content, add a critic, close issue #3, commit these planning files, push, merge or archive.
