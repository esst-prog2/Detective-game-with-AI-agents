# Milestone C: statement-specific contextual clarification

2026-11-06. Branch `feature/statement-specific-clarification`, based on main `37d7b26` (merged B PR #15, including commit `0cbebe1`). Local main was synchronized fast-forward only after a clean-status, remote/history/ancestry and worktree check. The user reviewed the implementation and authorized final review, scoped fixes, fresh verification, commit, push and a main-targeted PR. Manual merge, branch deletion, archive and D-F implementation remain unauthorized. Fetch confirmed origin/main still matches the branch parent. The separate demeanor worktree and existing manual servers are preserved.

## Existing behavior and resulting architecture

Ordinary topics select a base/current account; inspected evidence and established comparisons select explicitly authorized cores. Existing clarification repeats lastCore with clarification framing. The eight-turn per-speaker window supplies recent conversation, while B receipts preserve semantic testimony after eviction. Models receive only style, demeanor, intent and exact authorized performance pairs; adapters cannot choose facts. Failures/offline play use authored fallback. Committed emotion deltas affect delivery and never gates. Browser choices already accept six server-issued options and preserve independent text entry/history.

C extends this engine rather than replacing it. Opt-in v2 policy.facets supplies genuinely distinct authored answers for finite meaning/identity/source/time/certainty details. Every full speaker still needs six base subjects. V1 and B-only catalogs retain their paths, options, state shape and cache behavior. Ashcroft's story, evidence, dialogue, demeanor, conclusions, UI and public contracts are unchanged. No Greyhaven playable content or new ending was authored.

## Facet schema and target identity

An optional `policy.facets` array (at most128 entries, within the existing256-core catalog bound) opts into C. The private schema is closed:

```js
{
  id: 'keeper-current-source', suspectId: 'test-keeper',
  primaryStatement: 'keeper-revised-visit', accountVersion: 'v1',
  type: 'source', coreId: 'keeper-current-source-answer',
  label: 'How did you observe the visit?',
  aliases: ['How did you observe the visit?'], default: true,
  gate: { alternatives: [[
    { kind: 'received', speakerId: 'test-keeper', coreId: 'keeper-revised-visit' }
  ]] }
  // Optional historicalCoreId names a separately authored correction core.
}
```

Each primary is an owned base/account/disclosure core. Each response/correction is an owned `role:'facet'` core of the same public topic, with the normal authored content/variants/optional exact deliveries and epistemic annotations. accountVersion must match the primary's declared account version; non-account primaries require null. Only one facet per primary/type and at most one default are allowed. IDs cannot collide with rules or reserved choices. Aliases are one-to-eight whole normalized strings, at most100 characters each, unique per speaker across rules/facets. Gate bounds remain two alternatives of sixteen committed local inspection/testimony references. Unknown fields, owners, versions, predicates, duplicates and structural closed cycles fail construction. Facets cannot be account transitions or recursive primary targets.

Private state adds only `primaryTargets: Map<speaker,{speaker,primaryStatement,accountVersion,originTurn}>`, bounded by cast size. It is staged with B policy state. Each committed substantive non-facet core records that speaker's primary and committed turn. An informational facet focuses its received primary rather than its response core; repeated facets preserve the origin. An explicit reference to a different received primary adopts that receipt's original committed turn, including historical focus. Receipt insertion remains first-commit-only and bounded by catalog size. Diagnostics are detached trusted test views; no target, version, gate, stance or response-core field is added to HTTP/provider context.

## Resolution, unavailable details and accounts

Resolution validates choiceId against the currently offered speaker options. Existing exact policy aliases preserve evidence/comparison priority. Explicit whole facet aliases bind their authored primary; they require its actual receipt. Named evidence does not silently fall through into an unrelated facet: an explicit mapping can win after full authorization, otherwise the request receives evidence guidance. Finite generic questions such as 'How do you know?', 'Who do you mean?', 'When did that happen?' and 'Are you certain?' use only the speaker's committed primary. 'What do you mean by that?' selects its declared default. Case-specific patterns such as 'Which bell?' need an authored mapping; there is no unrestricted interpreter. Guessed IDs, quotes, compound or unresolved references do not establish context or fall through into a broad topic answer.

Guidance distinguishes no target, unreceived named account, unavailable detail, unsupported detail type, wrong witness, superseded account and unresolved/ambiguous reference. Messages mention no secret evidence, gate conditions, future version, culprit or internal identifier. Guidance uses the existing unsupported result contract, with null narration/no substantive turn; it changes no target, receipt, emotion, history or cache. Ambiguous earlier-account references need a reviewed explicit alias rather than arbitrary selection of an old receipt. Known explicit aliases can target a received account even when another statement is primary.

Current topics always select the current account. A current facet requires primary receipt with matching speaker/version, all gates, and current core authority. Historical clarification additionally requires explicit historicalCoreId and receipt of the current account. It serves that correction rather than the original facet response; absence produces superseded-account guidance. It never changes account pointers or replays the old claim as current. An explicit historical alias focuses that received old primary, so an implicit follow-up continues its authorized correction; asking the ordinary account topic returns focus to current testimony. An unlocked revision does not unlock old facets without their own historical permission/gates. All primary and historical authority survives eight-turn and actual64-entry cache eviction.

## Six-choice discoverability

C rules may declare boolean essential:true; route-critical base questions use existing suggestionPriority:1. Validation conservatively sums all essential rules and priority base cores per speaker and rejects more than four. This is stronger than enumerating simultaneous reachable states: it guarantees the budget but may reject mutually exclusive authoring that would fit at runtime. No silent essential truncation is allowed.

The menu orders first-time eligible essential rules (evidence/revision/comparison) by stable ID, then missing essential bases, then one eligible facet for the current primary. Facets prefer the declared default and then unseen details in stable order; after all are received, they rotate by committed delivery count. Remaining slots rotate optional evidence/rules/topics/revisits/social actions. At most one clarification choice is shown at once, preserving room for other actions. Essential prompts lose first-time priority after receipt but remain eligible by alias and optional rotation. All eligible facet aliases remain available immediately through free text, including historical references. Hidden facets never advertise labels before eligibility. Tests exercise eight additional optional actions, every facet, optional text access and a four-entry authoring budget under overflow.

## Atomicity, cache and security review

The same policyCoreAllowed boundary delegates to facet eligibility before selection and at commit. No second commit path was introduced. Context, facet receipts, text/history, emotions and cache stage in the existing cloned candidate. Pending/discarded testimony cannot authorize a follow-up. Existing generation, room epoch/presence, lifecycle, policy revision, session reservation/revision/identity and projection guards remain intact. Discard, stale provider success/failure, movement, independent inspection, ending and throwing/asynchronous/reentrant projection install none of the staged changes.

C cache identity extends B's trusted case/version/revision/current-account key with the selected rule/facet ID and existing exact pool identity. Primary commits advance policy revision; repeated facets do not duplicate receipts or move accounts. Old cached text has no authority to restore an old account. Every provider path and final commit still validates exact whole performances; raw prompts, private annotations and recent-turn text are never authorization. Static reachability is an over-approximation, not proof of prose correctness, joint narrative timing or fairness.

## Independent fixtures and verification

The private harbor fixture extends B's unrelated keeper/visitor case. It adds all five facet types, a locked clock detail, a source-limited revised account, an explicit correction of the old false account, and an independent visitor observation. Tests independently spell expected literals and forbidden outputs rather than computing them from the resolver. Neither fixture is production registered or browser imported. The browser test process owns an ephemeral real HTTP/session/engine server and forwards only API traffic to it; production still lists Ashcroft only.

| Check | Actual result |
| --- | --- |
| Complete Node | **598/598**, zero failed/cancelled/skipped/todo: all595 reviewed tests plus3 final input regressions (97 C tests beyond the501-test merged baseline). [Output](node-suite.txt) |
| Chromium | **48/48**,24 desktop and24 mobile; all46 baseline tests plus two actual C journeys,48.6 seconds. [Output](chromium.txt) |
| Standalone unchanged issue #3 | **81/81**. [Output](issue-3.txt) |
| Security/public-view/demeanor | **91/91**. [Output](privacy-demeanor.txt) |
| Production build/privacy | Passed;39 modules, unchanged JS259.81kB/79.87gzip and CSS26.23kB/6.35gzip, no source maps/private markers. [Output](build.txt) |
| CLI/Ashcroft |11 public engine actions and complete actual CLI journey passed; --list-cases lists only Ashcroft; no live model calls |
| Scoped strict OpenSpec | C, B, A and overarching planning changes pass |
| Strict archives |5/5 pass; no archive edited |
| Planning consistency |635 assertions, original approved narrative semantic hash5fc7e5b7c8ad430a03f8f70d456072abf5be3b84279875377024523cdd7eec94 |
| Repository-wide strict |8 pass /9 inherited failures,17 items. [Report](openspec-all.json) |
| Scope/whitespace/preservation | git diff --check and new-file whitespace pass; original160424-byte log prefix, complete162613-byte pre-finalization log and all17 prior mystery-deduction artifact files preserved byte-for-byte |

The nine inherited strict failures remain separate: changes add-investigation-http-api, add-playable-browser-interface, add-room-based-investigation, enforce-investigation-lifecycle, expose-safe-investigation-view; specs hybrid-dialogue-interface, npc-dialogue-naturalness, safe-npc-performance, stateful-npc-dialogue. Their pre-existing long descriptions were not rewritten to hide failures.

Three issues were exposed and corrected during development: a guessed statement reference initially fell through to the ordinary alibi classifier (the regression now rejects it without mutation); the new browser test interceptor initially also captured Vite's /src/api/ module (test-only routing now forwards /api/ paths exclusively); final source review found an explicit older-primary facet left implicit follow-ups focused on the previously active primary. A new independently specified regression failed before that focus fix; [RED output](focus-regression-red.txt) preserves it. Facets now focus their received primary while leaving account pointers untouched. Seven extra failure-mode tests verify historical focus rolls back atomically. Current-account questions explicitly return focus to current testimony. Both browser viewports and the complete suites were rerun successfully. No existing baseline test was weakened. Initial sandbox worker EPERM was resolved through approved execution permissions.

## Finalization review

Independent source/test review confirmed owned primary/version/response mappings, committed-only context, exact aliases and pools, historical correction focus and rollback, six-choice priority/rotation, private HTTP/bundle projections and unchanged v1/B-only paths. The seven-step initial/revised/historical/implicit/current-focus sequence is covered by literal engine expectations and both browser viewports. Historical receipt attribution and account pointers remain intact.

Review found one remaining variant of reference fallthrough: a bare guessed slug, case-qualified slug and single-quoted fabricated statement could select an ordinary alibi answer and thereby create context. This did not disclose locked testimony, but violated non-mutating guidance behavior. Three new independently specified tests failed before correction; [RED output](final-review-red.txt) preserves the run. C-only unresolved-reference handling now recognizes identifier-shaped text and paired single quotation marks, after existing exact mappings and finite contextual questions. Valid contractions, v1/B-only behavior and authored whole aliases remain on their established paths. Hyphenated free-form wording without a reviewed alias can receive guidance under this conservative finite resolver.

The final598-test suite preserves all595 reviewed tests; no existing expectation was weakened. Complete Chromium/security/build/CLI/spec/planning checks were rerun. The reviewed23-file inventory is extended only by this final RED report and PR_DESCRIPTION.md, for25 intended files. Verification outputs are refreshed, historical artifacts restored byte-for-byte, and the log remains append-only. No new mechanic, narrative, public field or later-milestone capability was introduced.

## Exact changed-file inventory

- `src/dialogue-policy.js`: facet validation, owned resolution/eligibility, primary staging and option priorities.
- `src/dialogue-state.js`: opt-in resolution/options and detached diagnostics.
- `src/game.js`: non-mutating specific guidance and facet-bound cache identity; existing transaction path retained.
- `web/scripts/check-boundary.mjs`: additional private facet/canary markers.
- `test-support/clarification-case.js`: private independent fixture.
- `test/clarification.test.js`:97 Node regressions.
- `web/e2e/clarification.spec.js`: real-engine desktop/mobile mixed choice/text journey.
- `openspec/changes/statement-specific-clarification/.openspec.yaml`, `proposal.md`, `design.md`, `tasks.md`, `specs/statement-specific-clarification/spec.md`: scoped C artifacts.
- `openspec/changes/design-relationship-driven-mystery/greyhaven-implementation-roadmap.md`, `check-greyhaven-design.mjs`: execution status/check only; narrative bodies/oracle untouched.
- `PLANNING_LOG.md`: append-only authorization, decisions and results.
- `docs/statement-specific-clarification/implementation.md`, `node-suite.txt`, `chromium.txt`, `build.txt`, `issue-3.txt`, `privacy-demeanor.txt`, `openspec-all.json`, `focus-regression-red.txt`, `final-review-red.txt`, `PR_DESCRIPTION.md`: report, actual verification outputs and publication description.

## Acceptance, limitations and D integration

C1-C3 are complete, approved for finalization and ready for PR review/manual merge. Planning fields were adapted to B's actual core/account/rule naming; no new public token or HTTP statement reference was introduced. The conservative four-entry essential validation and one rotating facet implement the approved six-choice budget without a navigation redesign.

Exact finite aliases intentionally do not understand arbitrary English, arbitrary quotes or full conversation search. Human helpfulness/comprehension is not established by literal tests. No new human or live-provider playtest is claimed. Historical correction prose and source consistency remain author responsibilities, especially if later versions add new corrections. Sessions and browser notes retain their existing ephemeral limits.

D requires separate approval to author/register the Mara/Owen preview, approve its sparse-topic/no-verdict profile, supply reviewed facets and historical corrections, and mark route-critical questions within the essential budget. E/F must exercise the20 approved Greyhaven examples and human fairness/source/custody acceptance. No preview, full case, new accusation logic, social simulation, relationship score, general AI interpreter or ending was implemented. Publication is authorized; wait for manual PR review/merge and separate D approval. Do not merge, delete branches or archive automatically.
