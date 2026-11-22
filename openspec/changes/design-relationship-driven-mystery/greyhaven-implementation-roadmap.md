# Greyhaven staged implementation roadmap

**22 November 2026 milestone update.** D merged in PR #17. E1 proceeds under the approved [Mara/Owen coordination pilot](../greyhaven-agent-coordination-pilot/proposal.md) and its existing acceptance criteria. E2 starts with a complete narrative design for project-owner review. Approval of that design gates E2 content implementation. F owns accusation outcomes and end-to-end verification. The E1–E4 package labels in the historical content plan below all fall within the new phase E2.

**Narrative baseline approved on 2026-11-06; execution status updated after separate milestone authorizations.** A is merged through PR #14 at3727a9b. B is merged through PR #15 at37d7b26; its specifications and B1-B4 checklist are in [deterministic-disclosure](../deterministic-disclosure/tasks.md). C is merged through PR #16 at2003b1b; its C1-C3 checklist is in [statement-specific-clarification](../statement-specific-clarification/tasks.md). D is implemented and verified on `feature/greyhaven-vertical-slice`, approved for commit, push and PR creation after final verification and user-confirmed manual playtesting; manual PR review/merge remain pending. E-F remain proposed, unstarted and unapproved. Its D1-D5 checklist is in [greyhaven-vertical-slice](../greyhaven-vertical-slice/tasks.md). The overarching planning checklist tracks preparation only; implementation tracking lives in the scoped changes. Narrative canon is unchanged.

## Gates and critical path

Recommended path **A -> B -> C -> D -> E -> F**. Content inventory/fixture review for E can begin alongside B/C after authorization, but full integration cannot bypass their security boundaries. Each milestone must have a concrete specification/test review and its own implementation authorization before code work. Acceptance from one stage is not automatic permission for the next. Approved narrative source stays fixed; technical changes that would alter it return for a narrow creative decision.

Use existing plain JavaScript, Node tests, React/Playwright and exact-pair performer. Estimates are relative and uncertain, assuming focused 2-4-hour sessions, existing dependencies and one developer; no calendar/deadline promise. A: 1-2 sessions; B: 2-3; C: 1-2; D: 1-2; E: 3-5; F: 2-3: roughly 10-17 sessions, excluding substantial playtest-driven rewriting. Content and review, not infrastructure, dominate later uncertainty.

## Milestone A — Multi-case foundation

**Scope/dependency:** starts after technical/spec approval. Bind private definitions, selected-case factory and immutable session identity. Add safe manifest/optional selector and additive `data.case` envelope; preserve default Ashcroft. Add full/preview definition validation using synthetic test fixtures, but publish only Ashcroft; no Greyhaven narrative yet. Extract/inject the original ending resolver without changing its text; keep legacy direct-constructor guard.

**Likely modules:** proposed src/cases/{registry,ashcroft,validate-package}.js; game.js optional trusted context/resolver; investigation-sessions.js/create; http-api.js route/body/envelope; server.js factory; index.js/cli.js flags; browser client/state/MainMenu. Existing case/catalog/delivery modules stay at their imports.

**State/transitions:** create resolves definition before allocating session; immutable case/version/mode attached to entry. Commands cannot switch it. New selection creates fresh game/client generation/notes. Preview accusation capability exists in validation/engine with a fixed error, tested synthetically only.

**Risks/tests:** bad public manifest or resolver leaks solution; shared mutable definitions; client accepts a late different-case snapshot. Test{} compatibility, explicit default, unknown/unpublished selectors/extra keys, two injected cases including colliding local IDs, cross-case evidence/NPC rejection, metadata mismatch, fresh caches, retained stale/session guards and private wrong outcomes. Public manifest must never execute model/factory calls. Frozen old client still parses default/additive envelope.

**Acceptance/definition of done:** default original CLI/browser journey and accusation unchanged; injected second case demonstrably isolated; no fixture/Greyhaven story published; full Node/API/client tests and relevant Chromium case-selection/default regression, production/import/artifact privacy pass. Any exact-envelope fixture migration covers only explicit additive metadata, never rewritten expected testimony. Complexity **medium**, broad integration surface,1-2 sessions.

Completed packages: **A1** definition/validator/default adapter; **A2** factory/session/API selection; **A3** CLI/browser manifest and envelope guards; **A4** compatibility/isolation/privacy proof. See the [merged implementation report](../../../docs/multi-case-foundation/implementation.md) for actual full-only scope: preview support and ending-resolver extraction remain deferred under the authorized exclusion of new accusation logic.

## Milestone B — Knowledge, belief and disclosure

**Scope/dependency:** A complete; approved finite policy contract. Add v2 catalog roles/gates/current-account selection using a tiny unrelated synthetic case, not full Greyhaven. Private source/belief/motivation annotations explain authorized truth/lie/omission; emotion remains delivery-only. Preserve v1 catalog/legacy behavior and exact performance limits.

**Likely modules:** dialogue-catalog.js opt-in validation dispatch; proposed dialogue-policy.js; dialogue-state.js; game.js preparation/cache/final guards; authored-performances.js compatibility where needed; new independent policy fixtures/tests. Keep production npc-performance/legacy validation strict.

**State/transitions:** finite monotonic account pointers/received semantic references/policy revision staged with candidate. OR-of-AND gates plus explicit trigger; all menu/text/cache/prepare/commit paths use one eligibility predicate. No general social graph or numeric trust.

**Risks/tests:** stale original account, pressure bypass, raw quoted evidence counted as receipt, ghost progression after projection error. Test every negative prerequisite, OR alternatives, malformed/cyclic/cross-case references, all adapter injections, eviction and delayed/reordered commits. Original emotion/demeanor tests and issue#3 suite unchanged.

**Acceptance/definition of done:** synthetic secret accessible through two reviewed branches, impossible through unsupported questions/model inventiveness/mood farming; no partial state installation; original case same fallback/delivery. Complete Node/security tests and source/privacy boundary review. Complexity **high**, technically riskiest,2-3 sessions.

Merged packages: **B1** schema/gate validation; **B2** staged account selection; **B3** cache/commit revalidation; **B4** independent negative/alternate/security matrix. See [Milestone B report](../../../docs/deterministic-disclosure/implementation.md). Informational cores use the `disclosure` role; C separately adds facet roles/primary targets. No Greyhaven content is publicly registered.

## Milestone C — Contextual clarification

**Scope/dependency:** B. Bind finite meaning/identity/source/time/certainty facets to primary statement/account version. Deterministic aliases/context targeting, honest no-detail guidance, six-choice priorities; no model interpretation layer.

**Likely modules:** dialogue-policy.js and catalog validation, dialogue-state.js resolve/options/prepare, game.js permission keys; browser DialoguePanel/ConversationHistory only if presentation needs refinement. Retain existing API question/choice payload and public kinds/topics.

**State/transitions:** primary-target references persist after facet replies and visible history eviction; old-account requests select approved correction, not obsolete lie. A facet may add a semantic receipt only on commit, never revise account unless separately authorized.

**Risks/tests:** lastCore becomes recursive facet target; old statement leaks secret; optional prompts displace essential ones. Synthetic target/source/facet oracles, wrong speaker, no context, old account, compound text, guessed choice IDs,8+ overflow and stale context tests. Exact old Ashcroft clarification preserved.

**Acceptance/definition of done:** specific questions resolve independently specified ambiguity; unknowns produce useful limits; no permission bypass; essential actions reachable within 6 and optional text retained. Node/client coverage and relevant Chromium mixed text/choice journey. Complexity **medium**,1-2 sessions.

Merged packages: **C1** target/facet schema and resolver; **C2** option priorities/overflow; **C3** informational-boundary and original clarification regression. See [Milestone C report](../../../docs/statement-specific-clarification/implementation.md). C was merged; D is separately authorized and E-F remain unstarted.

## Milestone D — Greyhaven browser vertical slice

**Scope/dependency:** A-C. Publish a clearly labeled `greyhaven-preview`: Mara/Owen, reception/boathouse, G4/G8, O1's approved evidence branch, M0/O0 and useful facets. No M1 invented without outside testimony, no full solution/accusation. See [slice design](greyhaven-vertical-slice.md).

**Likely modules:** proposed private greyhaven-preview data/catalog/policy subset, registry publication; MainMenu, DialoguePanel, EvidenceJournal/history, AccusationDialog/CLI preview affordance; independent fixture/public browser transcript. Neutral artwork and existing layouts first.

**State/transitions:** O0+G4+G8+presentation -> O1 atomically; M0 remains. Fresh preview session independent of Ashcroft. Explicit preview validator accepts only declared included subjects/gates; full cases still require 6 base subjects.

**Risks/tests:** preview accidentally grades a guessed full culprit; unavailable references; author invents an extra source to unlock mother. D1-D10 offline through browser and revisioned API, invalid/hostile text, provider failure/stale response, both acquisition orders, cross-case notes and disabled-verdict server guard.

**Acceptance/definition of done:** actual browser demonstrates relationship-motivated omission, evidence revision, clarification and readable contradictory accounts. No hidden solution/name-as-verdict leaks, false promise of full solvability or new plot facts. Complete Node, relevant Chromium, production/privacy build, manual keyboard/mobile review. Complexity **medium**,1-2 sessions. This is the practical honest demonstration stopping point.

Implemented packages awaiting review: **D1** approved subset authoring; **D2** preview mode/UI integration; **D3** deterministic browser/CLI/HTTP proof and review. See [Milestone D report](../../../docs/greyhaven-preview/implementation.md). Human playtesting remains pending; no commit, push, merge or archive is authorized.

## E2 narrative design requirements for approval

Start from the approved [story bible](greyhaven-story-bible.md), [timeline](greyhaven-canonical-timeline.md), [character dossiers](greyhaven-character-dossiers.md) and [deduction graph](greyhaven-deduction-graph.md). Preserve established Greyhaven facts and the characterization of Mara and Owen. The earlier five-interviewee inventory is the starting cast. The expanded cast target below governs E2. The five planned rooms already meet the location target. Judge any additions by the investigative or emotional work they do.

| Design deliverable | What the project owner should be able to review |
| --- | --- |
| 1. Underlying truth and timeline | Reconstruct what actually happened, when, where and who could perceive it. Trace each proposed addition against established events and distinguish what the designer knows from what the detective can establish. |
| 2. Expanded cast and relationships | Target at least 6–7 meaningful NPCs, including Owen and Mara. Keep their mother–son relationship emotionally central. For each character, show an independent motivation, a stake in the outcome and a relationship that affects what they say or do. Explain how one person's attempt to protect or understand another can complicate the investigation. |
| 3. Character knowledge and memory | For each NPC, distinguish firsthand knowledge, hearsay, belief, misconception, secret, motive and relevant remembered interactions. Trace pivotal statements to their source. Identify where a witness sincerely misinterprets an event, tells a partial truth, withholds information for personal reasons or deliberately lies. Show what could change their account and what they could still reasonably believe afterward. |
| 4. Investigative locations | Target at least 3–4 explorable locations. For each, identify the observation, encounter or evidence it makes possible. Check sightlines, travel and timing wherever a deduction depends on them. |
| 5. Evidence chains and competing interpretations | Connect physical evidence, records and testimony across multiple chains. Inventory genuine clues, ambiguous findings and plausible misleading leads. For each significant lead, explain why a player might follow it, its underlying explanation and the discoverable check that distinguishes rival interpretations. Record any uncertainty that survives the check. |
| 6. Testimony dependencies and account revisions | Map each material disclosure to the speaker, prior account, required inspection or received testimony, and resulting revision. Explain why the character responds differently at that point. A change of demeanor alone cannot establish a fact. |
| 7. Independent discovery routes | Walk through at least two complete, logically valid routes using player-accessible actions. For each, list the observations, sources, deductions and strongest competing explanation. Identify shared premises and each route's independent decisive support. Verify each still works with the other route's distinctive evidence omitted. Hearing the same source twice cannot count as corroboration. |
| 8. Agent influence | Specify where the Game Master may direct behavior and where a character's goal, relationships and committed memory shape its response. The deterministic engine owns truth, knowledge, gates and progression. Both routes must work offline. This design applies to the full case in E2. |
| 9. Conclusion and alternative outcomes | Define the intended inference, what evidence warrants it, what remains uncertain, and how incomplete or incorrect accusations should read. Distinguish what a detective can conclude about the repair dispute from what supports the murder accusation. F implements and verifies those outcomes. |
| 10. Consistency, solvability and fairness | Plan timeline and source checks, missing-prerequisite tests, both route walkthroughs and a first-time-player reasoning playtest. Ask players which evidence changed their interpretation, why a plausible alternative weakened and what remains uncertain. A correct guess or an exhausted dialogue menu alone cannot demonstrate successful deduction. |

Submit these ten deliverables together for explicit project-owner approval **before implementing E2 content**. The design review should settle the exact roster, locations and clue inventory in the context of the complete mystery.

## Historical full-case content plan (now E2)

**Scope/dependency:** B/C/D accepted and content inventory reviewed. Author full 5 interviewees/5 rooms/8 inspection items, six meaningful base subjects each, both account arcs,20 facets, two comparisons and approved source limits. Full original gates/routes preserved; no new twist. Full package initially constructible in integration tests, not publicly selectable until F.

**Likely modules:** private src/cases/greyhaven/{case,catalog,policy,canon}.js or equivalent small files, independent test/fixtures/greyhaven-reviewed.json and route inputs; generic UI/journal refinements only where demonstrated necessary. No original story rewrite, private frontend imports or mandatory art phase.

**State/transitions:** complete M0->M1->M2 and O0->O1 plus informational gates; no ambient time simulation. AC-HIDE/AC-BELL below are release gates. Compile reviewed planning aliases to local slugs with explicit mapping and validate all references/lengths/gate reachability.

**Risks/tests:** content/drift, swapped voice/source, reported statement upgraded to sight, mother mandatory, accidental confession. All approved event/observation/source/literal oracles, all gate branches/negative edges, source independence and essential option-overflow states. Author tests before catalog implementation; never derive expected outputs from the catalog.

**Acceptance/definition of done:** complete offline public-action A/B discovery chains (before verdict), optional secret paths and disconfirming wrong-Owen path; unchanged baseline checksum/data; no unreviewed claims. Full Node/security, relevant Chromium discovery, production/privacy and human content/blocking review pass. Complexity **high**, most content-intensive,3-5 sessions;60-70 reviewed bodies remains an estimate pending exact inventory.

Future packages: **E1** independent oracle/literal inventory; **E2** complete data/policy/content; **E3** journal/readability/concealment acceptance; **E4** both discovery routes and authoring/security checks. All unstarted.

## Milestone F — Accusation, endings and full-case validation

**Scope/dependency:** E and approved ending paragraphs/finite support policy. Bind Greyhaven conclusion resolver; supported correct=A OR B, partial correct qualified, incorrect private/final. Publish full `greyhaven` only after these checks. Preview remains clearly separate or is unpublished through reviewed availability change.

**Likely modules:** proposed greyhaven/conclusion.js, registry publication, game.js trusted resolver integration, existing CLI/HTTP/CaseConclusion rendering as needed; public walkthrough script/test-support and Chromium journeys. Original explainAshcroft remains exact compatibility implementation.

**State/transitions:** confirmed local suspect yields one immutable detached outcome; canceled accusation does not end. Resolver reads committed inspections/semantic receipts only, never raw prompts/model/private truth as support. A paragraph has its own prerequisites. Discard all pending candidates on ending as today.

**Risks/tests:** B ending borrows I-F, sparse guess reveals motive/strike, wrong outcome reveals Ruth, stale output installs a revision after end. Execute both fresh routes, each incomplete set, optional clues omitted, history eviction, incorrect each suspect, cancellation, late mutations and cross-case culprit IDs. Preserve all original mystery/issue#3/demeanor/lifecycle fixtures.

**Acceptance/definition of done:** complete Node, Chromium, production build plus import/artifact privacy, explicit issue#3, strict scoped specifications/change validation and whitespace. Save actual CLI/HTTP/browser offline transcripts and screenshots, then first-time-player reasoning/confusion without spoilers. A correct guess is not a fairness pass. Record limitations/contrary results and seek final review; no automatic merge/archive. Complexity **medium-high**,2-3 sessions plus playtest turnaround.

Future packages: **F1** reviewed conclusion/support sets; **F2** complete public routes/negative outcomes; **F3** regressions/build/privacy/playtest evidence and release review. All unstarted.

## Two explicit narrative acceptance gates

**AC-HIDE (E/F):** preserve scene acquisition, desire to save the original, separation from her person/bought time, accessible dry shared shelf, observed cover/placement and post-alarm custody gap. Inspect G1/G6, M-S/R-F and spatial S6-S8; do not invent a locked exit, ferry boarding prohibition or police cordon before discovery to explain why she did not leave. The baseline describes a choice, not physical inability. A narrow possible wording decision is recorded as N-01 in [implementation decisions](greyhaven-implementation-decisions.md); no new motive is silently added.

**AC-BELL (E/F):** G3's received description explicitly labels '20:30: signal given; sailing held' and '20:42: signal repeated; ferry departed', J-B/clarification explain the difference, and the existing journal lets players reread it. Test clock source versus recollection, both signal orders in questions, keyboard/mobile reading and no private 20:38 in notes. Human player must explain signal versus departure without memorizing other minutes; no timeline board required. Cold-page note limitations stay honest.

## Minimum scope, combinations and deferrals

Complete MVP is the approved 5/5/8 case, two arcs/two routes,20 targeted facets, deterministic offline content and safe case-specific endings with original game preserved. Prioritize gates, useful speech, source limits and actual browser play over delivery variants/art. Stop at D if necessary and call it an excerpt; E without F is not a completed mystery release.

A and B should stay separately reviewable because selection/isolation and disclosure authority fail differently. B and C may share a development branch only if B's acceptance boundary and separate diff remain clear; never use a blended passing demo to skip gate/security tests. C and D may combine into one reviewed implementation increment if synthetic facet tests precede content. E and F can share final validation infrastructure, but full case must not be published before safe endings pass. No milestone combination grants authorization automatically.

Defer dynamic schedules, general beliefs/gossip, trust scores, database/persistence, every-sentence facets, extensive art/voice, broad model interpretation, deduction board and complex timeline UI. Generic fallbacks are acceptable; incorrect or missing source constraints are not. Future implementation proposals must supply scoped OpenSpec deltas for actual behavior before apply; this planning change retains skip_specs and does not modify canonical contracts.
