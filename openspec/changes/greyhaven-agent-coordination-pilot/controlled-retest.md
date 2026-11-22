# E1 controlled provider retest · pending approval

## First trial diagnosis

The original credentialed run requested `gpt-4.1-mini-2025-04-14`. Its transcript records one director attempt, a local abort at 1,506 ms, no accepted strategy, and no reported token usage. Owen returned his authorized baseline answer after 1,512 ms. Mara subsequently used her ordinary delivery. The offline factual snapshots matched. [Original transcript](../../../docs/greyhaven-e1/live-provider-2026-11-22.jsonl)

| Question | Finding |
| --- | --- |
| Did the 1.5 s limit apply? | Yes. The engine scheduled a local abort, raced the role promise, checked a monotonic deadline and passed the remaining timeout to the SDK. The trace observer sets the aborted flag on that local signal. Six milliseconds of timer/observation overrun is consistent with asynchronous timers. |
| Did OpenAI receive the request? | Unknown. The live adapter entered the director path, which builds the request and invokes the SDK. The original timer measured local role elapsed time. There is no recorded HTTP response, provider receipt or request ID. Server completion and billing are unknown. |
| What caused fallback? | The local wait expired before a validated result became available. There is no recorded provider error. Network delay, connection establishment, remote processing and a possible later remote error cannot be distinguished from this trace. |
| Was the request correctly configured? | The trial launcher checked the credential's model ID and selected the official API base URL. The adapter uses the configured model, Responses API, strict JSON Schema, an object with one required enum field for the director, no extra properties, storage disabled and zero SDK retries. The NPC schema is a complete narration/dialogue pair. The credentialed trial did not reach either NPC call. Local wire tests verify the intended contract; account entitlement and provider acceptance were not established. |
| Was there avoidable overhead? | Offline comparison, SDK import, client creation and pilot initialization happen before the directed-turn deadline. The client is shared across roles. Input copying, projection, JSON serialization, SDK preparation and transport occur within the timed path. The 6 ms difference between role and full turn measurements is not a breakdown of network or model latency. No measured setup bottleneck justifies a warm-up, second client or model switch. |

## Proposed experiment

The original code used fixed engine constants. Selecting a different SDK timeout alone could not extend its outer timer. The dedicated local demo mode `live-retest` now injects one fixed preset into the same transaction. The normal game and original `live` demo use the original 1,500/4,000 ms budgets. A public API payload or browser setting cannot select this preset.

After explicit approval, run one fresh-session replay using the same model and secure local credential procedure. Send at most one request each for the director, Owen and Mara. There are zero retries, warm-ups or probe requests. The director gets at most 5,000 ms within Owen's shared 10,000 ms. Owen receives the remainder. Mara has a fresh 10,000 ms only if the original handoff committed and her turn qualifies. Loss of eligibility, timeout, invalid output or cancellation uses the existing fallback/discard rules. Cleanup removes the temporary credential even if the run fails.

Capture local SDK duration to response/error/abort, role duration, configured timeout, validation outcome, committed decisions, handoff use, turn timings, total demo and replay elapsed time, any HTTP error status and provider-reported token counts. Missing usage is unknown. Keep credential values, prompts, raw provider outputs and request bodies out of the report. Save the redacted transcript under a fresh filename and score the **experimental budget** explicitly. A successful retest would demonstrate live coordination at 5/10 seconds. Evaluate observed durations separately against the original targets. Task 4.3 stays open pending review.

## Local verification

The Node suite uses virtual time to model a 3,750 ms director decision, a 5,400 ms Owen selection and an 8,200 ms Mara selection. Their SDK timeout allowances are 5,000, 6,250 and 10,000 ms respectively. Both directed turns commit with factual parity. Three separate tests deliver otherwise valid results after the director, Owen or Mara timeout and verify that they cannot alter committed state. Existing tests cover the original deadlines, invalid outputs, session isolation, cancellation, projections, disclosure and offline play.

A loopback-only HTTP fixture runs the SDK and retest runner against a local server with dummy credentials. It checks the selected model, strict schemas, role order, SDK and total timing fields, metered fixture usage, successful handoff and rejection of an invalid Owen response without a Mara request. Fixture metrics are local test evidence. No new OpenAI request was made during preparation.
