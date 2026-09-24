# Spec Delta

## Purpose

Lets players inspect the bounded evidence of the MVP case without requiring NPC dialogue about individual clues.

## ADDED Requirements

### Requirement: List and inspect evidence descriptions
The system SHALL make each configured evidence item available for player inspection and SHALL show its description.

#### Scenario: Inspect an evidence item
- **WHEN** a player selects an available evidence item to inspect
- **THEN** the system displays that item's configured description

### Requirement: Exclude clue-specific NPC questions
The system SHALL NOT interpret a named evidence item in a typed NPC question as a request for a clue-specific response.

#### Scenario: Mention a named clue to a suspect
- **WHEN** a player asks a suspect about a specific named evidence item
- **THEN** the system does not retrieve a clue-specific NPC response
