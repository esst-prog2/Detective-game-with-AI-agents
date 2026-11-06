# Design

## Context

See proposal.md for motivation and mystery-audit.md for observed behavior, source reconstruction and deduction map. Existing engine tracks inspected evidence, finite discussed core IDs and eight recent turns per suspect; the latter are not full persistent history. Both UI adapters already display finalResult.text. Catalog validation currently insists on exactly one core per suspect/topic, and topic-option generation enumerates every core; simply appending a second evidence core would either fail validation or expose it as a generic topic. This requires a small explicit eligibility change.

## Goals / Non-Goals

**Goals:** One additional authored evidence response; accurate private annotations; understandable circumstantial deductions; stable evidence-aware final text through the existing contracts.

**Non-Goals:** No generalized facts/disclosure engine, trust gates, secret unlocks, scoring, new clues or UI flow. No re-authoring original eighteen topic answers or fallbacks. No claim of deductive certainty or automatic guilt inference from demeanor.

## Decisions

### 1. Alice recognizes the inspected cufflink

Proposed exact original/fallback for a new core `alice-mercer-cufflink-recognition`:

> The distinctive design matches the silver cufflinks I remember Clara wearing at dinner. I cannot be certain this one belongs to her. I did not see her drop it, and I do not know how or when it reached Victor’s study.

This wording incorporates the user's implementation approval clarification: a remembered design match cannot establish ownership or placement, and uncertainty includes both how and when. It is the single new approved fallback; no original topic testimony was rewritten.

Authorize a new static Alice knowledge observation: she saw Clara wear that pair at dinner. This does not transfer any existing private Clara fact into her general testimony. Recognition is a bounded witness identification, not scientific uniqueness or a witnessed loss. Existing public evidence says where it was found; the answer references that already inspected context. No hidden route, confession or murder-time observation is added. Alice's original evidence response continues to concern footprints.

Add the choice `identify-cufflink`, label "Ask whether Alice recognizes the inspected silver cufflink.", as an evidence option for Alice, study only, after silver-cufflink inspection. One eligible recognition plus her existing footprint option leaves room within the six-choice cap; comparison is Clara-only. This milestone adds no subsequent ownership confrontation or forced confession from Clara.

Alternatives: adding ownership to the evidence description would make inspection announce the association without a source; a new document/item increases scope; making Clara admit it rewrites her denial and creates a new disclosure arc. A single witness question is the smallest believable interactive repair.

### 2. Extend the existing evidence-response boundary explicitly

Use one additional evidence-specific core in the existing catalog with explicit required inspected-evidence metadata. Retain exactly one ungated base core for each of the six topics; identify base cores explicitly in validator, topic lookup and topic-choice generation. The new core uses the existing evidence topic, not a seventh classifier category. Validate its speaker/evidence reference and require the catalog evidence mapping to match. Do not rely on array order or a hidden naming convention for permission.

Apply the same evidence eligibility check to choices, named-clue text, clarification, preparation, current performance pool, cache reuse and final candidate commit. Generic "What do you know about the evidence?" must still select Alice's original footprint account. Before inspection, forged typed recognition, direct choice IDs and fake player claims do not create an eligible core. Once genuinely received, clarification uses the existing last-core mechanism and remains valid because inspected IDs persist. Remote/ended actions retain precedence and existing guards.

Current priority can crowd Clara's unanswered sighting out of the six visible choices after both study clues are inspected. Give the existing Alice/Clara base sighting cores a small authored suggestion priority among unanswered topics, below eligible comparison/evidence actions and above lower-priority generic topics. Validate that optional internal priority; it is neither a guilt indicator nor a seventh option. Verify visibility when all relevant evidence is already inspected and clarification/social choices are present. Keep all other topics reachable by existing text and rotation, with generic labels that do not identify a preferred suspect.

The new fallback is an authored string; ordinary/pressure alternatives, if supplied, retain every recognition and uncertainty assertion. Preserve all original base fallbacks. Ensure explicitly injected legacy phrasing takes its current approved content from the selected evidence core, not the original generic response; both adapters, cache and commit must authorize the current core's exact deliveries. No private case metadata or raw questions enter model context. Existing memory, demeanor, variant selection and abort/session behavior remain.

### 3. Correct only Alice's annotation and the intended deduction summary

Use the recommended annotation in mystery-audit.md. Retain her exact motive speech. Replace intendedSolution's unsupported missing-cufflink/footprint identification assertions with the cumulative public reasoning in the deduction map. Keep murderer, room/item descriptions, original topic testimony and private murder route unchanged. New knowledge authorization and separate testimony are proposed canon additions requiring review, not facts already observed in source.

Canonical changes are limited to the two included MODIFIED blocks. Older active MVP specs contain superseded no-clue-specific-response/repeat-cache language; canonical stateful/naturalness already supersede it. Earlier lifecycle text preserves verdict wording: retain those sentences verbatim and append the explanation. Do not rewrite archived designs or historical HW4/HW5 evidence. Adjust current regressions that freeze the wrong annotation/case fingerprint only for the approved content delta, retaining independent literal oracles and preservation checks for unaffected content.

### 4. Build conclusion text in the engine from finite recorded support

Keep finalResult shape `{ ended, result, text }` and existing verdict prefix. No schema, endpoint or client projection expansion. Compose reviewed paragraphs server-side before storing the write-once final result; never send raw intendedSolution or private metadata to browser/model.

Use existing inspected set and discussed-core summary sets, not the bounded recent-turn text, keywords in player input or provider output. A supporting question counts only after successful commit; inspected evidence counts after successful engine inspection. These are records of accepted public actions, not proof a human read a reply. Phrase summaries as "The investigation recorded..." and attribute Alice/Clara. An admitted disconnected command can commit under the existing contract; ending may summarize its public authorized content, but must not pretend it was acknowledged by the client. No receipt-acknowledgment protocol is introduced.

| Recorded prerequisites | Eligible explanation |
| --- | --- |
| Contract inspected | Contract documents intended partnership termination, a possible motive. |
| Alice sighting and Clara sighting committed | Their garden accounts conflict; not automatic proof Alice is truthful. |
| Only one sighting committed | Attribute only that account; do not invent the other side or announce an established contradiction. |
| Cufflink inspected AND recognition committed | Object found under desk matches pair Alice says Clara wore; explicitly unknown loss time and no witnessed loss. |
| Cufflink inspected without recognition | Describe object/location only, with no ownership inference. |
| Footprints inspected | Possible garden/study route; owner unestablished. Ben explanation may be attributed only if received. |
| Other topics / no support | Do not invent new deductions; no private letter, losses, route, shoe match or confession. |

Core explanatory chain is contract + cufflink + recognition + both sightings; footprint inspection is corroboration, not a mandatory completion flag. If the chain is incomplete, add "The accusation is correct, but the investigation did not establish the complete supporting chain." If complete, explain Clara is the best-supported suspect through cumulative circumstantial support, while an accessory could have arrived earlier and conflicting statements alone do not prove killing. Do not present a numeric score, missing-clue checklist, "case solved" badge or clue-collection prerequisite to accuse.

Illustrative full-support explanation, NOT executed output:

> Correct. Clara Voss murdered Victor Hale. The investigation recorded a contract showing Victor intended to end their partnership, giving Clara a possible motive. Alice described Clara coming from the garden shortly before the alarm; Clara denied being near the garden after dinner. Those accounts conflict. The cufflink found beneath the desk matches the pair Alice says Clara wore at dinner. Alice did not witness its loss and could not date its arrival. Together these clues support the accusation against Clara; no single one establishes the murder by itself.

If footprints were inspected, append the non-exclusive route qualification. No illustration authorizes reporting all paragraphs for partial play.

### 5. Keep incorrect outcomes final and private

Preserve "Incorrect. [name] is innocent. The investigation is over." Do not supply the actual killer, private exonerating activity or missed solution. Ensure CLI/browser confirmation already warns or minimally add a plain statement that confirmation ends the case, regardless of amount of investigation. Cancellation remains active; no automatic retry, continuation after a wrong verdict, or change to globally available accusation.

## Risks / Trade-offs

- One witness could be mistaken or lying -> retain attribution, independent document/object sources and uncertainty; test human reasoning rather than claiming mathematical uniqueness.
- Generic evidence lookup might leak new response -> explicit base-core and evidence eligibility checks on every selection/commit path; independent literal negative tests.
- New response variants might drop qualifications -> frozen literal review, exact-pair validation and malicious-provider tests with omitted limits, wrong speaker and altered loss timing.
- Sparse play may still guess correctly -> preserve existing outcome authority and honestly describe incomplete support; no gameplay lock.
- Older summary can outlive recent text -> only finite committed authored IDs count; no history persistence claim or fabricated recovered quote.
- Full explanation text may be long on mobile -> existing conclusion layout/escaped text, desktop/mobile readability verification, no redesign.

## Migration Plan

After approval, implement scoped data/catalog changes and independent fixtures, then engine conclusion composition and adapter regressions. Deploy matching server/browser and start fresh ephemeral sessions after content/catalog version change. No persistent data migration. Rollback is a normal reviewed revert; no history reset or force operation. Re-run current regressions; do not regenerate old experiments/evaluation baselines as if they described new content.

## Review decisions requiring approval

1. Alice observed Clara's dinner cufflinks; approve the exact new testimony and static knowledge authorization above.
2. Correct annotation only and preserve debt testimony; approve revised intendedSolution uncertainty.
3. Keep early accusations legal and use evidence-aware sparse endings, with existing verdict sentences unchanged.
4. Accept a defensible circumstantial mystery, without adding forensic exclusivity, corroborated alibis or a witnessed killing. A stronger proof standard would require a separate story revision, not an implied implementation task here.

The user approved these recommendations on 2026-11-06 subject to the ownership/how/when clarification above. Actual implementation results are in docs/mystery-deduction/verification.md. The human assessment is complete with user-reported difficulty/clarification concerns; this is not an unqualified fairness pass.
