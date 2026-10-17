# Spec Delta

## Purpose

Allow optional AI character performance using independently validated narration and speech while preserving deterministic mystery knowledge, author permissions and safe offline behavior.

## ADDED Requirements

### Requirement: Accept only an authorized structured performance pair
Model output SHALL be exactly an object containing narration (null or a 1-240-character string) and dialogue (a 1-1,200-character string), with no additional keys and at most 4 KiB UTF-8 serialized output. Both strings SHALL match one engine-authorized reviewed pair for the current NPC/core/context. SDK schema conformance alone SHALL NOT authorize content. Unknown text, mismatched pairs, private revelations, invented facts or consequential actions SHALL be rejected before publication or cache/memory insertion.

#### Scenario: Accept useful speech with optional narration
- **WHEN** a model returns an allowed pair with a short harmless gesture or null narration
- **THEN** its exact approved speech and permitted narration can be committed separately, retaining authorized testimony and intentional deception

#### Scenario: Attempt an unauthorized performance
- **WHEN** either field introduces a new alibi, confession, private fact, ownership claim, detective action/thought, destructive event or unapproved guilt reaction
- **THEN** the entire output is discarded and none of its partial text is displayed, stored as testimony or cached

#### Scenario: Combine independently valid but incompatible fields
- **WHEN** returned speech and narration belong to different NPCs, cores or permission contexts
- **THEN** the pair is rejected even if each string appears elsewhere in an authored catalog

### Requirement: Keep performance context minimal and server-only
Model requests SHALL include only reviewed performance style of at most 500 Unicode characters, coarse demeanor, public recognized intent of at most 64 characters and at most four current allowed pairs including a null-narration option. Raw player input and full history SHALL NOT appear in model input; player input SHALL appear publicly only as attributed bounded conversation history under the stateful contract. Raw case data, secrets, solution, lie metadata, internal policies and bearer/API credentials SHALL NOT appear in model input or dialogue payloads. Model configuration SHALL be server-only, never accepted in HTTP request bodies. Models SHALL NOT select facts, resolve contradictions, authorize disclosure or change memory/emotions/events.

#### Scenario: Inject player instructions or request private data
- **WHEN** a player asks the model to ignore policy, reveal prompts or remember an invented fact
- **THEN** the engine selects only permitted context, raw instructions are absent from provider input and canonical/player-claim separation remains intact

### Requirement: Fall back safely and preserve async guards
Missing configuration, provider failure/refusal, timeout, malformed/oversized output and validation failures SHALL use the prepared deterministic structured fallback exactly once while the context remains valid. Stale/ended completions, including failed-provider fallbacks, SHALL commit no response, memory, emotion, history, cache or transport revision. A cache hit SHALL undergo current permission and lifecycle checks.

#### Scenario: Fail offline or return malformed content
- **WHEN** credentials are absent or a provider returns extra keys, wrong types, prose, invalid JSON, excess size or times out
- **THEN** useful approved fallback dialogue remains playable, errors expose no provider details and optional narration remains authorized

#### Scenario: End during generation or fallback
- **WHEN** an investigation ends, moves, changes generation or loses transport reservation while performance is pending
- **THEN** successful or failed delayed work is discarded without altering the stable final result or any dialogue state

### Requirement: Preserve historical validation without overstating safety
The new runtime SHALL use the new bounded performer while retaining the explicitly injected historical phraser API, independent HW5 validator expectations and historical evidence unchanged. The old free lead-in SHALL NOT be promoted into trusted structured narration. Documentation SHALL state the finite-selection trade-off, authored-content risk and continuing open status of issue #3; the milestone SHALL NOT claim its resolution or close it.

#### Scenario: Run old and new boundary regressions
- **WHEN** historical A/B/C and immersion tests run alongside adversarial structured-output tests
- **THEN** the original expectations remain intact, the new path rejects unauthorized text in either field and passing tests do not imply a general semantic hallucination guarantee
