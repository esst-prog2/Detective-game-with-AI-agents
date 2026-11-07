# Milestone D: Greyhaven playable vertical slice

2026-11-07. Branch `feature/greyhaven-vertical-slice`, based on main `2003b1b` (Milestone C merge PR #16, including d4c2730). Clean local main was fast-forwarded after fetching origin and checking C ancestry, status, branches and worktrees. The user approved final verification, commit, push and PR creation on 2026-11-07 after manual playtesting and the four usability repairs. Final source review found no further production changes necessary. Publication is authorized; manual PR review and merge remain pending. No merge, branch deletion, archival or E/F work is authorized. The unrelated demeanor worktree and existing manual-play servers were preserved.

## Playable scope and package

The published `greyhaven-preview`, **The Last Bell at Greyhaven — Repair Dispute Preview**, contains exactly Mara Vale/Owen Vale, reception/boathouse and the pump worksheet/repayment demand (G4/G8). Ashcroft remains the default full case. The complete Greyhaven ID is unavailable. No other character, clue, full solution, dummy murderer or verdict is registered.

The server-only package `src/cases/greyhaven-preview.js` contains the approved M0/O0/O1 speech and three useful facets, explicit private knowledge/belief/concealment annotations, profiles and local references. Public dossiers show directed mother/son relationships and victim connections. Mara's protective lie is authored behavior motivated by a mistaken fear, not knowledge of murder or a relationship score. Owen's repair and unauthorized spending are separate from murder. No general social simulation, gossip or model-owned disclosure was added.

## Strict preview profile and trusted capability

An explicit definition `mode:'preview'` requires a closed `previewProfile:{subjects:[{suspectId,topics:['alibi']},...]}`. Each included speaker must be declared once with a nonempty unique subset of the existing topics. The v2 catalog must contain exactly those base topics and all declared speakers; extra/missing base topics or response subjects fail validation. Normal ownership, epistemic, rule/gate/facet, graph, source, performance and spatial validation still runs. Sparse or executable authoring is rejected by the existing plain-data package snapshot. Full cases reject this profile and still require all six subjects and a consistent local murderer solution.

Preview packages reject solution/privateCanon fields and use a closed top-level data shape with no murdererId. They do not store the full Greyhaven solution. Public metadata remains exactly id/title/mode. Registry validation precedes publication and fresh construction; immutable snapshots isolate sessions. The registry supplies mode/profile as trusted constructor context. No request key selects a profile, imports an arbitrary file, installs account state or changes a session's case.

The engine captures trusted mode and exposes it only as a trusted method for CLI use; nested public state/result shapes remain unchanged. Every preview accusation, including cancellation or a guessed/foreign suspect, returns fixed `accusation_unavailable` without grading, lifecycle mutation, account/cache effects or a verdict. HTTP preserves request/revision/session protections and returns409 with the existing fixed error envelope; rejection does not increment revision. The full-case accusation path remains unchanged.

## Investigation, accounts and clarification

The initial reception offers Mara's M0. The boathouse offers Owen's O0 and both inspectable records. The worksheet records the pump test/work/material/payment with source limits; the demand supplies the repayment conflict/deadline. No nested search, extra hidden object, timed lock or exact-phrase guessing is required.

O1 requires **committed O0 + inspected G4 + inspected G8 + explicit presentation**. Both acquisition orders and evidence-before-testimony work. Owen's base question is marked route-critical; after prerequisites the essential payment-and-argument evidence choice appears. Text can use its reviewed whole alias, “Ask Owen to explain the maintenance-fund payment and the argument,” or “Explain the maintenance fund payment and the argument.” Courtesy, pressure, quoted claims, inspection alone and provider output cannot advance the account. Repeated presentation returns current testimony without duplicate receipts or reversal. Maximum irritation cannot block earned testimony.

Mara has only M0 and its approved source facet. There is no M1/M2 core, account edge, speculative alternate source or backdoor trigger. Her missing full-case prerequisites are not fabricated and her account remains guarded after Owen's admission. Private fear/knowledge are never automatically spoken or shared with Owen.

Approved facets provide:

- M0/source: “Are you saying you watched him the whole time?” selects the approved guarded answer.
- O0/meaning: “What do you mean by work?” identifies the rescue pump, manual test and Jonah's hatch observation without revealing spending.
- O1/explanation: “Why hide a repair that helped someone?” separates useful work from permission and fear of judgment. The reviewed motive example maps to the existing meaning type rather than a new enum.

Explicit historical O0 clarification reuses the exact approved O1 body as its correction. It requires received O0/current O1 and cannot restore O0. Implicit follow-ups preserve that historical focus; ordinary whereabouts returns current O1 focus. No new historical correction facts were authored. The independent oracle compares all seven runtime cores to the six distinct approved literal bodies.

B/C already stage account pointers, first receipts, target focus, history, emotions and cache in one candidate. D uses that path without a Greyhaven-specific engine bypass. Case/version/account/facet cache authority and final generation/room/policy/session/projection checks remain. Real-package tests cover discarded/stale/deferred/projection failures and both provider success/failure after travel. Exact whole-performance authorization rejects premature O1, secrets and inventions through Responses/direct, legacy/structured adapters.

## Browser, CLI and non-terminal behavior

The existing start-screen manifest offers default Ashcroft and the distinct preview. Client parsing accepts the preview enum and binds the selected mode from the fetched manifest; subsequent session envelopes must match that immutable identity/mode. A relabeled full session is rejected. No client-generated capability is trusted by the server.

Small additive UI changes label the station/preview, display its objective and explain unavailable accusations where the normal action appears. Existing room travel, neutral artwork, journal, conversation history, six-choice prioritization, text form and focus handling are reused. One contextual facet remains visible; optional actions and exact aliases retain their existing paths. No timeline board or scoring was added. The universal “Start another case” navigation opens a chooser during active, ended or expired investigations; starting it creates a new session rather than relabeling the existing one. Canceling the chooser preserves the current investigation and notes.

The objective remains informational after O1: repair spending does not establish murder guilt, the full case/verdict is excluded, and exploration continues. Starting a new Ashcroft session clears preview notes only after success through existing generation/session handling. There is no completion score or terminal “success” ending. The CLI supports `--case greyhaven-preview`, `/choices`, eligible-only examples and fixed unavailable accusation output while remaining active. Default Ashcroft CLI menus/wording and ending behavior are preserved.

## Verification

| Check | Actual result |
| --- | --- |
| Complete Node | **656/656**, zero failed/cancelled/skipped/todo. All598 merged C tests retained plus58 D tests. The request's595 baseline preceded C's three final-review regressions. [Output](node-suite.txt) |
| Chromium desktop/mobile | **62/62**,31 per viewport: all58 prior tests plus4 complete-relationship regressions. The four new expectations failed before the label/rendering fix and pass afterward. [Full output](chromium.txt), [prior repair focused output](repairs-focused.txt) |
| Standalone unchanged issue #3 | **81/81**. [Output](issue-3.txt) |
| Security/public-view/demeanor | **91/91**, including the professor's five unchanged precedence cases. [Output](privacy-demeanor.txt) |
| Production build/privacy | Passed;41 modules, JS264.41kB/81.03gzip, CSS26.33kB/6.38gzip. No source maps, server imports, policy fields, secret canaries or authored O1 body in assets. [Output](build.txt) |
| Greyhaven walkthrough |17 public engine actions, premature/earned admission, facets/current/history, Mara unchanged and unavailable verdict; actual CLI choices/text journey. [Engine transcript](engine-public-actions.json), [CLI transcript](cli-walkthrough.txt) |
| Ashcroft walkthrough/CLI |11 public engine actions plus complete actual CLI journey passed. Case-list smoke lists Ashcroft and the preview only. No live model calls. |
| Strict scoped OpenSpec | D, C, B, A and overarching planning pass |
| Strict archives |5/5 passed; no archived files edited |
| Repository-wide strict |9 passed /9 inherited failures,18 items. [Report](openspec-all.json) |
| Planning consistency |637 assertions; unchanged semantic narrative hash5fc7e5b7c8ad430a03f8f70d456072abf5be3b84279875377024523cdd7eec94 |
| Preservation/whitespace |git diff --check and new-file whitespace pass; complete170790-byte pre-finalization log prefix, all17 prior mystery-deduction artifact files and six existing D screenshot/transcript files are preserved byte-for-byte |

The nine inherited strict failures remain separate: changes add-investigation-http-api, add-playable-browser-interface, add-room-based-investigation, enforce-investigation-lifecycle, expose-safe-investigation-view; specs hybrid-dialogue-interface, npc-dialogue-naturalness, safe-npc-performance, stateful-npc-dialogue. No unrelated requirement description was rewritten to suppress them.

All original Ashcroft browser journeys remain intact. Only obsolete manifest/count/mode expectations in case-registry, disclosure publication, client-manifest and browser-selection tests were updated to explicitly include the newly authorized preview; invalid unsupported modes remain rejected. No security assertion, authored expectation or demeanor rule was weakened. The e2e offline server now constructs the selected real registry case while preserving its Ashcroft privacy canaries.

An initial real-case HTTP test caught foreign-suspect preview accusations returning ordinary404 before the mode guard. The adapter now routes all preview accusations to the same unavailable guard after normal command validation/revision handling; no hidden-suspect lookup or grading occurs. The test and full suites pass. CLI examples were reviewed to avoid advertising a locked reason facet: they list only currently offered questions.

## Manual playtest repairs before finalization

The user manually tested D and reported three distinct issues. All three were reproduced before repair: three browser regressions failed on both desktop and mobile (six failures). [Pre-fix evidence](repairs-red.txt) records those failures. This is user-reported control feedback, not an unqualified narrative fairness or satisfaction result.

| Issue | Root cause / before | Repair / after |
| --- | --- | --- |
| A: cannot select Greyhaven again | MainMenu rendered only before a snapshot existed. The preview's return button and conclusion's quick restart called client.start with Ashcroft/default identity; no case chooser existed during play or after ending. | Universal “Start another case” opens a small existing-style ReadingDialog with the public manifest. The explicit start uses the existing new-session command; current session/notes remain until success. Cancel, failed loading and failed starts retain the current investigation. The old quick Ashcroft restart still works, and selection remains available after it. |
| B: Review observation appears inert | EvidenceJournal's received-item handler set selected/data-reviewed only. It opened no reader and had no visible selection treatment; the description was already inline. `git show HEAD` confirms this component was unchanged from merged C, so the issue predates D. Room re-review also relied on an inline observation that could already be open or outside attention. | Both journal and room review now open the existing focused ReadingDialog with the actually received name/description, including at remote journal locations or after ending. Enter/Space/click work; Close/Escape restores trigger focus. No API or engine operation is called and no evidence/state/revision changes. First inspection remains authorized and displays its existing inline observation. Missing descriptions are never invented. |
| C: absent accusation control is unexplained | Suppression was intentional and server protection worked. The scope explanation was only in a global preview notice, away from the normal action location. | A labeled informational note now occupies the preview's normal accusation area: final accusation unavailable, full murder cannot be solved here, continue exploring or start another case. Overview also explains the limitation. No fake enabled control, culprit or verdict was added; Ashcroft's normal button and grading are unchanged. |

Production repair files are exactly `web/src/App.jsx`, `web/src/components/GameNavigation.jsx`, new `web/src/components/NewInvestigationDialog.jsx`, `web/src/components/EvidenceJournal.jsx`, `web/src/components/SuspectOverview.jsx` and `web/src/screens/InvestigationScreen.jsx`. No further engine, API, session, case data, policy, clarification or narrative change was needed. Browser coverage is new `web/e2e/playtest-repairs.spec.js`; the existing `web/e2e/game.spec.js` now asserts the review dialog opens and closes it before the original accusation journey continues. Existing assertions were retained.

The case-switch journey checks Ashcroft -> Greyhaven -> Ashcroft -> accusation/end -> Greyhaven, four distinct correct identities, fresh server state, retained notes on chooser cancel, cleared local notes on successful new starts, and the old Ashcroft session still ended under its original identity. Review journeys reopen both cases' journal/room observations with keyboard focus restoration and zero POST commands. The preview test attacks the exact browser-opened session and compares state/revision before/after rejection, then verifies normal Ashcroft accusation. Full656 Node and58 Chromium suites, explicit81/91 regressions, build/privacy, both walkthroughs, CLI, scoped/archived validation, planning and whitespace all pass. D4 is tracked in the same scoped change; E/F remain unstarted.

## Public relationship label repair

The user found an isolated “Her son” bullet on Mara's room card. The public authored edge already identified Owen by targetSuspectId, but the shared PublicDossier rendered only edge.label. Owen had the same issue with “His mother.” All room cards, overview cards and public-dossier readers shared the renderer. Ashcroft has no extra relationship edges; Ben and Clara instead repeated their already-described victim connection in a separate paragraph.

PublicDossier now resolves edge targets exclusively from the selected case's public snapshot and displays named labels under a compact Relationships heading. Unknown targets are omitted rather than guessed or exposed as internal IDs. Existing fully named labels are not prefixed twice. Duplicate public prose is suppressed using normalized text and the current explicit employment/partnership formats; this is not general relationship inference.

Only public Greyhaven label strings changed: Mara's victim connection is “Adrian Vale — Brother,” with Owen's edge “Son”; Owen's is “Adrian Vale — Uncle,” with Mara's edge “Mother.” These are reciprocal presentations of the already approved/public sister, nephew, mother and son relationships. No edge, private relationship, plot fact, knowledge, belief, gate, account or speech body changed. Ashcroft's authored data and descriptions remain verbatim; redundant connection text is simply omitted from rendering.

Implementation/test files for this repair are `web/src/components/PublicDossier.jsx`, `src/cases/greyhaven-preview.js` (two public dossier records only), and new `web/e2e/relationship-labels.spec.js`, plus the same-change D5/spec, documentation, evidence outputs and append-only log. Four pre-fix desktop/mobile regressions failed; [RED output](relationships-red.txt) preserves them. They now verify exact Mara/Owen rows in room/reader/overview, Ashcroft descriptions without duplicate connections, no dialogue/disclosure requests during reading, absent secret labels and no horizontal overflow. Complete Node656/656, browser62/62, public-view/security/demeanor91/91, production build/privacy and scoped validation pass. Existing API contracts and the approved narrative oracle are unchanged.

Retest against a restarted API and a fresh investigation: immutable definitions/sessions in an already-running API retain earlier public label strings. The API and browser servers were subsequently restarted at the user’s request. The user then confirmed the preview was manually playtested and the reported usability issues addressed. This records acceptance of the bounded preview and repairs, not certification of every narrative route.

## Narrative audit and human acceptance

The [narrative audit](narrative-audit.md) maps every speech core, evidence clause, dossier, relationship, profile and instruction to approved planning sources. No contradictory chronology, impossible new knowledge, inaccessible prerequisite, confession, culprit leak or false murder conclusion was found in this bounded review. Original narrative documents/oracle are unchanged. Complete source/custody routes and their human fairness gates remain outside D.

Desktop/mobile screenshots and public transcripts are saved here. Assistant visual review found readable controls/text with no horizontal overflow; neutral generic art is deliberately reused. Keyboard focus after selected questions and repair dialogs is tested. The user confirmed successful manual playtesting and that case switching, observation review, accusation explanations and public relationship labels were addressed. Exact player route, viewport, transcript and reasoning were not supplied; no claim is made that every narrative route or full-case fairness was human-tested. Follow the [human checklist](playtest.md) and record actual questions, reasoning and confusing replies.

## Exact changed-file inventory and acceptance

The complete exact path inventory is [changed-files.txt](changed-files.txt), 61 files in the final PR scope, including the ready-to-use PR description. Production scope is the private preview package, explicit registry/profile validation, trusted no-verdict guard and error, CLI mode handling and small browser capability/presentation changes, including the six repair files above. Tests, independent literal oracle, public walkthrough, OpenSpec D artifacts, README, technical roadmap/checker status, append-only planning log and this evidence/report directory complete the scope. Canonical specs, old evidence, authored Ashcroft content/demeanor and approved Greyhaven narrative were not changed.

D1-D5 are complete. Final verification reran all established checks successfully, including62 Chromium cases (58 prior plus4 relationship regressions). The user approved publication after manual playtesting and acceptance of the four repairs; the PR remains subject to manual review and merge. Broader narrative comprehension and full-case fairness remain future acceptance work. Finite aliases and the conservative essential-choice budget remain B/C limitations. Sparse preview conversations intentionally do not answer all six full-case subjects. Jonah is referenced by approved testimony but is not interviewable here; this limitation and historical O1 repetition need human feedback. Placeholder artwork and a persistent scope notice may need later presentation review. Existing sessions/notes remain ephemeral; starting a selected case clears browser notes after success and does not delete the previous server session, which retains its normal expiry behavior.

E/F require separate approval: remaining cast/rooms/clues, the mother's full account arc, complete deduction routes, reviewed case-specific conclusions and full-case publication. No complete mystery, new accusation mechanics, social simulator, confession, legal guilt score or new ending was implemented. Commit, push and PR creation are authorized as this finalization step. No automatic merge, branch deletion or archival is authorized. E/F remain unstarted. Existing manual servers and the separate demeanor worktree are preserved during finalization.
