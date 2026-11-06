# Greyhaven implementation decisions and approval register

**Narrative approved for technical planning; architecture/implementation below proposed.** User approval on 2026-11-06 supersedes earlier creative-review-pending status. It does not authorize code, publication, canonical specification edits or implementing milestone A. No story detail is independently rewritten here.

## Approved baseline and integrity

Retain Adrian/Ruth as victim/culprit, Ruth's 32-year friendship and chosen escalation, Mara's protective lie, Owen's innocent-of-murder £480 misuse, Iris/Jonah sources, two signals 30/42,13 critical events,9 observation entries,5 people/5 rooms/8 items, two account arcs,20 facets, both four-item/eight-account routes, and all circumstantial/source/custody limits. Original Victor Hale case remains an unchanged compatibility fixture.

The semantic payload of greyhaven-design-oracle.json, excluding only its administrative `status` string, has SHA-256:

`5fc7e5b7c8ad430a03f8f70d456072abf5be3b84279875377024523cdd7eec94`

The documentation checker verifies that payload remains unchanged. Approval banners/administrative labels may change; events, gates, literal anchors, sources, route sets and custody limits do not. Any later intentional narrative adjustment requires a reviewed decision and independently updated oracle, not silently refreshing this fingerprint to make a mismatch pass. The prose documents remain authoritative for details outside that finite payload; a hash is not proof of complete narrative equivalence.

## Proposed technical choices for review

| ID | Recommendation / rationale | Approval needed and consequence |
| --- | --- | --- |
| T-01 | Small server registry/factory wraps old modules; no relocation/framework. Immutable definitions plus fresh per-game state | Technical approval before A; preserves existing import paths and legacy injection tests |
| T-02 | Stable IDs ashcroft/greyhaven-preview/greyhaven; GET /api/cases; create {} or {caseId}; immutable session; additive data.case envelope outside nested state | Approve exact API/CLI/browser contract. New endpoint/public field needs scoped future specification; legacy{} remains Ashcroft |
| T-03 | Optional `--case`/`--list-cases`; small browser selector. New generation/notes for a new session; no mid-session switch | Approve selection UX; no mandatory CLI prompt or persistence/migration |
| T-04 | New catalog schemaVersion: 2 with owned base/account/facet roles; finite at-most 2 AND alternatives/16 refs, explicit triggers; v1 unchanged | Approve bounded policy representation and validators. Six meaningful subjects remain mandatory for full cases |
| T-05 | Separate preview definition/mode has no solution/verdict; D contains Mara/Owen, R/B, G4/G8 and O1 G8 branch only; explicitly declared sparse subject subset allowed only in preview | Approve preview product/validation exception. Prevents fabricated outside sources for M1 or a fake murderer; an excerpt is not a complete case |
| T-06 | Private account pointers/semantic receipts/primary clarification target staged atomically; beliefs/motives static annotations, mood delivery-only | Approve minimal state. No general social simulation, irreversible hostility gate or model-owned disclosure |
| T-07 | Deterministic finite facet aliases/context; no new statementRef/core/facet API fields; existing topics and option kinds retained | Approve resolver behavior/limits. Ambiguous text gets guidance; old Ashcroft clarification preserved |
| T-08 | Existing journal/history, clear two-line authored G3 record, reinspection available. No new timeline/deduction board or automatic fact certification | Approve readability MVP and existing cold-page note limits; persistence remains deferred |
| T-09 | Trusted case-bound conclusion resolver; Greyhaven A OR B sets and per-paragraph prerequisites. Preview never grades; full case published only after F | Approve ending policy/paragraph inventory before F. Wrong outcomes remain private/final, no score/every-clue requirement |
| T-10 | Historical movement map validates authored backstory; player travel remains current unrestricted room action, not a timed adjacency simulation | Approve minimal mechanics boundary. No new clock, movement costs or locks just to implement the diagram |

These are recommendations to make approval concrete, not claims already implemented or accepted. [Roadmap](greyhaven-implementation-roadmap.md) links them to small executable future packages and definitions of done.

## Narrow narrative acceptance decision, not a new plot

**N-01 — concealment rationale/readability.** The approved account says Ruth takes the original from C, wants to preserve it, separates it from her person to buy time and uses accessible dry shared storage; M-S/R-F and G1/G6 support custody with an acknowledged gap. It does **not** establish that she was physically unable to leave the station or carry it outside. Do not implement an invented locked door, boarding rule, pre-discovery police guard or certainty about her private plan.

Recommend retaining this as a pressured choice, with the already approved public dry-storage account and discovery sequence. Ask the creative reviewer to confirm that this is sufficient if literal/visual implementation exposes ambiguity; any stronger 'why she stayed' line would need source/wording approval before E/F. N-01 does not block A-C technical foundations and does not reopen the culprit/timeline. Human acceptance AC-HIDE remains required even though the narrative baseline is approved.

**AC-BELL — no open schedule decision.** The 20:30 held and 20:42 actual signals are approved. Readability is the unresolved implementation test, not permission to change times. Recommend authored description with two labeled events, J-B/source questioning and ordinary journal rereading. No extra clock/technical trick or timeline UI is justified yet.

## Remaining approvals and deferrals

Technical review must approve T-01..T-10, preview boundary, exact protocol and staged work; then scope/specify/authorize the first implementation increment. Exact complete 60-70-body inventory, current-account historical correction wording and ending paragraphs require review during E/F authoring; approved anchors/semantics cannot drift. Confirm available semester/demo time before treating session estimates as a schedule. No deadline or measured difficulty is currently known.

No independent story adjustment is proposed by this roadmap. Deferred: general gossip/affection/belief inference, dynamic schedules, persistence/database, every-sentence clarification, extensive art/voice, broad model interpretation, scoring/deduction board and complex timeline UI. These require later evidence/approval, not an automatic backlog obligation. Human source/custody comprehension, visual blocking and fresh-player reasoning remain acceptance work that code tests cannot settle.

The same planning change retains skip_specs because it edits documentation only. Once actual behavior is authorized, prepare scoped implementation specifications/tasks without duplicating this planning change or pretending canonical contracts have already changed. All roadmap packages remain unstarted. Do not run openspec apply/archive, commit, push or merge as part of this request.
