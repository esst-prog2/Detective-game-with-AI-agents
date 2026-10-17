# Review 7: Repository hygiene and security

## Scope and method

Whole tracked repository and all locally reachable Git history, including local/remote branches, source/browser/tests, package locks, scripts, OpenSpec, planning/docs, screenshots and spike evidence. Used `git rev-list --objects --all` plus `git cat-file --batch` to scan all 334 reachable unique blobs as of review 6, not just HEAD/diffs. Also scanned current tracked working files, checked tracked filenames, largest blob sizes, `.gitignore` behavior, source/build/runtime privacy boundaries and both package audit results. No credential values were printed.

Credential patterns covered OpenAI-shaped keys, GitHub token forms, AWS access-key IDs and private-key headers. Initial substring matching produced one hit in `test/public-view.test.js:11`: the `sk-` substring inside an `ask-...` dialogue choice ID. Redacted inspection established it was not a credential; boundary-aware rescanning produced zero hits. This is pattern-based screening, not a guarantee that arbitrary encoded or unfamiliar secrets cannot exist.

## Confirmed finding and fix

**Medium, fixed: future experiment errors could persist provider secrets.** The historical experiment runner at `scripts/measure-real-model-phrasing.js:78` (base revision) copied arbitrary exception name/message/code into a JSONL record in tracked `spikes/results/`; its top-level catch also printed raw exception text. Provider errors can echo credentials or request material. The committed historical run contains successful attempts, not a demonstrated leaked key; the defect is the unsafe logging path for future failures.

Future writes now use `safeExperimentError` (`scripts/measure-real-model-phrasing.js:31`): fixed name/message, an allowlisted outcome category and only integer HTTP error statuses 400-599. Top-level failures print a fixed operational message. Existing evidence files, recorded outputs, schedule, latency calculation and historical phraser validator remain unchanged. No paid experiment rerun. `test/phrasing-spike.test.js:16` injects private canaries into arbitrary diagnostic fields and verifies none survive while 401/error classification remain usable; null errors and hostile status/category values also remain safe.

## Other findings and dispositions

- No confirmed committed credential, real personal record or `.env` file. `.env.example` contains only empty variable names; fictional case facts are authored game content. No history rewrite/force push needed or performed.
- `git ls-files` showed 271 tracked paths at review time, none in node_modules/dist/test-results or sensitive key/env filenames. `git check-ignore` confirmed `.env`, `.env.local`, installed dependencies and web generated/test output are ignored. The explicit example exception is correct.
- Largest reachable blob is a 1,493,180-byte dialogue screenshot. Other large files are documented browser/room/dialogue evidence, not build artifacts. Kept them because the user explicitly requires historical evidence preservation; no arbitrary size-based deletion.
- Public payloads use allowlists; no API credential or private case record is imported into the browser. Loopback Host/Origin controls, body/header caps, escaped React text and bearer-free errors/logging remain enforced. Vite proxy error logging is already sanitized (`web/vite.config.js:8`); server errors are fixed messages (`src/server.js:26`). Built artifact scanning disallows private markers and source maps.
- Both dependency audits report zero known vulnerabilities as of this run (including development packages). Locked registry URLs/integrities and current imports were reviewed in category 5. Registry advisories and regex scans do not establish absence of every security issue.

## Verification

Targeted spike tests: **3/3 passed**. Full final results are in [README.md](README.md). Source/evidence comparison with base `49f6b07` confirms unchanged `src/data/case.js`, `src/data/authored-deliveries.js`, historical `src/dialogue-phraser.js`, frozen testimony fixtures, HW5 validator tests, `spikes/results/`, dialogue-quality evidence and archived OpenSpec artifacts. Historical evidence was inspected, not regenerated. Known Alice debt inconsistency and issue #3 remain open; no new unresolved high-severity finding was confirmed.
