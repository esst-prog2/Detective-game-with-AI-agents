# Spec Delta

## Purpose

Provides a complete illustrated browser investigation over the existing public HTTP API, with accessible visual navigation and no invented authoritative gameplay state.

## ADDED Requirements

### Requirement: Present an illustrated complete investigation
The browser SHALL provide a title/start menu, location selection, illustrated scene, character questioning, evidence journal, suspect overview, accusation confirmation and case conclusion for the existing case. The initial playable release SHALL use cohesive gothic/dark-academia scene art or attractive illustrated placeholders, individual portrait treatments, atmospheric readable dialogue panels and evidence cards. It SHALL NOT present a terminal transcript as its primary interface or require generated artwork, external fonts, WASD, combat, 3D or complex animation. Missing/replaced artwork SHALL have a usable fallback without changing game rules.

#### Scenario: Start the case with placeholder artwork
- **WHEN** the player starts a new investigation with no generated artwork or model credentials
- **THEN** a real API session and safe public state open a complete illustrated investigation with functional controls and local placeholder assets

### Requirement: Represent location selection honestly
Location choices SHALL derive from the public location list and change only the displayed illustration and selected scene. The browser SHALL NOT claim server-side travel, lock clues by room, place NPCs/evidence in rooms without server data, or introduce time/movement costs. Scene views SHALL provide location names and decorative scene captions, clearly separated from canonical investigation facts. All public suspects and evidence SHALL remain reachable from every scene through visibly global contact/clue controls.

#### Scenario: Browse another location
- **WHEN** the player selects another location card
- **THEN** its background/name changes without a gameplay API command, and all public contacts and clues remain available

### Requirement: Display public identities and received testimony only
The suspect overview and questioning screen SHALL render names from safe public state and portraits from presentation assets. When occupations or roles are absent, the UI SHALL use the generic role Suspect rather than import private profiles. Questions SHALL be sent through the API within its input limits. Received answers SHALL be displayed as testimony, not verified facts. Conversation history SHALL contain only actual requests and accepted responses for that browser investigation, preserving the addressed suspect and question. Unsupported-topic guidance SHALL be distinguished from character testimony. No reply SHALL be fabricated on error or before generation completes.

#### Scenario: Question a suspect
- **WHEN** the player submits a supported question
- **THEN** one command is sent with the current revision, a loading indicator appears, and only the successful response is added to that suspect's displayed testimony

#### Scenario: Request unsupported information
- **WHEN** the API returns unsupported-question guidance
- **THEN** the UI shows it as guidance without pretending a new canonical fact or character revelation occurred

### Requirement: Track inspection history without pretending discovery gates
The journal SHALL list all evidence summaries as available from the start and distinguish Available to inspect from Inspected in this browser session. Descriptions SHALL enter client history only after successful evidence inspection. Descriptions, inspection markers and received testimony SHALL be kept only for the current in-memory browser investigation and SHALL NOT claim server persistence or locked/undiscovered evidence. After ending, already-received notes SHALL remain reviewable without sending new inspection/question commands.

#### Scenario: Inspect an available clue
- **WHEN** the player selects any clue while active and inspection succeeds
- **THEN** its received description appears in the journal and its inspection marker updates without hiding or unlocking other clues

#### Scenario: Reset browser-local history
- **WHEN** the player reloads or starts a new investigation
- **THEN** local history does not appear as recovered server history and the UI explains the loss of browser-session notes where relevant

### Requirement: Confirm and cancel accusations through the engine
The UI SHALL allow selecting a public suspect and show a keyboard-accessible confirmation dialog warning that confirmation ends the investigation. Opening selection SHALL NOT resolve an accusation. Confirm and cancel SHALL use the API's Boolean confirmation contract. The browser SHALL show correct/incorrect conclusion only from the server's final result, preserve its text and disable gameplay commands once ended. A wrong conclusion SHALL NOT reveal the actual murderer. Starting another investigation SHALL create a new session, clear local history and prevent responses from a previous session changing the new one.

#### Scenario: Cancel an accusation
- **WHEN** the player cancels the confirmation dialog
- **THEN** one canceled-accusation command is submitted and, on success, the UI continues active play using the returned revision

#### Scenario: Conclude and begin again
- **WHEN** a confirmed accusation ends the case and the player starts a new investigation
- **THEN** the authoritative result is shown before a new independent investigation begins with no old testimony, inspections or delayed responses

### Requirement: Handle pending requests and recovery safely
The client SHALL admit at most one mutation at a time with an immediate duplicate-submit guard, carry expectedRevision on commands, reject older state deliveries and associate every completion with the current session generation. A 15-second client timeout/abort SHALL be treated as an uncertain server outcome, not rollback. Conflicts/busy/stale responses SHALL prompt state refresh and deliberate retry, never automatic accusation replay. Ended-state errors SHALL reconcile through public state. Expired/missing sessions SHALL stop mutations and offer an explicit new investigation. Network/protocol errors SHALL retain input and known notes, show actionable plain-language errors and never invent success. Read-only navigation SHALL remain possible while dialogue is pending.

#### Scenario: Receive an older or old-session response
- **WHEN** network deliveries are reordered or a previous session completes late
- **THEN** neither authoritative state nor local testimony/journal is overwritten or appended from the rejected response

#### Scenario: Recover from a busy or lost-response request
- **WHEN** a command conflicts or its response is lost
- **THEN** the client refreshes state or offers refresh, preserves known observations, and asks the player to retry deliberately without assuming the operation failed to execute

### Requirement: Keep private data and credentials out of frontend artifacts
The client SHALL obtain game information only from approved public HTTP payloads. Frontend imports, static manifests/assets, built bundles and source maps SHALL NOT contain raw case records, murderer assignments, intended solutions, private profiles, hidden response tables, prompts or API keys. The required API session bearer SHALL be held only in API-client memory, never rendered, logged, persisted, included in browser navigation or sent to third-party services. All user/server text SHALL render as escaped text. No client-side solution selection, truth classification, clue unlocking or model call SHALL be implemented.

#### Scenario: Inspect browser artifacts before resolution
- **WHEN** browser code, assets, runtime public state and requests are inspected before accusation
- **THEN** they contain only public presentation data and actual public responses, with no hidden solution or server credentials; only the API request path/client memory carries its necessary session capability

### Requirement: Provide responsive keyboard-accessible play
All actions SHALL have semantic keyboard-operable controls, accessible names, visible focus and logical focus order. Dialogs SHALL trap/restore focus and support Escape cancellation. Loading/error updates SHALL be announced without replacing focus unexpectedly. Normal text SHALL achieve at least 4.5:1 contrast, large text and essential controls at least 3:1, and primary touch controls SHALL be at least 44 by 44 CSS pixels. Layout SHALL remain usable at a 360 CSS-pixel viewport and at 200 percent zoom without page-level horizontal scrolling. Reduced-motion preferences SHALL suppress nonessential animation, and portraits/art SHALL not be the sole source of a control's meaning.

#### Scenario: Complete a narrow-screen keyboard investigation
- **WHEN** a player navigates with keyboard only or uses a narrow viewport with reduced motion
- **THEN** location selection, questioning, journal inspection, cancellation and conclusion remain readable, reachable and functional

### Requirement: Preserve existing compatibility and exclude future gameplay
The browser SHALL play the current three-suspect case without a model key while leaving the CLI, all existing tests, HTTP contracts and HW4/HW5 evidence unchanged. Rendering SHALL derive entity lists from public state, with replaceable assets and generic fallbacks for unknown public identities. The first release SHALL NOT show nonfunctional difficulty, relationship, emotion, generated-case or expanded-cast controls.

#### Scenario: Render changing public collections
- **WHEN** a public-data fixture contains additional identities or a missing art entry
- **THEN** layouts render the collection and generic art fallback without importing private case information or requiring hardcoded three-person logic
