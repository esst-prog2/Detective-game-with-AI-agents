# Spec Delta

## ADDED Requirements

### Requirement: Expose only allowlisted lifecycle information
The public overview SHALL add a detached lifecycle object containing only status and finalResult. Status SHALL be active or ended. The finalResult SHALL be null while active and SHALL contain only the existing player-visible ended flag, correct/incorrect outcome and final text after ending. No canonical murderer field, solution, private NPC data, response cache, authoring metadata or additional internal lifecycle fields SHALL be exposed. Public reads SHALL NOT change state or invoke dialogue generation. The existing public field allowlist SHALL otherwise remain unchanged.

#### Scenario: Read an active public lifecycle
- **WHEN** a caller requests a public overview before a valid accusation is confirmed
- **THEN** lifecycle contains only active status and a null final result, with no solution or internal state

#### Scenario: Read an ended public lifecycle
- **WHEN** a caller requests a public overview after ending
- **THEN** lifecycle contains only ended status and a detached copy of the stored player-visible final result

#### Scenario: Mutate or extend internal state
- **WHEN** callers mutate returned lifecycle fields or private authoring fields are added to case records
- **THEN** later public reads retain the original lifecycle and expose only explicitly allowlisted fields

### Requirement: Apply lifecycle restrictions to public evidence inspection
The public evidence inspection contract SHALL return its existing detached display fields or null for unknown IDs while active. After ending, public inspection SHALL return only the deterministic investigation-ended error, without evidence descriptions or private records, even for unknown IDs. Overview evidence summaries and public suspect identity reads SHALL remain available after ending.

#### Scenario: Inspect public evidence after ending
- **WHEN** a caller requests a known or unknown evidence ID after a confirmed accusation
- **THEN** the public inspection returns an ended rejection instead of evidence or an unknown-ID lookup result
