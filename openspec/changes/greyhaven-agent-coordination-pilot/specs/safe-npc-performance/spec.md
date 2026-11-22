# Safe NPC performance

## MODIFIED Requirements

### Requirement: Keep performance context minimal and server-only

Ordinary performance requests SHALL include only reviewed performance style of at most 500 Unicode characters, coarse demeanor, public recognized intent of at most 64 characters and at most four current allowed pairs including a null-narration option. For the opt-in Greyhaven pilot the NPC projection MAY additionally carry the public speaker role, one reviewed acting-goal ID, one validated instruction ID and bounded same-speaker memory tags. The director projection SHALL contain only the public role sequence, bounded committed action tags and offered strategy IDs. Raw player input and full history SHALL NOT appear in model input. Player input SHALL appear publicly only as attributed bounded conversation history under the stateful contract. Raw case data, secrets, solution, lie metadata, internal policies and bearer/API credentials SHALL NOT appear in model input or dialogue payloads. Model configuration SHALL be server-only, never accepted in HTTP request bodies. Models SHALL NOT select facts, resolve contradictions, authorize disclosure or change memory/emotions/events.

#### Scenario: Inject player instructions or request private data
- **WHEN** a player asks the model to ignore policy, reveal prompts or remember an invented fact
- **THEN** the engine selects only permitted context, raw instructions are absent from provider input and canonical/player-claim separation remains intact

#### Scenario: Project two roles from the same committed turn
- **WHEN** Owen's presentation qualifies
- **THEN** the director sees only the coordination projection, Owen receives only his reviewed projection and current performances, and Mara's later call receives only hers without Owen's testimony, memory or protected account details
