# Existing mystery audit and deduction map

## Evidence status and method

Audit date: 2026-11-06. Base: main 6881d42, merging PR #10; 1d75d75 is an ancestor of fetched origin/main. Main fast-forward reported already up to date; planning branch is feature/improve-mystery-deduction. Initial worktree was clean.

Sources read: src/data/case.js, dialogue-catalog.js, authored-deliveries.js, dialogue-state.js, question-classifier.js, game.js, cli.js, HTTP/session code, browser client/conclusion, all four canonical specs, original MVP/lifecycle/room change contracts, relevant game/stateful/naturalness/public/lifecycle/security tests, README, PLANNING_LOG and security/quality reports. Findings below distinguish static inspection from execution.

A read-only, no-provider engine journey was executed through public views, inspection, travel, questions, choices and accusation. An initial shell quoting attempt failed before importing the game; a corrected stdin-fed Node run completed with exit 0. No code or test was added. This demonstrates current public-action behavior, not repaired-case acceptance or a human solve.

Observed route: inspect contract/cufflink in study; ask Alice sighting, cufflink and motive; travel garden, inspect footprints and ask Ben alibi; travel library, ask Clara sighting, use compare-garden-accounts and present-cufflink; confirm Clara. Alice cufflink returned unsupported guidance; other actions returned the testimony below; ending was exactly "Correct. Clara Voss murdered Victor Hale." No full test suite, browser run or provider request was performed in this planning milestone.

## Canonical reconstruction: developer knowledge versus obtainable information

Victor Hale owns Ashcroft Manor and is found dead in his study after a stormy dinner. Clara Voss is the configured murderer. There is no public precise death time, murder weapon, forensic footprint match or witnessed killing. Static interview positions are not murder-time alibis.

| Suspect | Public role and obtainable motive/alibi | Private developer facts and permissions | Opportunity assessment available to player |
| --- | --- | --- | --- |
| Alice Mercer, study | Housekeeper. Claims her room all evening. Says Victor was demanding, denies wishing harm and explicitly mentions her own debt. | Was in library reading debt letter; false room alibi protects embarrassment. Knows a more specific Clara route than her approved sighting permits. | Her alibi is uncorroborated; nervousness/debt do not establish murder. No public basis to infer the letter, library activity or her private route knowledge. |
| Ben Carter, garden | Gardener. Says he repaired greenhouse window; acknowledges anger about work and says losing a job is no reason to kill. | Victor planned replacement; earlier argument and dismissal threat are concealed in relationship account. Alibi is authored true, not independently verified publicly. | Has grounds access and a plausible work grievance; neither proves guilt. His public alibi remains a claim, not automatic exoneration. |
| Clara Voss, library | Business partner. Claims library alibi, ordinary business disagreements/profitability, no reason to harm Victor. Contract shows intended partnership termination. | Concealed losses, study meeting, murder, garden exit, cufflink and footprint ownership. Approved alibi/sighting/crime accounts lie or conceal. | Alice places her near garden around alarm; conflicts with denial. Contract supplies possible motive; physical clue ownership is missing publicly. |

### All existing topic testimony relevant to reasoning

| NPC | Topic | Obtainable content and limit |
| --- | --- | --- |
| Alice | Alibi | "I was at home in my room all evening." Lie; player is not given truth label. |
| Alice | Relationship | Victor was employer, demanding; she tried to serve well. |
| Alice | Motive | "I had no wish to harm Victor. My debt was my own problem, not his." Debt mention is already authorized. |
| Alice | Sighting | Saw Clara coming in from garden shortly before alarm; did not see where next. Not a sighting of entry into study or murder. |
| Alice | Evidence | Footprints from someone using garden door, not herself. A witness's assertion. |
| Alice | Crime | Heard sharp sound from study, then found Victor after others gathered. Does not establish exact death time or weapon. |
| Ben | Alibi | Repairing greenhouse window when Victor died. Self-report. |
| Ben | Relationship | Employer; disagreements; pride in knowledge of grounds. No specific argument disclosed. |
| Ben | Motive | Angry about work; denies murderous motive; mentions losing a job. |
| Ben | Sighting | Could not clearly see anyone from greenhouse because of rain. No corroboration of Clara or Alice. |
| Ben | Evidence | Mud fresh after storm; anyone using path would track it inside. Non-exclusive route evidence. |
| Ben | Crime | Heard Alice call, then came to study. No witnessed killing. |
| Clara | Alibi | In library reading during storm. No publicly demonstrated direct contradiction placing her inside study at death. |
| Clara | Relationship | Ordinary business disagreements. Contract makes minimization suspicious, not logically impossible. |
| Clara | Motive | Difficult but profitable partnership; no reason to harm. Profitability and intended dissolution can coexist. |
| Clara | Sighting | Saw only Ben near greenhouse before dinner; nowhere near garden afterward. Conflicts with Alice's sighting. |
| Clara | Evidence | Cufflink proves little; many guests; mud everywhere. No admission of ownership. |
| Clara | Crime | Went to study only after Alice called. No public timed observation conclusively refutes this. |

### Current versus proposed deduction map

Every row follows discoverable clue -> source -> interpretation -> supported deduction -> accusation role. Proposed material is explicitly labeled.

| Clue | Public source/action | Current interpretation and supported deduction | Gap / proposed change | Role in accusation and limits |
| --- | --- | --- | --- | --- |
| Torn contract | Inspect in study | Victor planned to end partnership with Clara; possible financial/professional motive | Keep description. Correct intended summary from "strong motive" as proof to possible motive corroborated by document. | Motive; not murder proof and not proof partnership was unprofitable. |
| V-engraved silver cufflink under desk | Inspect in study | Someone's cufflink present at crime location | Initial V does not identify Clara Voss; no public ownership or loss-time evidence. Keep physical description. | Presence of object only until recognition; no wearer automatically placed at death. |
| Alice recognition (PROPOSED) | Inspect cufflink, then ask Alice via contextual evidence choice or text | Matches pair Alice saw Clara wear at dinner | Add one reviewed witness response and static knowledge permission, using existing evidence presentation gate. No new item/document/room. | Connects Clara's accessory to study; witness identification is attributed, loss time unknown, not proof she killed. |
| Alice garden sighting | Ask sighting in study | Clara came from garden shortly before alarm, next destination unknown | Keep exact account; do not upgrade to private route. | Opportunity/nearby presence; conflicts with garden denial, does not time killing. |
| Clara garden denial | Ask sighting in library | Denies garden after dinner; places Ben there before dinner | Keep. Existing comparison unlocks only with both sighting cores. | Accounts conflict; at least one unreliable, player weighs Alice with independent clue. No automatic truth ruling. |
| Garden-account confrontation | Ask both sightings, then compare to Clara | Repeats Clara's authorized denial with contextual presentation | Keep; no confession or new route. | Makes contradiction legible, not additional independent evidence. |
| Muddy footprints | Inspect in garden | Fresh path from garden door toward study side entrance | Keep; no size, shoe identity or individual match. Developer claim "hers" must not appear in explanation. | Corroborates possible route only; cannot identify maker or exact traversal direction during killing. |
| Ben mud explanation | Present inspected footprints in garden | Anyone using path could track mud inside | Keep. | Explains route and non-exclusivity; weakens unsupported footprint certainty. |
| Clara contract confrontation | Present inspected contract in library | Existing motive denial/profitability account | Keep. Does not acknowledge termination and is not a separate clue. | Suspicious minimization beside contract; not a proven contradiction about profitability. |
| Alice debt | Ask motive in study | Embarrassing financial pressure; denial | Fix annotation only. | Fair red herring, no connection to weapon/study/murder. |
| Ben job grievance | Ask motive in garden | Angry over work; possible job loss | Keep. | Fair alternative motive; no specific physical connection. |
| Murder route, concealed losses, cufflink/footprint owner metadata | Private case records only | Not obtainable via authorized public actions | Do not serialize or feed to model; omit from player conclusion. | Cannot support player deduction as currently authored. |

Proposed cumulative reasoning: documented partnership termination gives Clara a possible motive; Alice's timely garden account conflicts with Clara's denial; the independently inspected desk clue plus Alice's recognition links Clara's accessory to the study. Footprints make the garden/study route plausible but are not an individual match. Together these make Clara the best-supported suspect among the authored alternatives. This is a defensible circumstantial inference, not deductive exclusion of every imaginable innocent explanation. Do not describe it as forensic proof or a witnessed murder.

## Confirmed defects and unsupported leaps

1. Intended solution calls the cufflink "Clara's missing cufflink" without discoverable recognition or proof it was missing. Recognition repairs attribution; revised solution must still remove unestablished "missing" timing.
2. Intended solution combines footprints and cufflink as a personal route match. Public data establishes neither footprint owner nor cufflink loss time. Repair wording, not forensic invention.
3. Alice motive speech mentions debt while concealmentReason says "Alice does not mention the debt." Correct annotation to what remains concealed.
4. Both endings currently give only verdict text. Successful play is not explained or distinguished from a lucky first-action guess.
5. Canonical naturalness/stateful specs require leaving original records and debt conflict unchanged. Explicit deltas are necessary; quietly changing case data would violate these requirements.

Fair intentional misdirection: alibis and denials are testimony, Alice debt and Ben grievance suggest alternatives, garden mud is non-exclusive. Unfair/incomplete writing: treating an engraving as ownership or private route/footprint annotations as discovered proof. Repeating Clara's denial or motive answer in confrontation adds context, not new evidence; counting it twice would exaggerate support.

## Fairness assessment

| Question | Current assessment | Proposed effect |
| --- | --- | --- |
| Can a new player identify Clara? | Can reasonably suspect her from contract and conflicting account; full intended physical chain is not supported. Executed route confirms missing recognition, not human solvability. | Obtainable recognition completes the physical connection; human first-time solve still requires actual playtest. |
| Clear reasoning? | Partial circumstantial reasoning; hidden attribution and overstatement weaken it. | Explicit sources and uncertainty; no requirement to prove every alternative impossible. |
| Discoverable without exact wording? | Clues accessible, topic options limited/rotated; unsupported clue questions can feel arbitrary. | Recognition appears after study inspection, within six choices; no hidden phrase or new room. |
| Recognizable contradictions? | Existing Alice/Clara prerequisite comparison works in executed run. | Preserve both orders and wording limits. |
| Suspicion versus evidence? | Demeanor is explicitly delivery only; verdict itself explains little. | Ending differentiates motive, witness claim, object connection and inference. |
| Wrong accusation plausible/fair? | Alice/Ben have plausible red herrings; uncorroborated alibis and one final choice permit mistakes. | Keep finality, confirm warning, no hidden score or new accusation lock. |
| Essential information missable? | All rooms reachable, inspection unrestricted while active; player may accuse before visiting. | No irreversible clue locks before accusation; inspect and revisit freely. Early guess remains allowed with honest sparse ending. |
| Checklist experience? | Six generic topics; evidence confrontations often repeat generic answers; pressure changes delivery only. | One purposeful evidence-specific question and coherent ending improve reasoning without requiring all topics or a deduction board. |

## Alice correction alternatives

Recommended private annotation: "Alice acknowledges her debt but conceals the debt letter and that she was in the library during the murder." Existing motive speech, false room alibi, private facts, personality and all original approved fallbacks stay intact. Recognition adds only a separate mundane dinner observation.

Alternative: remove debt from speech to preserve the old annotation. This rewrites canon, delivery fixtures and compatibility expectations and weakens an existing red herring; reject for this milestone. Alternative: relabel the response simply truth; this loses the useful partial-disclosure annotation while not explaining the concealed activity; prefer accurate concealmentReason instead. Original permitted-lie reason continues to describe embarrassment as her motive for lying about the alibi, not a rule forbidding every debt mention.
