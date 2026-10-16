# Advanced-programming-project

## Running the MVP

Requires Node.js LTS.

```powershell
npm install
npm start
```

The game works entirely with its prewritten dialogue by default. To enable optional OpenAI dialogue delivery phrases, set both environment variables before running:

```powershell
$env:OPENAI_API_KEY="your_api_key"
$env:OPENAI_MODEL="your_model"
npm start
```

Never commit API keys. Copy the variable names from `.env.example`; the game automatically falls back to prewritten dialogue if either setting is missing or the API call fails.

## Player-visible investigation data

`createInvestigation()` in `src/game.js` provides explicit public read methods for future interface adapters:

| Method | Returned display fields |
| --- | --- |
| `getPublicView()` | `title`, `victim: { name, description }`, `locations: string[]`, `suspects: { id, name }[]`, `evidence: { id, name }[]`, `lifecycle: { status, finalResult }` |
| `getPublicSuspect(id)` | `{ id, name }`, or `null` for an unknown ID |
| `inspectPublicEvidence(id)` | While active: `{ id, name, description }`, or `null` for an unknown ID. After ending: the error below. |
| `getLifecycle()` | `{ status: 'active' \| 'ended', finalResult }`; final result is `null` while active, then `{ ended: true, result: 'correct' \| 'incorrect', text }` |

Every call constructs detached objects/arrays and preserves case-data order. Changing a returned view cannot change the case, stored result or later reads. Public reads make no model calls. Evidence remains immediately inspectable while active; this change adds no discovery gates or journal state. A wrong accusation's final text identifies only the accused innocent suspect, without revealing the actual murderer.

The allowlist excludes the murderer designation, solution, private facts, motives, personality prompts, permitted lies, response tables and additional metadata. Existing introduction and evidence descriptions are authored player-visible text; they still require editorial review for spoilers. These methods assume the current case format, whose allowlisted leaf values and location names are strings. New structured fields require an explicit projection decision.

The existing `data`, `findSuspect()` and active `inspectEvidence()` contracts remain available to trusted internal callers, including the CLI. **Future network adapters must serialize public projections, never the investigation object or raw case records.** The game engine and case module belong on the server. Raw case references remain trusted internal access, not protection against malicious in-process code. This change adds no HTTP server or browser UI and does not resolve NPC dialogue knowledge leaks.

## Investigation lifecycle

Each investigation starts `active`. Only the first `resolveAccusation(suspectId, true)` for a valid suspect ends it and stores a final result. Cancellation (including non-Boolean confirmation) and unknown confirmed suspects leave active play unchanged. Only literal Boolean `true` confirms an accusation; the CLI still converts a trimmed, case-insensitive `yes` to that Boolean. Final results retain their original text and cannot be changed through returned resolution responses or lifecycle snapshots.

After ending, `askSuspect()`, `inspectEvidence()` and `inspectPublicEvidence()` return `{ kind: 'error', code: 'investigation_ended', text: 'The investigation has ended.' }`, including for cached questions and unknown IDs. Further `resolveAccusation()` calls return that error plus `{ ended: true, result: 'rejected' }`, even if the new accusation is canceled. A rejected command is distinct from the stored final result; retrieve the original result through `getLifecycle().finalResult` or `getPublicView().lifecycle.finalResult`.

Overview, lifecycle, suspect identities and evidence summaries remain readable after ending. Inspection descriptions and NPC answers cannot be retrieved through gameplay commands. A pending dialogue call that settles after ending is discarded before any cache write or answer return, including its fallback on failure. Already-running API requests are not canceled and may still incur cost; no late answer can reopen the investigation.

CLI evidence inspection now uses the guarded engine method. An already-ended investigation displays its stored final text and requests no gameplay input. Quitting the CLI without accusation remains a UI-only exit with no fabricated outcome. Start a separate investigation for a new playthrough; persistence and resetting an existing instance are outside this milestone.

## Local investigation HTTP API

Run `npm.cmd run start:api` to start the API at `http://127.0.0.1:3001`; `npm.cmd start` still launches the CLI. Set `API_PORT` to a number from 1 to 65535 to change the local port. The server binds only to loopback. Existing `OPENAI_API_KEY` and `OPENAI_MODEL` settings optionally enable server-side dialogue; without them the full case works offline. No client can choose model settings, case truth or private NPC information.

Start with `POST /api/investigations`, `Content-Type: application/json`, body `{}`. Its 201 response is:

```json
{
  "ok": true,
  "data": {
    "sessionId": "<64 lowercase hex characters>",
    "revision": 0,
    "state": { "title": "The Ashcroft Manor Murder", "victim": {}, "locations": [], "suspects": [], "evidence": [], "lifecycle": { "status": "active", "finalResult": null } }
  },
  "error": null
}
```

The example abbreviates the state collections and victim; actual state is the complete approved public view described above. Keep the returned session ID private: it is a bearer credential granting control of that investigation. Do not place it in a browser address bar, analytics or logs. The service does not log request URLs/bodies or include IDs in error details.

| Method/path | Exact request body |
| --- | --- |
| `GET /api/investigations/:id` | No body |
| `POST /api/investigations/:id/questions` | `{"suspectId":"ben-carter","question":"Where were you?","expectedRevision":0}` |
| `POST /api/investigations/:id/evidence/inspect` | `{"evidenceId":"muddy-footprints","expectedRevision":1}` |
| `POST /api/investigations/:id/accusations` | `{"suspectId":"clara-voss","confirmed":false,"expectedRevision":2}` |

Successful commands return 200 with `{ "ok": true, "data": { "sessionId": "...", "revision": 1, "state": {}, "result": {} }, "error": null }`. `state` is the current public view. Question results contain `kind`, `text`, and topic/cache flags when present; unsupported wording returns guidance. Inspection results contain only ID/name/description. Accusations contain `ended`, `result`, `text`: cancellation is a successful command leaving play active; `confirmed: true` resolves the case. Correct and incorrect accusations are both successful game actions. After ending, commands return 409, while GET still exposes the stable final public result.

Every successful command advances revision once, even a cached answer, inspection, guidance or cancellation. Supply the last observed revision in the next command. Only one command per session runs at a time: overlaps get `409 session_busy`, outdated revisions get `409 stale_revision`, and invalid async completions get `409 stale_response` or `investigation_ended`. Other sessions operate independently. GET during pending work returns the last committed revision. After a lost response, GET before deciding whether to retry; ignore lower-revision network deliveries for the same session and never blindly replay a final accusation. A disconnected accepted command retains its reservation and settles once; disconnect does not roll it back or cancel provider charges.

Errors have a fixed shape, with no raw exception or bearer ID:

```json
{"ok":false,"data":null,"error":{"code":"stale_revision","message":"Refresh state before retrying.","session":{"revision":1}}}
```

`error.session` is null before a session is resolved. Status/code groups: 400 (`invalid_request`, `invalid_json`, `invalid_id`, `invalid_session_id`, `invalid_route`); 403 (`forbidden_host`, `forbidden_origin`); 404 (`route_not_found`, `session_not_found`, `suspect_not_found`, `evidence_not_found`); 405 (`method_not_allowed`, with Allow); 409 (the conflicts above); 413 (`request_too_large`); 415 (`unsupported_media_type`, `unsupported_encoding`); 429 (`question_capacity`); 503 (`session_capacity`); 500 (`internal_error`). Well-formed post-game commands get `investigation_ended` before entity/revision checks; malformed requests still fail validation. Unknown suspects in canceled HTTP accusations are rejected, a stricter input rule than the trusted engine's cancellation shortcut.

Limits: 16 KiB per streamed request body, 1-1000 Unicode characters per trimmed question, strict typed exact-key JSON objects, lowercase slug entity IDs up to 64 characters, 100 sessions, 30-minute idle expiry and four concurrent question operations. No query parameters, compressed requests, arbitrary engine commands or GET bodies are accepted. Headers are limited to 8 KiB, with five-second header/keep-alive and ten-second request-receipt timeouts. Incomplete or malformed transport can close before JSON is deliverable. Sessions in flight are pinned until settlement, and idle expiry restarts then.

Sessions and caches live in one process: restarting or expiring a session loses progress. There are no accounts, persistence, multi-worker coordination or public-hosting guarantees. A token holder can control its session. Exact local Host/Origin checks, no permissive CORS, and no-store/nosniff/no-referrer response headers protect the local browser boundary; they do not protect against malicious local software. Model output still uses the existing deterministic validator/fallback and has its documented semantic limitations; this milestone does not resolve issue #3 or add a critic.

For the future Vite client, use relative `/api/...` fetch URLs. A future Vite development configuration can contain:

```js
server: {
  proxy: {
    '/api': { target: 'http://127.0.0.1:3001', changeOrigin: true }
  }
}
```

The API accepts exact `http://localhost:5173` and `http://127.0.0.1:5173` origins through that proxy, plus its own local origins. Foreign/null origins, cross-site fetch metadata and nonlocal Host headers are rejected. This is documentation only: no React/Vite application or dependencies are included.

## HW4 real-model phrasing spike

Verified result (2026-10-02): `gpt-6-luna`, **30/30 passed (100.00%)**, **p50 2249.9 ms**, **p95 4300.6 ms**. Evidence: [phrasing-2026-10-02T13-49-19-290Z-17052.jsonl](spikes/results/phrasing-2026-10-02T13-49-19-290Z-17052.jsonl). All 18 suspect/topic pairs plus 12 predetermined repeats are present, with zero validation failures, API errors, or timeouts. The current real-model phrasing path remains in the design because this run exceeds issue #4's approximately 70% viability threshold; 30 successful attempts do not guarantee future success. Metrics were independently recomputed from the evidence without rerunning the API experiment.

From the repository root, install locked dependencies with `npm.cmd ci` if needed, then run in PowerShell:

```powershell
$env:OPENAI_API_KEY="your_api_key"
$env:OPENAI_MODEL="your_model_id"
node scripts/measure-real-model-phrasing.js
```

Both variables are required; `.env` is not loaded automatically. Missing configuration exits before making calls or creating evidence. This experiment is manual and is never run by `npm test`.

The script makes exactly 30 sequential phraser attempts: all 18 suspect/topic pairs in data order, then four fixed repeats per suspect (Alice: topics 0,1,2,3; Ben: 2,3,4,5; Clara: 4,5,0,1). Topic indices refer to `TOPICS` in `src/data/case.js`. Each suspect has ten attempts and each topic has five. It uses the production prompt and validator directly, before game fallback/caching. SDK retry defaults are unchanged, so one attempt can include multiple HTTP requests. The existing eight-second abort timer is retained, with its signal now correctly supplied in request options.

Each run prints its evidence path: `spikes/results/phrasing-<UTC timestamp>-<process id>.jsonl`. The file contains run metadata, one record per attempt, and a final summary. Each attempt records inputs/request, outcome (`passed`, `validation_failure`, `api_error`, or `timeout`), error, elapsed milliseconds, and exact untrimmed `rawOutput`. Successful outputs are also retained to keep the format simple. JSON escaping preserves the original text, including whitespace. API failures/timeouts without output have `rawOutput: null`. Records are written after every attempt; interrupted runs have no final summary and must not be reported as a completed 30-call experiment.

The printed summary is passed / 30, pass rate (%), p50 latency (ms), and p95 latency (ms). API errors and timeouts count as unsuccessful attempts. Latency runs from `phrase()` start through resolution/rejection, including SDK retries and validation but excluding evidence writes. Percentiles use nearest rank over all 30 sorted latencies: p50 is the 15th and p95 the 29th value. Recompute from saved evidence without API calls:

```powershell
@'
import { readFileSync } from 'node:fs';
import { summarize } from './scripts/measure-real-model-phrasing.js';
const rows = readFileSync(process.argv[2], 'utf8').trim().split(/\r?\n/).map(JSON.parse);
console.log(summarize(rows.filter(r => r.type === 'attempt')));
'@ | node --input-type=module - spikes/results/phrasing-2026-10-02T13-49-19-290Z-17052.jsonl
```

After a completed run, append a dated line to `PLANNING_LOG.md` with the model, evidence path, actual passed/30, pass rate, p50, p95, and decision attribution. Below roughly 70% means the current phrasing path is not reliable enough and the design decision must change. Record that conclusion rather than tuning the prompt or validator during this experiment. Mark task 2.1 complete in `openspec/changes/measure-real-model-phrasing/tasks.md` only after verifying the saved summary and recording the result.

Commit `scripts/measure-real-model-phrasing.js`, `src/dialogue-phraser.js`, `test/game.test.js`, `test/phrasing-spike.test.js`, `README.md`, `PLANNING_LOG.md`, the entire `openspec/changes/measure-real-model-phrasing/` directory (including `.openspec.yaml`), and the completed run's JSONL file. Never commit API credentials or `.env` files.

## 1. The demo
I open the game and start a new murder mystery. I am told that one of the three suspects committed the murder, and I can talk to each of them by typing questions. Each has access to different information, so they answer based on only what they know. For instance, one suspect knows that they saw another character near the crime scene, while another one doesn't. I can ask questions, inspect pieces of evidence, and then type the name of the person I think could be the murderer. The game tells me whether my accusation is correct and the investigation ends.

## 2. The shape
in            a new game containing three suspects, a murder, a small number of locations and pieces of evidence
out           an accusation by the player and a result whether it was correct or not
in between    the player gets to investigate the crime by talking to NPC agents, asking questions, receiving info based on NPC's knowledge and memories, and examining evidence

## 3. The size
### First useful version: small but playable already
- 3 NPC suspects
- 2-3 locations
- 1 murderer
- a small set of evidence
- being able to converse with NPCs
- different info, knowledge, and memories for each NPC
- a final accusation
- a simple interface (I'd say command-line only)
- LLM agents controlling the NPCs' responses and decisions

### What it does NOT do this term
- sophisticated graphical game
- dozens of NPCs
- a large map with tens of locations
- complex animations
- voice interaction
- fully open-ended NPC actions
- long-term memory accross separate runs
- a large neural network

## 4. How we would know it works
- I think the most telling is this: given an NPC who has not been told a particular fact, it should not be able to use that fact in its decisions or responses.
- Given an information is shared between NPCs, for example, NPC A tells NPC B something, then NPC B's knowledge state should only have the information after telling.
- Given that the killer is known by the game engine, the player should receive either the correct result (if the accusation is correct) or an incorrect one if they accuse an innocent NPC.

## 5. What could stop this
It is a project I have not done before; I haven't tried making a game yet.
The LLM/agent architecture is also a risk, in my opinion, because I have to test and see early whether an LLM can reliably return the required actions or not (I mean no hallucation).
API access and response time could be another risk, so the game should always have a fallback version.

Also, the game uses fictional characters and artificially generated game data, so no personal or sensitive data is required. Both the game and sample datasets can be shown during presentation and shared in the repository.
