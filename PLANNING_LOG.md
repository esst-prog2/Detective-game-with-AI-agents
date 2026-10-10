## PLANNING LOG

2026-09-22 — AGENTS.md was created as the project planning log; you decided.
2026-09-22 — OpenSpec was selected for the project; you decided.
2026-09-22 - Node.js LTS and OpenSpec were installed, and OpenSpec was initialized for Codex in this repository; you decided.
2026-09-22 - Suspects will use controlled lying: whether they tell the truth or deliberately lie depends on their motive and personality; you decided.
2026-09-22 - The MVP will keep each suspect's knowledge fixed during an investigation; NPC-to-NPC information sharing is deferred to a later version; you decided.
2026-09-22 - NPC dialogue will use engine-approved facts and allowed lies, with an LLM producing only the natural-language phrasing; you decided.
2026-09-22 - For the MVP, the game engine will select the exact approved response content and the LLM will only phrase it naturally; you decided.
2026-09-22 - The MVP will classify free-text questions into a small fixed set of broad investigation topics; each suspect has one engine-approved response per topic and unsupported questions use a safe fallback; you decided.
2026-09-22 - The MVP will use exactly six investigation categories: alibi, relationship with victim, motive, sighting, evidence, and crime details; you decided.
2026-09-22 - Future project decisions will prioritize the smallest playable MVP scope; you decided.
2026-09-22 - The MVP will classify player questions with simple rules and keywords, and will show example questions to guide players toward supported phrasing; you decided.
2026-09-22 - The MVP will contain one hand-authored, fully solvable murder case with three suspects, one victim, 2-3 locations, and a small set of evidence; you decided.
2026-09-22 - Each MVP suspect will have a name, short personality description, relationship to the victim, motive or lack of motive, private facts, one permitted lie or concealment with a reason, and one approved response for each of the six investigation categories; you decided.
2026-09-22 - MVP evidence will be presented as inspectable descriptions; NPCs will not answer questions about individual named clues; you decided.
2026-09-22 - When a player question cannot be classified into a supported category, the MVP will show a deterministic fallback that suggests the six supported investigation topics; you decided.
2026-09-22 - In the MVP, repeating a question to the same suspect about the same category will return exactly the same response text; you decided.
2026-09-24 - Every approved MVP response will have a prewritten plain-text fallback, used if LLM generation is unavailable, times out, or returns invalid output; you decided.
2026-09-24 - The MVP accusation interface will present the three suspects in a numbered menu; you decided.
2026-09-24 - The MVP will require confirmation before a final accusation; a confirmed accusation ends the investigation; you decided.
2026-09-24 - The OpenSpec change for the initial playable version will be named build-mvp-detective-game; I decided.
2026-09-24 - The MVP proposal will introduce the game-case-content, npc-interrogation, evidence-inspection, and accusation-resolution capabilities; I decided.
2026-09-24 - The MVP will be a Node.js LTS command-line application written in plain JavaScript; you decided.
2026-09-24 - The MVP's optional NPC dialogue phrasing will use the OpenAI API, while retaining prewritten local fallbacks; you decided.
2026-09-24 - The MVP case will be The Ashcroft Manor Murder: Clara Voss killed Victor Hale, with Alice Mercer and Ben Carter as the other suspects; I decided.
2026-10-02 - HW4 spike question: with a real model, what fraction of phrasing calls survive the existing validator, and how slow are they? Run approximately 30 real phrasing calls covering all three suspects and all six existing topics, record each validation outcome and end-to-end latency, preserve raw model text for every validation failure, and report validator pass rate (%), p50 latency, and p95 latency in the planning log and final answer; below roughly 70% means the phrasing path is not reliable enough and the design decision must change. Inspect the SDK signal placement, follow OpenSpec, and propose the smallest spike before implementation; no new game features. Source: GitHub issue #4; you decided.
2026-10-02 - Proceed with measure-real-model-phrasing: exactly 30 sequential real-model attempts covering all 18 pairs plus 12 predetermined repeats; call the existing phraser with unchanged production prompt/validator before fallback, count all attempts in the main pass rate, distinguish validation failures from API errors/timeouts, preserve untrimmed failure text, and correct only signal placement while preserving timeout/API defaults. Keep real calls out of automated tests and do not run or record results without API key/model configuration; you decided.
2026-10-02 - For the spike tooling, use OpenSpec skip_specs because game requirements are unchanged; add scripts/measure-real-model-phrasing.js, repeat topic indices [0,1,2,3] for Alice, [2,3,4,5] for Ben, and [4,5,0,1] for Clara, retain all raw outputs in per-run JSONL under spikes/results/ for simplicity, and calculate nearest-rank p50/p95 over all attempt latencies including SDK retries and validation but excluding evidence writes; I decided.
2026-10-02 - HW4 spike answer to "With a real model, what fraction of phrasing calls survive the existing validator, and how slow are they?": the completed gpt-6-luna run with openai SDK 7.23.0 made 30 sequential attempts covering all 18 suspect/topic pairs plus 12 predetermined repeats, using the unchanged production prompt and validator before game fallback; full phrase() latency includes SDK retries and validation but excludes evidence writes. Independently recomputed from spikes/results/phrasing-2026-10-02T13-49-19-290Z-17052.jsonl: passed/total 30/30, pass rate 100.00%, nearest-rank p50 2249.9 ms and p95 4300.6 ms over all 30 attempts; zero validation failures, API errors, or timeouts. All 30 saved raw outputs also passed an offline replay through the existing validator. Retain the current real-model phrasing path in the design because the measured 100.00% pass rate exceeds issue #4's approximately 70% viability threshold; this decision applies to the measured sample, not a guarantee for future calls. You decided to retain the path; I independently verified the evidence without rerunning the API experiment.
2026-10-10 - HW5 independent test promise: "A test would go red if an NPC's generated response exposes internal prompt language, such as 'Approved statement', instead of speaking naturally within the game." Source: the user's independently chosen, human-defined detective-game immersion criterion, not the current implementation or model output; you decided.
2026-10-10 - HW5 independent expected result with approved content "I was in the kitchen.": candidate "Approved statement: I was in the kitchen." must be REJECTED. Source: the user's manual judgment of appropriate detective-game dialogue, independent of the current implementation; you decided.
2026-10-10 - HW5 independent expected result with approved content "I was in the kitchen.": candidate "Here is the approved text: I was in the kitchen." must be REJECTED. Source: the user's manual judgment of appropriate detective-game dialogue, independent of the current implementation; you decided.
2026-10-10 - HW5 independent expected result with approved content "I was in the kitchen.": candidate "I hesitated: I was in the kitchen." must be ACCEPTED provided existing format rules are satisfied. Source: the user's manual judgment of appropriate detective-game dialogue, independent of the current implementation; you decided.
2026-10-10 - HW5 scope and verification requirements: inspect and plan first, wait for approval before tests or fixes; later preserve actual red and green output from the same independent-expectations test, run the existing suite, document a separate expected gameplay outcome before one real use of the game, and record expected versus actual results. Keep the change small, defer a full multi-agent critic architecture, preserve HW4 spike evidence, make no real API calls, and do not commit, push, or merge; you decided.
2026-10-10 - HW5 inspection finding: all three human-specified candidates satisfy current structural checks and would be accepted by createOpenAIDialoguePhraser(...).phrase(); compared with human expectations REJECT, REJECT, ACCEPT, the first two differ and the third agrees. Source: source inspection only, not an executed test or game run; I determined.
2026-10-10 - HW5 recommended plan, pending your approval: test the existing phraser's phrase() with a fake Responses client and the three human-defined expectations; add a small case-insensitive check of the delivery lead-in for internal prompt wording (including approved statement, approved text, and my statement is), retain existing format checks and game fallback, and track HW5 in a separate OpenSpec change with explicit immersion scenarios. Preserve focused red/green output and suite output separately from HW4; I recommended, not yet approved or implemented.
2026-10-10 - Approved HW5 documentation and automated-test stage only: create and strictly validate a separate OpenSpec change, use the existing fake Responses client with the unchanged human-defined expectations, preserve actual RED output and exit status, then stop before production changes, real API calls, game use, commit, push, or merge; you decided.
2026-10-10 - Name the separate HW5 change reject-internal-prompt-dialogue, retain the existing npc-interrogation capability path with additive requirements because the MVP is unarchived, use test/dialogue-immersion.test.js with separate A/B/C tests, and use node --test --test-reporter=tap test/dialogue-immersion.test.js for RED and later GREEN. Localized case-insensitive word-boundary checks of known lead-in phrases are the planned fix; I decided within your approved approach.

2026-10-10 - HW5 RED execution evidence: command `node --test --test-reporter=tap test/dialogue-immersion.test.js`; actual exit status 1; production phraser unchanged during execution (SHA-256 46c487a02c20c4238458a1286bcd24c36821778c0ad730fc9360adf136b9575e). Expectations were defined by you before execution; I executed the fake-client test and recorded the complete stdout and stderr directly via spawnSync without truncation.

```text
TAP version 13
# Subtest: HW5 candidate A: reject Approved statement lead-in
not ok 1 - HW5 candidate A: reject Approved statement lead-in
  ---
  duration_ms: 12.8631
  type: 'test'
  location: 'C:\\Users\\hajni\\Documents\\MA\\3rd_advanced programming\\Detective-game-with-AI-agents\\test\\dialogue-immersion.test.js:19:1'
  failureType: 'testCodeFailure'
  error: 'Missing expected rejection: Candidate A must be rejected because it exposes internal prompt language.'
  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  operator: 'rejects'
  stack: |-
    async TestContext.<anonymous> (file:///C:/Users/hajni/Documents/MA/3rd_advanced%20programming/Detective-game-with-AI-agents/test/dialogue-immersion.test.js:20:3)
    async Test.run (node:internal/test_runner/test:1389:7)
    async startSubtestAfterBootstrap (node:internal/test_runner/harness:387:3)
  ...
# Subtest: HW5 candidate B: reject Here is the approved text lead-in
not ok 2 - HW5 candidate B: reject Here is the approved text lead-in
  ---
  duration_ms: 1.7741
  type: 'test'
  location: 'C:\\Users\\hajni\\Documents\\MA\\3rd_advanced programming\\Detective-game-with-AI-agents\\test\\dialogue-immersion.test.js:26:1'
  failureType: 'testCodeFailure'
  error: 'Missing expected rejection: Candidate B must be rejected because it exposes internal prompt language.'
  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  operator: 'rejects'
  stack: |-
    async TestContext.<anonymous> (file:///C:/Users/hajni/Documents/MA/3rd_advanced%20programming/Detective-game-with-AI-agents/test/dialogue-immersion.test.js:27:3)
    async Test.run (node:internal/test_runner/test:1389:7)
    async Test.processPendingSubtests (node:internal/test_runner/test:960:7)
  ...
# Subtest: HW5 candidate C: accept I hesitated lead-in
ok 3 - HW5 candidate C: accept I hesitated lead-in
  ---
  duration_ms: 1.3453
  type: 'test'
  ...
1..3
# tests 3
# suites 0
# pass 1
# fail 2
# cancelled 0
# skipped 0
# todo 0
# duration_ms 451.3414
```

Standard error (complete):

```text
```
2026-10-10 - HW5 RED expected versus actual: A expected REJECT but phrase() resolved, so its assert.rejects failed with Missing expected rejection; B expected REJECT but phrase() resolved, so its assert.rejects failed with Missing expected rejection; C expected ACCEPT and returned the exact candidate unchanged, so its equality assertion passed. Actual totals: 3 tests, 2 failed, 1 passed, exit status 1. This demonstrates the promised defect in the current production validator; I observed and recorded the results without changing your expected values.
2026-10-10 - Initial sandboxed evidence-capture attempt could not spawn Node (spawnSync EPERM) and did not execute the test or append test evidence; the approved escalated retry executed the same offline test and produced the full RED evidence above. I recorded the environment failure separately from assertion failures.
2026-10-10 - HW5 strict validation: command openspec.cmd validate reject-internal-prompt-dialogue --strict; actual exit status 0; output: Note: OpenSpec collects anonymous usage stats. Opt out: OPENSPEC_TELEMETRY=0 or openspec config set telemetry.enabled false Change 'reject-internal-prompt-dialogue' is valid. I executed validation.
2026-10-10 - Approved HW5 GREEN stage: implement the smallest lead-in-only production check, preserve the complete actual GREEN output from the exact RED command, run npm.cmd test, strictly validate the change, and update completed tasks; stop before real game use, API calls, commit, push, or merge; you decided.
2026-10-10 - Implement a single case-insensitive word-boundary regex for approved statement, approved text, and my statement is after existing lead-in structural validation; reuse the existing validation error and fallback behavior, leave the prompt and original three-case test unchanged, document the targeted check's limitations inline, and add separate offline regression checks for capitalization, statement announcement, approved-content isolation, and fallback caching; I decided within your approved approach.

2026-10-10 - HW5 GREEN evidence: command node --test --test-reporter=tap test/dialogue-immersion.test.js; actual exit status 0. I executed the unchanged human-expectations test and captured the complete combined output below.

```text
TAP version 13
# Subtest: HW5 candidate A: reject Approved statement lead-in
ok 1 - HW5 candidate A: reject Approved statement lead-in
  ---
  duration_ms: 8.5741
  type: 'test'
  ...
# Subtest: HW5 candidate B: reject Here is the approved text lead-in
ok 2 - HW5 candidate B: reject Here is the approved text lead-in
  ---
  duration_ms: 1.4922
  type: 'test'
  ...
# Subtest: HW5 candidate C: accept I hesitated lead-in
ok 3 - HW5 candidate C: accept I hesitated lead-in
  ---
  duration_ms: 1.0874
  type: 'test'
  ...
1..3
# tests 3
# suites 0
# pass 3
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 441.8537
```

2026-10-10 - HW5 GREEN expected versus actual: A expected REJECT and was rejected; B expected REJECT and was rejected; C expected ACCEPT and returned the exact candidate unchanged. All 3 passed, 0 failed, exit status 0; I verified these results with the original test unchanged. Earlier RED evidence is retained.

2026-10-10 - HW5 full regression evidence: command npm.cmd test; actual exit status 0. I executed the full suite and captured the complete combined output below.

```text

> detective-game-with-ai-agents@0.1.0 test
> node --test

✔ internal lead-in phrases are rejected regardless of capitalization (13.5989ms)
✔ immersion check examines only the generated lead-in (1.1303ms)
✔ rejected internal lead-in uses and caches the existing game fallback (10.6559ms)
✔ HW5 candidate A: reject Approved statement lead-in (6.6271ms)
✔ HW5 candidate B: reject Here is the approved text lead-in (1.375ms)
✔ HW5 candidate C: accept I hesitated lead-in (0.9897ms)
✔ the MVP case has exactly three complete suspects and a valid murderer (28.4709ms)
✔ keyword classifier recognizes all six categories and unsupported questions (3.7031ms)
✔ interrogation selects only the addressed suspect response and has safe fallback (1.8683ms)
✔ a repeated topic response is cached as identical display text (0.9094ms)
✔ evidence is inspectable and named evidence questions remain general category questions (3.3447ms)
✔ accusations can be cancelled and resolve correct or incorrect outcomes (5.7307ms)
✔ OpenAI adapter validates output and configured adapter falls back when no credentials exist (5.8975ms)
✔ OpenAI adapter passes the abort signal in request options and aborts on timeout (62.0668ms)
✔ scripted CLI session shows help, evidence, cancellation, and a final accusation (5.8318ms)
✔ spike schedule covers 18 pairs then 12 predetermined balanced repeats (6.8451ms)
✔ summary includes failures and timeouts in denominator and nearest-rank latencies (3.8508ms)
ℹ tests 17
ℹ suites 0
ℹ pass 17
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1077.2253
npm notice
npm notice New major version of npm available! 11.17.0 -> 12.2.0
npm notice Changelog: https://github.com/npm/cli/releases/tag/v12.2.0
npm notice To update run: npm install -g npm@12.2.0
npm notice
```

2026-10-10 - HW5 regression conclusion: npm.cmd test passed all 17 tests, 0 failed, 0 skipped, exit status 0; the 11 pre-existing tests and 6 HW5 tests passed. Case-insensitive rejection, approved-content isolation, fallback caching, and timeout handling were verified offline; I observed no regressions. The scripted CLI unit test is automated verification, not the pending real game session.

2026-10-10 - HW5 GREEN strict OpenSpec validation: command openspec.cmd validate reject-internal-prompt-dialogue --strict; actual exit status 0. I captured the complete combined output below.

```text
Note: OpenSpec collects anonymous usage stats. Opt out: OPENSPEC_TELEMETRY=0 or openspec config set telemetry.enabled false
Change 'reject-internal-prompt-dialogue' is valid
```

## HW5 — Manual Game Use

2026-10-10 - The user will personally play the offline game; prepare expectations before launch and leave actual observations empty until the user supplies them. Do not start the program, make API calls, commit, push, or merge; you decided.
2026-10-10 - Use Ben Carter's alibi question "Where were you when Victor died?", inspect all three evidence items, then accuse Clara Voss and confirm with yes for a deterministic ending. I selected this exercise from authoritative source code without launching the game; the five usability expectations below were independently specified by you before execution.

### Launch and source inspection (before execution)

Run the following in PowerShell from the repository root. These are instructions for the user, not commands executed by the assistant:

```powershell
Set-Location -LiteralPath 'C:\Users\hajni\Documents\MA\3rd_advanced programming\Detective-game-with-AI-agents'
Remove-Item Env:OPENAI_API_KEY -ErrorAction SilentlyContinue
Remove-Item Env:OPENAI_MODEL -ErrorAction SilentlyContinue
npm.cmd start
```

Source: package.json defines start as node src/index.js; src/index.js invokes runCli() using interactive readline; src/dialogue-phraser.js returns the unavailable phraser when API key or model configuration is absent, enabling the existing local fallback in src/game.js. Clearing both variables in the user's PowerShell session disables API phrasing for this exercise.

The main menu from src/cli.js is: 1. Question a suspect; 2. Inspect evidence; 3. Show example questions; 4. Make an accusation; 5. Quit.

The suspect numbers, from the caseData.suspects order in src/data/case.js and the numbered menu in src/cli.js, are: 1. Alice Mercer; 2. Ben Carter; 3. Clara Voss.

### Independently specified expected outcomes (recorded before launch)

2026-10-10 - Expectation 1: The game should start and display its menu; you decided. From source inspection, the title is "The Ashcroft Manor Murder" and the main menu has the five options listed above.
2026-10-10 - Expectation 2: The user should be able to select Ben Carter and ask a valid question; you decided. I selected the alibi topic and question "Where were you when Victor died?"; src/question-classifier.js classifies this as alibi through its first matching rule.
2026-10-10 - Expectation 3: Offline dialogue should display the exact prewritten answer for the selected question, without internal prompt language; you decided. The exact expected answer is "I was repairing the greenhouse window when Victor died." Source: src/data/case.js, suspect id ben-carter, responses.alibi; its response() helper sets fallbackText equal to approvedContent. The expected complete displayed line, including the speaker label added by src/cli.js, is "Ben Carter: I was repairing the greenhouse window when Victor died." I derived this expected wording from authoritative case data, not game execution.
2026-10-10 - Expectation 4: The user should be able to inspect the available evidence; you decided. Choose action 2, then evidence number 1, 2, or 3. Inspect each in turn by reopening action 2. Source: src/data/case.js evidence order and src/cli.js inspectEvidence().
2026-10-10 - Expectation 5: The user should be able to make an accusation and reach a game-ending result; you decided. For this selected exercise, choose action 4, suspect 3 (Clara Voss), then type yes. Source: src/data/case.js murdererId is clara-voss and src/game.js resolveAccusation() returns ended: true with the expected text "Correct. Clara Voss murdered Victor Hale." The CLI exits its investigation loop after this confirmed result.

Expected evidence displays, derived from src/data/case.js and the name/description formatting in src/cli.js:

1. Muddy footprints: Fresh muddy footprints lead from the garden door toward the study side entrance.
2. Torn contract: A torn business contract in Victor’s study shows he planned to end his partnership with Clara.
3. Silver cufflink: A silver cufflink bearing a V-shaped engraving was found beneath Victor’s desk.

### Exact manual input sequence

After running the launch commands, type each line at its corresponding prompt, pressing Enter after each:

```text
1
2
Where were you when Victor died?
2
1
2
2
2
3
4
3
yes
```

This sequence questions Ben, inspects all three clues, and confirms the accusation of Clara. A confirmation of no cancels the accusation and resumes investigation; only yes confirms it. Choosing 5 quits without an accusation result.

This offline exercise checks manual usability and prewritten dialogue. It does not independently exercise rejection of generated internal prompt language; RED/GREEN fake-client tests provide that evidence.

### Actual observations — to be supplied by the user


2026-10-10 - Actual manual observations supplied by you after personally launching and playing in offline mode (the assistant did not execute the session): the game launched and displayed the main menu; you selected Ben Carter and asked "Where were you when Victor died?"; the exact displayed answer was "Ben Carter: I was repairing the greenhouse window when Victor died."; you inspected muddy footprints, torn contract, and silver cufflink; you accused Clara Voss and confirmed; the exact result was "Correct. Clara Voss murdered Victor Hale."; the game ended correctly; you observed no unexpected behavior or errors. Source: your reported manual playthrough, including these exact output excerpts; no full terminal transcript was supplied.
2026-10-10 - Manual expected versus observed: expectation 1 (startup/menu) MET; expectation 2 (select Ben and ask a valid question) MET; expectation 3 (exact prewritten offline answer without internal prompt language) MET; expectation 4 (inspect all evidence) MET; expectation 5 (confirmed accusation and game-ending result) MET. The real-use exercise succeeded with all five independently recorded expectations met, based on your actual observations; you reported the results, and I recorded the comparison.
2026-10-10 - Authorize recording actual manual results, marking completed manual-use tasks, rerunning regression and strict validation, reviewing HW5 files for secrets and unnecessary files, committing HW5, pushing hw5-usable, and preparing or creating a PR to main with the specified title and exactly three short paragraphs. Do not merge or delete the branch; you decided.

2026-10-10 - HW5 pre-commit regression verification: command npm.cmd test; actual exit status 0. I captured the complete combined output below.

```text

> detective-game-with-ai-agents@0.1.0 test
> node --test

✔ internal lead-in phrases are rejected regardless of capitalization (4.7787ms)
✔ immersion check examines only the generated lead-in (0.4584ms)
✔ rejected internal lead-in uses and caches the existing game fallback (1.0002ms)
✔ HW5 candidate A: reject Approved statement lead-in (2.2101ms)
✔ HW5 candidate B: reject Here is the approved text lead-in (0.6163ms)
✔ HW5 candidate C: accept I hesitated lead-in (0.337ms)
✔ the MVP case has exactly three complete suspects and a valid murderer (5.5804ms)
✔ keyword classifier recognizes all six categories and unsupported questions (1.8401ms)
✔ interrogation selects only the addressed suspect response and has safe fallback (0.9612ms)
✔ a repeated topic response is cached as identical display text (0.3709ms)
✔ evidence is inspectable and named evidence questions remain general category questions (0.5594ms)
✔ accusations can be cancelled and resolve correct or incorrect outcomes (0.287ms)
✔ OpenAI adapter validates output and configured adapter falls back when no credentials exist (1.5525ms)
✔ OpenAI adapter passes the abort signal in request options and aborts on timeout (11.6822ms)
✔ scripted CLI session shows help, evidence, cancellation, and a final accusation (1.3469ms)
✔ spike schedule covers 18 pairs then 12 predetermined balanced repeats (4.0198ms)
✔ summary includes failures and timeouts in denominator and nearest-rank latencies (1.5696ms)
ℹ tests 17
ℹ suites 0
ℹ pass 17
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 348.7427
```

2026-10-10 - HW5 pre-commit strict verification: command openspec.cmd validate reject-internal-prompt-dialogue --strict; actual exit status 0. I captured the complete combined output below.

```text
Note: OpenSpec collects anonymous usage stats. Opt out: OPENSPEC_TELEMETRY=0 or openspec config set telemetry.enabled false
Change 'reject-internal-prompt-dialogue' is valid
```

2026-10-10 - Final verification passed: npm.cmd test reported 17 passed, 0 failed, 0 skipped, exit status 0; strict OpenSpec validation passed with exit status 0. I verified the results. GitHub CLI was not found by Get-Command or where.exe, so use the user-authorized manual PR fallback; I determined tool availability.

### Prepared PR

Title: HW5: dialogue immersion test and real game use

A test would go red if an NPC's generated response exposes internal prompt language, such as 'Approved statement', instead of speaking naturally within the game. The original validator accepted such dialogue; this change adds a targeted, case-insensitive check of generated lead-ins.

The expected values were independently chosen by me before running the code, based on human judgement of appropriate detective-game dialogue. RED produced 2 failed and 1 passed; GREEN produced 3 passed; regression testing produced 17 passed.

In my real offline game session, I questioned Ben Carter, inspected all three evidence items, correctly accused Clara Voss, and observed that the game behaved as expected without errors.
2026-10-10 - Reviewed the nine intended HW5 files and their changes: no API keys, token patterns, private-key blocks, unnecessary generated files, or HW4 modifications were found; git diff --check passed. Preserve the original expectations and RED/GREEN evidence. Prepare the exact user-specified three-paragraph PR description above and commit with message "HW5: validate NPC dialogue immersion and record real use"; you authorized the commit and PR format, and I completed the review. The targeted filter does not guarantee prevention of hallucinations or secret leaks.
