# Spec Delta

## Purpose

Provides a bounded local JSON interface for complete, independent detective investigations while keeping engine authority and private case data on the server.

## ADDED Requirements

### Requirement: Play the existing case through session endpoints
The API SHALL support POST /api/investigations to create a session, GET /api/investigations/:sessionId to retrieve public state, and POST subroutes /questions, /evidence/inspect and /accusations for commands. Creation SHALL accept only an empty JSON object. Each command SHALL require the last observed nonnegative integer expectedRevision plus its explicit fields: suspectId/question, evidenceId, or suspectId/confirmed respectively. Confirmation SHALL be a Boolean. Successful creation SHALL return 201, other successful operations 200. Supported but unclassified questions SHALL return the engine's deterministic topic guidance as a successful result. Both correct and incorrect accusations SHALL be successful resolutions; cancellation SHALL leave the investigation active.

#### Scenario: Complete an offline investigation
- **WHEN** a client starts a session without model configuration, reads state, questions suspects, inspects clues, cancels an accusation and then confirms a valid suspect
- **THEN** it can complete the same case using deterministic fallback dialogue and the existing engine's final outcome

#### Scenario: Resolve either accusation outcome
- **WHEN** clients confirm the murderer or an innocent suspect in separate sessions
- **THEN** each session ends with its own correct or incorrect result without changing other sessions

### Requirement: Keep sessions isolated and bounded
Each session SHALL own an independent investigation, response cache, revision and command reservation. Session identifiers SHALL be server-generated, unguessable 256-bit bearer capabilities encoded as 64 lowercase hexadecimal characters. The API SHALL reject malformed IDs and return indistinguishable not-found errors for unknown and expired well-formed IDs; it SHALL NOT list all sessions. Sessions SHALL expire after 30 minutes idle and be lost on process restart. The store SHALL hold at most 100 sessions, remove expired idle sessions before creation, and return a structured capacity error rather than evict unexpired sessions. In-flight work SHALL pin a session until settlement. No request SHALL select a different player's state through a body field.

#### Scenario: Isolate two players
- **WHEN** one session obtains cached dialogue or ends and another continues
- **THEN** the other session's cache, revision and lifecycle remain independent

#### Scenario: Expire or exhaust sessions
- **WHEN** an unknown/expired session is used or the session capacity is exhausted
- **THEN** the API returns a structured not-found or capacity error without revealing other sessions

### Requirement: Validate the entire transport contract
The API SHALL accept only documented routes/methods and exact body keys, reject query parameters and malformed path encodings, require UTF-8 application/json for POST requests, reject compressed bodies, and enforce a 16384-byte body limit even with chunked delivery. JSON must be a non-null object, not an array. Questions SHALL contain 1-1000 characters after trimming; entity IDs SHALL be 1-64 lowercase alphanumeric/hyphen slug characters and refer to configured public entities. expectedRevision SHALL be a nonnegative safe integer. Invalid syntax, type, extra fields or IDs SHALL NOT invoke a model or mutate engine/session state. GET requests SHALL have no body. Unknown commands SHALL NOT dispatch arbitrary engine methods.

#### Scenario: Reject malformed requests
- **WHEN** a client submits malformed JSON, invalid UTF-8, an oversized body, wrong content type, unexpected fields, invalid IDs or a non-Boolean confirmation
- **THEN** it receives a structured error and no gameplay operation runs

#### Scenario: Attempt private access or arbitrary dispatch
- **WHEN** a client requests raw data, injects private fields, names an internal method or requests an unlisted path
- **THEN** the request is rejected without returning internal records or executing the named method

### Requirement: Return consistent safe JSON
Application-level responses SHALL use `{ ok: true, data, error: null }` or `{ ok: false, data: null, error: { code, message, session } }`. Error session SHALL be null before session resolution or contain only its committed revision afterward; session IDs SHALL NOT appear in logs or error details. Success session data SHALL contain only sessionId, revision, the existing safe public state and, for commands, an explicitly projected result. Public state SHALL reuse the approved public view. Evidence SHALL use safe public inspection. Questions and accusations SHALL expose only documented engine display fields. Stack traces, raw exceptions, private facts, response tables, prompts, credentials and undeclared properties SHALL NOT be serialized. Responses SHALL have JSON content type, no-store caching and nosniff headers. Unexpected failures SHALL return a generic internal error.

#### Scenario: Preserve privacy across every response path
- **WHEN** private canaries are planted in case records, configuration or thrown errors and clients exercise success and failure paths
- **THEN** responses contain only approved fields and never serialize those canaries

### Requirement: Preserve engine lifecycle enforcement
Valid post-game questioning, inspection and accusation requests SHALL return a 409 investigation_ended error without changing the stored result or invoking generation. Public state SHALL remain readable afterward. Shape validation SHALL precede engine dispatch; after session resolution and valid shapes, engine ended-state rejection SHALL precede entity existence, revision and busy checks. The API SHALL NOT duplicate or override the engine's truth or outcome selection.

#### Scenario: Continue after ending
- **WHEN** a session ends and the client repeats a question, inspection, confirmation or cancellation
- **THEN** each command is rejected, and public state retains the first final result

### Requirement: Reject overlapping and stale commands
Sessions SHALL start at revision zero. Each successful accepted command, including cached dialogue, unsupported-topic guidance, inspection and cancellation, SHALL increment revision once; errors and reads SHALL NOT increment it. An active session SHALL accept at most one command at a time; overlaps SHALL return 409 session_busy without queuing or generation. A mismatching expectedRevision SHALL return 409 stale_revision. Unrelated sessions SHALL continue independently. Before publishing asynchronous results, the adapter SHALL verify its reservation, session identity, revision and engine lifecycle, discarding invalid/ended completions rather than sending an answer. Disconnected accepted commands SHALL retain their reservation until settlement and commit once; clients SHALL refetch state before retrying uncertain requests. All session responses SHALL identify their committed revision so future clients can ignore older network deliveries.

#### Scenario: Overlap or replay commands
- **WHEN** a question is pending and another command for that session arrives, or a completed command is retried with its old revision
- **THEN** the API returns busy or stale-revision errors without duplicate engine execution

#### Scenario: Receive stale asynchronous work
- **WHEN** an engine ends externally during pending dialogue or a reserved completion no longer matches its session/revision
- **THEN** no late NPC answer is sent and no adapter revision/result overwrites the authoritative final state

### Requirement: Keep the service local and model access server-side
The launch command SHALL bind only to loopback by default and SHALL enforce an exact local Host/Origin allowlist, with no permissive CORS or cookie-based ambient session authorization. Requests with an explicitly foreign Origin or cross-site fetch metadata SHALL be rejected. API credentials/model selection SHALL come only from server configuration, never client bodies. Missing configuration, adapter failure or invalid model output SHALL retain the engine's existing fallback behavior. At most four question operations SHALL run concurrently across sessions; excess operations SHALL receive a structured busy error. The CLI, existing tests and HW4/HW5 evidence SHALL remain functional and unchanged. Documentation SHALL describe a future same-origin Vite /api proxy, bearer-ID sensitivity, restart/expiry loss, single-process limitations and remaining dialogue safety risks.

#### Scenario: Use the future local client boundary
- **WHEN** documented local-origin requests reach the server directly or through the proposed Vite proxy
- **THEN** they can use the API while unrelated browser origins and client-supplied model settings are rejected

#### Scenario: Operate without credentials
- **WHEN** the server has no API key/model configuration
- **THEN** a complete investigation remains playable without making external model calls
