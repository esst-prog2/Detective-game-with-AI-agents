# Design

## Context

See proposal.md for motivation. `phrase()` owns validation; `game.js` hides errors and caches fallbacks. The installed `openai@7.23.0` takes `signal` in the second argument to `responses.create`.

## Goals / Non-Goals

**Goals:** Measure real validated phrasing before fallback, with auditable per-call data.

**Non-Goals:** New gameplay, alternative validation, prompt tuning, automatic real calls during tests, or reporting infrastructure.

## Decisions

- Call the existing phraser directly through a recording wrapper around the real SDK client. Capture `output_text` before trimming; classify a rejection after a received response as validation failure, and a rejected SDK request as API error or timeout. This avoids copying the validator or changing production error types.
- Run the 18 pairs in suspect/topic order, then repeat topic indices [0,1,2,3], [2,3,4,5], [4,5,0,1] for the respective suspects. This gives exactly 30 sequential phraser attempts, ten per suspect and five per topic. SDK retries remain unchanged and may produce additional HTTP requests within an attempt.
- Time each full `phrase()` with `performance.now()`, including SDK retries and validation, excluding evidence writes. Keep the eight-second abort timer and SDK defaults; change only signal placement.
- Append run metadata, attempt records, and a final summary to a unique JSONL file under `spikes/results/`. Keep all raw outputs because one record shape is simplest. Include inputs, request body, model/version information, outcome, error, and elapsed milliseconds. Never record credentials. Write each record before the next call so an interruption preserves evidence; partial runs have no final summary.
- Compute passed/total and pass percentage over all 30 attempts, including errors/timeouts in the denominator. Sort all latencies and use nearest rank: index ceil(p*N)-1 for p50 and p95. Do not retry failed attempts at the script level or change the sample based on outcomes.
- Keep the script import-safe for offline calculation tests. Require both environment variables before creating evidence or contacting the API. Document manual execution and recomputation from JSONL rather than adding a reporting subsystem.

## Measured decision

The completed 2026-10-02 run with `gpt-6-luna` and SDK 7.23.0 is preserved in [phrasing-2026-10-02T13-49-19-290Z-17052.jsonl](../../../spikes/results/phrasing-2026-10-02T13-49-19-290Z-17052.jsonl). Independent recomputation from all 30 attempt records agrees with the saved summary: 30/30 passed (100.00%), nearest-rank p50 2249.9 ms and p95 4300.6 ms. All 18 pairs and the 12 predetermined repeats are present; no validation failures, API errors, or timeouts occurred. Offline replay of the saved raw text through the existing validator also accepted all 30 outputs. The user decided to retain the real-model phrasing path because this measured pass rate exceeds the approximately 70% threshold from issue #4. The experiment was not rerun during verification.

## Risks / Trade-offs

- Thirty calls are a small sample -> report model and settings; below roughly 70% requires revisiting the phrasing design, not silently changing it during measurement.
- Aborted/API-failed calls may have no output -> record null raw text and a distinct outcome, never invent text or count fallback as success.
- Missing API configuration -> finish implementation and tests, leave the real-run task pending and record no measurements.
