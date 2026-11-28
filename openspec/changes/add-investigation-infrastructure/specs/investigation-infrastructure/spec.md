## ADDED Requirements

### Requirement: Case-defined contacts and navigation
The engine SHALL restrict accusations to eligible contacts and travel to connected destinations when the case declares connections. Missing eligibility defaults to true and missing connections permit all existing destinations. Preview restrictions take precedence.

#### Scenario: Supporting witness in a connected case
- **WHEN** a player interviews an ineligible witness or attempts a prohibited accusation or non-edge journey
- **THEN** the interview is available while either prohibited command is rejected without advancing state

#### Scenario: Malformed graph or solution
- **WHEN** a graph is partial, asymmetric, disconnected or contains invalid, self or duplicate destinations, or a solution names an ineligible character
- **THEN** loading fails

### Requirement: Read-only interview navigation
Both clients SHALL expose all currently authorized choices in deterministic pages of at most six and preserve read-only access to attributed received statements and applicable historical clarifications.

#### Scenario: Browsing and revising
- **WHEN** a player browses further questions or reviews a received statement
- **THEN** no turn, provider request, memory, receipt or direction is consumed and only currently authorized follow-ups can be selected

#### Scenario: Stale selection
- **WHEN** an action has lost eligibility before selection or commit
- **THEN** the engine rejects it and preserves the committed state
