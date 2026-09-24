# Proposal

## Why

The project needs a small but complete, demonstrable detective game that proves NPCs can converse without revealing facts outside their individual knowledge. Defining the MVP now turns the agreed gameplay and reliability boundaries into an implementable, testable scope.

## What Changes

- Add one hand-authored, fully solvable murder case with three suspects, one victim, 2-3 locations, and a small set of inspectable evidence.
- Add fixed per-suspect knowledge, motives, personality descriptions, and controlled lies; NPC knowledge does not change during an investigation.
- Add typed interrogation that maps simple rules and keywords to six supported investigation categories: alibi, relationship with victim, motive, sighting, evidence, and crime details.
- Add engine-selected, approved response content with LLM phrasing and a prewritten plain-text fallback. Repeated questions must return identical text.
- Add a deterministic fallback for unsupported questions and example questions that guide the player.
- Add a numbered, confirmed final accusation flow that reports whether the selected suspect is the murderer and ends the investigation.

## Capabilities

### New Capabilities

- `game-case-content`: Defines the single hand-authored MVP mystery and the structured suspect information it contains.
- `npc-interrogation`: Provides bounded, knowledge-safe NPC questioning and response behavior.
- `evidence-inspection`: Lets players inspect a small set of evidence descriptions without clue-specific NPC questioning.
- `accusation-resolution`: Lets players make and confirm one final accusation and receive the result.

### Modified Capabilities

- None.

## Impact

- Adds the initial command-line game application, case data, question classification, response-selection and LLM-adaptation boundary, and test coverage.
- Requires an LLM integration only for optional natural-language phrasing; prewritten response text keeps the game playable when that integration fails.
- Does not add NPC-to-NPC knowledge sharing, dynamic memory, clue-specific questioning, procedural cases, or a graphical interface.
