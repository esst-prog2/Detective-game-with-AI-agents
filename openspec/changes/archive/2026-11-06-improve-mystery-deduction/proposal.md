# Proposal

Implementation was approved on 2026-11-06 with the additional requirement that recognition cannot establish ownership or a witnessed drop. Implementation and automated verification are recorded in docs/mystery-deduction/verification.md; the original planning boundary below records the proposal stage, not current implementation status. User-reported playtest observations are now recorded, including a correct accusation and difficulty/clarification concerns.

## Why

The intended Ashcroft solution cites Clara's missing cufflink, but obtainable descriptions and testimony never establish ownership. The current ending gives a verdict without reasoning, and Alice's debt annotation contradicts her approved speech. Repair these authored gaps before expanding the game.

## What Changes

- Add one explicitly authorized Alice response identifying the inspected cufflink as matching the pair Clara wore at dinner, with no claim about when it was lost or who committed the murder.
- Offer that evidence question through existing contextual choices and free text; preserve all six original topic answers and fallbacks.
- Correct Alice's private concealment annotation, retaining her exact motive testimony and protecting her debt-letter/library details.
- Replace the overstated intended solution with a circumstantial, source-attributed deduction chain.
- Expand the successful final text using only inspected clues and committed testimony, acknowledging missing support; retain the existing verdict and incorrect-accusation privacy.
- Verify a complete offline public-action investigation across engine, CLI and browser, including missing-prerequisite and malicious-provider cases.

## Capabilities

### New Capabilities

- `mystery-deduction`: Discoverable, source-attributed clue chains and evidence-aware, privacy-preserving case conclusions for the existing mystery. Earlier case-content/accusation requirements exist only in older change directories, not as canonical capabilities; this capability supplies their focused deduction contract without rewriting those artifacts.

### Modified Capabilities

- `stateful-npc-dialogue`: Permit the narrowly reviewed authored case additions and resolve Alice's annotation conflict while preserving testimony, fixed knowledge and exact authorization.
- `npc-dialogue-naturalness`: Permit the same bounded editorial corrections without weakening complete-testimony equivalence or original fallbacks.

## Impact

Future implementation touches server case/catalog/intent/ending logic, independent content fixtures and integration tests; existing CLI, HTTP and browser consume the same result text contract. No dependencies, routes, public fields, model architecture or art changes are proposed. Existing immutable-result and stale-response guarantees remain.

## Non-goals and approval boundary

Planning only. No production/test implementation, canonical-spec edits, commits, pushes, merges or archives. No extra cast, rooms, cases, save/resume, relationship or secret-disclosure systems, deduction board, score or UI redesign. New evidence testimony uses existing inspection gating, not trust/emotion-based disclosure. Review the proposed story wording, knowledge permission and sparse-ending policy in design.md before implementation.
