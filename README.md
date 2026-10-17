# Advanced-programming-project

## Illustrated browser game

The current case is playable offline through an illustrated React interface. Use Node 24 LTS (verified with 24.19); the isolated `web/` package uses React 19 and Vite 8. The CLI and API commands below continue to work.

Install once, from PowerShell:

```powershell
Set-Location 'C:\Users\hajni\Documents\MA\3rd_advanced programming\Detective-game-with-AI-agents'
npm.cmd ci
npm.cmd --prefix web ci
```

Terminal 1 — offline API:

```powershell
Set-Location 'C:\Users\hajni\Documents\MA\3rd_advanced programming\Detective-game-with-AI-agents'
Remove-Item Env:OPENAI_API_KEY, Env:OPENAI_MODEL -ErrorAction SilentlyContinue
npm.cmd run start:api
```

Terminal 2 — browser application:

```powershell
Set-Location 'C:\Users\hajni\Documents\MA\3rd_advanced programming\Detective-game-with-AI-agents'
npm.cmd run dev:web
```

Open **http://127.0.0.1:5173**. Keep both terminals running; Ctrl+C stops each. Ports 3001/5173 must be free. Vite uses a same-origin `/api` proxy; the browser never needs model credentials. If choosing another API port, set the same `API_PORT` in both terminals. Do not put secrets in `VITE_*` variables. Development and preview bind to loopback; these commands are for local play, not public hosting.

Restart both servers after updating, then reload the page and start a new investigation. An old API process still has the previous contracts in memory.

Start in the study. Select a present person for the large-figure cinematic conversation, with free-text questions, secondary history/dossier and Return to room. Inspect room objects or use exits. **Rooms** offers alternative navigation; **Investigation overview** and **Evidence journal** allow global public dossier/received-note review. Remote actions offer travel; the server rejects remote questioning/inspection and post-game travel.

| Room | Present person | Evidence |
| --- | --- | --- |
| Study (start) | Alice Mercer | Torn contract, silver cufflink |
| Library | Clara Voss | None |
| Garden | Ben Carter | Muddy footprints |

These are static interview positions, not murder-time alibis. All rooms are reachable without movement costs or discovery locks. The six dialogue topics and intentional lies are unchanged. Accusations remain available against any suspect from any active room; confirming ends the case, while received notes remain readable. In the CLI, actions 1–5 remain and **6** travels to another room.

Playthrough tokens, drafts and received notes live only in page memory. Reloading loses them; there is no save/continue feature. API restart or 30 minutes of idle expiry can also invalidate a session. An explicit new investigation clears the old notes after creation succeeds. On uncertain receipt/conflict, use **Refresh investigation**, then deliberately retry. Refresh merges the API's bounded recent testimony without duplicating received turns; older actually received notes remain local. No accusation is automatically replayed. If a session expires, received notes stay readable until a new investigation is requested.

Build and verification:

```powershell
npm.cmd test
web/node_modules/.bin/playwright.cmd install chromium
npm.cmd run test:web
npm.cmd run build:web
openspec.cmd validate --all --strict
openspec.cmd validate --archived --strict
git diff --check
```

The browser suite starts its own offline API/Vite processes, so stop existing servers first. `npm.cmd test` includes the original backend suite and pure client tests. The production build checks its module boundary, forbidden server markers and absence of source maps. `web/dist/` is generated and ignored. With the API running, `npm.cmd --prefix web run preview` serves the built application through the same local proxy on port 5173; production hosting/security is outside this milestone.

[Hybrid dialogue playtest and screenshots](docs/hybrid-dialogue-playtest.md) records the current interface; [room/cinematic playtest](docs/room-browser-playtest.md) preserves room-milestone verification; [the earlier browser review](docs/browser-playtest.md) preserves the prior milestone. Local SVG scenes, portrait cameos, clue icons and separate neutral standing-figure placeholders are replaceable through `web/src/presentation/asset-manifest.js`. Figures are temporary artwork; future expression slots do not imply emotional AI. Chromium is the verified browser; native dialog support is required. Larger/empty room collections use responsive layouts and generic fallbacks without adding real characters.

If manual-play servers are running, tests can use a separate API port and IPv6 loopback listener without broadening the allowed browser origins:

```powershell
$env:E2E_API_PORT='3002'
$env:E2E_ISOLATED='1'
npm.cmd run test:web
Remove-Item Env:E2E_API_PORT, Env:E2E_ISOLATED -ErrorAction SilentlyContinue
```

This requires IPv6 `localhost:5173` and API port 3002 to be free. After the suite stops, `node web/scripts/room-walkthrough.mjs` uses those isolated listeners and captures review images under `docs/room-screenshots/`. The earlier `visual-walkthrough.mjs` is retained as historical tooling for the previous UI.

## Running the MVP

Requires Node.js LTS.

```powershell
npm install
npm start
```

The CLI and API work completely offline with deterministic authored performances. To enable optional Phase 2 performance selection, configure both variables below. The model selects from engine-authorized narration/speech pairs; it cannot rewrite the mystery. No default model is chosen by the app.

Set these only in the server/CLI environment, never in browser code or `VITE_*` settings:

```powershell
$env:OPENAI_API_KEY="your_api_key"
$env:OPENAI_MODEL="your_model"
```

Never commit API keys. Copy variable names from `.env.example`. Missing either setting, configuration failure, invalid output or provider failure uses deterministic offline delivery. The historical phraser remains available through explicit trusted `createInvestigation({ phraser: await createConfiguredOpenAIPhraser() })` integration and the unchanged HW4/HW5 experiment. It retains its old lead-in/cache/fallback behavior and documented semantic limits; normal CLI/API startup uses the new performer instead. HTTP cannot select adapters or models, and legacy/new adapters cannot be combined.

## Player-visible investigation data

`createInvestigation()` in `src/game.js` provides explicit public read methods for interface adapters:

| Method | Returned display fields |
| --- | --- |
| `getPublicView()` | `title`, `victim: { name, description }`, `locations: string[]`, `rooms: { id, name }[]`, `currentLocationId`, `suspects: { id, name, locationId, dossier }[]`, `evidence: { id, name, locationId }[]`, `lifecycle: { status, finalResult }`, `dialogue` as described below |
| `getPublicSuspect(id)` | `{ id, name, locationId, dossier }` or `null`; dossier contains reviewed role, relationshipToVictim, background and public relationship references |
| `inspectPublicEvidence(id)` | Active and in-room: `{ id, name, description }`; unknown: `null`; remote: `evidence_not_here`; ended: the error below |
| `getLifecycle()` | `{ status: 'active' \| 'ended', finalResult }`; final result is `null` while active, then `{ ended: true, result: 'correct' \| 'incorrect', text }` |

Every call constructs detached objects/arrays and preserves case-data order. Changing a view cannot change the case, position or stored result. Public reads make no model calls. Evidence inspection requires presence in its room while active; successful inspections are now recorded by the engine and gate evidence presentation, not inspection itself. A wrong final result does not reveal the actual murderer. Empty dossier relationship arrays mean no extra public links are recorded, not that someone has no family.

The allowlist excludes the murderer designation, solution, private facts, motives, personality prompts, permitted lies, response tables and additional metadata. Existing introduction and evidence descriptions are authored player-visible text; they still require editorial review for spoilers. These methods assume the current case format, whose allowlisted leaf values and location names are strings. New structured fields require an explicit projection decision.

The existing `data`, `findSuspect()` and guarded `inspectEvidence()` remain trusted internal APIs. **Network adapters must serialize public projections, never the investigation object or raw case records.** The game engine/case module belong on the server. `travelTo(locationId)` changes active position; trusted `getLocationContext()` supplies an internal epoch for stale-reply commit guards, never public JSON. Trusted `getDialogueDiagnostics()` supplies detached numeric state, private turn provenance, summaries and cache diagnostics for tests; it is never exposed by HTTP. Raw references do not protect against malicious in-process code. This milestone does not resolve issue #3.

## Stateful dialogue — Phase 1

`src/data/dialogue-catalog.js` keeps reviewed profiles, testimony cores, delivery alternatives, evidence relevance and comparison prerequisites separate from the unchanged mystery records. Alice remains nervous/dutiful with careful wording; Ben remains blunt/proud with restless explanation under pressure; Clara remains polished/composed with firm rebuttals. Existing intentional lies remain testimony, not verified facts. No family ties, new secrets or confessions are authored.

`askSuspect(id, question)` and `interact(id, {question})` / `interact(id, {choiceId})` share one engine path. Only one input is accepted. Six original topic examples still work; specific clue names, contextual clarification ("What do you mean by that?"), social challenges and authored conflicting-account questions are resolved deterministically before broad topic matching. Ambiguous or unsupported text produces guidance, not invented testimony. This is bounded intent recognition, not unrestricted natural-language understanding. The CLI accepts `/choices` inside its existing question prompt without adding prompts to ordinary scripts.

Each NPC has eight recent substantive turns, finite discussed/presented core/evidence IDs, a last-testimony pointer, repeat counts saturated at three, the last two gesture IDs/families, three recent selected deliveries, bounded narration pacing/cursor state and at most 64 cached performances. Raw player input stays attributed to `question`; it does not alter NPC knowledge or canon. Older testimony references remain usable for authored prerequisites even after their wording leaves the recent window. Browser-local longer history is still local. Sessions and all memory are isolated and ephemeral.

Cooperation, irritation and tension are clamped integers 0–4, private to the engine. Alice starts at (2,0,1); Ben/Clara at (2,0,0). Repetition, baseless challenges, first relevant evidence presentation and a first respectful new-topic question have deterministic character-specific deltas documented/tested in the OpenSpec design. Respect uses the markers "please"/"thank you"; repeats cannot farm cooperation. Clarification, unsupported guidance, canceled final accusations, travel and inspection alone do not change emotions. Emotion affects delivery only; even maximum irritation never withholds authorized testimony or unlocks secrets. Public demeanor is coarse neutral/receptive/irritated/uneasy, not a guilt score.

Public `dialogue` has exactly:

```js
{
  inspectedEvidenceIds: [],
  conversations: [{
    suspectId: 'alice-mercer', demeanor: 'neutral',
    recentTurns: [], // {turnId, question, kind, topic, narration, dialogue}
    options: [] // up to six {id, label, kind}, only while active and present
  }]
}
```

Options change after received testimony and successful inspection. Ben can be confronted with inspected footprints, Clara with the inspected cufflink or contract, and Alice with inspected footprints. Relevant existing cores supply answers; no private ownership or route is inferred. The garden-account conflict requires both Alice's sighting and Clara's after-dinner garden denial to have been received, then offers an attributed comparison without deciding who is truthful. A profitable partnership can still be dissolved; contract/dissolution alone is not a proven contradiction. Player claims cannot unlock either prerequisite.

**Unresolved case-data inconsistency:** Alice's existing motive answer says "My debt was my own problem, not his", while its concealment annotation says she does not mention debt. Both original records are preserved for compatibility and regression-tested. The engine records only that she said the approved testimony; it does not make debt a global public fact, add it to dossiers/options or give it to other NPCs. The debt-letter and library details remain private. Later editorial review and issue #3 remain open.

Dialogue preparation produces an opaque, single-use candidate. Memory, emotions, performance cache and turn IDs remain staged until engine lifecycle/mutation-generation/room checks and HTTP session/reservation/revision checks pass. Result/public snapshot projection happens before installation; rejection or projection failure installs none of the candidate. Travel (including away-and-back), inspection, canceled/confirmed accusations invalidate pending candidates. Direct overlapping dialogue is rejected. Disconnected admitted HTTP work may still commit once while valid; an uncertain client timeout is not rollback. `prepareDialogue`/`commitDialogue`/`discardDialogue` are trusted adapter APIs; never serialize candidate handles.

The catalog/intent/commit separation supports the optional Phase 2 performer below without giving a model authority over facts, options or memory. Phase 3 browser controls now consume only the public dialogue projection. Historical phraser APIs/tests/evidence remain unchanged.

## Safe NPC performance — Phase 2

`src/authored-performances.js` builds at most four current authorized pairs from reviewed whole-utterance alternatives tied to unchanged testimony cores and a harmless gesture catalog. The pool always includes null narration. Repeated questions/clarifications retain appropriate authored acknowledgement, and every allowed speech variant preserves all required testimony assertions, denials, timing and qualifications. Original plain testimony remains available; Alice's debt testimony remains verbatim. The model performs the character by choosing an exact pair; this initial strategy deliberately does not permit free-form improvisation. Future independent factual validation can be introduced at the isolated performance boundary through a separately approved design, without changing engine fact ownership.

`src/npc-performance.js` sends the existing Responses SDK a strict two-field JSON schema using documented [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs). Schema conformance alone does not authorize content. Both adapter and engine independently require an exact current pair, then validate again before candidate installation. Combining individually valid speech/narration from incompatible pairs, other characters, other topics or expired gesture permissions is rejected. Output permits only `narration: null | string` and `dialogue: string`; no model metadata, actions, memory or truth flags are accepted. Empty narration is represented by null, not an empty string. Limits are 1–240 Unicode characters for narration, 1–1,200 for speech and 4 KiB UTF-8 for the serialized pair; authored combinations obey these limits too.

The prompt contains only a reviewed style summary (at most 500 Unicode characters), coarse demeanor, recognized intent (at most 64 characters), and the current allowed pairs. It excludes raw player questions, history, case records, private facts, secrets, solution, lie annotations, internal policy/core IDs and session/API credentials. No tools or consequential actions are offered to the model. Provider response storage is disabled in the request. API keys remain in server configuration; text/history and credentials are not logged.

The configured performer uses an eight-second abort/deadline, disables SDK retries at both client and request levels and explicitly disables SDK logging. The timeout settles even if a provider ignores abort. Refusals, incomplete/empty/malformed/oversized output, novel text, extra fields, invalid combinations, failure and interruption discard the whole response and use the prepared deterministic pair while the investigation context remains valid. Provider errors and partial text never reach public history or cache. Models/configurations that reject the schema also fall back; tests do not establish live compatibility for every configured model.

Only the selected gesture updates the last-two-gesture memory; choosing null does not record an unseen fallback gesture. Cached performances are keyed by character/core/intent/demeanor/catalog version and a hash of the current permission pool, remain capped at 64 per NPC and are revalidated against that pool. Cache hits still process context/emotional state. Ending, travel, inspection or cancellation invalidate pending candidates and best-effort abort provider work. The existing engine/session/revision/projection guards still decide whether a validated response or fallback can commit; a late completion never reopens play or changes memory, emotions, cache or final result.

The browser and CLI render optional narration separately from spoken dialogue; the browser also presents current engine-issued choices. The compatible `text` field remains equal to spoken dialogue. All new automated model tests use fake providers, including adversarial revelations/actions, meaningful answers, gesture variation/silence, configured runtime wiring, stale/cache races and offline play. No live-provider quality/latency or new acceptance-rate claims are made. Authored content still requires editorial review, Alice's debt annotation conflict remains unresolved, and issue #3 remains open. The legacy validator's weaker alphabetic-prefix guarantee is preserved and separately regression-tested rather than described as generally safe.

## Investigation lifecycle

Each investigation starts `active`. Only the first `resolveAccusation(suspectId, true)` for a valid suspect ends it and stores a final result. Cancellation (including non-Boolean confirmation) and unknown confirmed suspects leave active play unchanged. Only literal Boolean `true` confirms an accusation; the CLI still converts a trimmed, case-insensitive `yes` to that Boolean. Final results retain their original text and cannot be changed through returned resolution responses or lifecycle snapshots.

After ending, `askSuspect()`, `inspectEvidence()` and `inspectPublicEvidence()` return `{ kind: 'error', code: 'investigation_ended', text: 'The investigation has ended.' }`, including for cached questions and unknown IDs. Further `resolveAccusation()` calls return that error plus `{ ended: true, result: 'rejected' }`, even if the new accusation is canceled. A rejected command is distinct from the stored final result; retrieve the original result through `getLifecycle().finalResult` or `getPublicView().lifecycle.finalResult`.

Overview, lifecycle, suspect identities and evidence summaries remain readable after ending. Inspection descriptions and NPC answers cannot be retrieved through gameplay commands. A pending dialogue call that settles after ending is discarded before any cache write or answer return, including its fallback on failure. Already-running API requests are not canceled and may still incur cost; no late answer can reopen the investigation.

CLI evidence inspection now uses the guarded engine method. An already-ended investigation displays its stored final text and requests no gameplay input. Quitting the CLI without accusation remains a UI-only exit with no fabricated outcome. Start a separate investigation for a new playthrough; persistence and resetting an existing instance are outside this milestone.

## Local investigation HTTP API

Run `npm.cmd run start:api` to start the API at `http://127.0.0.1:3001`; `npm.cmd start` still launches the CLI. Set `API_PORT` to a number from 1 to 65535 to change the local port. The server binds only to loopback. Both `OPENAI_API_KEY` and `OPENAI_MODEL` optionally enable safe server-side performance selection; without them play remains offline. No client can choose model settings, case truth or private NPC information.

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

State also includes `rooms`, `currentLocationId: "study"` at creation, and each suspect/clue's public room assignment as described above. Dossiers are authored public data; they are not copies of private character profiles.

| Method/path | Exact request body |
| --- | --- |
| `GET /api/investigations/:id` | No body |
| `POST /api/investigations/:id/questions` | `{"suspectId":"alice-mercer","question":"Where were you?","expectedRevision":0}` |
| `POST /api/investigations/:id/questions` (choice alternative) | `{"suspectId":"alice-mercer","choiceId":"ask-alibi","expectedRevision":0}` |
| `POST /api/investigations/:id/evidence/inspect` | `{"evidenceId":"torn-contract","expectedRevision":1}` |
| `POST /api/investigations/:id/travel` | `{"locationId":"garden","expectedRevision":2}` |
| `POST /api/investigations/:id/accusations` | `{"suspectId":"clara-voss","confirmed":false,"expectedRevision":3}` |

Successful commands return 200 with `{ "ok": true, "data": { "sessionId": "...", "revision": 1, "state": {}, "result": {} }, "error": null }`. `state` is the current public view. Substantive question results contain `kind`, `topic`, `text`, `cached`, `turnId`, `narration`, `dialogue`, `demeanor`. For example: `{"kind":"answer","topic":"alibi","text":"I was at home in my room all evening.","cached":false,"turnId":1,"narration":null,"dialogue":"I was at home in my room all evening.","demeanor":"neutral"}`. `text` equals speech only. Unsupported wording returns guidance with null narration and no substantive turn ID. Cache reuse does not skip context/emotional processing, and default repeated answers can vary in delivery. Inspection results contain only ID/name/description. Accusations contain `ended`, `result`, `text`: cancellation is a successful command leaving play active; `confirmed: true` resolves the case. Correct and incorrect accusations are both successful game actions. After ending, commands return 409, while GET still exposes stable final public state and received recent testimony with no available options.

Exactly one of `question` or `choiceId` is required; never send both, a label, history, guessed intent, evidence permission or model settings. Choice IDs use the existing 64-character slug bound. The engine recomputes availability: unknown/no-longer-eligible choices return fixed `409 dialogue_option_unavailable` without mutation/revision advance. A free-text attempt to present uninspected/irrelevant evidence returns accepted guidance (revision advances), without inspection, substantive memory or emotional change. Generic evidence-topic testimony remains available.

Every successful command advances revision once, even a cached answer, inspection, guidance or cancellation. Supply the last observed revision in the next command. Only one command per session runs at a time: overlaps get `409 session_busy`, outdated revisions get `409 stale_revision`, and invalid async completions get `409 stale_response` or `investigation_ended`. Other sessions operate independently. GET during pending work returns the last committed revision. After a lost response, GET before deciding whether to retry; ignore lower-revision network deliveries for the same session and never blindly replay a final accusation. A disconnected accepted command retains its reservation and settles once; disconnect does not roll it back or cancel provider charges.

Travel returns `{ "kind": "travel", "locationId": "garden", "changed": true }`. Same-room travel returns `changed:false` and still advances the adapter revision once. Remote questioning/inspection returns `409 suspect_not_present` / `409 evidence_not_here`; an unknown room returns `404 location_not_found`. These errors do not advance revision. Travel uses the same session reservation, takes no global question slot, and is rejected after ending. Location epochs discard pending dialogue invalidated by leaving and returning, even if HTTP revision and final room ID match the original context.

Errors have a fixed shape, with no raw exception or bearer ID:

```json
{"ok":false,"data":null,"error":{"code":"stale_revision","message":"Refresh state before retrying.","session":{"revision":1}}}
```

`error.session` is null before a session is resolved. Status/code groups: 400 (`invalid_request`, `invalid_json`, `invalid_id`, `invalid_session_id`, `invalid_route`); 403 (`forbidden_host`, `forbidden_origin`); 404 (`route_not_found`, `session_not_found`, `suspect_not_found`, `evidence_not_found`); 405 (`method_not_allowed`, with Allow); 409 (the conflicts above); 413 (`request_too_large`); 415 (`unsupported_media_type`, `unsupported_encoding`); 429 (`question_capacity`); 503 (`session_capacity`); 500 (`internal_error`). Well-formed post-game commands get `investigation_ended` before entity/revision checks; malformed requests still fail validation. Unknown suspects in canceled HTTP accusations are rejected, a stricter input rule than the trusted engine's cancellation shortcut.

Limits: 16 KiB per streamed request body, 1-1000 Unicode characters per trimmed question, strict typed exact-key JSON objects, lowercase slug entity IDs up to 64 characters, 100 sessions, 30-minute idle expiry and four concurrent question operations. No query parameters, compressed requests, arbitrary engine commands or GET bodies are accepted. Headers are limited to 8 KiB, with five-second header/keep-alive and ten-second request-receipt timeouts. Incomplete or malformed transport can close before JSON is deliverable. Sessions in flight are pinned until settlement, and idle expiry restarts then.

Sessions and caches live in one process: restarting or expiring a session loses progress. There are no accounts, persistence, multi-worker coordination or public-hosting guarantees. A token holder can control its session, including attributed question history. Exact local Host/Origin checks, no permissive CORS, and no-store/nosniff/no-referrer response headers protect the local browser boundary; they do not protect against malicious local software. Authored content still requires editorial review. The explicit legacy phraser retains its documented semantic limitations; this milestone does not resolve issue #3 or add a critic.

For the future Vite client, use relative `/api/...` fetch URLs. A future Vite development configuration can contain:

```js
server: {
  proxy: {
    '/api': { target: 'http://127.0.0.1:3001', changeOrigin: true }
  }
}
```

The API accepts exact `http://localhost:5173` and `http://127.0.0.1:5173` origins through the implemented Vite proxy, plus its own local origins. Foreign/null origins, cross-site fetch metadata and nonlocal Host headers are rejected.

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

## Hybrid browser dialogue

The illustrated interrogation now separates optional italic narration from spoken testimony, shows coarse public demeanor, and offers up to six engine-authorized questions alongside free text. Selecting a suggestion preserves your typed draft. History records actual questions and separate narration/speech; refresh can recover only the server's recent eight-turn window, while older received notes stay in this browser until reload or a new investigation.

Choices use the existing questions endpoint with `{suspectId, choiceId, expectedRevision}`; free text uses `{suspectId, question, expectedRevision}`. The client never submits a label or infers evidence relevance. Stale options require explicit refresh without automatic replay. Inspected IDs do not fabricate missing clue descriptions. Deploy the matching stateful API and browser together and start fresh ephemeral sessions.

See the [manual playtest checklist, screenshots and recovery limitations](docs/hybrid-dialogue-playtest.md). Reproduce the offline screenshots with `node web/scripts/dialogue-walkthrough.mjs`; it uses isolated local development servers and no model key.

## Dialogue naturalness refinement

The current offline and configured-performer paths use the same reviewed full-utterance repertoire. Recent speech, openings and structure are filtered before cache lookup; only the actual selected pair updates bounded delivery memory. Narration normally follows two speech-only replies and a relevant context change. The first already-established witness comparison may use one reviewed pause during cooldown. Models cannot invent an exception or combine individually allowed fields.

Run `node scripts/evaluate-dialogue-naturalness.js` for the fixed 18-question-per-NPC baseline comparison (108 matched responses), plus deterministic selector/failure modes. It exits nonzero for a failed mechanical gate and writes [actual transcripts and metrics](docs/dialogue-quality/report.md). Read the separate [testimony equivalence review, subjective assessment and manual checklist](docs/dialogue-quality/editorial-review.md): lexical counts alone do not establish naturalness or complete meaning. No live provider calls are made. The original baseline and historical HW4/HW5 evidence are preserved.

The demeanor label now has optional keyboard-accessible help. [Desktop](docs/dialogue-quality/screenshots/desktop-performance.png) and [mobile](docs/dialogue-quality/screenshots/mobile-performance.png) captures preserve the cinematic room/figure layout. The walkthrough script writes new captures under `docs/dialogue-quality/screenshots` rather than replacing the earlier milestone images. Restart ephemeral sessions after the catalog update; no API schema or model configuration changed.

## Richer dialogue release verification

The four reviewed dialogue changes are archived under `openspec/changes/archive/2026-10-17-*`; their proposals, designs, completed tasks and original evaluation baseline remain available there. The canonical contracts now live under `openspec/specs/` in `stateful-npc-dialogue`, `safe-npc-performance`, `hybrid-dialogue-interface` and `npc-dialogue-naturalness`. The naturalness refinement supersedes the earlier design restriction to verbatim-core performances while retaining exact reviewed-pair validation.

Final verification on 2026-10-17 passed 228 Node tests, 30 Chromium desktop/mobile tests, the production build and privacy checks. Chromium used the documented isolated-server recipe after the default API port was occupied. The user reported a successful final manual playtest. Finite authored alternatives can still repeat; these tests do not establish unrestricted AI factual validation or certify screen-reader behavior. Alice's debt annotation inconsistency and issue #3 remain open.
