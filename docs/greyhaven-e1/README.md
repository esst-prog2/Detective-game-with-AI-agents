# Greyhaven E1 review

**Independent readers:** complete the [eight unlabeled moves](blind-review.md) before reading the results below. For each, guess the speaker and describe the conversational move. Keep the original guesses and score speaker and move separately. The agreed threshold is at least six of eight in each category.

## Two interviews, one direction

The player obtains Mara's account, travels to Owen, asks too early about the payment, hears his initial account and clarification, inspects the worksheet, tries again, and inspects the repayment demand. Only then does the evidence choice authorize Owen's payment explanation. After it commits, travel to reception and ask Mara whether she watched him the whole time. Repeating Mara's question uses ordinary delivery again.

In a controlled run, the director received four committed categories in order: account, clarification, inspection, inspection. It chose **invite an account**. Owen invited the detective to follow up about his work. Mara received the same strategy as an instruction to keep the conversation open and asked which part to address first. Forcing the other allowed NPC choices kept the strategy fixed: Owen acknowledged the question and Mara offered to hear the detective out. Each move was followed by the full authorized testimony.

| Measured mode | Director | Owen / Mara | Result |
| --- | --- | --- | --- |
| Offline | Zero calls | Original authored deliveries | Both premature payment requests returned guidance. Owen's account advanced only after the two inspections and his initial account. |
| Scripted, invite an account | One controlled selection per replay | Own the explanation / keep conversation open | Two replays exercised all four local reactions under this strategy. |
| Scripted, set a boundary | One controlled selection per replay | Insist on precision / limit to observation | Owen narrowed the discussion to his work or separated the questions. Mara requested a specific moment or reserved judgment about the inference. |
| Initial configuration check | Zero requests dispatched | Credential-free fallback | The provider variables were absent at this earlier check. |
| Credentialed live trial, 22 November | One director attempt, aborted at 1,506 ms | Owen used fallback. Mara used ordinary delivery. | Factual parity passed. The required three accepted model results and two-turn handoff were not observed. |

The four scripted runs each dispatched three role calls and matched the offline factual snapshots at every recorded action, including options, receipts, account versions and lifecycle. Rounded local turn times in the captured scripted runs were 0–1 ms. These measure the fixture and engine only. The history-sensitive fixture test additionally selected a different strategy when the committed history contained a challenge. [Offline transcript](offline.jsonl), [four controlled transcripts](scripted.jsonl), [earlier credential-free check](live.jsonl).

## Live acceptance report · 22 November 2026

[Timeout diagnosis and proposed controlled retest](../../openspec/changes/greyhaven-agent-coordination-pilot/controlled-retest.md)

**Task 4.3 remains open.** One credentialed run used `gpt-4.1-mini-2025-04-14` on the OpenAI Responses API. The Game Master had a 1,500 ms timeout within Owen's shared 4,000 ms turn budget. The local abort event was observed at 1,506 ms. The runner captured neither an accepted strategy nor a provider usage response. Server-side completion, billed tokens and cost are unknown.

| Role | Provider attempts | Observed result |
| --- | ---: | --- |
| Game Master | 1 | Timed out before a direction was accepted. |
| Owen | 0 | Returned the authorized payment explanation via fallback. Full turn took 1,512 ms. |
| Mara | 0 | With no committed direction, the source question and its repeat used ordinary authored delivery. Each rounded to 0 ms. |

There were zero retries. The runner matched the offline factual snapshots and repeat reply, then exited with status 1 because the live coordination criterion was unmet. The temporary credential file was deleted and its absence verified. [Credentialed trial transcript](live-provider-2026-11-22.jsonl).

## Reproduce

From the repository root:

~~~powershell
node scripts/demo-greyhaven-coordination.js offline
node scripts/demo-greyhaven-coordination.js scripted
node scripts/demo-greyhaven-coordination.js live
~~~

Live mode uses the locally configured server-side `OPENAI_API_KEY` and `OPENAI_MODEL`. Its exit status is nonzero unless the director and both witnesses returned authorized selections. Each line of output is a JSON record. Actual live requests report role, call ordinal, elapsed time and usage where supplied. The runner checks factual parity against a fresh offline replay before reporting a result.

For interactive play set `$env:GREYHAVEN_AGENT_PILOT='1'` in the API or CLI process with those two provider variables configured. Run `npm.cmd start -- --case greyhaven-preview`, or launch `npm.cmd run start:api` and `npm.cmd run dev:web` in separate terminals and select the preview. Restart with the switch removed for ordinary performer routing. Missing credentials give ordinary offline play. Each eligible turn shares four seconds of provider time, including a maximum of 1.5 seconds for the director. Failures use authored dialogue. Each session has one attempt per role, even after cancellation. Public gameplay responses show the dialogue. The local runner provides the separate redacted trace.

## Verification and review status

### Controlled live retest · 22 November 2026

**The handoff worked. Task 4.3 remains open because the adapter rejected Mara's response.** The approved retest used `gpt-4.1-mini-2025-04-14` with a 5-second director deadline and a shared 10-second budget per directed turn. All three calls received responses within those limits. There were zero retries or warm-ups.

| Role | Live result | SDK elapsed | Input / output tokens |
| --- | --- | ---: | ---: |
| Game Master | Selected `invite-account` for the two interviews. | 1,812 ms | 111 / 7 |
| Owen | Received `own-the-explanation` and chose `acknowledge-question`. His payment account opened with “Fair question. I'll answer it straight.” | 3,092 ms | 300 / 85 |
| Mara | Received the committed `invite-account` handoff as `keep-conversation-open`. The adapter rejected the response and the game delivered the authorized fallback. The trace records no accepted Mara reaction or more specific rejection reason. | 1,323 ms | 221 / 39 |

The provider reported 632 input and 131 output tokens. The replay took 6,234 ms and the complete demo took 6,434 ms. Owen's full turn took 4,906 ms and Mara's took 1,324 ms. The director and Owen's full turn exceeded the original 1,500/4,000 ms targets. The runner verified factual parity against the offline session after every scripted action, including disclosure options, inspected evidence, receipts, account progression and lifecycle. Mara's repeat returned to baseline. The runner exited with status 1. The temporary credential was deleted and its absence verified. [First trial](live-provider-2026-11-22.jsonl) · [Controlled retest](live-retest-2026-11-22.jsonl)

### Mara rejection diagnosis · 22 November 2026

**The last proven boundary is inside the NPC adapter.** The SDK returned a response object and reported 221 input and 39 output tokens. The runner set `responseReceived` before checking completion, refusal, response text, JSON shape or offer membership. It recorded `response-rejected` in the catch around the adapter. The engine therefore received no selected pair to revalidate. The trace retained neither the response body nor the individual check that failed. Token counts alone cannot identify what Mara returned. [Original retest record](live-retest-2026-11-22.jsonl)

| Check in execution order | Finding for the historical run |
| --- | --- |
| Direction and eligibility | Owen committed `invite-account`. Mara reached her eligible turn with `keep-conversation-open`. Her two authored choices were `invite-precise-question` and `hear-detective-out`. |
| Provider receipt | The SDK returned in 1,323 ms of the 10,000 ms available. The recorded outcome rules out the local abort path. Receipt alone does not establish a completed, non-refused model answer. |
| Adapter validation | Possible failures include incomplete status or refusal, missing or oversized text, malformed JSON, wrong fields or values, or a pair outside the offer. The transcript cannot distinguish them. |
| Reaction and engine authorization | Reaction IDs are local labels. The wire contract required a complete narration/dialogue pair. Only after a successful return does the engine check the pair against this turn's own offers and derive the ID. No Mara ID was derived. |
| Commit and fallback | The authorized baseline reply committed, the one-use direction was consumed, and the repeat used baseline delivery. The runner matched offline inspections, options, testimony receipts, account progression and lifecycle at every checkpoint. |

**Contract finding.** The original strict schema required null narration and a string for dialogue. A string outside Mara's two choices could satisfy that schema and still fail the required verbatim comparison. The instruction did require an exact offered pair. This difference in what the schema enforced is reproducible. There is no evidence assigning Mara's particular rejection to the model, an incorrect validator, wrong eligibility, or a stale handoff.

**Repair.** The E1 NPC schema now enumerates exactly the two complete dialogue strings in that speaker's current offer. Both remain independent choices. This repeats the authorized lines in the request schema and may increase input tokens. The adapter still checks shape and whole-pair equality, and the engine independently checks its own offers before deriving the reaction label. An ID-only answer or extra field fails shape validation. A complete reaction from another direction fails offer membership. No cross-direction search is needed to classify it.

Future local demo reports record the failed stage and a fixed category, for example `json_parse / invalid_json`, `response_shape / schema_mismatch`, `offer_membership / unauthorized_performance`, or `engine_revalidation / unauthorized_performance`. Response status, refusal and the local deadline have separate categories. Unknown exceptions produce a generic category. The trace copies no exception messages, provider text or proposed reaction values. Cancellation still discards the candidate and its staged events.

**Local verification.** All 680 Node tests and 64 Chromium tests passed, as did the browser build and privacy check and strict validation of this OpenSpec change. Fake responses exercised both valid Mara choices under each direction, wrong-direction pairs, ID-only responses, extra fields, malformed JSON, refusal, incomplete responses and engine revalidation. The loopback SDK test reproduced a rejection on Mara's third call and verified the redacted report. The fake-clock and cancellation tests verified that late results cannot commit. All simulated Mara fallbacks matched offline evidence, options, receipts, case progression and the repeat reply. This diagnosis used zero live provider calls.

**Live acceptance.** Task 4.3 still needs one same-session transcript with three accepted live choices and offline factual parity. A single separately approved three-attempt trial is justified to test the narrower schema with the actual provider. It cannot reconstruct the earlier answer. Report any experimental 5/10-second result separately from the original 1.5/4-second targets. The two retained live transcripts contain all genuine provider measurements to date.

### Independent reader score

On 22 November 2026 the project owner submitted these answers before consulting the labeled transcripts. The scoring key is the [reaction catalog](../../src/cases/greyhaven-reactions.js) at commit `a80dd66`, matched by exact dialogue line to the reader sheet. Each column earns one point per match. The move is scored by the conversational action described, independently of the speaker guess.

| Row | Speaker guess | Key speaker | Submitted move | Key move | Speaker / move points |
| --- | --- | --- | --- | --- | --- |
| A | Mara | Mara | Requests a precise observation before responding. | `narrow-observation` | 1 / 1 |
| B | Owen | Owen | Welcomes the question and offers a direct answer. | `acknowledge-question` | 1 / 1 |
| C | Mara | Mara | Invites the detective to finish and offers attentive listening. | `hear-detective-out` | 1 / 1 |
| D | Owen | Owen | Sets a firm boundary, redirecting attention to the repair work. | `narrow-to-work` | 1 / 1 |
| E | Mara | Mara | Withholds agreement until the detective explains their interpretation. | `reserve-judgment` | 1 / 1 |
| F | Owen | Mara | Asks the detective to prioritize one part of the question. | `invite-precise-question` | 0 / 1 |
| G | Owen | Owen | Insists on finishing his account before discussing the work. | `invite-follow-up` | 1 / 0 |
| H | Owen | Owen | Separates the repair work from the argument and requests one topic at a time. | `separate-questions` | 1 / 1 |

**Speaker identities 7/8. Conversational moves 7/8. Both pass the 6/8 threshold.** F earns the move point for recognizing the invitation to pick a specific part. On G the reader recognized the sequence of topics. I scored the move conservatively because the description omits Owen's affirmative invitation to ask a follow-up.

The implementation verification recorded 673 passing Node tests and 64 passing Chromium tests, including the two-witness interview on desktop and mobile. Retest preparation recorded 678 passing Node tests. The browser production build passed its privacy check. The scoped OpenSpec change and all five archived changes passed strict validation. Repository-wide strict validation reported the same nine older failures on a separate export of main at `e578de4`. The remaining live acceptance gap is an authorized Mara reaction in the same run as the director and Owen.
