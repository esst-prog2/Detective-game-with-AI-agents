# Review 1: Specification alignment

## Scope and method

Whole tracked repository, not the previous feature diff: canonical `openspec/specs/*/spec.md`, active and archived changes, README, planning history, source, browser components/state/client, tests, scripts, historical spike output and dialogue/playtest evidence. Traced requirements through engine -> CLI/HTTP -> browser and compared tests with stated acceptance criteria. Binary artwork/screenshots are presentation evidence, not executable requirements. Read the scanned Session 6 homework slide visually.

The four canonical specs cover stateful dialogue, performance, naturalness and hybrid UI. Older case, lifecycle, public projection, room and HTTP contracts remain in their corresponding active change specs; those were also consulted rather than interpreting their absence from `openspec/specs` as removal of the behavior.

## Findings and disposition

- **Medium, known/unresolved: Alice's debt disclosure annotation contradicts retained testimony.** `src/data/case.js` (Alice motive response), `README.md:135`, `openspec/specs/stateful-npc-dialogue/spec.md:15` and `test/stateful-dialogue.test.js:251`. The response mentions debt while its concealment annotation says otherwise. Changing either record is an editorial decision affecting historical evidence. Preserved exactly as explicitly requested; not a newly discovered runtime regression. Debt remains attributed testimony, never shared verified knowledge. Issue #3's legacy factual lead-in limitation also remains open (`src/dialogue-phraser.js:22`, `test/npc-performance.test.js:269`).
- **Low, retained: specification organization is incomplete.** Earlier implemented contracts live under `openspec/changes/{build-mvp-detective-game,expose-safe-investigation-view,enforce-investigation-lifecycle,add-investigation-http-api,add-room-based-investigation,add-playable-browser-interface}/specs/`, while only the newer four capabilities are canonical. A canonical-only audit would miss important requirements. Consulted both sets; no bulk archival/sync was done during a code review because reconciling older deltas requires a separate deliberate specification pass.
- No additional confirmed implementation violation: text/choice authority, inspected-clue prerequisites, bounded/isolated memory, staged commit guards, offline play, safe projections, fixed testimony, browser history reconciliation and end-state rules align with the combined contracts. Engine generations, finite pair hashes and separate browser received-note storage are justified implementation details. Historical reports describe their milestone's behavior and are not current runtime claims.

## Testing quality and verification

`npm.cmd test`: **228 passed, 0 failed/skipped**. Initial sandbox run could not spawn Node test workers (EPERM); rerun with subprocess permissions passed. This was an environment restriction, not a code failure.

Independent unit evidence includes fixed emotion expectations (`test/stateful-dialogue.test.js:15`), pre-room case checksum (`test/room-investigation.test.js:9`), adversarial invalid pairs and fixed historical A/B/C validator expectations. The frozen testimony fixture (`test/fixtures/reviewed-testimony.json`) establishes exact accepted text independently of runtime lookup but is still assistant-authored editorial evidence, not independent human proof of semantic equivalence. Tests comparing catalog-derived values to engine output establish wiring/selection, not factual correctness. HTTP tests use real loopback server/session/engine components; pure client tests use mocked transport and are not browser integration tests. Playwright provides the separate browser integration layer. Naturalness metrics establish finite mechanical gates, not unrestricted conversational quality.

No runtime change or new test was justified for this category. This report and the overall index are the review's documentation-only change. Known limitations remain visible rather than being claimed resolved.
