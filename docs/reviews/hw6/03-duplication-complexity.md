# Review 3: Duplication and unnecessary complexity

## Scope and method

Whole repository responsibility comparison: engine/CLI/API/browser, authored catalogs, validators/projections, unit/integration fixtures, scripts and evidence, package manifests, specifications and documentation. Compared near-duplicate operations by their trust level and contract, not merely matching text. Read both Playwright suites and the mock-client/unit tests to distinguish shared setup from independent expected values.

## Findings and disposition

- **Low, retained duplication:** performance context/style/hash construction appears in both `offerLegacyPerformances` (`src/authored-performances.js:28`) and `offerPerformances` (`src/authored-performances.js:73`). These are small stable constructions; the selection/pacing contracts differ. No present inconsistency or behavior bug was demonstrated, so extracting a new abstraction was not justified in this review.
- **Informational, intentional:** validation/projection repeats at `src/game.js:97`, `src/http-api.js:100`, `src/npc-performance.js:5` and `web/src/api/investigation-client.js:47`. These boundaries receive different trust levels. Sharing a server module with the browser risks importing private case/catalog dependencies; removing a validation layer weakens independent checks. Retained explicit allowlists.
- **Informational, intentional:** literal testimony fixtures duplicate runtime authored prose (`test/fixtures/reviewed-testimony.json`, `src/data/authored-deliveries.js`). Generating expectations from the catalog would remove the independent regression oracle. The case checksum and hardcoded emotional rules are likewise deliberately independent.
- **Informational, retained:** browser journeys repeat start/travel/navigation helpers (`web/e2e/game.spec.js:3`, `web/e2e/hybrid-dialogue.spec.js:2`); screenshots/walkthrough scripts overlap older UI milestones. The small helpers keep each suite readable and the walkthroughs preserve evidence provenance. No broad helper framework or screenshot deletion was justified.
- CLI and HTTP delegate dialogue/facts to the same engine rather than duplicating authorization. CLI example questions use the case's name while engine prompts use generic victim wording (`src/cli.js:4`, `src/dialogue-state.js:3`); consolidating their display strings provides little benefit and would couple prompts unnecessarily.

## Verification and test assessment

No actionable functional defect or worthwhile consolidation confirmed; documentation-only commit. Previously completed full Node baseline remains 228/228. Source tracing confirms commands converge on engine methods. Existing real HTTP/CLI integration tests check those paths together, while browser mock fixtures check parsing/reconciliation only. Test fixtures that derive public room identities from the case prove ordering/projection, not independent case correctness; the historical checksum supplies separate protection. Deferred dead-module reachability analysis belongs to review 5.
