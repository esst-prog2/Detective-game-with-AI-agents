# Design

## Context

See proposal.md. All three prior dialogue phases remain complete and uncommitted. Planning edits are confined to this change and append-only PLANNING_LOG entries.

Audit findings (source and actual probe details in audit.md and audit-baseline.json):

- Every core has only a plain variant and the same per-character `framing.calm` prefix. `prepareTurn` selects the latter on subsequent new topics; `offerPerformances` also defaults to that variant.
- Repeats/clarifications concatenate fixed framing, sometimes two introductions. The model receives at most four pairs but normally only two different spoken strings; different gestures do not make the speech structurally different.
- `offerPerformances` uses demeanor to change repeated answers, but ordinary first-time topics largely ignore it. Per-character style descriptions cannot alter a verbatim allowed pair.
- Only the last two actual gesture IDs are remembered. Three gestures then recur cyclically. The provider can select narration on most turns even though offline narration appears every third delivery.
- The permission-pool hash protects cache safety, but no recent speech/opening history changes permission eligibility. A valid cached performance can therefore reinforce repetitive delivery. The cache is not the primary source of the original catchphrases.
- The visible browser demeanor explanation is always printed in the dialogue overlay. Help can retain its meaning without occupying every interaction.

## Goals / Non-Goals

**Goals:** improve observable prose structure in offline and configured modes using reviewed content, simple deterministic selection and measurable evaluation; preserve existing factual, state and UI contracts.

**Non-Goals:** unrestricted generation, semantic/model critics, new intent recognition, a new emotion model, new discoveries or relationships, frontend-generated dialogue, new model/dependency selection, paid evaluation calls, persistent memory, issue #3 closure or changes to original case/HW4/HW5 evidence.

## Decisions

### 1. Reviewed full speech alternatives, with explicit testimony equivalence

Changing only prefixes cannot meet structural variation. Keep the original `approvedContent` and source annotation immutable. Add a server-only authored delivery collection scoped to existing core IDs (and the existing social response per NPC), rather than assembling default spoken text from personality introductions. Reuse the catalog and exact-pair builder; do not add a parallel dialogue engine.

Each delivery has a stable ID, full literal speech, permitted intent/demeanor groups (encoded by original/ordinary/clarify/pressure mode), a reviewed opening-family and structure-family ID. Author approximately six alternatives per topic: original/plain, two meaning-preserving neutral structures, a contextual clarification, and two pressure structures. A record can serve multiple eligible contexts; catalog bounds remain finite (up to eight speech variants per core, with a single verbatim original for Alice's protected motive). Social responses need several short distinct alternatives too. Wording is individually reviewed; these slots are not templates to concatenate at runtime. Remove `Let me answer carefully`, `Plainly put` and `Allow me to be clear` from the new default delivery repertoire, including capitalization/punctuation variants.

Store an independent editorial/test review matrix for each core: required assertions, qualifiers, time/place limits, certainty limits, denials and intentionally false/concealing stance. Each full alternative must communicate all of them. Validate known IDs, nonempty eligibility, uniqueness, field/byte bounds and coverage declarations at construction; verify actual wording against independent reviewed fixtures and human-readable checklists. A `covers` label alone is not proof of equivalent meaning; do not build a keyword-based semantic validator or claim one exists.

This is an explicit, approval-dependent extension of Phase 2 design/spec section on verbatim cores, not an unnoticed relaxation of runtime safety. Arbitrary model paraphrases remain forbidden. Runtime still accepts only a complete exact pair from the current pool. Keep the original plain testimony as an eligible deterministic first ordinary topic response, including exact Alice motive and first sighting compatibility fixtures. At later turns select reviewed equivalents; if authoring cannot safely rephrase a core, preserve its complete original speech and vary only warranted delivery. Alice's motive core remains verbatim in every alternative for this milestone because of the unresolved debt annotation; no new debt facts, option labels, global knowledge or cross-NPC disclosures are allowed.

### 2. One staged selection policy for offline and provider modes

Separate fact/intent resolution and emotion transitions from performance choice. After `prepareTurn` determines the authorized core and staged demeanor, build the same reviewed eligible pair pool regardless of whether a performer exists. An explicit legacy phraser keeps its historical path and cache semantics. For existing prefix-only custom catalogs, adapt their approved plain/prefix variants through the same selection seam without inventing new content; the Ashcroft quality gates apply to the reviewed new catalog. Empty catalogs keep safe guidance.

Add a per-NPC private recent-delivery ring of at most three committed entries: speech ID, opening family, structure family, optional gesture ID/family. Keep a saturating speech-only-since-narration counter (0-2). Existing eight public turns, repeat counters, emotion deltas and knowledge summaries do not change. IDs/families/counters never enter public views or prompts.

Selection uses deterministic filters and stable catalog order, not random text or a weighted score:

1. Enforce core, intent, demeanor and known-context eligibility before any variety preference. A repeat acknowledgment requires that core to have been received; comparisons require the existing committed prerequisites. An ordinary question must still get a meaningful answer.
2. Prefer speech not used in the last three committed deliveries; if all eligible speeches are recent, relax the oldest exclusion first. Avoid an immediately identical speech whenever another equivalent eligible speech exists. Then prefer a different recent opening/structure family when available, with stable least-recent/catalog ordering as the tie-break. Retain any unavoidable repetition in evaluation evidence; never invent filler or weaken testimony to pass a metric.
3. Build at most four explicit pairs, always including a speech-only option and a preselected deterministic fallback. Do not admit other recent speeches merely because a model might choose them more creatively. Diversity eligibility applies to the offered pool as well as fallback ordering.
4. Accept an exact current pair from cache or model; otherwise use the first prepared fallback. Record only what was actually selected, in the candidate state.

Do not derive claims, knowledge or emotional transitions from the chosen prose. Reject stale candidates before installing recent deliveries, gesture history, counters, cache or testimony. Reuse the existing lifecycle/generation/room/session/revision guards and synchronous commit. Null narration must not record an unseen gesture. Cached turns still update ordinary conversation state exactly once.

### 3. Cache remains a performance optimization

Apply variety filters before lookup. Retain catalog-version/core/NPC/intent/demeanor plus exact filtered-pool hash in the cache key and the existing 64-entry-per-NPC cap. The selected delivery's metadata is resolved from the current engine-owned entry; never accept model-provided IDs. A cache hit is usable only if its exact pair is still eligible after repetition and gesture rules. Pool changes invalidate old delivery permissions naturally. Bump the authored catalog version for the new repertoire. Reduced cache hit rate is acceptable; do not bypass variety to preserve the old hit rate. Never use cache hits as evidence of better naturalness.

### 4. Emotion affects authored delivery without changing facts

Keep all existing transition math and public enums. Tag reviewed alternatives so a neutral and irritated rendering of the same core differ in wording/structure: Alice uses precise limited assertions and restrained qualification; Ben answers directly and may use corrections or relevant extra explanation under pressure; Clara uses controlled statements and firmer rebuttal when the conversation supports it. Pressure must not add uncertainty to a firm denial, remove a qualifying clause or invent a motive. Repetition and clarification reference only the same speaker's committed account. Avoid generic evasions and multi-sentence throat-clearing.

Use independently constructed neutral/irritated/receptive/uneasy test setups; compare paired same-core outputs and check factual equivalence, not merely different demeanor metadata. Original compatibility delivery remains available in neutral first-response cases. No private cause, murderer ID or truth annotation participates in selection.

### 5. Sparse narration with broader harmless families

Retain last-two actual gesture exclusion and add family-aware variety (face, hands, posture, pause) with individually reviewed small expressions. Expand the three-item lists only where necessary, within the current twelve-gesture cap. No arm-folding/gaze/clothing replacement loop or dramatic reaction to a hidden fact.

A turn normally offers a non-null pair only after at least two intervening speech-only replies and when the authorized conversational context warrants it (clarification, revisit, evidence presentation, comparison or demeanor transition). This is a cooldown plus context gate, not a mandatory every-third-turn schedule. Initial turns are speech-only. When a gesture is offered, exclude its last two actual IDs and, where another eligible family exists, exclude its last two actual families; keep null available. During cooldown, only the first committed established-comparison reaction may offer a reviewed pause; it cannot repeat or bypass comparison prerequisites. A model request alone never overrides pacing. A speech-only model choice does not consume gesture history. Offline fallback may choose a warranted gesture, with reproducible sparse variation; failed model output uses that same prepared fallback.

### 6. Unobtrusive browser demeanor

Keep the exact public enum and simply render `Demeanor: Neutral`, `Receptive`, `Irritated` or `Uneasy`. Do not invent `Composed` as a new engine state. Associate an accessible help description with the label (`aria-describedby` and screen-reader-only text); offer a keyboard-accessible small help control or native disclosure for sighted readers. It explains that demeanor concerns conversational delivery and does not establish truthfulness. No always-visible technical sentence, hidden numerical score, new portrait meaning or layout redesign. Preserve current large figures, focus handling, readable narration and dark-academia tokens. Update browser assertions to require the accessible explanation, not delete the safety explanation test.

### 7. Repeatable quality evaluation and acceptance gates

Implement a local script after approval, with a checked-in fixed scenario and JSON/Markdown output. Reuse the 18 substantive inputs per NPC in audit-baseline.json; record setup travel/inspections, all commands and choice IDs/labels separately and assert every measured turn resolves to an authorized substantive result. Use independent investigations per NPC/mode. Clara's setup receives Alice's sighting, then her own sighting before comparison; Alice and Ben receive only their authorized confrontations. Do not invent cross-comparison options for them. Exercise text and existing choice IDs when eligible, all six topics, repeats, clarification, social pressure, inspected evidence and Clara's established comparison. Add same-core neutral/pressure contrast cases outside the scored 18-turn sequences.

Run offline and deterministic fake selectors (first pair, last pair, prefer-null, prefer-narration, invalid/error fallback); no live model call by default. Save complete exact narration/speech, inputs, public demeanor, mode and source hashes. Report cache hits separately. Before is the captured current engine; after must be executed on the approved implementation with the same scenarios, never copied from proposal examples. If a first/last selector cannot meet a gate, narrow the eligible offered pool, not the validator or test expectation.

Per NPC and measured 18-turn mode, gates are:

| Measure | Acceptance |
| --- | --- |
| Three reported signature phrases | Zero occurrences, normalized case/punctuation |
| Repeated opening | No normalized first-four-word opening more than 4/18; separately count reviewed discourse/opening families across topics so trivial punctuation/prefix swaps cannot pass |
| Structural variation | At least three editorially distinguishable speech structures in the 18 turns; IDs must agree with an inspection of actual words |
| Short direct answers | At least 10/18 start with substantive testimony or a relevant concrete response, rather than a generic personality announcement |
| Immediate speech repetition | No identical consecutive speech where an eligible equivalent alternative exists; recent-three preference verified independently |
| Narration frequency | At most 6/18 narrated turns, normally at least two speech-only replies between them; separately report any reviewed first-comparison exception; offline walkthrough contains at least two warranted narrations, prefer-null may contain none |
| Gesture repetition | No gesture ID repeats among the last two narrated turns; no gesture family dominates more than half of narrated turns when at least four occur; compare raw strings as well as IDs |
| Meaning/safety | Every required proposition and qualifier retained in every delivery; no unauthorized statement, confession, action, private disclosure, invented account or evasion in place of a useful answer |
| Personality/emotion review | For each NPC, document actual neutral/pressure examples and reviewer judgments on voice, naturalness, usefulness and safety; no hard numeric metric is treated as proof of believable personality |

Define normalization explicitly: lowercase, strip punctuation, collapse whitespace, take up to the first four words; count each reply once. Report exact-string and opening-family frequencies, length distribution, silence ratio, gesture strings/families and repeated-topic versus unrelated-topic breakdowns. The finite script and matrix are fixed before after-evaluation; preserve failures and do not silently relax thresholds. Meaning preservation is a blocking editorial condition, not a claim that a lexical metric proves semantic equivalence. Include representative actual before/after transcripts for all three NPCs and a manual play checklist. Clearly separate automated counts, assistant editorial observations, proposed examples and any later user judgment.

### 8. Regression and verification scope

Keep the full Node suite, independent HW5 A/B/C and legacy prefix/timeout tests, raw case checksum and Alice motive/sighting compatibility fixtures. Tests asserting that every later delivery contains the entire original core or fixed `framing.clarify` text must migrate to independent reviewed utterance/required-information fixtures, exact current-pair rejection and unchanged originals; not to `nonempty` or self-derived production expectations. Catalog fixtures and synthetic eight/twelve-NPC data gain optional delivery metadata or use the compatibility adapter; retain their scale/privacy checks. Gesture/cached-stale tests retain their behavioral guarantees while expanding the catalog.

Add adversarial tests for old pairs excluded by recent speech/family/cooldown rules, cross-core/NPC/emotion pairs, mixed allowed fields, partial testimony and private facts. Rejected/stale provider success/failure and rejected HTTP commits must leave the entire recent-delivery/counter/cache state untouched; independent sessions and cached fallback must be covered. Run full Node, desktop/mobile browser suite, frontend build/import/artifact privacy checks, strict change validation and git diff --check. Record actual counts and quality-gate results; update tasks only after verified implementation. No production changes in this planning turn.

## Risks / Trade-offs

- [Exact pair validation cannot prove authored paraphrases equivalent] -> independent proposition/stance review and literal test fixtures; preserve original text and reject unreviewed prose. This is the deliberate smallest expressiveness extension needing approval.
- [Finite repertoire eventually repeats] -> recent selection and observable 18-turn gates reduce local repetition; no promise of endless fresh testimony, multi-topic composition or unrestricted conversational intelligence.
- [Sparse gestures reduce optional provider variation] -> apply the same engine gate to every mode; natural silence is desirable.
- [Emotion and variety requirements leave too few alternatives] -> retain a useful authorized answer, report the shortage and failing gate; do not add secrets or drop meaningful answers.
- [New opening-family labels game the metrics] -> compare normalized actual text and review transcript structures independently.
- [Performance cache hit rate drops] -> bounded resources and correct delivery take priority; report, do not speculate about live latency/cost.

## Migration Plan

After approval, author and review new deliveries, add bounded selection memory and the shared pool, adapt targeted tests, then change the demeanor label/help and evaluate. No persisted state exists; restart ephemeral sessions when the catalog version changes. Preserve explicit legacy callers and public HTTP/browser schema. Rollback uses the previous catalog/selection path as a whole; do not disable pair validation. Leave completed prior OpenSpec artifacts and historical evidence intact; this change records its explicit precedence. Stop for user review after implementation and verification without committing/pushing/merging/archiving.
