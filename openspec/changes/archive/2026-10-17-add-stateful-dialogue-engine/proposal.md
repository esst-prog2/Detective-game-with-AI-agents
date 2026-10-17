# Proposal

## Why

Interrogation currently classifies six topics and caches one string per suspect/topic. It cannot remember testimony, interpret contextual follow-ups or offer evidence-aware questions. Establish authoritative, bounded dialogue state before adding expressive model delivery or changing the cinematic interface.

## What Changes

- Introduce authored character profiles and dialogue plans, retaining the existing mystery, intentional lies and public dossiers.
- Route text, suggested choices, follow-ups and inspected-evidence confrontations through one engine command path.
- Track inspected evidence, per-NPC testimony/context and modest deterministic demeanor; never promote player assertions into knowledge.
- Add optional narration and spoken dialogue with a legacy text projection, useful offline variants and engine-owned option availability.
- Stage asynchronous dialogue and commit memory/emotion/cache only after engine and transport guards pass.
- Extend the existing questions endpoint and public projection additively; preserve CLI menus and accusation confirmation.
- **BREAKING behavior:** repeated accepted questions may have different delivery instead of identical topic-cache text. Facts and intentional deception remain stable; explicit test migrations are required.
- Phase 1 of three: followed by `add-safe-npc-performance`, then `add-hybrid-dialogue-interface`. Approval of planning does not authorize implementation of any phase.

## Capabilities

### New Capabilities

- `stateful-npc-dialogue`: authoritative intents, profiles, bounded memory, deterministic demeanor, safe structured offline delivery and compatible HTTP/CLI access.

### Modified Capabilities

None in the empty main-spec inventory. Design records explicit supersession of conflicting unarchived topic-cache/public-view/HTTP contracts; older artifacts remain untouched.

## Impact

Expected implementation areas: src/game.js, question classification, server-only authored dialogue modules, session commit boundary, HTTP result/body projections, CLI and focused Node tests. No new dependencies, database, agent framework, story facts, cast, solution, historical HW4/HW5 edits, UI implementation or issue #3 closure. Detailed audit, bounds and content-review decisions are in design.md.
