# Spec Delta

## Purpose

Present authoritative stateful conversations as an accessible cinematic detective experience with optional narration, useful choices and first-class free-text questioning.

## ADDED Requirements

### Requirement: Render structured performance cinematically
The browser SHALL retain the illustrated room, dark-academia identity, prominent large figure and integrated dialogue overlay. Optional narration SHALL be visually and semantically separate from spoken dialogue, omitted when null and rendered as escaped text. Guidance SHALL be distinguished from received testimony. Public demeanor SHALL use only coarse server labels, never a guilt/truth score. Missing expression artwork SHALL fall back safely to existing neutral/generic art.

#### Scenario: Receive narrated or speech-only replies
- **WHEN** accepted replies contain narration or null narration
- **THEN** the interface displays only actual received content with correct speaker attribution, no duplicate legacy text and no invented gesture or emotion

### Requirement: Offer contextual choices alongside free text
The interrogation SHALL present engine-issued options for topics, clarification, revisits, eligible evidence and established comparisons, alongside an independently operable free-text form. Selection SHALL submit the option ID through the same questions command path without changing a typed draft. The frontend SHALL NOT create option meaning, relevance, prerequisites or contradictions. Remote/ended/pending interactions SHALL retain existing restrictions.

#### Scenario: Mix text and eligible choices
- **WHEN** a player types a question, follows up, inspects evidence and selects a newly available confrontation
- **THEN** each interaction uses the current engine options/revision and receives authorized testimony while free text remains available

#### Scenario: Select a stale option
- **WHEN** an option is no longer eligible when submitted
- **THEN** the UI preserves drafts/known notes and offers state refresh after the structured error, without automatic replay or invented success

### Requirement: Preserve honest accessible conversation history
History SHALL keep narration and speech separate, identify actual player input or engine choice labels, distinguish guidance and merge accepted server recent turns by speaker/turn ID without duplication. The server's eight-turn window SHALL NOT be presented as complete persistent history; older actually received local turns SHALL remain readable. Inspected IDs SHALL NOT fabricate missing evidence descriptions. Received testimony SHALL remain unverified testimony.

#### Scenario: Recover a lost reply or review after ending
- **WHEN** state reconciliation includes a committed recent turn or the investigation ends
- **THEN** the turn is merged once, existing notes remain readable and no new question/inspection is sent to reconstruct missing information after ending

### Requirement: Preserve privacy and asynchronous client guards
All new public fields SHALL pass explicit client projections. Session bearers SHALL remain in client memory only; raw case/secret/policy/prompt data SHALL stay out of frontend modules, assets, bundles, state and logs. Choice/text requests SHALL share mutation, generation, revision, room, timeout and lifecycle guards. Old or ended-late replies SHALL NOT append narration/history, alter demeanor or reopen play. Uncertain requests SHALL require reconciliation and deliberate retry.

#### Scenario: Reorder responses or replace a session
- **WHEN** dialogue or GET deliveries arrive late after movement, ending, a newer revision or a new investigation
- **THEN** obsolete content is discarded and the accepted room, final result, history and demeanor remain correct

#### Scenario: Inject private metadata or markup
- **WHEN** a response contains undeclared private fields or user/server text resembles executable markup
- **THEN** projections exclude the private fields and rendered text cannot execute scripts or expose credentials

### Requirement: Support accessible responsive full offline play
The UI SHALL support keyboard-operable choices/free text, visible focus, dialog focus return, non-disruptive status announcements, 44px primary targets, 4.5:1 normal-text/3:1 large-control contrast, 360px layout, 200-percent zoom/reflow and reduced motion. The existing mystery SHALL remain fully playable offline through either final outcome and cancellation. Larger synthetic casts and missing art SHALL render without hardcoded three-person assumptions. Actual desktop/mobile cinematic screenshots SHALL be reviewed in addition to automated behavior checks.

#### Scenario: Complete the offline case on narrow or keyboard layouts
- **WHEN** a player uses mixed text/choices, travels, reviews history/evidence and cancels or confirms an accusation without a model key
- **THEN** all essential actions and received content remain readable/reachable, the figure stays prominent and authoritative ending behavior is unchanged
