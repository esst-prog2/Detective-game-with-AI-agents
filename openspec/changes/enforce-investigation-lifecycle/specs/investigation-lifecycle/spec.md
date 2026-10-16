# Spec Delta

## Purpose

Makes the investigation lifecycle authoritative in the engine, with a single stable conclusion and deterministic rejection of further gameplay commands.

## ADDED Requirements

### Requirement: Start active and end once
Each investigation SHALL start active with no final result. Only its first explicitly confirmed accusation of a valid suspect SHALL transition it to ended and store a correct or incorrect result. Cancellation or an invalid suspect while active SHALL leave it active without a final result. A new investigation SHALL have independent state.

#### Scenario: Create an investigation
- **WHEN** a new investigation is created
- **THEN** its lifecycle is active and its final result is absent

#### Scenario: Cancel and continue
- **WHEN** an active accusation is not confirmed
- **THEN** the investigation remains active and questioning and evidence inspection remain available

#### Scenario: Confirm an invalid suspect
- **WHEN** an active accusation names an unknown suspect
- **THEN** it is rejected without ending the investigation or storing a result

#### Scenario: Confirm a valid accusation
- **WHEN** the player explicitly confirms a valid suspect while active
- **THEN** the engine ends the investigation and stores the corresponding correct or incorrect outcome

### Requirement: Reject commands after ending
After ending, the engine SHALL reject questioning, evidence inspection and all further accusations with a deterministic investigation-ended error. This SHALL apply to both internal and public evidence inspection, known and unknown IDs, supported and unsupported questions, cached answers, and confirmed or canceled accusation attempts. Rejections SHALL NOT contain evidence descriptions or NPC answers, invoke a dialogue generator, or change the final result. Read-only overview, lifecycle, identity and evidence-summary queries SHALL remain available.

#### Scenario: Attempt post-game questioning or inspection
- **WHEN** a caller asks any question or inspects any evidence after ending
- **THEN** it receives an investigation-ended rejection without an answer or description

#### Scenario: Repeat or cancel an accusation after ending
- **WHEN** a caller repeats the original accusation, accuses another or unknown suspect, or cancels an accusation after ending
- **THEN** the command is rejected and the original final result remains unchanged

### Requirement: Preserve a stable detached final result
The engine SHALL retain the first resolved outcome and display text without recomputing them on later reads or commands. Returned lifecycle and final-result objects SHALL be detached so caller mutation cannot change stored state. An incorrect accusation SHALL NOT reveal the actual murderer through lifecycle information.

#### Scenario: Read or mutate returned results
- **WHEN** a caller mutates the initial resolution response or later lifecycle snapshots and reads the state again
- **THEN** the original status, outcome and text remain unchanged

### Requirement: Prevent late dialogue from resuming ended play
If questioning began while active but its asynchronous dialogue generation finishes after a confirmed accusation ends the investigation, the question SHALL resolve as an investigation-ended rejection without returning or caching that late answer. The stored result SHALL remain unchanged.

#### Scenario: End while dialogue is pending
- **WHEN** a valid accusation ends an investigation before a pending dialogue generator settles successfully or unsuccessfully
- **THEN** the pending question returns an ended rejection and does not commit dialogue after ending

### Requirement: Preserve terminal investigation behavior
The CLI SHALL retain numbered suspect selection, explicit confirmation, continued play on cancellation, and the existing correct/incorrect ending messages. Evidence inspection SHALL pass through engine enforcement. Opening the CLI with an already-ended investigation SHALL show the stored final text and return without requesting gameplay input. Quitting the CLI without accusation SHALL NOT fabricate an accusation result.

#### Scenario: Complete or cancel a terminal accusation
- **WHEN** the player uses the normal CLI confirmation flow
- **THEN** cancellation continues play and confirmation ends once with the original outcome wording

#### Scenario: Reuse an ended investigation in the CLI
- **WHEN** the CLI receives an already-ended investigation
- **THEN** it displays the stored final text and exits without offering another investigation action
