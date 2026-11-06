# Greyhaven statement-specific clarification design

**Approved narrative examples; proposed reusable mechanism. No implementation.** Preserve the 20 [reviewed examples](greyhaven-clarification-examples.md) and their source/disclosure limits. Existing Ashcroft clarification behavior remains the compatibility path, not a wholesale content rewrite.

## Targeting without a model interpreter

For new-schema catalogs define finite facets on an owned primary statement/account version: meaning, identity, source, time and certainty. The words are internal intent tags, not new public topics or request keys. Each mapping names one authorized core with a reviewed body/default fallback and its prerequisites. 'What do you mean?' selects the declared default facet or an honest limitation; it never cycles through undisclosed facts.

Reuse per-NPC lastCore context, expanded privately into `{speaker,primaryStatement,accountVersion,originTurn}`. An informational facet preserves its primary target instead of making itself the next recursively clarified assertion. Switching speakers uses the new speaker's committed context; it cannot import the former speaker's private memory. Speaking to a character who has no target produces a request to identify the account, without fabricating a turn/secret.

Proposed finite resolution order, with unsupported ambiguity returning guidance rather than choosing arbitrarily:

1. Validate current `choiceId` against that speaker's actually offered options. Each choice privately binds its target/facet/version in current state.
2. For text, preserve explicit named-evidence eligibility and reviewed cross-account comparison rules. A question naming one inspected item is not silently reclassified as a new secret request.
3. Match a bounded set of case-authored whole aliases and deterministic facet patterns: meaning, who, how known, which bell, when, saw-versus-heard, certainty. If evidence wording and a facet both apply, a reviewed explicit mapping wins; otherwise ask which target is intended. Do not broaden the existing six-topic classifier indiscriminately.
4. Use last primary statement for implicit follow-ups. An explicit bounded reference such as 'your earlier alibi' can resolve only to that speaker's retained received account references. More than one plausible target gets a neutral clarification request; unseen statements cannot be named by the engine as alternatives.
5. Run the same core/current-account gate predicate as normal dialogue before pool selection and again at commit. A facet adds only the permitted refinement or an authored refusal/limit.

No new HTTP `{facet}`, `{coreId}` or `{statementRef}` input is needed for the MVP. The current question-or-choice contract suffices. Do not publish internal semantic IDs or add a general conversation-search API to enable old-row clarification buttons. A durable public target-token design can be reviewed later if actual usability requires it.

## Outcomes and version behavior

| Context | Intended behavior |
| --- | --- |
| J-B + 'Which bell?' | Distinguish held signal from actual departure in plain language; two recorded times are accessible, not specialist knowledge |
| J-C + 'How do you know Ruth was there?' | Auditory recognition of two familiar voices on house line; state fallibility and lack of visual observation |
| J-C + 'Did you see the folder?' | Explicitly reported position, not direct sight; never invent visual certainty |
| I-S + identity/view, G5 absent/present | No unearned I-F before gate; after gate close-door view versus bench angle, number not read on exit object |
| M0 + 'How do you know?' | Current permitted evasion, not M1/M2. Kindness/anger changes delivery only |
| Old M0 mentioned after M1 | Reviewed correction/attribution using received M0 and current M1; do not restate the old lie as current or erase it from history |
| M2 + 'Why lie if innocent?' | Qualified past fear, not knowledge of guilt/innocence then; no unrelated person gains that private motive automatically |
| O0 + 'What work?' | Real pump/test/source explanation while withholding money; O1 gate unchanged |
| No approved extra detail | Natural honest limit or permitted evasion. No endlessly varied paraphrases that pretend to add information |
| Unsupported, compound, ambiguous or adversarial text | Bounded guidance/target clarification; no model guessing, implicit receipt, emotion farming or unauthorized mutation |

Keep response `kind:'answer'` and existing topic enum (facet inherits the parent's subject). Public option `kind:'clarify'` already exists. New labels can be case-specific; private facet intents must not exceed the existing provider intent bound or leak gate reasons. Each informational body has its own exact authorized pool; it is not a stylistic variant permitted to change facts.

## Six-choice discoverability

Preserve the approved ordering: newly eligible essential evidence/revision/comparison, missing route-critical base questions, one contextual facet, then optional evidence/topics/revisits/social. Stable author IDs break ties. Newly delivered essential prompts lose first-time priority but remain eligible through text/revisit rotation. Hidden gates must not advertise secret labels. Model relevance ranking is neither needed nor allowed.

Validate authoring states have at most four simultaneous first-time essential choices per speaker. This leaves space for a useful facet within six. An invalid catalog/state that exceeds the approved essential budget must fail authoring validation or receive an explicitly reviewed navigation change; do not silently truncate. Optional choices are not removed: text addresses any eligible optional item, and existing rotations expose them. Test actual bounded reachability at 8+ eligible candidates, not merely options.length<=6.

## Acceptance for C and later integration

Synthetic fixtures first: exact question/target/facet/expected body and forbidden implication authored independently. Test all patterns, no context, speaker switch, compound target, unseen explicit quote, superseded version, repeated facet, more than 8 turns, stale choice, private-fact canaries and malicious provider outputs. A facade that always repeats the prior statement cannot pass the source/time/identity distinctions. Cache and candidate keys bind selected account/facet; late output cannot install an old gate result.

Then exercise all 20 Greyhaven rows in E/F and the original-case literal fixtures. Test both menu/text paths and offline delivery. UI comprehension remains human work: ask a fresh player what the answer resolved and what it did not establish. Do not treat exact-match tests as proof a response is helpful.
