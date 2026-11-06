# Player-facing investigation walkthrough and acceptance strategy

## Status

The sequence below preserves the proposed repaired-case walkthrough. Implementation was approved on 2026-11-06 with stronger ownership/how/when uncertainty. Actual engine/CLI/browser public journeys have now run: see docs/mystery-deduction/verification.md and its recorded transcripts/screenshots. The current-case baseline remains separately recorded in mystery-audit.md. User-reported human feedback is now recorded in docs/mystery-deduction/playtest.md: correct accusation, obvious contract/cufflink combination and unhelpful clarification. This is qualitative evidence with the documented limits.

## A complete offline investigation

Start a fresh investigation with no model credentials. Follow displayed room/object/person names; the six standard topics remain supported. You need not ask every topic or provoke any character. The quoted new recognition is proposed wording; original-topic deliveries may vary while preserving the same content.

| Step | Player action | Information actually obtained | Permitted reasoning |
| --- | --- | --- | --- |
| 1 | Start in study; inspect Torn contract | Victor intended to end his partnership with Clara. | Possible motive, not proof. |
| 2 | Inspect Silver cufflink | Silver cufflink, V-shaped engraving, beneath Victor's desk. | Physical object at crime location; owner/time not yet established. |
| 3 | Talk to Alice; select the newly offered recognition question | "That matches the pair of silver cufflinks with V-shaped engravings Clara wore at dinner. I did not see her lose one, and I cannot tell you when it came to be beneath Victor's desk." | Alice connects the object to Clara's dinner accessories; do not infer a witnessed loss or murder-time presence. |
| 4 | Ask Alice "Did you see anyone suspicious?" or choose the corresponding offered sighting | Saw Clara coming in from garden shortly before alarm, did not see next destination. | Nearby presence at relevant time according to Alice, no witnessed killing or study entry. |
| 5 | Travel to garden; inspect Muddy footprints | Fresh trail from garden door toward study side entrance. | Possible route, no maker identification. |
| 6 | Ask Ben about inspected footprints; optionally ask his alibi | Anyone using path could track mud inside; says he was repairing greenhouse window. | Route is non-exclusive, alibi self-reported. No false exoneration. |
| 7 | Travel to library; ask Clara sighting | Saw only Ben near greenhouse before dinner; denies garden afterward. | Conflicts with Alice's sighting. Her account is still a claim. |
| 8 | Select the available garden-account comparison | Clara reiterates authorized account/denial. | Explicit challenge exposes disagreement, not an admission or independent second clue. |
| 9 | Optionally present contract and cufflink to Clara | Existing motive/evidence denials, no confession or new ownership admission. | Weigh denials against document and Alice's recognition; profitability can coexist with termination. |
| 10 | Review evidence and conversation notes; choose Clara, read finality warning, confirm | Correct verdict plus explanation containing only recorded support and uncertainty. | The contract, conflicting garden account and accessory connection collectively make Clara the strongest supported suspect. |

No action uses a private solution field or requires the player's question to assert a hidden truth. Interview room positions are not alibis. Steps 6 and 9 provide context but are not required for the core conclusion. Footprints corroborate a route but are not a mandatory accusation condition. Alice and Clara sightings can be collected in reverse order with the same comparison prerequisite behavior.

For the CLI use action 2 to inspect local named evidence; action 1 to choose a present suspect and type a standard question or `/choices`, selecting by displayed label; action 6 to choose the named room; action 4 to choose Clara and explicitly answer yes. Do not hardcode option indices because contextual ordering changes. In the browser use room objects, present character dialogue, engine choices, navigation and accusation confirmation. Both must obtain the same supporting content, not necessarily identical varied phrasing.

## Acceptance matrix (all proposed, none run for the repair)

| ID | Scenario and independent evidence | Passing criterion |
| --- | --- | --- |
| A1 | Fresh offline engine journey using public actions, then actual CLI and Chromium equivalents | Every essential clue/response obtainable with room guards; expected content checked against independently reviewed literal assertions, not generated expected values. No raw case reads in player decision path. |
| A2 | Inspect cufflink, visit Alice, select visible recognition or type a supported cufflink question | Both reach the correct dedicated core and retain identification plus both uncertainty limits. Generic evidence topic still returns original footprint response. |
| A3 | Recognition before inspection, forged choice, remote request, ended request and player-supplied ownership/debt claims | No recognition disclosure, substantive history, emotional/cache mutation or prerequisite satisfaction from rejected input. No additional fact from other speakers. |
| A4 | Collect sightings in both orders; inspect all items first; exercise six-option cap | Recognition and unanswered sighting remain discoverable without exhausting unrelated topics; comparison appears only after both committed accounts. Names/labels expose no hidden guilt. |
| A5 | Clarify/repeat/revisit recognition, pressure setup, offline/allowed fake selectors/cache | Same current permission and full testimony; no qualification dropped, original base fallbacks intact. Wrong-speaker, wrong-core and mixed-pair outputs rejected independently. |
| A6 | Alice motive response and private annotation fixture | Exact original debt sentence retained; corrected annotation describes letter/library concealment; other NPCs/public dossiers/options/provider context do not gain letter/library details. |
| A7 | Full recorded core chain plus optional footprint/Ben variants | Correct ending attributes both sightings, qualifies motive/accessory/timing, includes route only when inspected and attributes Ben only if his evidence response committed. No private route/weapon/footprint owner. |
| A8 | Immediate correct guess; contract-only; cufflink without recognition; recognition but one sighting missing; both sightings without comparison | Original verdict retained; only recorded support appears; incomplete chain explicitly acknowledged. Comparison need not be asked to recognize already received conflict. No hidden discovery checklist or accusation gate. |
| A9 | Full chain followed by more than eight turns; delayed invalidated response; disconnected admitted response | Finite committed IDs retain eligible summary after history ages out; stale/failed work adds no support; admitted committed work follows documented server-record semantics rather than claiming human receipt. |
| A10 | Fresh and partially investigated Alice/Ben accusations; cancellation; repeated ended command and mutated snapshots | Wrong result reveals no killer, private alibi or missed solution. Cancel stays active; first final text immutable/detached across engine, HTTP refresh and browser notes. |
| A11 | Read actual serialized provider requests and inject invented loss-time/ownership/route/confession, other-speaker recognition and incompatible pairs | Exact current-pair safety, minimal prompt, fallback and cache/commit checks hold. Existing issue #3 suite passes unchanged in its security expectations. No live paid call needed. |
| A12 | Full and sparse CLI/HTTP/browser ending, desktop/mobile, lost-response refresh | Same semantic support and result text through existing projections; no extra schema fields or browser private imports; readable complete explanation, focus/finality/history behavior retained, no automatic replay. |

Future verification commands: npm.cmd test; npm.cmd run test:web (documented isolated ports if necessary); npm.cmd run build:web; openspec.cmd validate improve-mystery-deduction --strict; openspec.cmd validate --all --strict; openspec.cmd validate --archived --strict; git diff --check. Use existing dependency/tool setup, no live provider credentials. Record actual output/counts only after execution. Add actual transcript and screenshots for the completed walkthrough without overwriting historical HW4/HW5 or quality baselines.

## Human fairness check

After implementation, have a first-time player use the displayed actions without developer hints. Before the verdict, ask them to explain their suspicion using obtained clues; record their actual reasoning, confusion and missed options. A defensible explanation should mention documentary motive, the conflicting garden accounts and Alice's uncertain accessory identification, and should not claim a footprint shoe match or rely on nervousness as guilt. Record contrary observations; do not substitute engine murderer-ID correctness or lexical tests for human comprehensibility. The subsequent user-reported correct accusation and concerns are recorded separately in docs/mystery-deduction/playtest.md; the original checklist does not substitute for a verbatim transcript or establish satisfactory difficulty.
