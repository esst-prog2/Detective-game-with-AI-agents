# Spec Delta

## Purpose

Defines the single, hand-authored murder mystery and bounded suspect data used by the playable MVP investigation.

## ADDED Requirements

### Requirement: Provide one bounded MVP murder case
The system SHALL provide one fully solvable, hand-authored murder case containing exactly three suspects, one victim, two or three locations, and a small set of evidence items.

#### Scenario: Start the MVP case
- **WHEN** a player starts a new investigation
- **THEN** the system presents the single configured murder case with its three suspects and available evidence

### Requirement: Define complete suspect information
The system SHALL define for each suspect a name, short personality description, relationship to the victim, motive or lack of motive, private facts, one permitted lie or concealment with its reason, and an approved response for every supported investigation category.

#### Scenario: Retrieve a suspect's supported response data
- **WHEN** the game handles a supported category question for a suspect
- **THEN** that suspect has approved response data available for the category

### Requirement: Keep suspect knowledge fixed
The system SHALL keep each suspect's knowledge fixed for the entire investigation and SHALL NOT share facts between suspects.

#### Scenario: Continue an investigation after questioning another suspect
- **WHEN** a player questions one suspect and then questions another
- **THEN** the second suspect's available knowledge is unchanged by the first conversation

### Requirement: Provide a solvable investigation
The configured case SHALL provide sufficient evidence and approved suspect responses for a player to identify the murderer without relying on facts outside the case content.

#### Scenario: Follow the intended solution path
- **WHEN** a player inspects the configured evidence and receives the relevant approved responses
- **THEN** the available information supports identifying the configured murderer
