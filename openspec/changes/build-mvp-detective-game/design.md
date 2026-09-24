# Design

## Context

The repository currently contains project documentation and no application source. See [proposal.md](proposal.md) and the four capability specs for the required MVP behavior. The implementation must be a small Node.js LTS command-line application in plain JavaScript, and must remain playable when an LLM is unavailable.

## Goals / Non-Goals

**Goals:**

- Keep the game state and all answer content deterministic and locally testable.
- Keep case content separate from CLI flow and dialogue generation.
- Make an optional LLM integration unable to select game facts, lies, or outcomes.
- Use only a small, hand-authored dataset for the initial case.

**Non-Goals:**

- Dynamic NPC memory, NPC-to-NPC communication, procedural cases, a graphical UI, or clue-specific typed questions.
- A general-purpose natural-language understanding system.
- Requiring an API key or network access to play the game.

## Decisions

### Use a deterministic core with an optional dialogue adapter

The core selects a suspect's approved response from local case data before any LLM call. A `DialoguePhraser` adapter receives only the selected response and personality context; it returns display text or signals failure. The core falls back to the response's prewritten text on any adapter error, timeout, or invalid result.

The first response text is cached by suspect and category for the current investigation. Later questions that map to the same pair return the cached text directly.

This separates correctness from presentation and makes the important knowledge-boundary tests independent of network access. An LLM selecting facts or returning unconstrained answers was rejected because it could leak hidden facts and would be difficult to test reliably.

### Integrate OpenAI through the Responses API

The production dialogue adapter will use the official JavaScript `openai` SDK and the OpenAI Responses API. It reads `OPENAI_API_KEY` and a configurable `OPENAI_MODEL` from the environment; if either is absent, the adapter reports unavailable and the core uses the local fallback. API keys are never stored in case data or committed files.

The adapter sends a short instruction to produce one concise in-character rendering of the already selected content, with no tools, no conversation persistence, and no access to the full case data. The official OpenAI documentation supports the JavaScript SDK, environment-based API-key configuration, and `responses.create` for text generation. [Developer quickstart](https://developers.openai.com/api/docs/quickstart)

### Store the mystery as structured local data

One case-data module will contain the victim, murderer, locations, evidence descriptions, and three suspect records. Each suspect record will include required profile fields and a dictionary of six category responses. Every category response includes engine-approved content, a prewritten fallback/display text, and its truthfulness or concealment metadata.

Structured data makes completeness testable: tests can verify that every suspect has all six responses and that the murderer is one of the presented suspects. Free-form prompts as the source of truth were rejected because they cannot enforce those invariants.

### Classify questions using ordered local keyword rules

A `QuestionClassifier` normalizes typed input and applies explicit, ordered keyword/pattern rules to return one of the six category identifiers or `unsupported`. The order is documented beside the rules to resolve overlapping wording consistently. The CLI displays sample questions so players know the supported vocabulary.

An LLM classifier was rejected for the MVP because it adds a second network-dependent AI decision and makes classification less predictable. Entity extraction for individual clues is intentionally excluded.

### Build a simple command-line interaction loop

The CLI will use Node's built-in line-reading support and expose actions to choose a suspect, ask a question, inspect evidence, view help/examples, and start an accusation. Accusation selection is a numbered menu followed by a yes/no confirmation; only confirmation resolves and ends the game.

The CLI owns input/output only. It calls core services for classification, response selection, evidence lookup, and accusation resolution so those behaviors can be unit-tested without terminal interaction.

### Use Node built-ins for the initial test suite

Use Node's built-in test runner and assertions for unit tests. This avoids introducing test-framework configuration into the MVP while covering case integrity, classification, approved-response selection, fallback behavior, repeated-answer caching, evidence inspection, and accusation resolution.

## Risks / Trade-offs

- [Keyword matching misses unusual player wording] -> Display examples and a deterministic topic-guidance fallback; expand rules only when actual MVP testing identifies useful phrases.
- [LLM wording adds facts or fails] -> The engine selects content first, limits the adapter input to that content, caches accepted text, and always has a prewritten fallback. Core tests use a mock adapter.
- [The hand-authored case is not actually solvable] -> Write the case's intended evidence-and-dialogue solution path and test data completeness before manual playtesting.
- [Terminal input is confusing or malformed] -> Validate menu input and confirmation answers, then redisplay the relevant prompt instead of ending the game.

## Migration Plan

1. Create the Node.js CLI and case data without requiring an LLM configuration.
2. Implement and test deterministic investigation behavior using the prewritten response path.
3. Add the OpenAI dialogue adapter behind a configuration boundary and retain the fallback as the default when unconfigured.
4. Manually play through both a correct and incorrect accusation before presenting the MVP.

No data migration or production rollback is required because this is the initial application. Removing or disabling the optional adapter reverts the game to its prewritten responses.
