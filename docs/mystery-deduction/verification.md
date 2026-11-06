# Mystery deduction implementation verification

Date: 2026-11-06. Branch: feature/improve-mystery-deduction. Original implementation baseline: main 6881d42 (issue #3 fix merged through PR #10). The user approved implementation and explicitly required uncertain accessory recognition rather than ownership certainty. Publication was subsequently authorized; finalization checks are recorded below. Archival requires a confirmed merge into main.

## Implemented behavior

- Inspecting the study cufflink enables Alice's recognition choice and named-clue text path. She remembers a matching distinctive design, explicitly cannot establish ownership, did not witness a drop, and does not know how/when the object reached the study. This is one separate static authorized core, not an emotion/trust secret unlock. All eighteen base topic answers and original fallbacks remain unchanged.
- The six-topic base lookup excludes evidence-gated cores. Validation requires matching speaker/evidence mappings; preparation and final candidate checks enforce the current inspection permission. Legacy caches now use core IDs so Alice's generic evidence and recognition cannot reuse each other's deliveries. Both provider adapters and direct injected adapters still require exact currently authorized outputs.
- Alice's debt concealment annotation now describes withholding the letter/library activity, preserving her original motive sentence. The intended solution no longer claims a missing cufflink or identifies a footprint maker.
- Existing Alice/Clara unanswered sighting topics have deterministic authored priority after eligible evidence/comparison choices. More than six eligible questions are explicitly tested. Recognition and the essential sightings remain visible; optional topics remain usable through free text and later choices. No frontend-generated guilt or relevance is added.
- Correct results append reviewed source-attributed paragraphs selected only by inspected evidence and committed authored-core IDs. Contract + recognition + both sightings provide substantial circumstantial support without requiring footprints, every topic or the comparison action itself. A correct guess/partial investigation gets only its recorded support and an incomplete-evidence acknowledgment. Incorrect verdicts, cancellation and write-once finality stay private and unchanged. The CLI now warns that confirmation ends play; the browser already warned.
- Browser rendering retains paragraph breaks using one white-space CSS declaration. No new route, public field, dependency, model, artwork, score, deduction board or persistent state.

## Executed checks and actual results

| Check | Actual result |
| --- | --- |
| `npm.cmd test` | 356 passed; 0 failed, cancelled, skipped or todo. Includes the original 311 tests with narrowly migrated content/order/verdict fixtures and 45 new mystery tests. |
| Issue #3 regressions | All 81 existing knowledge-leak protection tests passed as part of the full Node suite; that test file, provider adapters and their security expectations are unchanged. New tests add 20 recognition attacks across Responses/direct injection and structured/legacy adapters. |
| `npm.cmd run test:web` | 40/40 Chromium tests passed, 20 desktop and 20 mobile. All 34 previous tests retained; six new executions cover full/sparse/incorrect outcomes, real offline choices/rooms/inspection, visible essential questions and core support without all clues. |
| `npm.cmd run build:web` | Passed: 39 modules; JS 258.28 kB / 79.43 gzip; CSS 26.23 kB / 6.35 gzip. Source/import boundary and artifact scan passed; no source maps or forbidden server markers. |
| `node scripts/walkthrough-mystery-deduction.js` | Passed; 11 recorded public engine actions and complete actual CLI session. No model configuration/provider calls. |
| `openspec.cmd validate improve-mystery-deduction --strict` | Passed. |
| `openspec.cmd validate --archived --strict` | Four passed, zero failed. |
| `openspec.cmd validate --all --strict` | Four passed, nine failed under installed OpenSpec 1.14.3. All failures are existing requirement descriptions over 500 characters, in untouched canonical/older change files. See baseline comparison below. |
| `git diff --check` | Passed. New planning/code/doc files additionally scanned for trailing whitespace. Git's LF-to-CRLF notice for the append-only planning log is informational. |
| Preservation review | Original authored-deliveries.js, reviewed-testimony.json, both provider adapters, issue #3 security tests, historical spikes/HW4/HW5 evidence and canonical/archived specs have no diff. Historical case checksum still passes after explicitly normalizing only the three approved content changes. |

Dependency installation used the existing lockfiles; neither package nor lockfile changed. Node 24.20.0; no paid/live API call or credential used. Sandbox network/cache and subprocess restrictions required authorized installation/test/build reruns; ordinary failures were not treated as passing results.

Initial Node failures were ten expectations freezing the approved old annotation, verdict-only text, option order and base-only core assumptions; these were updated while retaining independent content oracles, original eighteen-topic fixtures and the historical case checksum for unaffected content. One new test was corrected to accept an already-reviewed generic evidence variant rather than requiring the original on a later turn. Browser walkthrough setup was corrected for the existing arrow-prefixed return label and approved Alice sighting variants. These did not require changing production behavior or dropping assertions about evidence uncertainty.

## Strict OpenSpec baseline comparison

To distinguish new failures from existing ones, `git archive HEAD openspec` was extracted to a temporary workspace directory and validated with the same OpenSpec 1.14.3 executable. Committed baseline: 3 passed, 9 failed (12 items). Current work: 4 passed, the same 9 failed (13 items); the additional passing item is this change. Every failure concerns the new CLI's long-description warning being fatal under strict mode. No requirement splitting or unrelated canonical-spec editing was undertaken.

Failing baseline items: add-investigation-http-api, add-playable-browser-interface, add-room-based-investigation, enforce-investigation-lifecycle, expose-safe-investigation-view, hybrid-dialogue-interface, npc-dialogue-naturalness, safe-npc-performance and stateful-npc-dialogue. Earlier reports describing these as informational were produced with earlier tool behavior. [Baseline output](openspec-baseline-strict.txt) and [current output](openspec-current-strict.txt) retain the actual results. This is a known repository verification limitation, not a clean repository-wide strict result.

## Actual public walkthrough evidence

- [Engine inputs/results](engine-public-actions.json), [actual CLI transcript](cli-walkthrough.txt).
- [Desktop browser public-action results](desktop-public-actions.json), [mobile results](mobile-public-actions.json). Session capabilities and credentials are not recorded.
- [Desktop conclusion](desktop-supported.png), [mobile conclusion](mobile-supported.png), [360px](mobile-360px.png), [CSS 200%](desktop-200-percent.png).

The recorded route starts fresh, inspects contract and cufflink in the study, asks the displayed Alice recognition and sighting questions, inspects garden footprints and asks Ben, travels to Clara, asks her sighting and the available garden comparison, then explicitly confirms an accusation. The combined public reasoning is: possible documentary motive + conflicting garden accounts + uncertain accessory connection; footprints add a possible non-exclusive route. No private murder route, concealed losses, debt letter, forensic ownership or confession is used.

Full engine/CLI and browser actions were executed, not fabricated illustrations. The regression matrix also covers core support without footprints or optional topics; immediate and partially investigated correct guesses; both incorrect suspects; both sighting orders; aged-out recent history; stale and projection-failed recognition; cache separation; generic fallback compatibility; real revisioned HTTP final-text recovery; and malicious output omission/addition/cross-speaker attacks. Existing browser lost-reply/session/privacy/room guards pass unchanged.

## Visual review and remaining limitations

Reviewed actual desktop/mobile full-page captures, 360px and CSS 200% desktop reflow. The conclusion text, qualifiers, navigation and actions are visible with no horizontal overflow at those tested sizes. Long explanations require vertical scrolling, particularly on mobile. Narrow and zoom checks are independent: combining a 360px viewport with 200% CSS zoom requests 180 effective CSS pixels, below the existing 320px app minimum. That unsupported combination overflows; no claim is made that it is supported. CSS zoom is not native zoom or screen-reader certification.

One recognition utterance is deliberately retained verbatim across demeanor/repetition so no qualification is lost; its finite repertoire can repeat. Recognition is a witness recollection, not unique forensic identification. The mystery remains circumstantial and cannot exclude every hypothetical innocent explanation. Engine summaries record successful commits, not a receipt acknowledgment: admitted commands may commit despite a lost reply, and finite IDs may outlive the eight-turn public window. No save/complete persistent-history claim is made.

**Human feedback received on 2026-11-06.** The user reports that the player correctly suspected and accused Clara, considered the torn contract the strongest sign, and found the cufflink/contract combination fairly obvious. The player also found clarification replies sometimes unhelpful or incoherent because they repeat rather than explain. This supports the repaired chain's accessibility for this player, while exposing difficulty and clarification-quality limitations; it is not an unqualified fairness pass. Exact utterances, assistance, device/browser and ending impressions were not supplied. Task 3.2 is complete as an assessment with recorded concerns. See the [playtest observations and retained checklist](playtest.md). Richer relationships, harder evidence and a larger case require a separate approved design; no new gameplay or renewed automated test result is claimed here.

## Finalization verification (2026-11-06)

Fresh pre-publication checks on the completed feature tree passed 356/356 Node tests, 81/81 explicitly executed issue #3 regressions, and 40/40 Chromium tests. Chromium used the documented isolated API 3002 / IPv6 Vite listener so existing manual-play servers were preserved. Production build/source/artifact privacy passed with unchanged 39-module and bundle-size results. Strict change validation and all four archived changes passed. Current repository-wide strict validation still reports four passed/nine failed from the same untouched long-description baseline items; no new failing item or unrelated spec correction was introduced. Whitespace checks passed.

Fetched origin/main is 0318127, merging the separate demeanor regression through PR #11. Before publication the mystery branch has no remote branch and GitHub's read-only PR query returns HTTP 200 with an empty array for its head. GitHub CLI is unavailable, so publication uses a pushed branch, exact comparison link and reviewed PR description rather than claiming a PR was created. The unpublished milestone commit will be rebased onto that main baseline; any post-integration verification is recorded separately. The already-merged demeanor test is base content, not a new change in this PR.

Post-integration verification: the unpublished milestone commit was rebased onto 0318127. Only the append-only PLANNING_LOG.md conflicted; the original common prefix, all main entries and every milestone entry were preserved. The complete Node suite on the final rebased tree passed **361/361**, zero failed/cancelled/skipped/todo: 316 tests from current main plus 45 mystery tests. A direct Git comparison confirms src/, web/, scripts/, test-support/ and package files are unchanged by the rebase; the 40-test browser/privacy-build results above therefore cover the same production/browser source. The five demeanor tests are unchanged relative to main and are absent from this PR's diff. Local main was safely fast-forwarded without checkout and equals origin/main at 0318127. Strict change validation and whitespace checks passed again; all ten tasks remain complete. Captured validation logs were normalized to UTF-8 and trailing-whitespace-free text without changing their reported results.

Review entry point: [compare main with the feature branch](https://github.com/esst-prog2/Detective-game-with-AI-agents/compare/main...feature/improve-mystery-deduction?expand=1). The ready-to-use [PR description](PR_DESCRIPTION.md) records current verification and limitations. No PR merge or automatic archive is authorized before user review and a confirmed implementation merge.

All ten tasks have supporting implementation/automated/qualitative assessment evidence. Completion does not assert improved difficulty or useful clarification for every reply. No new defect requiring a change to the approved repair behavior was confirmed in final review. The reported difficulty and repetitive clarification are retained future design opportunities, not hidden unfinished tasks or claims of an unqualified fairness pass.

The OpenSpec archive workflow was reviewed. This change remains unarchived until its implementation is confirmed merged into main. New mystery-deduction canonical spec creation and the two reviewed dialogue-spec delta updates must occur through that later archive/sync workflow and receive a separate review; no unrelated change is archived or canonical spec rewritten during publication.

## Future design opportunities outside this completed milestone

- Greater mystery complexity, difficulty and storytelling, with rooms/people serving a complete timeline and deduction chain rather than merely increasing content volume.
- Meaningful personal relationships affecting choices and behavior; separate each NPC's knowledge, beliefs, motivations and chosen testimony.
- Conditional disclosure of secrets and deliberately authorized lies to protect another character or conceal unrelated information. The protective-mother/guilty-son example is a design example, not current-case canon.
- Clarification that resolves a specific ambiguity, reference, timing or observation limit instead of merely rephrasing testimony.
- A future relationship-driven investigation with fair misleading clues, corroboration and exclusion of alternatives, planned and reviewed before implementation.

None of these features is implemented or added as an unfinished task in improve-mystery-deduction.
