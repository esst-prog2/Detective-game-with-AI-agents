# Spec Delta

## Purpose

Lets players question suspects in natural language while keeping all disclosed content within engine-approved knowledge and lies.

## ADDED Requirements

### Requirement: Support six investigation categories
The system SHALL classify supported typed player questions using simple rules and keywords into exactly these categories: alibi, relationship with victim, motive, sighting, evidence, and crime details.

#### Scenario: Recognize an alibi question
- **WHEN** a player asks a supported question about where a suspect was during the murder
- **THEN** the system classifies the question as alibi

### Requirement: Guide supported questioning
The system SHALL display example questions that guide players toward the six supported investigation categories.

#### Scenario: View interrogation guidance
- **WHEN** the player enters or views the interrogation interface
- **THEN** the system displays examples covering the supported categories

### Requirement: Select only approved response content
The system SHALL select the exact response content from the addressed suspect's approved response for the classified category, including any permitted lie or concealment, before generating player-visible dialogue.

#### Scenario: Ask a suspect about a known topic
- **WHEN** a player asks a supported question to a suspect
- **THEN** the selected content is limited to that suspect's approved response for the matched category

### Requirement: Keep unknown facts out of dialogue
The system SHALL NOT include a fact in a suspect response when that fact is absent from the suspect's approved response content.

#### Scenario: Ask a suspect about an unknown fact
- **WHEN** a player asks a suspect about information not available in that suspect's approved response content
- **THEN** the response does not disclose that information

### Requirement: Use bounded dialogue phrasing with fallback
The system SHALL use an LLM only to phrase engine-selected content naturally. It SHALL display the prewritten plain-text fallback for that content if generation is unavailable, times out, or produces invalid output.

#### Scenario: LLM phrasing succeeds
- **WHEN** valid LLM phrasing is available for approved response content
- **THEN** the system displays phrasing that preserves the selected content

#### Scenario: LLM phrasing fails
- **WHEN** LLM generation is unavailable, times out, or returns invalid output
- **THEN** the system displays the response's prewritten plain-text fallback

### Requirement: Return stable repeated answers
The system SHALL return exactly the same response text when a player repeats a question to the same suspect that maps to the same category during one investigation.

#### Scenario: Repeat a recognized question
- **WHEN** a player repeats a question to the same suspect and both questions map to the same category
- **THEN** the system displays the identical response text used for the earlier question

### Requirement: Handle unsupported questions safely
The system SHALL display a deterministic fallback naming the six supported topics when a question cannot be classified into a supported category.

#### Scenario: Ask an unsupported question
- **WHEN** a typed player question matches no supported category
- **THEN** the system displays the deterministic topic-guidance fallback without generating NPC facts
