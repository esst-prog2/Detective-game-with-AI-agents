# Spec Delta

## Purpose

Provides a clear, final accusation interaction that resolves the MVP investigation against the configured murderer.

## ADDED Requirements

### Requirement: Present suspects in a numbered accusation menu
The system SHALL present the three suspects as numbered choices when the player begins an accusation.

#### Scenario: Open the accusation menu
- **WHEN** a player chooses to make an accusation
- **THEN** the system displays the three suspect names as numbered choices

### Requirement: Require confirmation before resolving an accusation
The system SHALL request confirmation after the player selects a suspect and SHALL NOT resolve the accusation unless the player confirms it.

#### Scenario: Cancel a pending accusation
- **WHEN** a player declines confirmation for a selected suspect
- **THEN** the system returns to the investigation without ending it

### Requirement: End the investigation after a confirmed accusation
The system SHALL compare a confirmed accusation with the configured murderer, display whether it is correct or incorrect, and end the investigation.

#### Scenario: Confirm the correct accusation
- **WHEN** a player confirms the configured murderer
- **THEN** the system reports a correct accusation and ends the investigation

#### Scenario: Confirm an incorrect accusation
- **WHEN** a player confirms an innocent suspect
- **THEN** the system reports an incorrect accusation and ends the investigation
