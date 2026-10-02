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
