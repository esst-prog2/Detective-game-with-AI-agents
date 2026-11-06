# Design

**Narrative baseline approved for technical planning on 2026-11-06. All technical contracts/work packages below are proposed; no production implementation authorized.**

## Context

See [proposal](proposal.md) for motivation. The existing package/current branch is continued safely at 52a7c43. The current engine already injects case data/catalog, enforces room/presence, stages candidate mutations and validates exact performance pairs. A large rewrite is unnecessary. Actual gaps are private registry/selection, explicit profile validation, conditional current-account cores, informative facets, selected-case conclusion dispatch and adapter hardcoding; [gap analysis](greyhaven-architecture-gap-analysis.md) identifies concrete functions/tests.

Narrative bodies and finite oracle are preserved. The [approval register](greyhaven-implementation-decisions.md) fixes the semantic payload hash, distinguishes approved facts from technical proposals and records a narrow concealment wording concern without inventing an exit restriction. Human plausibility, source comprehension and difficulty still need assessment after implementation.

## Goals / Non-Goals

Goals: safe second-case support while retaining Ashcroft default; engine-owned authored disclosures; useful clarification; a real browser excerpt before full content; independent regression/test gates; coherent semester scope and explicit technical decisions.

Non-goals: code or playable Greyhaven now, canonical spec edits, autonomous NPC simulation, numerical trust, database/persistence, scoring/deduction board, complex timeline UI, new story facts, committing/publishing/archiving. Roadmap preparation does not authorize executing its packages.

## Decisions

### 1. Bound cases at the factory/session boundary

[Case design](greyhaven-case-data-design.md): validated server-only definitions bind data/catalog/policy/solution/conclusion, shared immutably; every game has its own state/caches. Thin Ashcroft adapter wraps unchanged source files. Full/preview definitions are distinct; unavailable definitions never become selectable by guessing an ID. Preserve legacy raw constructor/tests and Ashcroft ending guard; registered cases use a trusted bound resolver, never a request-selected function or display title.

Propose GET /api/cases with public id/title/mode only, exact create alternatives{} or {caseId}, and additive **data.case** session-envelope metadata, keeping nested public state/result contracts. New client validates selected identity/generation. Existing default clients ignore the additive envelope field and retain{} behavior; tests must prove this. No case selector accepted on existing mutation payloads. Optional CLI flags avoid breaking old scripted menus. Browser selector starts a fresh session/notes rather than relabeling one.

### 2. Finite account policy and atomic installation

[State-machine design](greyhaven-disclosure-state-machine.md): private immutable sources/beliefs/motivations, compact current account pointers/received references and monotonic policy revision. Approved M1/M2/O1 and informational gates retain their exact prerequisites; no emotion unlock, automatic gossip or confession state. Propose opt-in catalog schemaVersion:2 with owned roles and bounded OR-of-AND gates, retaining v1 validation/behavior. Full cases still author six base subjects; preview declares an explicit limited subset.

All selection paths share eligibility: options, text, evidence, comparison, facet, cache, prepare and final commit. Gate/account context, exact pool and resulting mutations are staged together under existing generation/room/session/reservation/revision/lifecycle checks and projection-before-install. The model remains a current-pair selector with style/demeanor/intent only. One reviewed fallback still needs the existing harmless framing/length structure; no relaxation of exact-pair or legacy protection follows.

### 3. Informative facets use primary statement context

[Clarification design](greyhaven-clarification-design.md): finite meaning/identity/source/time/certainty mappings to separately authorized cores, with a primary target/account version that survives a facet reply and visible-turn eviction. No unconstrained model parser or new coreId/facet API field. Current questions/choice IDs suffice; ambiguous/unseen targets get honest guidance. Old accounts remain attributed history and cannot return as fresh current truth.

Retain current topics/option kinds and six-choice limit. Stable first-time essential priorities plus one facet precede optional topics/revisits; text remains available. Validate designed essential budget and actual overflow reachability, not merely truncation length. Original Ashcroft clarification/professor demeanor oracles remain unchanged.

### 4. A playable excerpt without missing-witness shortcuts

[Vertical slice](greyhaven-vertical-slice.md): recommend separately labeled greyhaven-preview with Mara/Owen, R/B, G4/G8 and approved O1 branch plus facets. M0 conflict remains; M1 cannot be fabricated without J-B and I-S/J-C. Preview has no solution/verdict and a server-enforced unavailable-accusation boundary, tested beyond the disabled UI.

A preview-only declared subject/gate subset avoids inventing filler or full-case material early. This exception is explicit technical approval T-05, not a weakened full-case authoring contract. D is an honest live demo stopping point; E/F are necessary to claim a complete murder investigation.

### 5. Preserve narrative acceptance and evidence-aware endings

AC-HIDE in [roadmap](greyhaven-implementation-roadmap.md): retain acquisition, preservation motive, separation/bought time, accessible shared shelf, observed cover and custody gap. No invented physical impossibility of leaving. N-01 asks only whether a future source-appropriate wording clarification is needed before E/F.

AC-BELL: explicit received G3 signal-held/departure lines, J-B/facets and existing accessible journal rereading; no numerous timestamps to memorize, hidden 20:38 fact or technical timeline widget. Local receipt/history limits stay honest.

F binds finite A OR B support and per-paragraph prerequisites. Incomplete correct stays qualified, incorrect private/final, no all-clue or score requirement. Canonical support never comes from provider/raw questions/private truth as if discovered. Original explainAshcroft remains compatible.

## Staged work and estimates

| Milestone | Result / dependency | Complexity / focused sessions |
| --- | --- | --- |
| A | Case factory/selection/isolation, default preserved, synthetic proof; technical/spec approval first | Medium,1-2 |
| B | Finite disclosure/account mechanics with synthetic fixtures; A | High,2-3; largest technical risk |
| C | Statement facets/targeting/overflow; B | Medium,1-2 |
| D | Actual browser repair-dispute preview; A-C | Medium,1-2; honest demo stopping point |
| E | Complete approved 5/5/8 content and all source/gate paths; D plus inventory approval | High,3-5; most content work |
| F | Safe conclusions, both full routes, regression/playtest evidence and full availability; E | Medium-high,2-3 plus human turnaround |

Roughly 10-17 focused 2-4-hour sessions; no calendar commitment and no known deadline. Optional content preparation can overlap B/C; implementation acceptance remains A->B->C->D->E->F. [Roadmap](greyhaven-implementation-roadmap.md) gives 21 unstarted work packages, exact likely files/state/tests/security/definition of done and which combinations preserve review boundaries. Extensive art, variants, schedules/gossip, persistence and general AI interpretation are deferred.

## Risks / Trade-offs

Case-envelope compatibility, per-case shared mutable state, stale account/facet caches, cross-speaker permissions, hidden labels, preview verdict leaks and undiscovered ending claims are the critical code risks. Source import and built-marker scans must expand to new private module paths/annotations without weakening prior checks. Synthetic isolation/policy/facet tests precede content; preserve all issue#3 attacks and independent original testimony/demeanor fixtures.

Source/custody psychology and human clue comprehension cannot be automated away. Tests can detect invalid IDs, impossible declared coordinates and missed prerequisites; they cannot certify every reader's confidence or enjoyment. [Regression strategy](greyhaven-regression-strategy.md) maps existing suites and independently specified future outcomes, with real public-action routes and contrary human findings recorded.

## Approval and verification boundary

Current task runs only strict planning/documentation/whitespace/scope checks and reports the nine inherited strict failures separately. Narrative approvals are recorded; T-01..T-10, preview/transport decisions, later literal additions and implementation authorization remain open. Future actual behavior needs scoped OpenSpec deltas before apply; skip_specs is valid for this documentation-only change. No implementation rollout/data migration or publication occurs now. Stop for technical review.
