# Design

## Context

See proposal.md for motivation. `createInvestigation({ data, phraser })` already separates the CLI from engine operations, but returns `data` and raw records from `findSuspect` and `inspectEvidence`. The CLI uses those contracts. Evidence is immediately inspectable, locations are strings, and no persisted investigation lifecycle exists. Main specs are empty; the MVP and HW5 requirements live in unarchived changes.

## Goals / Non-Goals

**Goals:** Give future interface adapters a narrow, serializable read contract; make new private record fields private by default; prevent aliasing through returned public objects; leave current gameplay intact.

**Non-Goals:** Replacing all trusted internal methods, enforcing a browser/server import boundary, adding discovery or lifecycle state, validating arbitrary case schemas, fixing dialogue knowledge leakage, introducing UI assets or building future personality/relationship systems.

## Decisions

- Add `getPublicView()`, `getPublicSuspect(id)` and `inspectPublicEvidence(id)` to each investigation. The overview shape is `{ title, victim: { name, description }, locations: string[], suspects: { id, name }[], evidence: { id, name }[] }`. Public evidence inspection adds only `description`. Explicit construction is safer than copying a record and deleting known secrets: newly added metadata stays excluded automatically.
- Only identity is public for suspects. Personality text, relationship-to-victim and motive currently contain authoring guidance or undisclosed information, so copying them would preempt future disclosure policies. Portraits and other presentation fields can be added explicitly when their models exist.
- Construct fresh arrays and objects on every read using the injected `data`. Existing allowlisted fields are authored strings; general schema validation is deferred. Do not hardcode cast size, case identity or evidence IDs. A generic clone of the full case would preserve secrets; freezing returned references would not provide a detached public contract.
- Keep overview evidence as summaries and use a separate safe inspection lookup for descriptions. This preserves the existing list/inspect distinction without inventing discovery gates. Reuse the existing safe evidence summary projection where practical.
- Keep `data`, `findSuspect` and `inspectEvidence` unchanged for trusted callers. Document that future API adapters must serialize only public projections, never the investigation object or raw methods. This additive step avoids a CLI migration and limits regression risk.
- Use focused Node tests with an independently specified public shape and planted private markers at multiple record levels. Check JSON serialization, fresh references, nested mutation isolation, alternate cast sizes, no phraser calls on reads, and unchanged dialogue/accusation behavior. Existing CLI and HW4/HW5 tests remain unchanged.

## Risks / Trade-offs

- [Trusted raw APIs remain accessible] -> Clearly document the distinction; future HTTP code must explicitly select public operations rather than serialize the engine.
- [Allowed descriptions can contain authored spoilers] -> Treat the public introduction and evidence descriptions as reviewed display content; this projection is not a semantic spoiler detector.
- [Future models add nested objects or discovery state] -> Revise the allowlist and tests explicitly before exposing those fields; current contract covers the current valid string-based data.
- [Public views do not stop dialogue hallucinations] -> Keep issue #3 and the later dialogue-boundary milestone separate; do not claim this change resolves them.

## Migration Plan

Add the public methods and tests without changing CLI usage or case content. Document the new contract and run the full offline suite plus strict validation of this change. No dependencies, data migration or deployment are needed. Rollback consists of removing the additive methods, their tests and documentation; existing consumers continue to use their original methods. Leave the change unarchived for review and do not push or merge.
