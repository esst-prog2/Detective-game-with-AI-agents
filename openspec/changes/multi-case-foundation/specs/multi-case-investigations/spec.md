## ADDED Requirements

### Requirement: Validate private registered cases
The server SHALL accept only explicit validated full-case packages with stable unique IDs, public metadata, private data, a complete owned dialogue catalog and a local solution. It SHALL reject malformed or unsupported packages and references outside their local cast, rooms, evidence and catalog. Definitions SHALL be immutable snapshots; investigation state SHALL be freshly constructed.

#### Scenario: Validate independent packages
- **WHEN** two valid packages are registered, or a duplicate or invalid reference is supplied
- **THEN** valid packages construct distinct investigations and invalid registration fails before publication

### Requirement: Publish a safe case manifest
GET /api/cases SHALL return the existing safe envelope with data.cases containing only published id, title and full mode. It SHALL allocate no session, invoke no provider and retain existing transport restrictions. Production SHALL publish only Ashcroft in this milestone.

#### Scenario: List cases without secrets
- **WHEN** a player requests the manifest
- **THEN** only safe metadata is returned, without solution, hidden records or test fixtures

### Requirement: Select a case compatibly
POST /api/investigations SHALL accept exactly {} or {caseId}. Omission SHALL select ashcroft. Unknown, unpublished or malformed IDs and extra keys SHALL produce fixed 400 invalid_request without allocation. Successful session envelopes SHALL add case={id,mode} beside existing sessionId, revision, state and optional result; nested state and result contracts SHALL remain unchanged.

#### Scenario: Default and explicit creation
- **WHEN** a client creates without selection or explicitly selects a published case
- **THEN** it receives the default Ashcroft or selected case with matching additive metadata

#### Scenario: Reject invalid selection
- **WHEN** a client supplies an unavailable ID, path, null, number or extra field
- **THEN** creation fails without a bearer allocation or private availability explanation

### Requirement: Isolate permanent session identity
Each session SHALL retain immutable case identity/version and use only its selected investigation for all actions. Commands SHALL reject case selectors and foreign entity IDs absent locally. Memories, inspections, emotions, caches, accusation solutions and pending candidates SHALL remain session-local, retaining transactional and lifecycle protections. A colliding local ID SHALL resolve only in the current case.

#### Scenario: Interleave independent investigations
- **WHEN** concurrent sessions question, inspect, travel or accuse using local or foreign IDs
- **THEN** only valid local actions affect their own case and no private solution or memory crosses sessions

### Requirement: Preserve interface and authorization compatibility
Ashcroft SHALL remain playable unchanged offline through CLI, HTTP and browser. CLI SHALL support optional --case and --list-cases without changing default prompts. Browser SHALL offer published selection, validate case identity before accepting snapshots, reset notes on successful creation and reject late prior-session data. Existing exact dialogue authorization, evidence-aware endings and incorrect-accusation privacy SHALL remain enforced.

#### Scenario: Switch or fail to create
- **WHEN** a new session succeeds, creation fails, or an obsolete reply arrives
- **THEN** successful creation resets case-local notes, failure preserves prior identity, and obsolete data cannot contaminate the accepted session
