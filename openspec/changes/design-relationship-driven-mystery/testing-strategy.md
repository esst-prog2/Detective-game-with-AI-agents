# Proposed verification strategy

**Future test design, not executed tests.** Greyhaven has now been selected for detailed design. The templates below are historical generic strategy; the concrete proposed oracle is [greyhaven-review-and-acceptance.md](greyhaven-review-and-acceptance.md), with exact [public walkthroughs](greyhaven-player-walkthroughs.md). The revised narrative expectations are now approved as implementation-planning baseline; additional literal/technical expectations still need review before code. The current staged plan is [greyhaven-regression-strategy.md](greyhaven-regression-strategy.md), preserving independently specified results.

## Author the oracle before code

After concept selection, the user/reviewer approves a finite event timeline, observation/source table, intentional lie versus mistaken belief classifications, motivations, disclosure/clarification conditions and essential deduction routes. Store independent expected outcomes and reviewed exact utterances separately from runtime catalog generation. Do not derive a test's expected permission by calling the same policy being tested, or accept a transcript merely because it matches current implementation.

Every essential inference needs an explicit human argument: what was obtained, which source it came from, how independent that source is, what alternatives it excludes and what uncertainty remains. A graph reaching the configured murderer ID is not a proof of fair human deduction. Automated checks can catch structural contradictions; a fresh reader must still challenge the logic and alternate explanations.

## Acceptance matrix for eventual implementation

| Area | Design-derived fixture/scenario | Expected property |
| --- | --- | --- |
| Timeline | Ordered/ranged events, movement/access constraints and independently authored observations | No character at incompatible places/times; every significant account is intentionally true/false/mistaken/uncertain, not accidentally contradictory |
| Knowledge | Per-speaker observed versus heard IDs; private canaries in other characters and solution | Wrong-speaker/raw claim/unknown source cannot authorize a fact or enter provider context |
| Belief | Protector suspects an innocent person; a confident witness repeats a mistaken account | Confidence/loyalty is not truth; correction changes only the permitted belief/account after the declared event |
| Intentional lies | Explicit original false account and its permitted revision | False but authorized testimony works; a model's invention is rejected even if plausible or accidentally true |
| Disclosure | Just below each prerequisite; every all/any branch; repeated and reordered actions | Gate requires committed public actions and correct NPC presentation context; no keyword farming or ghost transition |
| Relationships | Protective relative versus unrelated bystander under the same question | Only the declared motivation affects selected accounts; no reciprocal/global inference from an edge |
| Clarification | Meaning, identity, time, source and certainty facets on approved statements | Adds the approved disambiguation or honest limitation, does not simply repeat or invent precision; blocked details stay blocked |
| Clarification context | No previous statement, changed speaker, old/retracted account, ambiguous target, more than eight turns | Honest target request/guidance or authorized bounded context; no fabricated recall or superseded account asserted as current |
| Comparison | Both required claims, only one, fake quote, shared-source claims, explicit presentation | Only authored grounded comparison; two repetitions of one source do not become independent corroboration |
| Route redundancy | Primary protected witness unavailable/guarded; independent document/witness route | Essential inference remains obtainable; fallback does not silently rely on the same concealed source |
| Emotion/aggression | Aggressive path, respectful path, repeated courtesy; original professor demeanor examples | Existing precedence/clamps preserved; no one-turn irreversible deadlock or accidental disclosure from tone |
| Options | More than six evidence/facet/comparison/topic candidates at several progress states | Essential next questions remain visibly reachable without unrelated-topic exhaustion; optional text and later choices remain usable |
| Async/cache | Delayed valid lie after correction, provider failure, travel away/back, ending, session/revision/projection failure | No stale reply/revision/belief/unlock installed; current account's exact-pair permissions also constrain cache hits |
| Exact performance | Omitted uncertainty, invented source/relative, wrong speaker/core, mixed fields, unapproved confession | Whole output rejected, current useful authorized fallback used; no private graph/raw input in provider requests |
| Endings | Supported correct, partial correct, incorrect and canceled accusations, with optional clues omitted | Explain only obtained support with uncertainty; wrong outcome reveals no culprit/private solution; first result remains final/detached |
| Offline/adapters | Actual CLI, revisioned HTTP, browser mixed choices/text, unavailable provider | Same semantic discoveries/permission transitions; complete useful case without AI or automatic mutation retries |
| Original-case regression | Ashcroft evidence/testimony/debt annotation/recognition/endings, HW4/HW5 and issue #3 fixtures | Original approved mystery is unchanged; new case does not inherit its private records, caches or explanation |

Use bounded state exploration for the small account/disclosure graph, not all possible prose strings or a full simulation. Explicitly test every negative permission edge and each route the design claims is an alternative. Keep accepted testimony distinct from objectively verified facts in public snapshots.

## Proposed deterministic public-action walkthroughs

For the chosen concept, produce exact CLI inputs, engine/HTTP command sequence and browser controls only after the public case records and oracles are approved. Each transcript must label obtained observations and conclusions separately. No raw case reads may be used to choose a command in the player path. Finite engine commit records do not prove a human received every reply; lost-response reconciliation must preserve that distinction.

| Provisional route | Public sequence template | What the later test must demonstrate |
| --- | --- | --- |
| A: protective witness route | Fresh case -> inspect scene and an ordinary time-reference record -> receive initial protective alibi and another account -> ask source/time clarification -> inspect corroborating alternative activity -> present an engine-authorized contradiction/evidence-grounded reassurance -> receive limited revision -> collect independent culprit-related support -> deliberate accusation | Son's apparent implication can be reconsidered; revision is neither confession nor knowledge of the culprit. The final accusation needs more than motive or a time-reference trick. |
| A: independent route | Fresh case -> receive guarded response -> use boathouse/ferry-office observations and another permitted witness -> obtain the essential timing/visit inference without the mother's revision -> collect remaining support -> accuse | Essential reasoning survives skipped reassurance, repeated questions and a hostile interview; optional secret closure is not required. |
| B | Fresh case -> inspect access record -> clarify what the entry measures -> compare admitted credential sharing with an independent physical observation -> inspect plain-language financial evidence -> distinguish unrelated wrongdoing -> collect converging opportunity/motive evidence -> accuse | Record semantics and multiple interests matter; no outside accounting knowledge, universal log hack or single-entry conviction. |
| C | Fresh case -> receive two agreeing accounts -> ask each source/observation limit -> inspect a permitted original record -> distinguish shared source from firsthand evidence -> resolve one non-murder concealment -> independently investigate present opportunity -> accuse | Disproving the public backstory alone does not solve the current killing; a recorded source is not a convenient confession. |

These are route templates, not proof that any sketch is already solvable. Exact dates/times, clues, prerequisites, revisions and ending support are intentionally deferred until selection. The approved full plan should also specify a short, resilient demo route and a second route that skips optional topics; demo order must not be the only valid order.

## Human review and execution honesty

Use a first-time player who has not seen developer-only concept spoilers. Before accusation, record their own suspicion and source-based reasoning, what alternatives they excluded and what they remain unsure of. Record confusion, incorrect accusations and unhelpful clarification verbatim where possible; a correct guess is not a fairness pass. Do not assign a difficulty rating based on one user's outcome or fabricate timing/success rates.

Future implementation validation should reuse Node, Chromium, production/import/artifact privacy, issue #3 and OpenSpec checks. This planning milestone runs only documentation/OpenSpec/whitespace checks; historical 361/40 results describe the previous implementation and are not newly executed here. The nine existing repository-wide strict failures are reported separately.
