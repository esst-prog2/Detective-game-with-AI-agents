# E1 · A Game Master for the Greyhaven preview

## Why

Today a model can select how one witness delivers authorized testimony. E1 should let a teacher see a model make an interview decision that carries from Owen to Mara, then see each witness independently choose how to respond. The two-person preview already supplies the necessary interviews, factual gates and offline comparison.

## What Changes

- Introduce an opt-in pilot in the local CLI and server-backed browser game. At one authorized evidence confrontation, the Game Master reads committed play history and chooses a strategy for Owen and a later Mara follow-up.
- Give each speaker a bounded, character-specific choice within either strategy. All branches deliver the complete authorized statement. The engine reviews the direction, the selected performance and the eventual commit.
- Supply an independent offline/scripted replay and a small live demonstration with redacted role events and measured call usage. See the [scenario and acceptance rubric](demonstration.md).
- E1 ends at this pilot. E2 owns the full Greyhaven case and both discovery routes. F owns accusation outcomes and end-to-end verification.

## Capabilities

### New Capabilities

- `interview-coordination` covers optional cross-speaker model direction, local character decisions, transaction safety and observable evaluation.

### Modified Capabilities

- `safe-npc-performance` distinguishes the pilot's narrowly typed input projections from the existing performer projection. Its exact narration/dialogue output contract still applies to every NPC.

## Impact

Changes after approval would touch the preview package, investigation transaction, server/CLI composition and provider adapters. Reuse the current SDK, public questions endpoint, session guards and test infrastructure. Keep the pilot's local evaluation trace outside the gameplay HTTP response. The [architecture audit](../../../docs/ai-architecture-review.md) explains the baseline. The older roadmap's E1–E4 content work packages all belong to phase E2 under the newly approved milestone split.
