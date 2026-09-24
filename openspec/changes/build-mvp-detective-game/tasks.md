# Tasks

## 1. Project setup and case content

- [x] 1.1 Initialize the Node.js plain-JavaScript CLI project with a start command and Node built-in test command; verify both commands are declared in `package.json`.
- [x] 1.2 Add the official `openai` JavaScript SDK and configuration documentation that keeps `OPENAI_API_KEY` and `OPENAI_MODEL` out of committed files; verify dependency installation and that no secret is present in tracked configuration.
- [x] 1.3 Create the single hand-authored case dataset with one victim, exactly three suspects, 2-3 locations, a small evidence set, the configured murderer, and the intended solution path; verify a case-integrity test passes.
- [x] 1.4 Populate every suspect with the required profile fields, private facts, permitted lie or concealment, and six category responses with prewritten fallback text; verify a test confirms complete category coverage.

## 2. Deterministic investigation core

- [x] 2.1 Implement ordered, normalized keyword rules for alibi, relationship with victim, motive, sighting, evidence, and crime details; verify classifier tests cover every category and unsupported input.
- [x] 2.2 Implement approved-response selection by suspect and category, including the deterministic unsupported-question topic-guidance fallback; verify tests prove selection cannot return another suspect's response.
- [x] 2.3 Implement per-investigation response caching by suspect and category; verify a repeat-question test receives exactly the same display text.
- [x] 2.4 Implement evidence listing and description lookup without clue-specific NPC response lookup; verify evidence-inspection and named-clue-question tests pass.
- [x] 2.5 Implement accusation selection and confirmation resolution against the configured murderer; verify tests cover cancellation, correct confirmation, and incorrect confirmation.

## 3. OpenAI dialogue phrasing and fallback

- [x] 3.1 Define a dialogue-phrasing adapter contract that accepts only engine-selected response content and personality context; verify core tests can use a mock adapter without network access.
- [x] 3.2 Implement the OpenAI Responses API adapter with the official SDK, environment-based API key and model configuration, concise no-tools prompting, timeout/error handling, and invalid-output detection; verify adapter tests use mocks and missing configuration reports unavailable.
- [x] 3.3 Connect the adapter to the response service so valid phrasing is cached and every unavailable or failed call uses the response's prewritten fallback; verify fallback and cache tests pass.

## 4. Command-line game and verification

- [x] 4.1 Implement the command-line investigation loop with suspect selection, typed questions, evidence inspection, help containing example questions, and input validation; verify a scripted terminal session reaches each action.
- [x] 4.2 Implement the numbered accusation menu and yes/no confirmation prompt in the CLI; verify a scripted session can cancel and can end after a confirmed accusation.
- [x] 4.3 Add integration tests for a complete correct and incorrect investigation outcome, knowledge-bound response selection, and the no-API-key fallback path; verify the full Node test suite passes.
- [ ] 4.4 Manually play the case using both the OpenAI-configured path (when credentials are available) and fallback-only path; verify the solution is understandable and the game remains playable without network access.
