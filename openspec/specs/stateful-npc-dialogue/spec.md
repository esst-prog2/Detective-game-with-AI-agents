# stateful-npc-dialogue Specification

## Purpose

Provide authoritative, bounded, personality-driven conversations shared by engine, CLI and HTTP without allowing presentation or player claims to rewrite the mystery.

## Requirements

### Requirement: Preserve authored knowledge and useful distinct voices
Dialogue SHALL use separately authored profiles for existing suspects, reconciling current traits with the approved design. Valid topic answers SHALL retain all approved core testimony and intentional lies regardless of demeanor. New framing and gestures SHALL introduce no canonical fact, detective action, secret, guilt tell or consequential event. The original murderer, evidence, case records and historical HW4/HW5 evidence SHALL remain unchanged. Profiles and machinery SHALL support synthetic eight/twelve-NPC cases without adding real cast members or assuming three NPCs.

#### Scenario: Compare character responses and preserve testimony
- **WHEN** Alice, Ben and Clara receive the same approved social challenge and their existing topic questions offline
- **THEN** their authored vocabulary, rhythm and pressure behavior differ while valid answers retain each suspect's authorized core information

#### Scenario: Keep known disclosure boundaries explicit
- **WHEN** Alice answers her existing motive or sighting topic
- **THEN** her existing debt mention and limited sighting remain testimony for compatibility, the conflicting concealment annotation remains an unresolved case-data inconsistency, debt is not promoted to global public/other-NPC knowledge or discovery facts, and no debt-letter/library location or private route detail is newly revealed

### Requirement: Share authority across text and contextual choices
Text and engine-issued choices SHALL resolve through the same lifecycle/presence/permission rules. Suggested options SHALL reflect prior testimony, inspected evidence and authored comparisons, with at most six available options per present NPC and none for remote or ended NPCs. Supported topics SHALL remain reachable by free text. Choices SHALL not become six permanently static topic buttons. Ambiguous/unsupported requests SHALL provide concise guidance without inventing facts.

#### Scenario: Follow up or revisit
- **WHEN** a player asks what the last substantive answer meant or selects its clarification/revisit option
- **THEN** the engine uses only that NPC's committed context and authorized core, while a contextless follow-up yields guidance

#### Scenario: Reject unavailable choices and forged context
- **WHEN** a caller submits an unknown, remote or no-longer-eligible choice or supplies fabricated memory/intent fields
- **THEN** it receives the documented unavailable/validation/presence error with no dialogue state or revision mutation

### Requirement: Require inspected evidence and established comparison prerequisites
Only successful engine inspection SHALL mark evidence inspected. Named evidence presentation SHALL require inspection and reviewed relevance; generic evidence-topic testimony SHALL remain available. A contradiction option SHALL require an authored comparison whose public evidence/testimony prerequisites are committed. Neither player claims nor the model SHALL establish facts, relevance, ownership, guilt or contradictions.

#### Scenario: Unlock a grounded confrontation
- **WHEN** the player inspects the torn contract or records both Alice's garden sighting and Clara's after-dinner garden denial
- **THEN** the corresponding evidence option or authored conflicting-accounts option becomes available with its own prerequisites, an authorized existing denial response and no automatic truth/guilt/confession assertion

#### Scenario: Avoid manufacturing a contradiction
- **WHEN** the player has only Clara's profitable-partnership testimony and the torn contract showing planned dissolution
- **THEN** a relevant evidence question can appear but those facts alone are not labeled logically contradictory

#### Scenario: Mention unknown facts or uninspected evidence
- **WHEN** a player asserts private facts or requests presentation of an uninspected or irrelevant clue
- **THEN** no clue is auto-inspected and no NPC knowledge, comparison or private answer is created; safe guidance does not commit a substantive turn

### Requirement: Keep bounded provenance-separated memory
Each investigation SHALL isolate inspected records, canonical NPC knowledge, player-input claims, received testimony and established comparisons. Per NPC, recent substantive turns SHALL be limited to eight, repeat counts SHALL saturate at three, and summary sets SHALL contain only finite authored IDs. Player text SHALL be tagged as input and bounded to 1,000 Unicode characters; it SHALL never become canonical knowledge or model-authored memory. Clarification SHALL use the last committed substantive testimony. Received testimony SHALL not be labeled verified truth.

#### Scenario: Repeat and truncate safely
- **WHEN** a player repeats topics and exceeds eight accepted turns with one NPC
- **THEN** repetitions are recognized and delivery can vary without new facts, the recent window remains bounded, and older testimony provenance still supports authorized comparisons

#### Scenario: Isolate investigations and speakers
- **WHEN** two sessions question the same NPC or one player changes suspects
- **THEN** memory, presented evidence, emotional state and follow-up references do not leak between sessions or speakers

### Requirement: Apply deterministic character-specific demeanor
Cooperation, irritation and tension SHALL be integers clamped to 0-4 with the baselines/deltas in the approved design. Only committed substantive conversational events SHALL apply their applicable deltas once. Clarification SHALL not count as hostile repetition; courtesy SHALL not be farmed by repeats. Coarse public demeanor SHALL describe delivery only. Emotion SHALL never unlock secrets, create testimony, force confession or depend on murderer identity.

#### Scenario: Apply distinct pressure responses
- **WHEN** each NPC receives the same baseless accusation, repeated question, first relevant evidence or first respectful new question
- **THEN** the documented character-specific transition and clamping occur exactly once and the approved factual answer remains available even at extreme state values

#### Scenario: Cancel or reject without changing demeanor
- **WHEN** final accusation is canceled, an input is unsupported or a command is rejected/stale
- **THEN** no NPC emotional deltas or substantive testimony records are applied

### Requirement: Expose safe structured dialogue and compatible transport
Accepted substantive results SHALL include optional narration, spoken dialogue, monotonic turnId and coarse demeanor, retaining text equal to dialogue and legacy topic/cached fields where applicable. Public state SHALL expose only inspected IDs, received bounded turns, coarse demeanor and currently allowed option IDs/labels/kinds in addition to existing safe fields. Private policies, internal IDs, knowledge, emotions' numerical values, prompts and raw records SHALL be excluded through detached allowlists. Unsupported guidance SHALL have null narration and no substantive turnId.

#### Scenario: Read detached public context
- **WHEN** a caller reads state, injects canaries in private/catalog fields or mutates returned nested dialogue arrays
- **THEN** only declared public fields and received text serialize, no future/private options appear and authoritative state remains unchanged

#### Scenario: Use the questions endpoint compatibly
- **WHEN** an active caller submits exactly suspectId/expectedRevision and either question or choiceId
- **THEN** the existing JSON envelope and revision rules apply; both inputs/extra keys fail validation and a well-formed unavailable choice returns 409 dialogue_option_unavailable without mutation

### Requirement: Commit async dialogue atomically
No candidate dialogue SHALL mutate memory, emotions, presented IDs, history or cache until lifecycle, room generation, engine generation and applicable session reservation/revision guards pass. Invalid, ended or superseded work SHALL be discarded even when provider work fails or a performance is cached. Projection failure SHALL leave candidate changes and HTTP revision uncommitted. Direct overlapping dialogue SHALL reject the second operation without queuing. An admitted disconnected command SHALL commit once only while its guards remain valid.

#### Scenario: End or leave and return during generation
- **WHEN** a pending response completes after ending, another engine mutation, or travel away and back
- **THEN** no reply, cache entry, memory/emotion mutation or revision from that candidate is published and the final result remains stable

#### Scenario: Lose transport authority or projection
- **WHEN** a pending operation loses its session reservation/revision/identity or candidate public projection throws
- **THEN** none of its staged engine state is installed and existing state/revision remain intact

### Requirement: Preserve offline and historical compatibility
Complete CLI/HTTP/browser investigation SHALL remain possible with no model key. CLI actions 1-6, plain question prompts and Boolean accusation confirmation SHALL remain compatible; optional choice access SHALL not add prompts to existing plain-text scripts. Historical phraser APIs and their independent HW5 A/B/C expectations SHALL remain supported with exact authorized compatibility outputs and original testimony fallback, while new configured runtime uses the new authority path. Existing request/session caps, safe errors, origin policy, bearer privacy, room restrictions and ended-state behavior SHALL remain enforced.

#### Scenario: Finish offline or use an explicit legacy fixture
- **WHEN** a player completes the case offline or a compatibility fixture explicitly injects the old phraser
- **THEN** both use canonical lifecycle/presence guards, original historical validator/cache expectations remain testable, and the stateful default supports useful varied conversations without exposing secrets
