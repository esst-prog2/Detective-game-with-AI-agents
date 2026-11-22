# Interview coordination

## Purpose

Let one model direct a pair of interviews while each witness chooses a character-specific response under the investigation's factual permissions.

## ADDED Requirements

### Requirement: Coordinate two eligible interviews

In the enabled Greyhaven pilot the Game Master SHALL choose one of at least two offered cross-speaker strategies based on committed player-action categories. Its choice SHALL constrain how Owen handles the authorized payment presentation and how Mara handles her next eligible source clarification.

#### Scenario: Carry a strategy across rooms
- **WHEN** the director and Owen each return valid choices and Owen's evidence turn commits
- **THEN** ordinary travel to reception preserves the direction, and Mara receives its character-specific instruction on her authorized source follow-up without another director call

#### Scenario: Ask too early
- **WHEN** Owen's initial account or either inspection is missing
- **THEN** the attempted payment presentation uses the existing unavailable-choice or guidance behavior, makes zero role calls and grants no receipt or direction

### Requirement: Give each speaker an independent bounded decision

Each strategy SHALL offer each eligible speaker at least two distinguishable conversational actions, each expressed by an exact reviewed performance carrying the entire currently permitted testimony. The speaker SHALL select using its own acting goal, style, safe committed memory and validated instruction.

#### Scenario: Hold the direction fixed
- **WHEN** two fresh replays select different eligible reactions for the same speaker under the same direction
- **THEN** the player can distinguish the conversational actions in the dialogue and both replies preserve every assertion, omission and uncertainty limit of that core

### Requirement: Bind directions to committed session state

A direction SHALL be session-, case-, speaker- and target-specific, consumed once on the target turn's successful commit, and expire after two intervening committed substantive interviews or when its case, session, or target becomes invalid.

#### Scenario: Expiry and isolation
- **WHEN** two intervening substantive interviews commit, the session restarts, or another session selects the same case
- **THEN** the old direction is unavailable there, even when local speaker and statement IDs coincide

#### Scenario: Lose authority while waiting
- **WHEN** either role returns after the pending turn is canceled, superseded or loses projection or commit authority
- **THEN** that candidate cannot install testimony, directions, consumption, memory, delivery history, cache entries or a revision

### Requirement: Bound provider usage and preserve playable fallback

The pilot SHALL permit at most one director and two NPC requests per session across the two directed interviews, with zero retries and one four-second provider-wait budget per player turn. A valid current turn SHALL use the existing authored fallback on any invalid, failed, missing or late role result. Offline mode SHALL require zero calls.

#### Scenario: Director or witness fails
- **WHEN** an originating role fails or its shared deadline elapses
- **THEN** the current valid interview completes once with baseline delivery and installs no handoff, and a late result cannot change it

### Requirement: Demonstrate observable coordination and factual parity

The evaluation SHALL replay the same public actions offline, with controlled provider choices, and in a separately labeled live trial. It SHALL report role provenance, visible behavior, elapsed time and request usage. Identical action sequences SHALL retain identical factual permissions and investigation progression.

#### Scenario: Compare the two strategies
- **WHEN** both strategies and both reactions per speaker are exercised in matched replays
- **THEN** each produces a reviewable difference in conversational behavior and zero differences in authorized cores, inspections, receipts, account transitions, available factual choices and lifecycle
