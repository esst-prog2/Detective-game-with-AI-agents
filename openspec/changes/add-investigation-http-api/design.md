# Design

## Context

See proposal.md for motivation. The foundation branch includes safe public reads and engine lifecycle enforcement. `createInvestigation` accepts injected case data and a phraser, caches per-instance dialogue, guards both evidence paths and accusations, and discards dialogue settling after ending. `getPublicView`, `getPublicSuspect`, `inspectPublicEvidence` and `getLifecycle` provide the required boundaries. Raw `data`, `findSuspect` and `inspectEvidence` are trusted internal access and must not become HTTP payloads.

The classifier still maps free text to six topics and unsupported guidance; named clues do not gain new dialogue semantics. There is no HTTP/session code or browser build configuration. Existing tests use Node's runner and fake adapters; optional dialogue configuration is already environment-based. Main specs remain empty; reuse the contracts in the unarchived changes without editing or archiving them.

## Goals / Non-Goals

**Goals:** A complete local API playthrough of the current case, independent bounded sessions, explicit transport validation, safe serialized data, deterministic concurrency behavior and offline reliability.

**Non-Goals:** User accounts, internet hosting, TLS termination, persistence, multiplayer within one investigation, reset/delete endpoints, generic command dispatch, AI classifier/critic, case generation, cast expansion, journal state or React implementation. A session token is a capability, not an authenticated user account.

## Decisions

### Built-in server and dependency direction

Use `node:http`, `node:crypto` and existing engine modules. Add import-safe `src/http-api.js` (routing, validation and projections), `src/investigation-sessions.js` (store/reservations/revisions), and `src/server.js` (configuration and listen/shutdown only). Add `npm run start:api` without changing `npm start`. Export a server factory with injected investigation factory/clock/ID source and limits for tests; imports must not listen, read secrets into output or call a model. Retain plain JavaScript and existing dependencies. A web framework or database would add setup without helping these five routes.

Use the repository's supported Node LTS baseline; no runtime upgrade is part of this change. Node documents built-in HTTP server limits and request/response handling at https://nodejs.org/api/http.html and secure random byte generation at https://nodejs.org/api/crypto.html#cryptorandombytessize-callback .

### Routes and exact request bodies

| Method/path | Exact body | Engine use | Success data |
| --- | --- | --- | --- |
| POST /api/investigations | `{}` | Create new investigation | sessionId, revision=0, state |
| GET /api/investigations/:sessionId | No body | getPublicView() | sessionId, revision, state |
| POST /api/investigations/:sessionId/questions | `{ suspectId, question, expectedRevision }` | getPublicSuspect(), askSuspect() | sessionId, revision, state, result |
| POST /api/investigations/:sessionId/evidence/inspect | `{ evidenceId, expectedRevision }` | inspectPublicEvidence() | sessionId, revision, state, result |
| POST /api/investigations/:sessionId/accusations | `{ suspectId, confirmed, expectedRevision }` | getPublicSuspect(), resolveAccusation() | sessionId, revision, state, result |

No body-selected case, model, personality, facts, engine method or session override. No session listing. Known route with wrong method returns 405 and Allow; unknown route returns 404. Query parameters, extra path segments, encoded separators and malformed percent encoding return a generic invalid-route error. Use anchored route matching and validate the original path before normalizing; no filesystem/static-file serving.

For POST require application/json (optional charset=utf-8), identity/no Content-Encoding, a complete UTF-8 JSON object, and exact own keys. Reject arrays/null, prototype-related or other unknown keys and type coercion. Creation requires `{}`, not an absent body. Count streaming bytes against 16384, independently of Content-Length; oversize returns 413, wrong media/encoding 415, malformed JSON/UTF-8 400. Reject GET bodies. Questions are trimmed and contain 1-1000 Unicode code points. Entity IDs match lowercase alphanumeric segments separated by single hyphens, length 1-64. Session IDs are exactly 64 lowercase hex digits. expectedRevision is a nonnegative safe integer; confirmed must be an actual Boolean. Unknown valid entity IDs return 404 while active, including unknown suspects in canceled accusations: this is stricter HTTP validation without changing the engine's internal contract.

Validate transport/body shape first, then session existence. For a resolved session with a valid-shaped command, check engine lifecycle before entity existence/revision/busy so well-formed post-game commands consistently return investigation_ended. Invoke the corresponding engine command to obtain its ended rejection; do not fabricate final outcomes. Syntax errors still return validation errors even after ending. Active precedence: entity existence, expected revision, session reservation, global question capacity, engine execution.

### Consistent response contract

All application responses use exactly one envelope:

`{ ok: true, data: { sessionId, revision, state, result? }, error: null }`

`{ ok: false, data: null, error: { code, message, session: null | { revision } } }`

Creation is 201; GET and successful commands are 200. state is the detached `getPublicView()` result. Copy question result fields explicitly: kind, text, and topic/cached only when returned. Unsupported questions remain a 200 guidance result. Evidence result contains id/name/description only. Accusations expose ended/result/text only. A canceled accusation is 200 with its existing text; a wrong accusation is also 200 because it is a valid final game action. Do not send truthfulness or concealment labels.

| Status | Error codes |
| --- | --- |
| 400 | invalid_request, invalid_json, invalid_session_id, invalid_id, invalid_route |
| 403 | forbidden_origin, forbidden_host |
| 404 | route_not_found, session_not_found, suspect_not_found, evidence_not_found |
| 405 | method_not_allowed |
| 409 | investigation_ended, stale_revision, session_busy, stale_response |
| 413 | request_too_large |
| 415 | unsupported_media_type, unsupported_encoding |
| 429 | question_capacity |
| 503 | session_capacity |
| 500 | internal_error |

Use fixed messages; never echo offending bodies/headers, raw exceptions, provider errors or stack traces. Resolved-session error metadata includes only committed revision; bearer IDs are omitted per the implementation request, not state or arbitrary details. Clients recover state with GET. Return Content-Type application/json; charset=utf-8, Cache-Control no-store, X-Content-Type-Options nosniff and Referrer-Policy no-referrer. No success with empty/partially validated output. Avoid logging session-bearing URLs, question bodies, prompts or credentials; optional diagnostics are limited to status/error category.

HTTP parser failures/slow incomplete requests may close the transport before a normal request exists. Handle clientError safely with a generic response/close; document that a transport disconnect cannot guarantee an application JSON envelope. Set maxHeaderSize=8192 bytes, headersTimeout=5000 ms, requestTimeout=10000 ms and keepAliveTimeout=5000 ms explicitly. These bound request receipt, not the existing model deadline. Stop reading/destroy the offending stream safely on overflow; do not buffer arbitrary data to produce an error.

### Sessions and local access boundary

Use Map entries `{ game, revision, lastAccess, reservation }`. Generate 32 cryptographically random bytes as lowercase hex, check for collisions before insertion, and never accept a client-chosen ID. Knowledge of the ID grants access; no cookies, Referer-derived session or account authentication. IDs must not appear in browser address bars, analytics or logs. The later client should retain them in memory for its current playthrough. A token holder can intentionally share control; preventing that needs future accounts/authentication.

Proposed initial limits: 100 sessions, 30 minutes idle expiration, and four concurrent question operations across the process (including cached/unsupported question requests for simple accounting). Valid session accesses refresh lastAccess; expired sessions behave like unknown ones. Prune lazily on store access/creation using an injected clock, not a background process. Pin reserved sessions until settlement and refresh idle time on completion. At capacity, prune expired idle entries then return 503 without evicting an unexpired investigation. Restart loses all sessions; one process only, no cross-worker sharing or persistence guarantees.

Launch on 127.0.0.1:3001, with a validated optional API_PORT override and no arbitrary bind-host option in this milestone. Permit Host values localhost or 127.0.0.1 with the actual API port; reject other hosts to reduce DNS rebinding exposure. If Origin is present, allow only exact API origins and http://localhost:5173 / http://127.0.0.1:5173. Reject Origin:null and explicit cross-site Sec-Fetch-Site. Requests without browser Origin/fetch metadata remain usable by local tools. No Access-Control-Allow-Origin headers or wildcard CORS: the supported browser setup uses a same-origin proxy. This is a local service boundary, not hardened public hosting or protection against malicious software running as the user.

### Overlap, revisions and asynchronous completion

Use a non-queuing reservation per session. Check and set it synchronously before awaiting any engine work. If occupied, return 409 session_busy; no work is queued. Commands in other sessions still run, subject only to the four-question cap. No priority lane for accusations: confirming while a question is pending gets busy and must be retried after refreshing state. This is simpler than queues, avoids queued accusations based on stale observations, and preserves engine ownership of final resolution.

Each successful command increments revision once, including inspection, cached answers, unsupported guidance and cancellation. Reads and all rejected requests leave it unchanged. Require expectedRevision on every command. After a successful command, any duplicate carrying its previous revision gets stale_revision and cannot re-execute. This is optimistic concurrency, not a durable idempotency-key service. If the response is lost, GET before deciding whether to retry; evidence inspection/answer history is not persisted beyond the engine's existing cache.

Capture the entry identity, starting revision and unique reservation token. After await, recheck all three and engine lifecycle before constructing a response. Normal supported HTTP commands cannot end a reserved session concurrently. Nevertheless, an injected/out-of-band engine ending is possible: if ask returns an ended error or lifecycle is now ended, send investigation_ended, do not increment revision and never publish dialogue. Other mismatches return stale_response without a revision commit. The engine itself already prevents late cache writes; keep it unchanged. A confirmed accusation's own legitimate ended result is accepted, not misclassified as stale.

Snapshot state/result synchronously with the revision commit. Network deliveries may arrive out of order after that; every response carries its revision, and the future client must ignore lower revisions for the same session. GET during a pending command returns the last committed revision and current public engine view. A disconnect before a complete validated body executes nothing; after command admission, do not release the reservation early or claim rollback. Let it settle and commit once even if the socket is gone, release all counters/reservations in finally, and omit socket writes. The existing SDK adapter owns its eight-second abort/fallback behavior; an already-running request can still incur cost and is not canceled by a browser disconnect. Unexpected adapter-level failures map to a generic error and release resources; the client must refetch rather than assume rollback.

### Model boundary, local Vite development and compatibility

Production bootstrap obtains the optional phraser through the existing configured adapter; each session receives its own engine/cache. With missing key/model use local fallback and make no external calls. Credentials/model are environment-only server configuration, absent from bodies and responses. Never expose raw provider responses or prompts through diagnostics. Reusing display text does not turn the existing lead-in validator into a complete semantic leak guarantee: issue #3 and the critic remain deferred.

For the later React + Vite client, document relative fetch('/api/...') calls and a future Vite server.proxy entry targeting http://127.0.0.1:3001 with changeOrigin=true. Vite proxy support is documented at https://vite.dev/config/server-options.html#server-proxy . The browser calls its own localhost:5173 origin; the proxy reaches the API, whose allowlist accepts that local Origin. No Vite dependencies, config files, web assets or React source are added now. Preserve `npm start`, all engine contracts and current six-topic limitations; unsupported free text still returns guidance.

### Verification plan

Use Node tests and real loopback HTTP requests on ephemeral ports; factories inject fake phrasers, clocks and IDs, with no live model calls. Close every server/socket in test cleanup. Separate store and transport tests where this makes capacity/expiry checks deterministic.

- Full offline case: create/read, ask relevant topics, inspect all clues, cancel, continue, confirm correct; separate incorrect session and immutable post-game result.
- Two sessions: independent answer caches/revisions/lifecycles, one delayed adapter does not block the other.
- Validation matrix: unknown/malformed/expired session, invalid/unknown entities, wrong methods/routes/queries, body-selected internals/model, missing/extra fields, arrays/null, non-Boolean confirmation, invalid revision, malformed JSON/UTF-8, media type and compressed/chunked/oversized input.
- Privacy matrix: private canaries at case/victim/NPC/evidence levels and secrets embedded in fake provider exceptions; exact success/error payloads and headers, no raw fields or exception messages. A question quoting a secret cannot cause the API to serialize raw case knowledge; no new semantic LLM guarantee is claimed.
- Concurrency: same-session busy, revision mismatch/replayed command, exactly one accepted concurrent accusation, second-session progress, read while busy, global cap, reservation release after failure/disconnect, deferred success/failure after out-of-band ending, stable result and revisions on rejection.
- Lifecycle: known and unknown well-formed post-game commands (including cancellation and cached questions) return ended errors; GET remains safe; wrong final result does not reveal murderer.
- Resources/local browser boundary: TTL/capacity, random-ID collision retry via fake generator, forbidden Host/Origin, absent Origin for local tools, slow/aborted receipt, clientError safe handling and factory imports without a listener/model call.
- Preserve the existing 35 tests, CLI and all HW4/HW5 evidence. Full suite, strict OpenSpec validation and diff review are implementation exit criteria.

## Risks / Trade-offs

- [Token theft grants session control] -> Local-only binding, Host/Origin checks, no cookies/CORS, no-store headers and no token logging; accounts/TLS require a future deployment design.
- [In-memory sessions disappear or exhaust capacity] -> TTL/cap bounds and explicit errors; document single-process/no-restart-continuity limits.
- [Busy responses interrupt fast UI interactions] -> Keep the UI command pending, then GET/retry after completion; do not automatically replay final accusations.
- [Disconnected model calls still cost money] -> Preserve existing timeout/fallback and cap concurrency; no guarantee that disconnect cancels provider work.
- [Existing dialogue prose may contain semantic leakage] -> No full-case prompting or raw serialization; retain deterministic validation/fallback and track issue #3 separately.
- [Node transport faults cannot always yield JSON] -> Bound receipt and close malformed sockets safely; distinguish transport failure from structured application errors.

## Migration Plan

After approval, add modules/tests and one launch script, document the contract and proxy example, then run all tests, strict validation and diff review. No migration, new dependencies or browser changes. Disable/remove the added API entry point to return to CLI-only use; restarting intentionally drops sessions. Do not modify historic evidence or archive/sync older changes. This planning session leaves API artifacts uncommitted and implementation tasks unchecked.
