# Tasks

## 1. Implementation

- [x] 1.1 Correct signal placement only; verify a focused fake-client test checks the body and options and observes abort.
- [x] 1.2 Add the standalone 30-attempt script and JSONL evidence; verify offline tests cover the schedule and summary calculations, and missing configuration exits before any run.
- [x] 1.3 Document execution, configuration, evidence and commit instructions; append decisions to PLANNING_LOG.md and verify the full test suite and OpenSpec validation pass.

## 2. Real experiment

- [x] 2.1 With API key and model configured, execute exactly 30 sequential attempts; retain JSONL evidence, append actual passed/total, pass rate, p50/p95 and the below-70% design conclusion to PLANNING_LOG.md, and verify the summary can be recomputed from the 30 attempt records. Leave pending when configuration is unavailable.
