# Greyhaven deterministic disclosure state machine

**Narrative rules approved as planning baseline; technical representation proposed.** This document implements no state machine. The approved [disclosure design](greyhaven-disclosure-design.md) and unchanged [design oracle](greyhaven-design-oracle.json) remain the source of facts, exact anchor speech and prerequisites.

## Minimum private state

Reuse inspected IDs and per-speaker discussed/presented sets. Add a finite current-account map (`maraWhereabouts`, `maraReason`, `owenExplanation`), a monotonic policy revision, and compact delivered statement references. Initialize Mara M0/current reason undisclosed, Owen O0; M-S/J-B/J-P/J-C and other ordinary accounts remain independently available. Keep source/belief/motivation annotations immutable in the selected definition. No separate mutable global belief engine is needed: Mara's fear is an authored mistaken belief, and her current account records how she is willing to qualify/explain it.

Suggested private reference: `{speakerId, statementId, accountKey, accountVersion, firstCommittedTurn}`. Statement IDs refer only to owned immutable cores. Retain finite semantic receipt IDs after eight visible turns are evicted; the maximum is the authored catalog, not unbounded raw text. Public dialogue does not serialize account keys, policy revision, gate predicates, beliefs or the diagnosis 'lie'. Emotion remains cooperation/irritation/tension 0..4 with existing deltas and demeanor precedence; no disclosure predicate reads a mood number.

## Approved rules mapped to transitions

All inputs below mean **committed** inspections/testimony in this case plus a currently authorized explicit request. Typing a name, quoting a response, seeing a locked label, an uncommitted candidate or a provider output is not receipt.

| Rule | Initial/hidden information and motive | Required inputs and interaction | Result / state / reversibility | Alternative and security constraints |
| --- | --- | --- | --- | --- |
| M1 | M0 falsely says Owen stayed with Mara/no visit; she saw visit and fears him guilty | M0 + O0 + G3 + J-B + either I-S or J-C, then one reviewed C-V comparison/reassurance alias | Deliver approved M1 limited admission; `maraWhereabouts=M1`, reason still undisclosed; monotonic, never revert | Visual or call branch; solution A bypasses Mara entirely. No generic kindness/pressure unlock; no mother's inference promoted to witnessed blow |
| M2 | After M1 she still withholds reason for lying | M1 + G4 + J-P, explicitly ask reason given witnessed repair | Approved M2 fear explanation; location stays M1, `maraReason=M2`; no reversal | Both full deduction routes skip this. Does not identify sleeve as blood/paint or claim she knew innocence before lying |
| O1 | O0 admits work/earlier words but hides misuse of entrusted money, fearing judgment | O0 + G4 + either G8 or M1, with corresponding reviewed evidence/comparison prompt | Approved O1 money/visit admission; `owenExplanation=O1`; no reversal | G8 branch avoids Mara. Work/living-boundary route does not require confession to spending. No invented killer clue or permission for other NPCs' secrets |
| I-F | Basic I-S available; precise visual source detail withheld until contextual inspection | I-S + G5, explicit identity/view question | Deliver approved bounded view detail; record received ID, no account reversal | B skips I-S/I-F/G5. Inspection alone creates no observation; bench view not upgraded to desk/blow |
| I-P | Iris omits restricted copying, no reversed alibi | G7, explicit packet question | Approved copying explanation; received ID only | Optional historical depth, not essential murder gate. No automatic gossip to Ruth/Mara |
| R-F | Ruth denies later visit; conceals later collection, admits later storage | G6, explicit custody question | Approved early-collection lie/current R-F; receipt only, no confession state | Location in cupboard is not exclusive ownership. Preserve collection/storage distinction and both routes' source limits |
| J-C | Jonah knows call/voices; not a secret-disclosure arc | Ordinary direct call question or timeline follow-up; **no G3 eligibility gate** | Approved two-voice account plus limits; receipt only | G3 still required in reviewed support sets for recorded timing/instruction. Never visually saw original, strike or20:38 |

Ruth has no truth/repentance transition. R0/R-F/R-D may remain contradicted claims. A model, repeated accusations, high tension or a developer-spoiler question cannot invent one. Two substantial arcs are Mara's staged correction/explanation and Owen's admission; the other informational cores do not become extra reversible personality systems.

## Closed rule representation

Propose a small OR-of-AND list of typed references, plus a declared trigger and optional account transition:

```text
gate = { alternatives: [ [committedReference, ...], ... ], triggerId }
reference = inspected(evidenceId) | received(speakerId,statementId)
transition = { accountKey, fromVersion, toVersion }
```

Normalize the approved all/any rules without changing them: M1 becomes two conjunctions, O1 two, other gates one; C-F has two already-reviewed alternatives. Proposed initial bounds are at most 2 alternatives and 16 references per alternative, sufficient for all approved rules; validate lengths/IDs and fail closed rather than silently truncating. These bounds are technical proposals, not changes to evidence semantics. No arbitrary script, recursive boolean language, evaluation of player text, runtime code in JSON or NPC-to-NPC event bus.

Gates may refer to previously delivered superseded accounts as historical evidence (e.g. M0 for C-V), but selection of the current whereabouts topic cannot serve M0 after M1. Support/endings distinguish a received historical claim from an established fact. Validate account version edges for reachability/cycles and invalid from-states. Repeating an already completed transition returns the appropriate current account or contextual explanation, without replaying emotion/disclosure side effects as a fresh unlock.

## Atomic execution

1. Resolve a text alias or currently offered choice to an owned candidate core/trigger. Verify current speaker, room, case, lifecycle and gate against committed state.
2. Clone/stage state using the existing `prepareTurn` candidate path. Select the resulting account/version and exact performance pool together; keep the old state authoritative while the provider runs.
3. Cache lookup includes selected case/catalog/current account/facet and permitted pool identity. Validate cached pair against the current pool; a stale M0 cannot masquerade as M1.
4. At final commit, recheck session reservation/revision, game identity, mutation generation, room epoch/presence, lifecycle, policy version and gate/trigger. Existing projection-before-install order remains.
5. Install text, semantic receipts, account stage, emotion, target context and cache together. Any failure/discard/travel/end/projection error installs none. A lost client receipt is reconciled through existing refresh semantics, never automatic replay.

The AI receives only the current style/demeanor/intent and allowed whole narration/dialogue pairs, not canon, gates, raw questions, account stages or other NPCs' records. Revalidate exact pairs independently at engine/commit as today. A factually true but unauthorized secret is rejected just like an invented one.

## Fixture-first acceptance for B

Use a tiny unrelated two-person synthetic case with independently specified secret, mistaken belief and original/revised literal bodies. Verify every required input omitted, both OR branches, explicit trigger absent/present, repeated/reordered questions, maximum irritation, clarification attempts, forged quotes and cross-case IDs. Use deferred performers to test stale/canceled/travel/projection/ending/eviction paths. Run existing demeanor and issue#3 expectations unchanged. Only after this boundary works should D author the approved O1 slice; B does not quietly load Greyhaven's solution to demonstrate the mechanism.
