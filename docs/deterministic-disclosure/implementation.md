# Milestone B: deterministic disclosure and account revisions

Date: 2026-11-06. Branch `feature/deterministic-disclosure`, based on main3727a9b. Fetch and ancestry verified that PR #14 merged Milestone A, including effca5a. Clean local main fast-forwarded before branching. The separate demeanor worktree and running manual-play servers are untouched. The user reviewed B and authorized final verification, commit, push and PR creation, including necessary scoped defect fixes. Manual merge, branch deletion, archival and C-F remain unauthorized.

## Scope and files

This implements roadmap B1-B4 with unrelated test content, preserving the original case and public interfaces. New private `src/dialogue-policy.js` owns policy validation, eligibility, explicit action plans, current-account selection, receipt staging and policy cache identity. Integration edits are limited to `src/data/dialogue-catalog.js`, `src/dialogue-state.js`, `src/game.js`, `src/cases/registry.js`, `src/cases/validate-package.js`, and the artifact scan `web/scripts/check-boundary.mjs`.

New test support: `test-support/disclosure-case.js`. New suites: `test/disclosure-validation.test.js`, `test/disclosure-state.test.js`, `test/disclosure-transactions.test.js`. Traceability: `openspec/changes/deterministic-disclosure/` (proposal/design/tasks/spec/metadata), this report and saved outputs, technical roadmap execution-status updates and its documentation checker, append-only `PLANNING_LOG.md`. No browser source, CLI/API/session transport, dependencies, original authored content, ending resolver, canonical specification or archived milestone changed. Roadmap/checker edits record execution status, not narrative revision.

## Authoring contract and knowledge boundary

V1 catalogs, including unchanged Ashcroft, retain their existing profile/core/option validation and selection. An explicit v2 catalog adds `schemaVersion:2`, a private `policy`, and core roles `base`, `account`, `disclosure`. Every full-case speaker still requires six base subjects. `base` supplies ordinary topics, `account` supplies revised versions of one base topic, and `disclosure` supplies gated informational testimony without changing an account. The name `disclosure` implements B's informational-core need; C's `facet` role/target schema is deliberately rejected for now. V2 uses policy rules instead of the old evidence/comparison arrays, which must be empty; this avoids two competing authorization paths. Existing structural speech/variant/profile/performance checks validate every core, not only the six base rows.

Policy has exactly `caseId`, `accounts`, `rules`, `epistemics`. Accounts are speaker-owned, each with an initial version and finite version-to-core map. The initial core is a base subject; subsequent cores are owned account cores of that same topic. No core belongs to two accounts. Epistemic records explicitly distinguish a speaker's known facts, beliefs, concealed known-fact IDs and motivation. Core `stance` records truth/belief/lie/omission and `basis` references owned known facts or beliefs. These are immutable authoring annotations: knowing or believing something does not authorize saying it. Only reviewed core speech and its existing exact performances can be displayed. The model never receives these annotations and never chooses a gate or transition.

Rules declare an ID, speaker, target core, existing public kind (`topic`, `evidence`, `contradiction`), safe label, one-to-eight exact normalized aliases, gate and optional account transition. Aliases are case/space/punctuation tolerant but match the complete request, not arbitrary substrings or a model interpretation. Missing prerequisites on a recognized alias return existing guidance rather than falling through to a broader topic. Evidence-kind rules additionally require a declared local inspected item, recording presentation through the existing action semantics. No rule accepts raw quotes, mood, counters, code or client-supplied account state.

Gates have one or two alternatives, each one-to-sixteen typed references:

```js
{ kind: 'inspected', evidenceId: 'local-clue' }
{ kind: 'received', speakerId: 'local-speaker', coreId: 'owned-core' }
```

References must resolve within the selected catalog/data; external case qualifiers are rejected as extra fields. Definition validation binds `policy.caseId` to the registry definition. Trusted raw v2 construction also requires matching `caseContext:{id,version}`; the registry supplies it. There is no new HTTP field or arbitrary case loader.

Validation rejects unsupported schema/roles/predicates/keys, incomplete topics, duplicate/foreign owners/IDs, ambiguous or reserved choices/aliases, missing versions, conflicting account membership, self/back cycles and structurally unreachable gates/versions. Bounds: at most16 accounts,16 versions/account,64 rules,256 cores,64 profiles/epistemic records,64 known facts/beliefs each,16 basis references. Gate reachability is a finite structural over-approximation assuming all local inspections and base testimony can be obtained. It detects closed prerequisite cycles; it is not a proof of every possible authored narrative's joint timing, semantic consistency or player experience. Authored graph/content review remains necessary.

## Private state, eligibility and atomic commitment

Only v2 adds private `state.policy`:

```text
caseId
revision
accounts: Map<accountId, currentVersion>
receipts: Map<coreId, {speakerId, statementId, accountKey, accountVersion, firstCommittedTurn}>
```

Account pointers start at explicit initial versions. Historical receipts are inserted once per authored core, retaining first committed attribution/version/turn after the public eight-turn history or 64-entry performance cache evicts old material. The maximum receipt count is catalog size, not player input volume. Private diagnostics project detached maps/records for testing; HTTP never exposes them. V1 diagnostics/state retain their existing shape.

A rule can propose its target only when its owned gate holds against committed inspections/receipts and its source version is current. A direct topic request selects the current account core, so an initial lie cannot masquerade as fresh testimony after revision. Initial accounts and ordinary base topics remain directly available. Informational cores require an eligible explicit rule on first disclosure; after receipt they can be revisited/clarified while their gate holds. Locked cores cannot be reached by generic clarification, guessed IDs, pressure or quoted witness claims. This is eligibility for authored speech, not certification that a witness is truthful.

Preparation uses the existing cloned candidate state. It stages account movement, first receipts and policy revision alongside dialogue, emotion, gestures, presented evidence and cache. Staged receipts never satisfy their own gate. AI selection receives only the existing projected style/demeanor/intent/exact whole pairs; failures and timeout use an eligible authored fallback. V2 offline prefix-only catalogs also use the exact-pair offer path; both legacy and structured injected adapters remain independently checked.

Final commit rechecks generation, room epoch/presence, lifecycle, policy revision and the same core/rule predicate before and after synchronous public/result projection. Session reservation/revision/game/bearer checks remain unchanged outside the engine. Only then is candidate state installed. Throwing/asynchronous/reentrant projection, discard, stale entry, movement, inspection, cancellation or ending installs none of the candidate's policy/history/emotion/cache. Independently committed inspection/travel/ending actions remain committed.

Repeating a completed transition serves the current account (including a later version) and never moves backward. Repeated receipt/transition does not increment policy revision or duplicate semantic records. Existing normal repeat emotion/delivery/history behavior remains; no first-time presentation/disclosure benefit is farmed. Unsupported typed guidance retains the existing HTTP command/revision behavior; it changes no account or semantic receipt. A guessed unavailable choice is rejected without admitting a command.

V2 cache keys prefix the original exact pool key with trusted case ID/version, policy revision and current account map. Old cached initial claims remain private historical entries until normal eviction, but cannot match a current revised request. V1 cache keys/pools are unchanged. Full state, caches and receipts are per investigation; identical local IDs in separate sessions/cases do not establish shared authority. Bare text cannot prove where a player learned an ID; all resolution uses the selected game.

## Independent fixture and acceptance evidence

The two-person harbor fixture is test-only and unrelated to Mara/Owen or Greyhaven. The keeper knows a visitor entered a store but initially lies that no visit occurred, mistakenly fears a broken seal and withholds the location of a duplicate ledger. The visitor independently supplies a visual or heard later-living account. Revision requires the ticket inspection, both initial accounts and either later-living account plus an explicit comparison. A separate witnessed-repair prerequisite permits a second reason-account revision. Ledger disclosure additionally needs its own inspection and the committed visit revision. Expected literals and missing-input expectations are specified independently in tests, not calculated from resolver output.

Tests cover both routes/every omitted prerequisite, source ownership, false authorized accounts versus known facts/belief, no automatic progression, wrong trigger/speaker/room/case, forged quotes, maximum irritation, retries/repeated transitions, staged invisibility, session isolation and shared local IDs. Multi-version tests retain historic claims while selecting the latest account. A bounded stress fixture forces actual 64-entry cache eviction and verifies receipts still unlock the intended revision. It remains local to its test and is not another playable case.

The four-adapter matrix (Responses structured/legacy and direct injected structured/legacy) rejects premature true secrets, obsolete initial testimony, other-speaker speech and invented facts. Deferred tests cover success/failure after each invalidation, explicit discard, projection failures/reentrancy, every session stale guard, provider timeout and ignored late completion. Real HTTP runs both routes using only existing public commands and checks unchanged envelope/state/result keys, private-field exclusion, extra-state rejection and private final incorrect outcomes. Production registry still publishes Ashcroft only.

## Verification results

| Check | Actual result |
| --- | --- |
| Complete Node suite | **501 passed**, zero failed/cancelled/skipped/todo: all497 reviewed tests plus4 final schema regressions (92 disclosure regressions beyond the409-test A baseline). [Output](node-suite.txt) |
| Chromium desktop/mobile | **46 passed**,23 per viewport; fresh complete browser suite on isolated API3101/IPv6 Vite,44.2 seconds. [Output](chromium.txt) |
| Standalone issue #3 | **81 passed**, original file/expectations unchanged. [Output](issue-3.txt) |
| Issue #3/public-view/demeanor group | **91 passed**:81 security,5 public-view,5 professor precedence cases. [Output](privacy-demeanor.txt) |
| Production build/import/artifact privacy | Passed;39 modules, JS259.81kB/79.87gzip, CSS26.23kB/6.35gzip; browser bundle unchanged, no source maps or server/policy markers. [Output](build.txt) |
| Ashcroft walkthrough/CLI smoke |11 public engine actions plus complete actual CLI journey; only Ashcroft in case list; no live model calls |
| Strict selected OpenSpec | `deterministic-disclosure` passes |
| Strict archived changes |5 passed,0 failed; no archive modified |
| Repository-wide strict |7 passed /9 inherited failures,16 items. [Exact report](openspec-all.json) |
| Planning consistency |633 assertions pass, including current milestone status and new roadmap links; narrative oracle semantic hash unchanged |
| Whitespace/scope | `git diff --check`, new-file whitespace and exact preservation checks pass; the155098-byte original pre-B log prefix plus the full pre-finalization log, and all10 generated historical evidence files are preserved. Protected source/narrative/canonical/archive paths have no diff. |

The nine inherited long-description failures remain unchanged: changes `add-investigation-http-api`, `add-playable-browser-interface`, `add-room-based-investigation`, `enforce-investigation-lifecycle`, `expose-safe-investigation-view`; specs `hybrid-dialogue-interface`, `npc-dialogue-naturalness`, `safe-npc-performance`, `stateful-npc-dialogue`. No unrelated specification is rewritten to hide them.

Two initial new test setups were corrected: a duplicate alias lacked the punctuation normalized by the old helper, and the cache stress case filled exactly64 keeper entries rather than exceeding the per-speaker bound. The alias matcher was made punctuation tolerant within v2; the stress test now admits65 distinct keeper entries and asserts actual eviction. Review also fixed malformed legacy array dispatch to return errors rather than throw, with a direct regression. No existing expected testimony, security test or precedence was weakened. The final Node count includes these tests; all failures were resolved. Saved outputs normalize trailing whitespace only. Browser/walkthrough-generated historical artifacts are backed up and restored byte-for-byte after verification.

## Final security review and deviation from the approved report

Finalization independently reviewed source and tests for shared authorization, committed prerequisites, speaker/case ownership, atomic projection/commit, bounded first receipts, stale account/cache behavior and v1 compatibility. No broader architecture change was needed. One schema defect was reproduced: the validator treated an explicitly present falsy `transition` on an informational rule as absent. Four independent expectations for null, false, zero and empty string failed against the reviewed code; [RED evidence](validation-red.txt) retains that run. The validator now checks property presence and requires the declared transition object to match the closed schema. Valid informational rules still omit this field; no new schema capability or gameplay behavior is introduced.

All four new cases pass in the fresh501-test suite, increasing the reviewed497 baseline by four without removing or weakening any test. Chromium46, issue#3 81 and combined privacy/demeanor91 remain unchanged. Source review confirms ordinary base/current-account speech is authorized by the validated catalog; first gated disclosure requires its explicit policy rule, and later revisits require committed receipt/current-version authority. Player text never writes receipts, model output never selects a target, and malformed requests cannot inject account state. Explicit provider failure/timeout can successfully commit an authorized fallback; discarded or stale candidates install none of their changes.

The PR targets `main`, which matches the branch's3727a9b parent after fetch. Unlike A's earlier PR, no additional planning checkpoint is pending in this branch: the diff contains B implementation, tests/specs/reports and only the related roadmap/checker status updates plus append-only log. B1-B4 are complete. Original Greyhaven narrative bodies/oracle and Ashcroft authored content, demeanor, evidence, ending logic, public interfaces, issue#3 expectations and unrelated archives remain unchanged. Final publication files also include `PR_DESCRIPTION.md` and `validation-red.txt`; all verification outputs were refreshed from actual reruns.

## Remaining risks and Milestone C integration

All B1-B4 behavioral acceptance criteria are implemented, tested and approved for finalization, with PR review/manual merge pending. Authoring remains trusted: exact membership cannot prove prose truth, fairness, relevance or semantic equivalence, and structural reachability cannot certify every hypothetical complex graph. No new human fairness/visual acceptance or live-provider performance claim. Only Ashcroft is publicly playable; B is exercised through injected private fixtures.

C must add owned facet/primary-target/account-version selection, useful unavailable-detail guidance and richer six-choice discoverability without bypassing the shared eligibility predicate or staged receipts. B preserves existing clarification and the six-choice cap; eligible policy actions precede ordinary choices and exact aliases remain available for overflow. B's two-character fixture fits this budget; the61-action stress test uses free text deliberately. No claim that arbitrary authoring fits six visible choices. C must not use recent-turn text as authoritative policy state or make old versions newly current.

No relationship scores, social simulation, NPC gossip, new emotional mechanics, Greyhaven narrative/preview, scoring, public state expansion or new verdict/ending behavior. B publication alone is approved; no C-F implementation, archive, merge or branch deletion. Next step: review the Milestone B PR and merge manually only when accepted.
