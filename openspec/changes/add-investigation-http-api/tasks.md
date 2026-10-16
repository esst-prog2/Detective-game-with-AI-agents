# Tasks

## 1. Local transport and session infrastructure

- [x] 1.1 Add import-safe HTTP/server factories and separate start:api launch command using Node built-ins, preserving npm start; verify imports do not listen or contact models, ephemeral-port startup/shutdown works, and local Host/Origin checks and configured receipt/header limits reject unsafe traffic with safe responses.
- [x] 1.2 Add in-memory sessions with random 256-bit IDs, independent engine instances/revisions, 30-minute idle expiry, a 100-session cap and reservation pinning; verify isolation, malformed/unknown/expired IDs, collision retry, capacity/pruning and no cross-session state/cache contamination with injected clock/ID/factory tests.

## 2. Validated API contract

- [x] 2.1 Implement the five documented routes, exact method/body/query/path validation, streamed 16384-byte limit, UTF-8 JSON/media/encoding checks, ID/question/Boolean/revision validation and safe clientError handling; verify malformed/chunked/oversized/aborted input, unknown commands and missing/extra/prototype-related fields cannot dispatch engine work.
- [x] 2.2 Add consistent JSON success/error projection, fixed messages/status codes and privacy headers; reuse public state and public evidence inspection, project question/accusation display fields explicitly, and verify exact payloads exclude planted private data, secrets, provider exceptions, prompts and credentials on success/failure paths.
- [x] 2.3 Connect creation/public reads/questions/inspection/accusations to engine lifecycle and server-only optional phraser configuration; verify a full no-key HTTP investigation, supported/unsupported questions, all evidence, cancellation/continued play, correct/incorrect outcomes on separate sessions and stable post-game rejection through HTTP without changing engine or CLI contracts.

## 3. Concurrency and stale work

- [x] 3.1 Add non-queuing per-session command reservations, required expectedRevision checks, exactly-once successful revision increments and a four-question process cap; verify overlaps/replays/stale revisions, concurrent accusations, GET while busy, independent-session progress and no mutation/generation on rejected work.
- [x] 3.2 Recheck reservation/session identity/revision/lifecycle before async publication, retain reservations across disconnects and release counters in finally; verify deferred success/failure after out-of-band ending, no late dialogue publication, resource cleanup after errors/disconnects and revision/final-result stability. Document that network delivery can reorder and clients must ignore older revisions/refetch after uncertain outcomes.

## 4. Documentation and integration verification

- [x] 4.1 Document endpoint examples/envelopes/status codes, bearer-ID handling, in-memory expiry/restart/capacity limitations, local bind/security boundaries, existing dialogue limitations and a future Vite /api proxy example; verify no React/Vite source or dependencies are introduced and append all implementation decisions/results to PLANNING_LOG.md.
- [x] 4.2 Run the full automated suite including all existing 35 tests and new real-loopback/fake-adapter tests, strict OpenSpec validation for add-investigation-http-api and git diff --check; record actual counts/statuses and review the final diff for secrets, unnecessary files, HW4/HW5 evidence edits or unrelated milestones. Do not commit, push, merge or archive without approval.
