# Proposal

## Why

The engine currently exposes authoritative case records, including the murderer and private suspect information. Future graphical adapters need explicit player-visible data without serializing those records or changing the existing CLI.

## What Changes

- Add a detached, allowlisted investigation view containing the title, public victim introduction, location names, suspect identities and evidence summaries.
- Add public suspect lookup and evidence inspection that return only approved display fields, with null for unknown IDs.
- Verify that extra private fields cannot escape and that modifying returned views cannot mutate the case or later gameplay.
- Retain existing engine and CLI contracts. Do not add HTTP, UI, lifecycle state, dialogue changes or expanded case models.

## Capabilities

### New Capabilities

- `investigation-public-view`: Defines detached player-visible investigation, suspect and evidence projections.

### Modified Capabilities

- None. The existing capabilities remain in unarchived changes; this additive boundary does not change their gameplay requirements.

## Impact

Small additions to `src/game.js`, focused offline tests, integration-boundary documentation in README, and append-only planning-log updates. No dependencies or artwork are required. Existing HW4/HW5 artifacts and evidence remain unchanged. This is a data boundary for future adapters, not a network security boundary or a resolution of NPC knowledge leakage.
