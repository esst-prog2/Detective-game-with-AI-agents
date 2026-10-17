# Issue #3: dialogue knowledge authorization

Date: 2026-10-17. Baseline: `862f9d4` (PR #9 merge). Branch: `feature/issue-3-knowledge-leak-protection`. User approved publication on 2026-10-17 after review. Commit and branch push are authorized; merge, archival and issue closure remain unauthorized. Issue #3 stays open until merge and final checks.

## Threat model and invariant

The deterministic engine owns canonical case facts and authored testimony, including intentional lies. A player may ask unpredictable questions, assert secrets, impersonate another speaker or inject model instructions. A provider may return arbitrary text, refuse, throw an exception containing private text, replay an older valid answer, or return after the game changes. Provider output is untrusted even when its JSON schema is valid.

Every displayed model performance must exactly match a complete eligible narration/speech pair for the current suspect and conversation. Names, locations, times, evidence, relationships, hidden routes, admissions and contradictions cannot be added through model prose. Authorization is membership in engine-authored outputs, not a keyword blacklist or a semantic model judgment. Authoring remains trusted: exact membership cannot prove that an authored alternative is factually equivalent or appropriate.

## Reproduced before the fix

An actual offline fake Responses client fed the original `createOpenAIDialoguePhraser` into `createInvestigation().askSuspect('alice-mercer', 'Where were you?')` before editing production code. It returned:

```text
I own the murder weapon: I was at home in my room all evening.
```

The baseline engine returned that entire string as both `text` and `dialogue`, with `kind: answer`, `turnId: 1`, null narration and neutral demeanor. It was eligible for the normal history/cache installation. This is a reproducible unauthorized admission, not a live-model anecdote. Baseline adapter validation only required an unchanged approved suffix, a short alphabetic lead-in and exclusion of three immersion-breaking phrases. A factual lead-in satisfied those rules. Independently, the engine accepted any nonempty string from an injected phraser, bypassing even those weak adapter rules.

The newer structured performer did not reproduce this leak: both its Responses adapter and the engine validate the complete returned pair against the current offered pool. Prior tests already demonstrated this difference; their former test that accepted the legacy exploit now requires rejection. Original HW4/HW5 experiment artifacts, archived specs and independent A/B/C tests remain unchanged.

## Entire pipeline examined

| Stage / production files | Authority and privacy findings |
| --- | --- |
| `data/case.js`, `data/dialogue-catalog.js`, `data/authored-deliveries.js` | Private case records contain solution, private knowledge and lie metadata. The separately authored catalog maps one core per speaker/topic to reviewed complete utterances. Runtime schema validation checks references, sizes and structure; it does not semantically prove editorial correctness. Alice's existing motive/debt annotation inconsistency is preserved. |
| `question-classifier.js`, `dialogue-state.js` | Local classification and option resolution choose testimony. Named evidence requires inspection and speaker relevance; comparisons require both committed accounts. Raw player claims cannot create knowledge or unlock comparisons. Emotion is deterministic, clamped and cannot authorize a confession. Memory holds eight attributed turns per NPC, finite sets, saturated repeat counts and bounded caches. |
| `authored-performances.js` | Refined selection filters complete reviewed speeches by current topic/intent/demeanor and recent delivery history, then offers explicit optional-gesture pairs (at most four). Prefix-only catalog compatibility uses a separate offer construction with the same exact-pair validator. Mixing independently eligible fields is not allowed. Hash-based cache keys reflect the offered pool; hits are revalidated. |
| `npc-performance.js` | Requests contain only projected style, coarse demeanor, recognized intent and the current exact pairs. No raw questions/history, full profiles, canonical/private records, solution or lie annotations. Requests disable storage and configured SDK logging/retries. Schema, size, exact membership and completion/refusal checks reject provider inventions; timeout races abort work even if the provider ignores cancellation. |
| `dialogue-phraser.js` | Historically reachable through explicit injection and the opt-in experiment script, not normal CLI/API startup. Previously allowed free factual lead-ins. Now offers exact original text plus three reviewed compatibility prefixes; the existing pair validator authorizes the whole output. Request storage and configured SDK logging are disabled. |
| `game.js` | All text/choice entry points converge on staged preparation and commit. Now validates legacy output independently of its adapter and on cache reuse/final commit. Legacy style comes from bounded catalog vocabulary/rhythm rather than raw case personality. Failures use the original approved testimony with null narration. Structured failures retain the prepared authorized fallback, with original testimony still in the authored repertoire. |
| `cli.js`, `index.js`, `server.js` | Configured runtime uses the structured performer; missing credentials are offline. CLI prints only engine results. Server creates per-investigation engines with a shared stateless performer. Explicit injected legacy games now have the same authorization guarantee. |
| `http-api.js`, `investigation-sessions.js` | Exact command bodies, presence/choice checks, reservation/revision/game identity guards, bounded session/question capacity and explicit public projections. Questions use opaque staged candidates; stale/projected failures cannot install partial history/cache/emotion or advance revision. Errors are fixed messages; provider errors are not logged or reflected. |
| Browser `api/investigation-client.js`, state reducer/provider, `DialoguePanel.jsx`, `ConversationHistory.jsx` | Public allowlists, speaker/turn result consistency, generation/revision/room/ended guards and explicit reconciliation prevent obsolete replies entering notes. Model prose is never generated in the browser. React renders narration, speech and attributed player input as text. Browser transport trusts the local authoritative server; its projections are not a second semantic authorization engine. |
| `scripts/measure-real-model-phrasing.js`, privacy/security tests and build boundary | The opt-in server experiment deliberately records its approved requests and raw provider outputs under ignored results; those diagnostic artifacts are not player dialogue and may contain rejected provider inventions. Sanitized error records omit arbitrary provider messages. No experiment or paid call was run. Build checks exclude server imports/private markers/source maps. Existing HTTP error, public-view, session, browser race and catalog literal-fixture regressions remain active. |

## Applied safeguards and trade-off

The minimal fix reuses `validatePerformance`; it does not introduce another authorization validator. The legacy compatibility API still accepts approved content/personality and returns a string, but permitted deliveries are finite: original text, `quietly: `, `I hesitated: ` or `firmly: ` followed by exact testimony. `I hesitated` retains the professor's independent HW5 candidate C. Model creativity in this older path is intentionally reduced to selection. Modern authored whole-utterance alternatives, personality/emotion handling and the browser presentation are unchanged.

The engine independently checks even a directly injected fake/malicious phraser, validates cached strings and installs the exact allowed pair on the candidate for the existing final commit check. No provider text enters canonical state before validation. Travel, inspection, cancellation, ending and session supersession retain their existing staged commit guards.

## Adversarial regression matrix

New suite: `test/knowledge-leak-protection.test.js` (81 tests). Alice and Clara have different permitted alibis and private histories: Alice's library/debt-letter truth is excluded from her alibi, while Clara's library claim is approved testimony and her murder/route knowledge is excluded. Assertions use independent literal alibi/denial oracles and the existing frozen editorial fixture, not a validator-generated expected answer.

| Attack / required check | Alice | Clara | Production coverage |
| --- | --- | --- | --- |
| 1. New location: attic prefix | Rejected | Rejected | Responses legacy/structured adapters and direct injected adapters |
| 2. New time: midnight prefix | Rejected | Rejected | Same four paths |
| 3. Unauthorized Ben/cufflink sentence | Rejected | Rejected | Same four paths |
| 4. Murderer/hidden escape-route fact | Rejected | Rejected | Same four paths |
| 5. Denial changed to admission | Rejected | Rejected | Same four paths plus explicit motive-denial fallback checks |
| 6. Approved alibi plus secret-daughter sentence | Rejected | Rejected | Same four paths |
| 7. Other suspect's valid alibi | Rejected | Rejected | Same four paths |
| 8. Same suspect's valid motive in alibi context | Rejected | Rejected | Same four paths |
| 9. Current narration paired with different current speech | Rejected | Rejected | Actual refined catalog, multi-turn engine path; fixture asserts the invented pair is genuinely absent |
| 10. Delayed valid reply after leave-and-return | Discarded | Discarded | Legacy and structured engine paths, no memory/cache/emotion mutation |
| Legitimate exact outputs | Accepted | Accepted | Both Responses paths, original alibi and authored legacy prefix |
| Prompt privacy after injection/history/inspection | Passed | Passed | Both Responses paths, actual serialized requests, private canaries and literal permitted speeches |
| Actual HTTP to browser client | Safe fallback | Safe fallback | Both adapter types, real loopback server/session store and production browser client |
| Actual CLI rendering | Safe fallback | Safe fallback | Explicit legacy game with malicious injected phraser |

Existing tests additionally cover withheld qualifications, unauthorized narration/actions, prefix-only catalog pair mixing, stale emotions/delivery eligibility, all four state invalidations, provider failures/refusals/timeouts, session identity/reservation/revision/projection failure, independent sessions and browser late-response/ending protections. Those checks were run, not inferred from new unit validators.

## Three different kinds of evidence

1. **Never supplied to the model:** raw player questions or memory, case solution, murderer ID, private fact records, hidden debt-letter and murder routes, other speakers' private knowledge, lie metadata and API/session credentials. New request tests seed private canaries, poison raw personality and add hostile player memory. Requests are inspected after real engine projection; only approved current testimony and style are sent. A fact legitimately included in current testimony is permitted even if it also appears in a private case annotation (for example Clara's library claim). Alice's debt mention remains limited to her approved motive.
2. **Attempted but rejected:** fake providers invent locations/times, add names/evidence, disclose the murder route, confess, append a secret sentence or replay a different speaker/context. These outputs are deliberately supplied by the test provider even though absent from its request. The engine installs only fallback; tests inspect result, cache and bounded received history. This tests output authorization independently of prompt privacy.
3. **Authorized and accepted:** exact first alibis and authored compatibility prefixes are accepted and attributed to their speaker. Existing varied-speech tests continue to require full testimony equivalence and current context eligibility. Authorized testimony remains an account, not verified truth.

## Verification

| Check | Actual result |
| --- | --- |
| Complete `npm.cmd test` | 311 passed, zero failed/cancelled/skipped; 230 previous tests plus 81 new regressions |
| New matrix and historical compatibility | New matrix passed; unchanged independent HW5 A/B/C and immersion regressions passed; the old exploit-acceptance test now requires rejection |
| Chromium desktop/mobile | 34/34 passed (17 per viewport), existing isolated API 3002 / IPv6 Vite configuration |
| Production `npm.cmd run build:web` | Passed; 39 modules, JS 258.28 kB / 79.43 gzip and CSS 26.21 kB / 6.34 gzip; artifact privacy and no-source-map checks passed |
| Privacy/security | Actual request projections, private canaries, literal eligible speech checks, engine result/cache/history assertions, HTTP errors, public views and browser module/runtime checks passed |
| Strict OpenSpec | All 12 current items and four pre-existing archived changes passed; only informational long-requirement notices |
| Whitespace/preservation | `git diff --check` passed after removing an extra EOF blank line; original case/authored content, frozen fixtures, historical HW4/HW5 evidence and archived files unchanged |

The sandbox initially blocked Node subprocess startup (`spawn EPERM`); the authorized rerun passed. Two initial new mixing fixtures did not create a real incompatible pair because repeated-topic filtering exhausted alternate speeches. Their setup was corrected to use a topic/follow-up sequence, retaining the assertion that a genuine forbidden mix must exist; both then passed. No production-path assertion was removed. No live API key or API credit was used. Browser private-file 403 probes are expected passing privacy checks. The unchanged graphical suite exercises offline production behavior; malicious-provider transport coverage is in the new real HTTP/browser-client integration tests, not a claim of new malicious-provider Chromium scenarios.

## Remaining limitations

- Finite exact selection protects the output boundary; it is not a mathematical proof of arbitrary natural-language safety or editorial equivalence. Incorrect trusted authoring can still authorize bad testimony. Existing literal editorial fixtures make changes reviewable, not semantically infallible.
- Unpredictable questions can be unsupported or classified into an imperfect topic; the engine can still only deliver that topic's authorized testimony. Player-authored secret claims appear as attributed player input in received history and are never promoted to NPC facts or model context.
- The standalone adapter APIs accept trusted caller-supplied approved content/style. They cannot authorize an arbitrary caller's case data. Production callers project those inputs; public HTTP cannot inject them. Trusted internal `data`, `findSuspect` and diagnostics APIs remain server-only conventions.
- The historical adapter still relies on the client's abort support for timely timeout settlement; it has no modern performer's independent timeout race. A deliberately nonsettling injected adapter can delay its pending request, but cannot publish after invalidation. Normal configured CLI/API uses the bounded modern performer.
- The optional experiment can retain raw model inventions as local diagnostic evidence; it must not be mistaken for accepted testimony or shipped as browser data. Historical captures describe the old validator and were not regenerated.
- No live-provider behavior, independent human semantic review or new manual live-demo certification is claimed. Alice's debt annotation inconsistency is deliberately unresolved. Issue #3 remains open pending review.
