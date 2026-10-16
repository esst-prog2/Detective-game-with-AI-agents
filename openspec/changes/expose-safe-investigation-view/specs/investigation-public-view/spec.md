# Spec Delta

## Purpose

Provides explicitly allowlisted, detached player-visible investigation data for interface adapters without exposing authoritative case secrets.

## ADDED Requirements

### Requirement: Provide an allowlisted investigation overview
The system SHALL provide a serializable player overview containing only the case title, victim name and introduction description, location names, suspect IDs and names, and evidence IDs and names in case-data order. The overview SHALL NOT include evidence inspection descriptions, the murderer designation, intended solution, suspect personality prompts, motives, private facts, beliefs, secrets, disclosure rules, permitted lies, response tables, truthfulness labels, concealment reasons, or any unlisted fields added to case records.

#### Scenario: Retrieve the current case overview
- **WHEN** an adapter requests a public overview of the configured investigation
- **THEN** the overview contains exactly the allowlisted fields and preserves their authored display values and ordering

#### Scenario: Extend case records with private metadata
- **WHEN** private metadata is added to case, victim, suspect or evidence records
- **THEN** serializing the public overview does not expose that metadata

### Requirement: Provide safe individual lookups
The system SHALL provide public suspect lookup containing only ID and name and public evidence inspection containing only ID, name and authored inspection description. Unknown IDs SHALL return null. All configured evidence SHALL remain inspectable without discovery prerequisites, preserving current gameplay.

#### Scenario: Retrieve a suspect identity
- **WHEN** an adapter looks up a configured suspect through the public lookup
- **THEN** it receives only the suspect ID and name, without private metadata

#### Scenario: Inspect configured evidence
- **WHEN** an adapter inspects configured evidence through public inspection
- **THEN** it receives only the evidence ID, name and description, without additional metadata

#### Scenario: Request an unknown identity or evidence item
- **WHEN** an adapter supplies an unknown ID to either public lookup
- **THEN** the lookup returns null without returning another record

### Requirement: Isolate returned data from authoritative records
The system SHALL return detached objects and arrays for every public overview and lookup. Mutating a returned value SHALL NOT change case data, subsequent public results, dialogue selection, evidence descriptions or accusation outcomes. Public reads SHALL NOT invoke dialogue generation or change gameplay behavior.

#### Scenario: Mutate a returned overview and inspection
- **WHEN** a caller changes nested victim, suspect, evidence or location values in public results
- **THEN** authoritative case records, subsequent reads and investigation behavior remain unchanged

### Requirement: Preserve existing interface behavior
The system SHALL preserve the existing CLI and existing engine method contracts, including offline dialogue, repeat caching, evidence access and accusation results. Public view construction SHALL use the investigation's configured case data without a hardcoded cast size or character IDs.

#### Scenario: Continue the existing CLI investigation
- **WHEN** the existing CLI conducts an investigation after public views are introduced
- **THEN** its questioning, evidence inspection, cancellation and confirmed accusation behavior continues to work

#### Scenario: Project another configured dataset
- **WHEN** an investigation uses injected case data with different identities and collection sizes
- **THEN** the public results reflect that dataset without exposing additional private fields
