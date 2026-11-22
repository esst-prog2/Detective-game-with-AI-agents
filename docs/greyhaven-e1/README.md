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
| Live requested | Zero requests dispatched | Credential-free fallback | Neither provider environment variable was configured. Live decision, latency and billed token evidence are outstanding. |

The four scripted runs each dispatched three role calls and matched the offline factual snapshots at every recorded action, including options, receipts, account versions and lifecycle. Rounded local turn times in the captured scripted runs were 0–1 ms. These measure the fixture and engine only. The history-sensitive fixture test additionally selected a different strategy when the committed history contained a challenge. [Offline transcript](offline.jsonl), [four controlled transcripts](scripted.jsonl), [live attempt](live.jsonl).

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

All 673 Node tests and 64 Chromium tests passed, including the two-witness interview on desktop and mobile. The browser production build passed its privacy check. The scoped OpenSpec change and all five archived changes passed strict validation. Repository-wide strict validation reported the same nine older failures on a separate export of main at `e578de4`. The successful live trial with measured usage and latency remains outstanding.
