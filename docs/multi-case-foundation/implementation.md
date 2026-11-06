# Milestone A: multi-case foundation

Date: 2026-11-06. Implementation branch: `feature/multi-case-foundation`, based on authorized planning checkpoint `0b36bf1`. That checkpoint contains only the existing 33-file approved planning package and 36 appended log lines. After implementation review, the user authorized final verification, commit, push and PR creation for Milestone A only. Merge, branch deletion, archival and Milestone B remain unauthorized. The unrelated demeanor worktree stays untouched.

## Architecture and package contract

`src/cases/registry.js` is an explicit private allowlist, not a file loader. Its production instance registers only the thin Ashcroft adapter. Every definition is validated, cloned and deeply frozen; authoring changes cannot alter running or subsequent games. Each factory call uses the existing engine to create fresh mutable dialogue/memory/cache/emotion/evidence/location/lifecycle state. No engine, dialogue or accusation algorithm changes.

A full package contains `id`, `version`, `mode: full`, `publicMetadata: {id,title,mode}`, existing-shaped `data`, `catalog`, `solution: {murdererId}` and optional private `privateCanon`. Data retains characters, rooms, placements, evidence, dossiers, authored responses and private facts. The duplicated legacy `data.murdererId` must agree with `solution`; it is retained to avoid rewriting Ashcroft. Initial state is its validated `initialLocationId` and the engine's fresh empty dialogue state. Arbitrary mutable state seeds are not accepted.

Validation rejects unsupported package fields/modes/catalog schemas, non-plain or executable/cyclic data, sparse arrays, duplicate identities/entities, missing public fields/topics/profiles, foreign placements/dossier edges/evidence gates/options/comparison references, and missing/conflicting/nonlocal solutions. It composes existing spatial, catalog and authored-performance validators without weakening them. All full-case characters must have profiles and all six subjects. The legacy three-person/two-to-three-room `validateCase()` remains unchanged for its original contract; registered full cases use spatial and complete-character/catalog validation without that original case-size restriction.

Public metadata permits exactly three fields. The manifest projects those fields again and returns detached objects. Existing game projections expose only public dossiers, room/clue identities and authorized inspection/testimony. The registry is never imported into the browser. Validation checks structure/references, not the semantics or fairness of authored prose; reviewed data remains trusted.

## Exact public contract

| Operation | Behavior |
| --- | --- |
| `GET /api/cases` | 200 `{ok:true,data:{cases:[{id:"ashcroft",title:"The Ashcroft Manor Murder",mode:"full"}]},error:null}`; no bearer, session/factory allocation or provider call |
| `POST /api/investigations {}` | Existing default Ashcroft, 201 |
| Same with `{caseId:"ashcroft"}` | Explicit same case, 201 |
| Same with another published ID | Selected local package; currently available only through injected test registries |
| Unknown/unpublished, empty/path/overlong/null/numeric ID, extra key | 400 `invalid_request`, fixed message, no allocation |
| Session GET or successful command | Existing fields plus outer `data.case:{id,mode}`; no case version or nested-state/result changes |
| `caseId` on any session command | 400 `invalid_request`; no case switching |
| Foreign suspect/evidence/room absent locally | Existing 404 `suspect_not_found`, `evidence_not_found`, `location_not_found`, no revision advance |
| Ended, stale, busy, expired or remote command | Existing errors/transaction/lifecycle rules unchanged |

The manifest uses existing Host/Origin/method/body/route restrictions and no-store headers. Error envelopes never include private exception details or bearer IDs. No dynamic imports, path resolution, extra model parameters or new CORS origins are introduced.

The session resolves a published package **before** bearer/factory allocation. `caseId`, `caseVersion` and the frozen `{id,mode}` descriptor are non-writable/non-configurable entry properties. Commands use only the entry's game. Existing revision, reservation, game/session identity, room epoch, projection-before-commit and lifecycle protections stay intact. Trusted zero-argument factory injections remain compatible with old tests; production factories consume the resolved definition. In-process test hooks remain trusted APIs, not security barriers against hostile server code.

Case-local IDs need not be globally unique. An ID absent from the current game is rejected; an ID reused in two packages resolves to each game's own record. A bare string cannot prove which case a player learned it from. Clients cannot submit foreign evidence records, knowledge state or dialogue cores.

## Interfaces and backward compatibility

CLI no-argument behavior, six numbered actions, `/choices`, exported Victor examples and default wording remain intact. Optional `--list-cases` allocates no game/provider; `--case <published-id>` selects explicitly, with fixed unavailable/usage guidance. New test cases use generic topic examples. The original Ashcroft data, catalog, deliveries, engine, demeanor, provider adapters and ending resolver remain unchanged.

Browser loads and validates the safe manifest with a small labeled selector, defaulting to Ashcroft. It shows retry guidance if unavailable and does not advertise Greyhaven. Every new client session envelope must match requested/current case identity before state or results are accepted. Successful creation resets history, clues, drafts and selected suspect; failed creation retains former identity and notes. Existing generation/bearer/revision/room/ended guards reject old responses. Case metadata is outside nested public state.

The frozen `test-support/legacy-investigation-client.js` is the byte-for-byte browser client from checkpoint `0b36bf1`. A real HTTP regression exercises its `{}` creation, questioning, accusation and refresh against additive envelopes. Existing test edits are limited to two expected envelope fixtures; no testimony expectations were rewritten. The updated browser requires the updated API; restart existing API processes before playing. No persistence or migration is added.

## Isolation fixtures and security

`test-support/second-case.js` is a tiny independent harbor fixture, unrelated to Greyhaven: two characters, one room, one clue, different exact testimony and a different private solution. It supplies all six existing topics solely to exercise the full contract, not a new playable narrative. An alternate instantiation deliberately reuses Ashcroft local IDs with different records/culprit. Neither fixture is production-registered, bundled or offered publicly.

Tests interleave HTTP sessions, reject foreign actions/switching, preserve revisions, isolate inspections/memories/emotions/caches, distinguish same-ID records and solutions, retain wrong-verdict privacy/finality, and discard staged replies after game replacement. Both structured and legacy injected providers returning another case's authorized speech are rejected to the selected case's fallback; private canaries stay out of provider context, manifests and public views. Client tests cover metadata filtering/mismatch, failed creation, successful reset and late prior-case reads/questions. The unchanged issue #3 suite covers the full adversarial adapter/cache/commit matrix.

Build module boundaries already reject imports outside `web/`, including the new private directory. The artifact scanner additionally rejects new case/private markers and retains all prior checks and source-map exclusion. These scans complement projections and tests; they are not a semantic proof of spoiler-free writing.

## Verification

| Check | Actual final result |
| --- | --- |
| Complete `npm.cmd test` | **409 passed**, 0 failed/cancelled/skipped/todo: all 361 baseline tests plus 48 new cases. [Full output](node-suite.txt) |
| Complete Chromium suite | **46 passed**, 23 desktop and 23 mobile, retaining all 40 existing checks plus six new executions. Finalization rerun: isolated API 3101 / IPv6 Vite, 44.4 seconds. [Full output](chromium.txt) |
| Standalone issue #3 suite | **81 passed**, unchanged attack suite. [Full output](issue-3.txt) |
| Explicit privacy rerun | **86 passed**: all 81 issue #3 tests plus five public-view checks. Mystery/demeanor suites also pass in the fresh complete Node run; the earlier combined group passed136. |
| Final production build | Passed, 39 modules; JS 259.81 kB / 79.87 gzip, CSS 26.23 kB / 6.35 gzip; import boundary, artifact scan and source-map exclusion passed. [Output](build.txt) |
| Existing public walkthrough | Passed: 11 engine actions plus complete actual CLI journey, no provider calls |
| CLI `npm.cmd start -- --list-cases` | Passed; only `ashcroft: The Ashcroft Manor Murder` |
| Strict `multi-case-foundation` and planning change validation | Both pass |
| Strict archived-change validation | **5 passed**, zero failed; no archive created or modified |
| Repository-wide strict validation | **6 passed / 9 inherited failures**, 15 items. [Exact report](openspec-all.json) |
| Preserved planning checker | **629 documentation assertions passed**, unchanged 33-file planning package and approved narrative semantic hash |
| Whitespace/scope review | `git diff --check` and all 20 new-file whitespace checks passed; 295 protected files and the 146357-byte pre-technical log prefix remain exact, including historical evidence and protected source/canon |

The nine inherited failures remain: changes `add-investigation-http-api`, `add-playable-browser-interface`, `add-room-based-investigation`, `enforce-investigation-lifecycle`, `expose-safe-investigation-view`; canonical specs `hybrid-dialogue-interface`, `npc-dialogue-naturalness`, `safe-npc-performance`, `stateful-npc-dialogue`. All concern pre-existing requirement descriptions over 500 characters under strict validation. No unrelated spec was edited to hide them. The new selected change contributes one additional passing item relative to the 5/9 baseline.

Initial Node/Vite attempts hit sandbox `spawn EPERM` and were rerun with approved subprocess permissions. The first focused run passed97/99: a new test incorrectly capitalized the existing clue name, and Node fetch did not transmit a forged Host header; correcting the literal and using raw HTTP made both checks effective. Initial isolated Chromium passed44/46 because the mock failed only the first of React Strict Mode's two initial manifest requests. It now remains unavailable until explicit retry. No production assertion was removed or weakened. The default browser launch first found manual-play ports occupied; tests used existing isolation settings instead of stopping those processes.

The final browser suite regenerated historical mystery evidence. Its fresh output was retained under the local temporary `milestone-a-generated-evidence` directory; original tracked screenshots/transcripts were then restored from the checkpoint and verified against the pre-implementation protected hashes. No human playtest or manual visual acceptance is claimed. Manually running IPv4 3001/5173 servers were preserved throughout.

Saved text outputs remove trailing whitespace only; original raw captures remain in the local temporary `milestone-a-*.log` files. Chromium's expected denied-file probes and color-environment warnings are retained. Neither is a failed test.

## Final publication review

The finalization reran every required check; Node409/Chromium46/issue#3 81 match the review baseline with zero new failures. The source review found no material defect requiring a production fix. It verified the browser's explicit selection and no-argument new-investigation paths: omitted selection constructs `{}` and expects Ashcroft, rather than reusing the prior case ID; failed selection retains the former accepted identity. Existing staged-candidate and generation guards remain intact. Registry/session/API/client trust boundaries, duplicate local IDs, fixed errors and exact dialogue authorization were inspected in actual code and exercised by the rerun.

The PR targets `main` without changing its base to hide ancestry. `origin/main` is an ancestor of planning checkpoint `0b36bf1`, which is not yet on main. Consequently the PR intentionally includes that approved 33-file overarching planning package, its historical append-only log, and the Milestone A implementation/publication documentation. The planning documents describe later stages but implement none of them; no unrelated planning branch, story revision, archived milestone or demeanor worktree is included. The checkpoint is preserved as its own commit. No history rewrite is needed.

## Exact changed-file inventory

- Private registry: `src/cases/ashcroft.js`, `registry.js`, `validate-package.js` (three new files).
- Server/CLI integration: `src/investigation-sessions.js`, `http-api.js`, `server.js`, `cli.js`, `index.js`.
- Browser: `web/src/api/investigation-client.js`, `state/investigation-state.js`, `screens/MainMenu.jsx`; `web/scripts/check-boundary.mjs`.
- Tests: new `test/case-registry.test.js`, `multi-case.test.js`, `multi-case-browser.test.js`, `web/e2e/case-selection.spec.js`; new `test-support/second-case.js` and frozen `legacy-investigation-client.js`.
- Existing fixture migration: one additive envelope line each in `test/browser-state.test.js` and `test/http-api.test.js`.
- Traceability: `README.md`, append-only `PLANNING_LOG.md`; the five-file `openspec/changes/multi-case-foundation/` package; this report plus `PR_DESCRIPTION.md`, `node-suite.txt`, `chromium.txt`, `issue-3.txt`, `build.txt`, `openspec-all.json` in `docs/multi-case-foundation/`.

## Scope decisions and remaining milestones

A1 registry/validator/adapter, A2 session/API, A3 CLI/browser and A4 regression/privacy proof are tracked in the separate `multi-case-foundation` OpenSpec change. The overarching completed planning checklist remains historical; its 21 future-package descriptions are not rewritten as runtime claims. No narrative body, oracle payload, original authored data, canonical specification or archive is edited.

Two roadmap A details are deliberately deferred to respect this authorization's explicit exclusion of new accusation logic/endings: preview/sparse-topic capabilities (D), and trusted ending-resolver extraction (when needed for D/F). A rejects preview definitions rather than guessing verdict behavior. Non-Ashcroft packages cannot use the reserved Ashcroft catalog identity to acquire the historical explanation guard. Existing ending logic is untouched; synthetic full cases use the existing correct/incorrect behavior.

B finite relationship disclosure, C statement clarification, D Greyhaven preview, E complete content and F case-specific endings remain planning-only and unstarted. No new scoring, simulation, emotional mechanics, story or artwork. Only Ashcroft is publicly playable; genuine multi-case selection is exercised through injected fixtures. Session storage and notes remain ephemeral. No live model call, new dependency or human fairness claim.

Next: review the Milestone A PR before merging. Milestone B needs separate authorization. Existing manually running servers need an ordinary restart to load the new API; they were not stopped during verification.
