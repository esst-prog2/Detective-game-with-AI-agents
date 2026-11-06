# Architecture audit

> Detailed-phase reinspection, 2026-11-06: branch/HEAD remain feature/design-relationship-driven-mystery at52a7c43; existing dirty files belong to this planning change and were preserved. Case/catalog, dialogue-state, game/conclusion, session/API/performance boundaries and relevant test/archived-milestone sources were revisited. No runtime/canonical changes were needed for this phase. [Greyhaven assessment](greyhaven-implementation-assessment.md) maps the concrete story to these observed gaps.


**Observed implementation at main 52a7c43, inspected 2026-11-06.** This audit is read-only evidence, not a claim that proposed mechanics already exist. PR #12's implementation and PR #13's archive commits are ancestors of fetched main. The initial tree was clean; main was fast-forwarded before the planning branch was created. Other branches/worktrees remain intact.

## Existing representation and reuse

| Concern | Existing source and observed behavior | Reuse and gap |
| --- | --- | --- |
| Canonical case/private solution | src/data/case.js: murdererId, intendedSolution, rooms, evidence and suspects with privateFacts/permittedLie/approved topic responses | Server-owned authored truth remains. PrivateFacts are strings, not a structured timeline or provenance graph. There is one live case. |
| Identity/personality/public relationships | publicDossier in case.js and separately reviewed style profiles in dialogue-catalog.js | Public family/social relationship edge shape exists, but current arrays are empty and have no behavioral role. Private motivations are not a policy input. |
| Knowledge permissions/testimony | Catalog core belongs to a speaker/topic; evidence mappings, requiredEvidenceId and comparison prerequisites authorize narrow responses | Strong bounded authorization; no separate knowledge/belief sets, conditional account selection or retraction semantics. Existing authorized lies remain testimony, not objective truth. |
| Conversation memory | dialogue-state.js: inspected set, per-NPC discussed/presented IDs, lastCore, eight recent turns, saturated repeat counters, bounded delivery/cache history | Keep finite ID summaries and attributed input. No global complete dialogue log or explicit "this NPC heard statement X" ledger. Eight-turn text cannot be the disclosure database. |
| Emotion | cooperation/irritation/tension 0-4, character-specific deltas; demeanor precedence irritation, tension, cooperation, neutral | Existing effect is delivery and gestures, not secrets. Direct five-case professor regression in test/demeanor.test.js must remain. No affection score or social simulator is needed. |
| Evidence/navigation | Engine-owned room position, presence guards, inspection records; all rooms reachable, no travel cost/locks; named clue requires inspection/relevance | Reuse physical-action restrictions and evidence options. New claims must not auto-inspect objects or infer private ownership. Conditional discovery of items is not needed initially. |
| Contextual/cross-suspect questions | resolveDialogue chooses choice/text intent; comparison requires finite received core IDs. Six visible choices; essential unanswered sighting priority and bounded topic rotation | Extend declared comparisons and question priorities. Cross-account comparison is not automatic NPC knowledge transfer or a general natural-language reasoner. Larger contextual pools need fair reachability, not another blind slice. |
| Clarification | Regex recognizes a few meaning/clarify phrases, selects lastCore; prepareTurn and approved deliveries preserve same core content | Current behavior explains why rephrasing can repeat. Who/time/source/certainty are not separate clarification intents; useful refinements need separately reviewed content and statement targets. |
| Candidate/session authority | game.js prepares opaque candidates, stages state and validates exact pairs at commit; HTTP store enforces session identity/reservation/revision, rooms/generation/lifecycle | New belief/disclosure/retraction changes must participate in this transaction. Projection failure or delayed work cannot partially unlock a branch. |
| AI/fallback | npc-performance.js validates one exact current narration/speech pair, limits payload/pool; legacy phraser is separately constrained to exact approved strings/prefixes | Keep model as delivery selector, not truth/belief/disclosure decision-maker. Offline authored fallback fully determines gameplay. No secret policy or whole case sent to model. |
| Accusation/ending | resolveAccusation compares confirmed ID, stores detached final result; mystery-conclusion.js chooses Ashcroft explanation from inspected/discussed IDs | Keep confirmation, finality and private wrong outcome. Explanation is explicitly gated to Ashcroft title/murderer/catalog version, so a second case needs its own reviewed resolver rather than reusing Ashcroft prose. |
| CLI/API/browser | CLI actions 1-6 and /choices; exact HTTP request allowlists, same choice/text path; React renders escaped server-projected public state | Reuse these adapters and current client stale/uncertain-receipt guards. Today session creation accepts an empty body and uses a fixed factory; there is no case picker/registry API. |

## Constraints that are easy to miss

- validateCase encodes exactly three suspects and two/three locations. createInvestigation currently invokes spatial/catalog/performance checks rather than that full MVP validator. Do not mistake synthetic larger casts for fully validated larger mysteries. A later explicit case-contract validator must preserve the original fixed MVP fixture while validating new cases under an appropriate profile.
- Catalog validation requires six ungated base cores per profile and the current authored-testimony source shape. Additional gated evidence cores work, but there is no general gate expression, belief record, account-version selector or five-way clarification schema.
- defaultDialogueCatalog recognizes Ashcroft identities/title and otherwise returns an empty catalog. A new case must explicitly supply its own reviewed catalog; no inherited testimony, style, private relationship or solution.
- Cache identity includes core/context/performance eligibility; the legacy cache is core-specific. A changed account needs a distinct current core or equally explicit policy version plus current-pool validation. Broad topic keys would replay an old lie as a fresh revised answer.
- Case data must stay out of the browser import graph. New dossier relationship edges require explicit public review; private loyalty or "suspects son" metadata must never piggyback on them.
- Browser history can retain received old statements while engine summaries persist finite IDs. Retraction must not overwrite history or make a retracted statement count as current corroboration.

## Specifications and regressions consulted

Canonical specs: stateful-npc-dialogue, safe-npc-performance, hybrid-dialogue-interface, npc-dialogue-naturalness and mystery-deduction. Archived 2026-11-06-improve-mystery-deduction proposal/design/audit/walkthrough and current playtest/archive review supply the repaired-case limits. PLANNING_LOG.md already records the recurring-cast ambition, separation of facts/knowledge/beliefs/secrets, and the protective-relative example; these are direction, not implemented functionality.

Tests inspected include stateful-dialogue (synthetic eight/twelve-NPC catalogs, provenance, emotion and commit guards), demeanor (professor's direct oracle), mystery-deduction (recognition permissions, overflow, endings and public journeys), knowledge-leak-protection (independent adversarial outputs), plus current catalog validation and API/client projection paths. Their presence is architectural evidence; no production test run or new count is claimed in this planning milestone.

## Contracts a later implementation proposal must address

| Existing contract | Future tension; no change made here |
| --- | --- |
| stateful-npc-dialogue: preserve authored knowledge; received claims are not truth | Keep objective world fixed. Author conditional testimony and explicit, attributed belief updates; do not silently redefine received player input as NPC knowledge. |
| stateful-npc-dialogue / naturalness: emotion never unlocks secrets or alters testimony | Initial recommendation keeps numerical demeanor delivery-only; evidence-grounded, relationship-motivated policy changes testimony. If emotion later gates optional disclosures, define an explicit case-scoped delta and independent essential route. |
| naturalness: every variant preserves complete approved core content | A clarification supplying new authorized detail is a distinct core/statement facet, not an allegedly equivalent paraphrase. A revision is a new account, not variation of the original lie. |
| safe-npc-performance: minimal current exact pool, no raw history/solution/policy | Preserve unchanged. Select eligible new utterances before preparing model context; do not ask a model to infer loyalty, truth or permission. |
| mystery-deduction: existing Ashcroft chain and finality | Preserve original case as compatibility fixture. New case-specific reasoning/ending rules require their own reviewed contract without rewriting Ashcroft canon. |
| hybrid interface: six choices, public projections, attributed history | Extend purposeful choice policy and publicly understandable correction status only after choosing the story; do not expose secret branch IDs or add inert UI controls. |

No framework replacement, database, multi-agent runtime or semantic free-generation validator is justified by the inspected gaps.
