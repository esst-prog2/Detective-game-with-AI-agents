# Spec Delta

## ADDED Requirements

### Requirement: Reject known internal prompt language in delivery lead-ins
The system SHALL reject generated delivery lead-ins containing the phrases "approved statement", "approved text", or "my statement is", regardless of capitalization, even when the generated response passes existing structural rules. Rejected generation SHALL use the selected response's prewritten fallback in the game.

#### Scenario: Reject approved statement introduction
- **WHEN** approved content is "I was in the kitchen." and generation returns "Approved statement: I was in the kitchen."
- **THEN** the generated candidate is rejected

#### Scenario: Reject approved text introduction
- **WHEN** approved content is "I was in the kitchen." and generation returns "Here is the approved text: I was in the kitchen."
- **THEN** the generated candidate is rejected

#### Scenario: Reject statement announcement
- **WHEN** approved content is "I was in the kitchen." and generation returns "My statement is: I was in the kitchen."
- **THEN** the generated candidate is rejected

#### Scenario: Reject capitalization variants
- **WHEN** a structurally valid delivery lead-in contains "APPROVED STATEMENT", "Approved Text", or "MY STATEMENT IS"
- **THEN** the generated candidate is rejected

#### Scenario: Use fallback after immersion rejection
- **WHEN** generated dialogue is rejected for internal prompt language during a supported interrogation
- **THEN** the game displays the selected response's prewritten fallback

### Requirement: Accept natural delivery lead-ins within existing structural bounds
The system SHALL accept "I hesitated: I was in the kitchen." for approved content "I was in the kitchen." when existing format rules are satisfied. Immersion validation SHALL retain the existing exact approved-content suffix, permitted lead-in characters and length, and total output length checks.

#### Scenario: Accept natural hesitation
- **WHEN** approved content is "I was in the kitchen." and generation returns "I hesitated: I was in the kitchen."
- **THEN** the generated candidate is accepted unchanged

#### Scenario: Continue rejecting changed approved content
- **WHEN** approved content is "I was in the kitchen." and generation returns "I hesitated: I was in the garden."
- **THEN** the generated candidate is rejected
