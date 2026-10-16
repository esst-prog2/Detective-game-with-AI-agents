# Spec Delta

## Purpose

Makes detective investigations spatially authoritative and presents approved room inhabitants through cinematic, accessible character conversations without exposing private case knowledge.

## ADDED Requirements

### Requirement: Own current location and static placements on the server
Each investigation SHALL start in its authored initial room and expose an explicit current location. The case SHALL use stable room IDs and server-authored static suspect/evidence placements. Every entity SHALL reference a valid room; invalid or missing spatial configuration SHALL be rejected without falling back to global access. The current case SHALL retain the study, library and garden, start in the study, place Alice/torn contract/silver cufflink in the study, Clara in the library and Ben/muddy footprints in the garden. These SHALL represent current interview-time positions, not historical alibis. The murderer, approved dialogue/lie rules, existing evidence descriptions and intended solution SHALL remain unchanged.

#### Scenario: Start independent room investigations
- **WHEN** two investigations start and one travels
- **THEN** both initially occupy the study and only the travelling investigation changes position, with all authored placements remaining static

#### Scenario: Reject invalid authored spatial configuration
- **WHEN** a configured case has duplicate room/entity IDs, an invalid initial room or an entity referencing a missing room
- **THEN** it is rejected without exposing configuration details at the HTTP boundary or allowing unrestricted interactions

### Requirement: Travel through an authoritative active command
Active investigations SHALL accept an explicit travel command to any configured room. Successful travel SHALL change only current position and applicable public state; same-room travel SHALL succeed as a no-op. Unknown rooms SHALL be rejected. Travel SHALL NOT move NPCs, consume time, unlock clues, clear received information or resolve an accusation. Ended investigations SHALL reject travel before considering room existence and retain their first result and last position. Public reads SHALL NOT travel.

#### Scenario: Travel and remain in the same room
- **WHEN** an active player travels to the garden and then requests the garden again
- **THEN** the first command changes position and the second reports no change, without moving any suspect or clue

#### Scenario: Reject unknown and post-game travel
- **WHEN** an active player supplies an unknown room or an ended player requests any room
- **THEN** the command is rejected without changing position, cache or the final result

### Requirement: Reject remote questioning and inspection in the engine
Only suspects present in the current room SHALL be questioned, including repeated cached questions and unsupported-topic questions. Only evidence located in the current room SHALL be inspected through either trusted or public inspection. Known remote targets SHALL yield `suspect_not_present` or `evidence_not_here` without generation, caching, inspection descriptions or state mutation. Lifecycle rejection SHALL precede presence and entity checks after valid-shaped commands reach an ended engine. Accusation confirmation/cancellation SHALL continue to work against any known suspect from any active room.

#### Scenario: Attempt a remote cached or unsupported question
- **WHEN** the player asks a suspect in another room using a previously cached topic or unsupported wording
- **THEN** the engine rejects presence before returning cache/guidance and does not invoke the model

#### Scenario: Attempt remote evidence access
- **WHEN** a caller inspects a known remote clue through either inspection interface
- **THEN** the engine rejects it without returning its description or changing state

#### Scenario: Accuse someone in another room
- **WHEN** the active player cancels or confirms an accusation against a known remote suspect
- **THEN** existing cancellation and correct/incorrect final-result semantics apply without forced travel

### Requirement: Discard dialogue invalidated by travel or ending
If position changes during pending dialogue, including leaving and returning, its eventual reply SHALL be discarded before publication or caching. Ended-state rejection SHALL take priority if the investigation also ends. An obsolete response SHALL NOT reopen an investigation, change the final result, appear as received testimony or contaminate another room/session's history. This protection SHALL apply to direct engine calls as well as HTTP/browser use.

#### Scenario: Leave and return during pending phrasing
- **WHEN** a deferred question starts in a suspect's room and the engine travels away and back before it settles
- **THEN** the completion is rejected as stale with no answer/cache publication, even though the final room ID matches the original

#### Scenario: End while a reply is pending
- **WHEN** an investigation ends before an asynchronous reply succeeds or fails
- **THEN** the original final result stays stable and no delayed dialogue is published or cached

### Requirement: Expose only explicitly approved public dossiers and spatial state
Public state SHALL retain the prior title/victim/location-name/lifecycle fields and extend them with room ID/name summaries, currentLocationId, suspect locationId/dossier and evidence-summary locationId. Public suspect lookup SHALL use the same safe dossier projection. Dossiers SHALL contain only authored role, relationshipToVictim, background and approved relationships with targetSuspectId/kind/label. Current dossier text SHALL match the approved design table; all current additional-relationship arrays SHALL be empty and SHALL NOT imply that a person has no family. Public membership and dossiers SHALL be readable globally. Evidence descriptions SHALL remain available only through valid inspection or previously received browser notes. Every nested projection SHALL be detached and exclude undeclared fields, private profiles/relationships, prompts, motives, response tables, lie annotations, intended solution and pre-resolution murderer assignments.

#### Scenario: Read a room directory and public profile
- **WHEN** an adapter retrieves state or a suspect dossier from any room
- **THEN** it receives only the approved spatial/profile fields and no uninspected evidence descriptions or protected character facts

#### Scenario: Mutate nested public fields or inject secrets
- **WHEN** a caller edits a returned room/dossier/relationship or private canaries are added alongside or inside public blocks
- **THEN** later engine state remains unchanged and serialization contains only explicitly projected approved fields

### Requirement: Extend the existing HTTP command contract safely
The API SHALL add `POST /api/investigations/:id/travel` accepting exactly locationId and expectedRevision, with existing slug, safe-integer, body-size and JSON validation. Success SHALL return 200 using the existing envelope with public state and `{kind:'travel',locationId,changed}`. Every accepted travel, including same-room travel, SHALL increment revision once; rejected travel/presence commands SHALL not. Unknown valid room IDs SHALL produce 404 location_not_found; known remote interaction SHALL produce 409 suspect_not_present/evidence_not_here. Existing session reservation SHALL reject overlapping travel/questions and stale revisions; travel SHALL not consume a question-capacity slot. Existing expiry, capacity, lifecycle precedence, local-origin policy, fixed errors, safe logs and bearer protections SHALL remain enforced.

#### Scenario: Travel through HTTP and reject forged remote commands
- **WHEN** a client travels using its current revision and then submits a question or inspection for another room
- **THEN** travel returns the new public position/revision and the remote action returns a structured presence error with no further revision change or private description

#### Scenario: Overlap, replay or inject travel state
- **WHEN** travel overlaps a pending command, uses an outdated revision or includes unexpected position/presence/profile fields
- **THEN** the existing busy/stale/validation rules reject it without applying the requested state

### Requirement: Provide room-based selection and globally readable notes
The browser SHALL display the authoritative current room background/name, only its present characters with public profile access, its inspectable objects and labeled navigation to other rooms. Rooms with zero, one or multiple people/objects SHALL remain usable; membership SHALL derive from server state rather than a frontend placement table. Navigation SHALL send travel and update canonical room only on accepted state. Remote suspects SHALL not be shown as immediately available for questioning. Global dossier/journal views SHALL allow reading approved profiles and received notes; remote unreceived interactions SHALL offer explicit travel rather than silently interrogate/inspect. Ended investigations SHALL allow note/profile review while disabling travel and gameplay.

#### Scenario: Navigate, question and inspect within rooms
- **WHEN** the player enters each authored room
- **THEN** only its assigned inhabitants/clues offer immediate interactions, other rooms remain reachable, and successful interactions preserve the existing offline case loop

#### Scenario: Review remote notes and recover failed travel
- **WHEN** the player reads known notes from another room or a requested travel fails or has uncertain receipt
- **THEN** note review sends no inspection, and the UI retains the last accepted room until explicit public-state reconciliation rather than inventing travel success

#### Scenario: Render empty and larger-room fixtures
- **WHEN** public fixtures contain an empty room or multiple additional inhabitants without dedicated artwork
- **THEN** the UI renders honest empty states or an accessible wrapping collection with generic art, without changing the real case cast

### Requirement: Present cinematic person-to-person interrogation
Selecting a present character SHALL open an interrogation composed within the current illustrated room, with a visually dominant large neutral human figure, clearly named speaker, integrated cinematic dialogue overlay, labeled free-text input and natural Return to room. History SHALL be accessible in a secondary panel without dominating the default composition. Dialogue SHALL contain only actual accepted replies or clearly distinguished guidance; no greeting, emotion, personality fact or answer SHALL be invented. Small portrait cameos SHALL not substitute for the required large figure. Existing aesthetic SHALL be preserved and figure assets SHALL be independently replaceable, with generic fallback and future expression slots that do not infer emotional state or guilt.

#### Scenario: Speak directly to a present character
- **WHEN** the player selects Alice, Ben or Clara in their current room
- **THEN** the character's consistent large figure dominates the illustrated scene while dialogue, question input, history access and return controls remain readable and functional

#### Scenario: Replace or lose figure art
- **WHEN** a figure asset is replaced or unavailable
- **THEN** presentation uses its manifest/fallback without changing presence, dialogue, dossiers or game rules, and the character remains named and operable

### Requirement: Preserve request safety and accessible cinematic play
The client SHALL retain memory-only bearer handling, exact public projections, synchronous mutation gate, revision/generation guards, timeout uncertainty and no automatic mutation replay. Travel SHALL be blocked during pending mutations; local reading SHALL remain possible. Public reconciliation SHALL close an interrogation if its suspect is no longer present, preserve known notes/drafts and discard obsolete room/session replies. Semantic controls, visible focus, history/dialog focus return, reduced motion, 44×44 primary targets, normal-text 4.5:1/control-large-text 3:1 contrast, 360px layouts and 200-percent zoom/reflow SHALL remain supported. Visual review SHALL inspect actual desktop/mobile room and cinematic screenshots, not rely only on DOM tests.

#### Scenario: Reconcile out-of-band movement and delayed replies
- **WHEN** equal-revision public state changes room or an old request completes after travel/session replacement
- **THEN** the current room and selected interrogation reconcile safely and obsolete dialogue is not appended or cached as received information

#### Scenario: Operate with keyboard and narrow display
- **WHEN** the player travels, opens a dossier, asks questions, reviews history or cancels an accusation using keyboard/narrow-screen controls
- **THEN** focus and essential controls remain visible, reachable and readable without page-level horizontal scrolling or excessive motion

### Requirement: Preserve CLI and complete offline mystery compatibility
The CLI SHALL show current location and offer explicit travel while preserving existing actions 1–5 and accusation confirmation semantics. Question/evidence choices SHALL reflect current presence; no adapter SHALL bypass engine restrictions. Complete CLI/HTTP/browser investigations SHALL work without model credentials and preserve existing dialogue, intentional deception, evidence text and correct/incorrect outcomes. Existing test assertions SHALL be retained with valid travel/setup and exact public-fixture migrations. Historical HW4/HW5 evidence, phraser expectations and prior OpenSpec artifacts SHALL not be rewritten; no new cast/case, NPC movement, emotion AI, critic or issue #3 closure SHALL occur.

#### Scenario: Finish the same case offline through every adapter
- **WHEN** players travel among rooms, ask the existing topics, inspect all clues and cancel/confirm accusations without a model key
- **THEN** CLI, HTTP and browser remain playable through either authoritative final outcome with unchanged canonical content and privacy restrictions
