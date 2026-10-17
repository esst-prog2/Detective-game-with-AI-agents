# Proposal

## Why

The room-based browser has a strong cinematic composition, but its dialogue panel presents one undifferentiated string and six static example questions. Present authoritative stateful conversations without losing the prominent figure, free text or accessibility.

## What Changes

- Depend on `add-stateful-dialogue-engine` and `add-safe-npc-performance` for the completed milestone; offline UI remains fully usable without the latter's model configuration.
- Project and render optional narration separately from speech, with actual received history and subtle public demeanor.
- Replace static-only help with engine-issued suggestions, contextual follow-ups, revisits and eligible evidence/contradiction choices alongside first-class free text.
- Retain cinematic room art, large figures, responsive typography, accessible reading dialogs and future replaceable expression slots.
- Preserve bearer handling, one-mutation gating, revision/generation checks, stale-room rejection, no automatic replay and ended-state review.
- Verify complete offline browser play, choices/free-text equivalence, privacy, adversarial escaped text, accessibility and actual desktop/mobile visuals.
- Phase 3 of three; no frontend inference of knowledge, relevance, guilt or canonical actions.

## Capabilities

### New Capabilities

- `hybrid-dialogue-interface`: cinematic structured conversations and engine-driven dialogue choices.

### Modified Capabilities

None in main specs. Design explicitly extends the unarchived browser/room contracts while preserving their security, presence, lifecycle and aesthetic requirements.

## Impact

Expected implementation areas: browser API projection/client, reducer, DialoguePanel/history, small presentation/CSS changes, Node client tests and Playwright scenarios. No server-module imports, new art requirement, framework, new story/cast/case, polished expression generation or historical evidence edits.
