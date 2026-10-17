# Proposal

## Why

Manual play found useful, safe dialogue undermined by repeated personality announcements and mechanical gestures. A read-only 18-question-per-NPC probe confirms that fixed prefixes, narrow speech pools and delivery-insensitive caching produce this repetition in both offline and injected-selector paths.

## What Changes

- Replace default prefix assembly with reviewed complete speech alternatives tied to the existing testimony cores, conversational intent and public demeanor. Remove the three reported catchphrases rather than substitute new signatures.
- Deliberately extend Phase 2's verbatim-core-inside-every-variant rule: keep original testimony immutable and available, but allow explicitly reviewed whole-utterance equivalents preserving every assertion, denial, qualification and intentional lie. Exact current narration/speech-pair validation remains mandatory.
- Use a small bounded history of actual selected deliveries to prefer structurally different eligible alternatives before cache lookup; share selection between offline and configured performance paths.
- Offer narration sparsely, keep silence valid, and vary harmless expression/posture/pause families without inferring private feelings or guilt.
- Shorten the visible browser label to `Demeanor: Neutral` (or the existing authorized public value), moving the truthfulness explanation to accessible unobtrusive help.
- Add a repeatable 18-question-per-NPC evaluation with explicit quantitative gates, editorial review, actual before/after transcripts and reproducible offline/fake-provider runs.

## Capabilities

### New Capabilities

- `npc-dialogue-naturalness`: reviewed structural variation, bounded repetition-aware delivery, sparse safe narration, unobtrusive demeanor presentation and measurable dialogue-quality evaluation.

### Modified Capabilities

None in main specs (`openspec list --specs` reports none). This delta explicitly supersedes the unarchived Phase 2 requirement that every alternative contain the full core verbatim; its exact-pair boundary and all other Phase 1–3 protections remain controlling. No existing artifact or historical evidence is rewritten.

## Impact

Expected production scope after approval: `src/data/dialogue-catalog.js`, `src/dialogue-state.js`, `src/authored-performances.js`, the performance-selection portion of `src/game.js`, and the browser demeanor label/help and minimal styling. `src/npc-performance.js` has been audited; its schema, prompt surface, bounds and exact validator need no relaxation. Targeted tests, a local quality-evaluation script/report and current docs will be updated. No HTTP/public schema, dependency, model, case, evidence, emotion-delta, permission or investigation architecture change is planned. Explicit historical phraser behavior, HW4/HW5 evidence, Alice's unresolved debt annotation and open issue #3 are preserved. Planning only until user approval; no commit/push/merge/archive.
