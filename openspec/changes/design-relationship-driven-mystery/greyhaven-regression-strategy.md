# Greyhaven staged regression and acceptance strategy

**Approved narrative baseline; proposed tests and execution gates. None of these production suites is run by this planning task.** Retain the existing Node/Chromium frameworks. The 34 narrative scenarios in [review-and-acceptance](greyhaven-review-and-acceptance.md),20 clarification rows, exact A/B/wrong journeys and immutable narrative fixture are the independent design source—not future implementation output.

## Oracles before implementation

E1 produces a reviewed test fixture containing literal anchors, forbidden implications, event/source ownership, gate branches and route minima. Author it from approved documents before runtime catalog generation. Tests must not import the catalog to compute their expected permissions or copy a passing output into expected text. Preserve `test/fixtures/reviewed-testimony.json`, test-support/reviewed-testimony.js and all professor/issue#3 expected examples for Ashcroft. A deliberately false but authorized account is expected; a model's factually true unapproved confession is rejected.

Keep synthetic A/B/C fixtures unrelated to the murder and inject them only in tests. Include colliding local IDs to prove namespaces, and distinct canaries in each case/speaker/account/private annotation. Full Greyhaven route fixtures use reviewed aliases mapped to wire slugs; no raw source access, state injection or test-only unlock is allowed in player-action walkthroughs.

## Regression matrix and ownership

| Area | Existing anchors / future addition | Independent expected result | First gate |
| --- | --- | --- | --- |
| Original case | game/room/public-view/mystery-deduction tests; reviewed testimony fixture; web/e2e/mystery-deduction.spec.js | Same identities,18 original answers, Alice's uncertain recognition/debt annotation, circumstantial supported/incomplete endings and private incorrect outcomes | A and every later stage |
| Selection/isolation | investigation-sessions/http-api/browser-state tests; new case-registry and selection fixtures |{} defaults Ashcroft; explicit allowed identity installed once; invalid/unpublished selection no allocation; interleaved games never share evidence, account stages, memory, emotion/cache or outcomes | A |
| Public protocol | public-view/http-api/client tests, frozen old-client parsing | Nested state/result shape retained; only approved data.case/manifest metadata added. Unknown keys rejected; forged caseId on command cannot switch session | A |
| Privacy | public-view canaries, web/vite.config.js import boundary, web/scripts/check-boundary.mjs artifact scan | No solution, canon/source/policy annotations or provider secrets in manifest, responses, browser imports/maps/artifacts/errors. New private paths/markers explicitly checked | A onward |
| Knowledge/belief/lie | knowledge-leak-protection/npc-performance/stateful suites; new owned-source fixtures | Direct observation/report/inference distinct; mother fear not witnessed guilt; false alibi stays permissible but no extra secret/version | B |
| Conditional disclosure | new policy unit tests and bounded state enumeration | Every missing input/request blocks; both M1/O1 branches work; no numeric mood gate or irreversible hostile dead end; J-C directly available | B then E |
| Atomicity/lifecycle | investigation-lifecycle/sessions tests, deferred performer/projector | No partial account/emotion/receipt/cache/target commit after stale room/session/revision, cancellation, failed projection, discard or end; no automatic replay on uncertain receipt | B onward |
| Performances/fallback | npc-performance, phrasing-spike, knowledge-leak-protection; both legacy and structured injected paths | Whole current pair only; missing uncertainty, altered source, mixed fields, confession and cross-account cache output rejected; useful exact offline fallback | B/C onward |
| Emotions/demeanor | stateful-dialogue and test/demeanor.test.js unchanged | Clamp/deltas unchanged; professor's five explicit cases retain irritation > tension > cooperation > neutral precedence; mood never authorizes a secret | B onward |
| Clarification | new primary-target/facet fixtures plus original clarification assertions | Correct source/time/identity or honest limitation; no prior target/speaker switch/old version/history eviction cannot invent knowledge; facet does not recursively steal its primary context | C |
| Question overflow/free text | mystery-deduction overflow precedent plus new 8+ states | At most 6 choices, each first-time essential prompt reached before unrelated exhaustion; hidden labels absent; optional text/revisit remains available | C/E |
| Browser excerpt | new web/e2e/greyhaven-preview.spec.js; D1-D10 in slice document | Actual offline browser demonstrates O1 branch, useful facet and M0 conflict; neither full-case solution nor verdict available, server guard not UI alone | D |
| Essential evidence/reachability | case-definition validation plus full discovery journeys | Valid placements, no unreachable/gated-away mandatory record, acyclic reachable account graph; A skips mother; B skips key visual sources. All rooms remain accessible as current engine allows | E |
| Timeline/source consistency | independent event/observation fixture and docs checksum | Recorded 30/42 distinction, living-before-killing, correct spatial view/phone conditions, no medical 38 oracle or caller report promoted to sight | E |
| Full accusations/endings | new Greyhaven conclusion tests, existing lifecycle tests | Selected case's murderer only; A OR B substantial support; subsets qualified; no all-clue rule; paragraph prerequisites prevent undiscovered facts; incorrect/private/final | F |
| Adapter parity | public engine/CLI, revisioned HTTP and browser offline journeys | Same semantic discoveries/gates and correct sources with menu/text; recorded server action versus received client text remain honestly distinguished | D/F |
| Human acceptance | first-time-player record, AC-HIDE/AC-BELL | Player explains custody possibilities and held signal versus departure; actual reasoning/confusion/alternatives recorded, not a pass from guessing right | D usability, E/F full fairness |

The five professor examples stay explicit: `[2,3,0] -> irritated`, `[4,3,3] -> irritated`, `[3,0,2] -> uneasy`, `[3,2,1] -> receptive`, `[2,2,1] -> neutral`. Preserve the issue#3 suite's existing independently specified attacks and all four adapter modes; add new-case/gated/facet attacks beside them rather than replacing or weakening them.

## Unexpected text and boundary attacks

Test invented facts, other-case clues, private canon quotations, made-up confessions, role/prompt instructions, guessed locked option IDs, wrong-speaker references, compound ambiguous questions, direct old-account requests, source/identity swaps and long/unicode input. The expected result is a currently authorized body or bounded guidance, with no additional receipt/inspection/stage. Test raw exact secret text before and after a gate so the engine, not a lexical coincidence, owns eligibility. Validate both parser preparation and final commitment; a provider that returns approved text for the wrong current context must still fail.

Do not demand unrestricted natural-language understanding. Freeze the supported aliases, show useful available choices, and record honest unsupported cases. Prompt injection is tested as untrusted input, not solved by adding more instructions to the model. Provider requests must exclude raw question/history/whole case/private policy; exact-pool output is independently checked.

## Endings and receipt matrices

Execute fresh A and B separately with provider disabled, optional history/G7/G8 omitted, alternate questioning order and visible-turn eviction. For B assert I-S/I-F/G5 were never obtained and no visual paragraph appears. For A assert J-C/M-S were never obtained and no heard-voice/placement paragraph appears. Test immediate correct guess, every reviewed required source removed in turn, optional clues added, wrong each suspect, canceled confirmation and attempted post-end mutation. A historical superseded lie is a received claim, not corroboration of current truth.

The server uses committed semantic receipts, while the browser may have lost an HTTP reply. Preserve current refresh/reconciliation semantics and explicitly distinguish server-recorded support from text actually displayed; do not claim a user read every committed statement. A new journal must not silently reconstruct unseen secret content from case files.

## Practical command and evidence gates after authorization

Use `npm.cmd test` for the complete Node suite; `node --test test/knowledge-leak-protection.test.js test/demeanor.test.js` for explicit safety/oracle evidence; `npm.cmd run test:web` for Chromium; and `npm.cmd run build:web` for the Vite build/artifact boundary. Review and extend source import protection in web/vite.config.js and private markers in web/scripts/check-boundary.mjs for new src/cases/policy fields. Do not assume a marker scan proves absence of all sensitive prose. Scope-specific OpenSpec strict validation and `git diff --check` accompany each implementation increment; the nine existing repository-wide failures remain separately reported until independently fixed.

A: full Node and targeted browser selection/default tests plus build/privacy. B: full Node, explicit security/demeanor and boundary checks. C: full Node plus browser mixed-context/overflow. D: full Node/preview Chromium/build/privacy and visual usability. E: full Node/security/discovery Chromium/build/privacy plus content/source review. F: complete Node/Chromium/build/privacy/explicit issue#3/scoped strict and actual public transcripts, screenshots and first-time-player evidence. If counts change, account for added tests instead of treating historical 361/40/81 as a required new result. No paid/live model call is necessary for solvability or a release gate.

Automated checks can reject missing IDs, cross-case references, impossible declared coordinates, unreachable finite gates and forbidden output. They cannot prove a motive convincing, a witness honest, a diagram legible, the puzzle difficult or an accusation satisfying. Record contrary human findings and adjust only through approved narrative changes.
