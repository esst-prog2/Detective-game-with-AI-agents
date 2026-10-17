# Design

## Context

See proposal.md and the phase-1 audit/design in ../add-stateful-dialogue-engine/design.md. Phase 1 supplies immutable permitted dialogue candidates, author-reviewed voice/narration pools and an atomic commit seam. Current src/dialogue-phraser.js checks an exact approved suffix and restricted alphabetic lead-in, not the truth of that lead-in. HW5 explicitly expects A/B internal-language candidates rejected and C ("I hesitated") accepted; those expectations and historical measurements remain unchanged.

## Goals / Non-Goals

**Goals:** give the model a bounded character-performance role with separately validated narration and speech and identical offline semantics.

**Non-Goals:** free-form factual rewriting, semantic truth scoring, dialogue critic, LLM intent/permission/memory authority, new model/dependency selection, live paid benchmarks, new story facts or issue #3 closure.

## Decisions

### 1. Reviewed performance alternatives rather than unrestricted prose

Model output is exactly `{ "narration": null|string, "dialogue": string }`; no metadata is needed from the model. The engine already knows speaker, intent, facts, demeanor, turn ID and permissions. Reject missing/extra keys, arrays/nonobjects, empty speech, wrong types, code fences/trailing prose and outputs over 4 KiB UTF-8 before parsing. Spoken text is 1-1,200 Unicode characters; optional narration is 1-240, with null meaning no narration. Authored catalog validation enforces those same limits.

At each turn the engine constructs a finite list of allowed pairs. Each pair has an approved speech variant retaining the selected canonical core verbatim and either null or a reviewed harmless narration string. The model selects a pair by returning its exact strings; validate the entire pair, not each field independently. Unknown text, a valid string paired with the wrong core/NPC/state, or a previously valid narration excluded by anti-repetition rules fails. Return only accepted engine-projected strings; never parse model instructions as events. Even a supposedly harmless novel gesture is rejected rather than trying to infer its implications with a regex.

This is a conscious expressiveness trade-off for the first release. Personality comes from authored vocabulary/framing, pressure modes, stateful choices and variation selected by AI; AI does not freely improvise prose. An alternative of asking a model/critic whether arbitrary narration is safe cannot provide a deterministic knowledge boundary and is out of scope. If later open-ended performance is wanted, it needs a separately approved safety design and tests. Do not describe this finite selection as unrestricted creative paraphrasing.

Null narration is always eligible; all other narration describes only the addressed NPC's harmless expression/posture/pause. No detective actions, inner thoughts, evidence destruction/transfer, room movement, object use, guilt-coded terror or private-cause attribution. Amusement, uncertainty or defensiveness must have an approved public conversational trigger; no hidden murderer/secret-based permission. Avoid last two gesture IDs through phase-1 engine selection. Useful approved speech is mandatory even when style is guarded/irritated.

### 2. Minimal server-only prompt

Pass only the current NPC's approved performance-style summary (at most 500 Unicode characters), coarse demeanor, recognized public intent label (at most 64 characters) and at most four of this turn's permitted string pairs. Each pair already obeys the 4 KiB output bound, keeping prompt content bounded independently of history length or future cast size. Null narration must remain represented in the allowed pool. Do not pass raw case, full profile, murderer/solution, truth/lie annotations, concealment reasons, private relationships/facts, raw player text, conversation transcript or session bearer. Pair ordering can reflect deterministic variety; do not include internal policy IDs or unavailable alternatives. All pairs have equivalent authorized factual content. The model cannot infer a new claim from a player's injected instruction because raw player instructions are absent.

Use the existing installed SDK/server configuration and eight-second abort default. Use a JSON-output facility supported by that installed SDK where available, but runtime parsing/exact-pair validation remains mandatory. No browser calls, client model selection, request logging of prompts/responses, or credentials in errors. Add no retry loops: missing key/model, transport failure, empty/refusal/malformed output, timeout or validation failure selects the prepared deterministic fallback once. Do not introduce a new API-key storage mechanism or change historical experiment scripts.

### 3. Validate at the engine boundary as well as the adapter

The new performer is an untrusted output source even when injected in a test. The adapter validates structure/size; the engine rechecks the pair against its immutable current permission pool before candidate commit. Do not rely on an SDK schema alone or the fact that an adapter returned a string. Fixed error/fallback responses never include exception text, provider payloads or partial model output. Valid output does not authorize emotion changes; phase 1 already staged those based on input semantics.

Keep the legacy exported phraser/functions and validator untouched for explicit historical callers. Phase-1 compatibility seam remains documented as trusted with old limits; do not automatically convert its free lead-in into trusted narration. Configure CLI and HTTP runtime to inject the new performer rather than the old phraser after this phase. Reject configuring both seams. The browser cannot enable legacy mode. Existing experiment invocation retains its original adapter/validator so saved acceptance numbers remain comparable.

### 4. Delayed work and cache

Reuse phase-1 prepare/commit. Before caching or publishing an accepted pair/fallback, recheck active lifecycle, engine mutation generation, location epoch/presence and HTTP reservation/revision. Ending or stale context discards the candidate, including a fallback produced after a provider error. A late model response cannot recreate a lost session, adjust demeanor or become memory. Best-effort abort saves work; commit guards provide correctness. Cache key includes catalog version/core/NPC/variant/permission pool and is subject to the existing 64-entry-per-NPC cap; cached text is revalidated against current permissions and cannot bypass emotion/context processing.

### 5. Dedicated safety coverage and issue #3 status

Use fake provider responses and secret canaries; normal tests make no external requests. Cover both-field private leaks, arbitrary prefix/quote changes, secret/private relationship IDs in metadata, fake ownership, murder confession, changed alibi, narrator detective speech/thoughts, contract destruction, room movement, guilt-coded reactions, cross-character pairs, valid fields in invalid combinations, stale permissions, malformed/oversized JSON, refusal, timeout and rejection/fallback races. Assert invalid partial output is absent from API, public memory, cache and browser-bound payloads. Verify prompt input excludes raw player input, raw case, truth metadata and bearer/API credentials. Include a valid allowed pair, null narration and required useful testimony at extreme demeanor values.

Retain independent HW5 A/B/C and original immersion tests. Add a regression showing an alphabetic factual lead-in can pass the historical syntactic validator, explicitly documenting its limited guarantee, while the new performer rejects equivalent unauthorized narration/speech. Do not change the old validator to make this test seem safe. Dedicated tests narrow the new path's model-output risk but cannot prove authored data is correct or resolve every issue #3 scenario. Closing issue #3 requires separate explicit approval and review of that issue's full acceptance scope; do not close it here.

## Risks / Trade-offs

- [Authored unsafe pair passes exact validation] -> content/provenance review and boundary fixtures; model validator is not an authoring oracle.
- [Finite choices feel repetitive] -> reviewed per-NPC variants, optional silence, memory-driven intent/context and anti-gesture repetition; evaluate human play quality before later broadening.
- [Model adds latency without new facts] -> optional configuration, deterministic fallback and cached validated performance; report limits honestly, no fabricated live-model quality claims.
- [Legacy API remains weaker] -> keep explicit compatibility path out of configured runtime and HTTP selection, preserve historical warnings/evidence.
- [Abort does not stop all billing] -> bounded concurrency/timeout and commit discard; resource completion does not imply state mutation.

## Migration Plan

Implement only after phase 1 and user approval. Add new adapter/validator, then engine-boundary validation and configured runtime wiring; leave historical exports/experiment unchanged. Run full Node suite and targeted HTTP races/privacy tests, existing browser journeys and build privacy checks where runtime changes affect them, strict OpenSpec validation and diff check. Record actual results. Roll back runtime injection to phase-1 deterministic performer if needed; no session migration or persisted state exists. No commit/archive/push without authorization.
