// Documentation-only checker: preserves the previous stdin checks and adds
// narrative provenance/layout checks. No game imports, runtime tests or writes.
// Run from any directory: node <path-to-this-file> [--baseline <snapshot-dir>]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const dir = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(dir, '../../..');
const read = (file) => fs.readFileSync(path.join(dir, file), 'utf8');
let assertions = 0;
const check = (condition, message) => {
  assert.ok(condition, message);
  assertions += 1;
};
const files = fs.readdirSync(dir);
for (const file of files) {
  const text = read(file);
  check(!/[\t ]+$/m.test(text), `${file}: trailing whitespace`);
  check(text.endsWith('\n'), `${file}: final newline`);
  if (!file.endsWith('.md')) continue;
  check((text.match(/^# /gm) ?? []).length === 1, `${file}: one title`);
  check((text.match(/^```/gm) ?? []).length % 2 === 0, `${file}: balanced fences`);
  for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (target && !/^[a-z]+:/i.test(target)) {
      check(fs.existsSync(path.resolve(dir, target)), `${file}: link ${target}`);
    }
  }
}
check(/skip_specs: true/.test(read('.openspec.yaml')), 'documentation metadata');
check(!fs.existsSync(path.join(dir, 'specs')), 'no gameplay deltas');
const oracle = JSON.parse(read('greyhaven-design-oracle.json'));
const timeline = read('greyhaven-canonical-timeline.md');
const graph = read('greyhaven-deduction-graph.md');
const walk = read('greyhaven-player-walkthroughs.md');
const disclosure = read('greyhaven-disclosure-design.md');
const dossier = read('greyhaven-character-dossiers.md');
const evidence = read('greyhaven-evidence-catalog.md');
const clarifications = read('greyhaven-clarification-examples.md');
const review = read('greyhaven-narrative-review.md');
const acceptance = read('greyhaven-review-and-acceptance.md');
const minutes = (time) => time.split(':').reduce((h, m) => Number(h) * 60 + Number(m));
check(oracle.locations.length === 5, 'five locations');
check(oracle.clues.length === 8, 'eight clues');
check(oracle.events.length === 13, 'thirteen canonical events');
const events = Object.fromEntries(oracle.events.map((event) => [event.id, event]));
for (const event of oracle.events) {
  const row = timeline.split('\n').find((line) => line.startsWith(`| ${event.id} |`));
  check(Boolean(row), `${event.id}: timeline row exists`);
  check(row.split('|')[2].trim() === event.publishedTime, `${event.id}: time agrees`);
  const [start, end = start] = event.publishedTime.split('-');
  check(event.start === minutes(start) && event.end === minutes(end), `${event.id}: coordinates`);
}
for (const [a, b] of [
  ['T01', 'T05'], ['T01', 'T06'], ['T05', 'T08'], ['T06', 'T08'],
  ['T08', 'T09'], ['T09', 'T10'], ['T10', 'T11'], ['T11', 'T12'], ['T12', 'T13'],
]) check(events[a].end < events[b].start, `${a} precedes ${b}`);
check(events.T02.start === 1230 && events.T12.start === 1242, 'retained bell times');
check(events.T12.start - events.T02.start === 12, 'twelve-minute bell interval');
check(events.T08.start === 1238, 'developer strike minute unchanged');

const adjacency = new Set(['R:C', 'C:R', 'R:T', 'T:R', 'R:B', 'B:R', 'C:T', 'T:C', 'B:F', 'F:B', 'F:T', 'T:F']);
const occupancy = oracle.occupancyCriticalMinutes;
check(Object.keys(occupancy).length === 6, 'six significant people including victim');
for (const [person, intervals] of Object.entries(occupancy)) {
  check(intervals[0][0] === 1225 && intervals.at(-1)[1] === 1243, `${person}: full critical-window coverage`);
  for (let i = 0; i < intervals.length; i += 1) {
    const [start, end, location] = intervals[i];
    check(start < end, `${person}: positive interval`);
    check(oracle.locations.includes(location) || /^travel:[RCBFT]-[RCBFT]$/.test(location), `${person}: valid place`);
    if (!i) continue;
    const previous = intervals[i - 1];
    check(previous[1] === start, `${person}: no gap/overlap`);
    if (!location.startsWith('travel:') && !previous[2].startsWith('travel:') && location !== previous[2]) {
      check(adjacency.has(`${previous[2]}:${location}`), `${person}: connected movement`);
    }
  }
}
const at = (person, time) => occupancy[person]?.find(([a, b]) => a <= time && time < b)?.[2];
for (const time of [1236, 1237, 1238, 1239, 1240]) {
  check(at('Owen', time) === 'B' && at('Jonah', time) === 'F', 'work/hatch coverage');
  check(at('Mara', time) === 'T' && at('Iris', time) === 'T', 'terrace company coverage');
}
check(at('Ruth', 1238) === 'C' && at('Adrian', 1238) === 'C', 'strike opportunity');
check(timeline.includes('The test alone does not cover 20:41-20:43'), 'worksheet end not stretched');
check(dossier.includes('we stayed together for the second signal'), 'post-test mutual testimony');

const known = new Set([...oracle.clues, ...oracle.statements]);
for (const statement of oracle.statements) {
  check((dossier + disclosure).includes(statement), `${statement}: described ownership`);
}
for (const [id, gate] of Object.entries(oracle.gates)) {
  check(known.has(id) && gate.explicitPresentation, `${id}: explicit finite gate`);
  for (const dependency of [...gate.all, ...gate.any]) {
    check(known.has(dependency), `${id}: known dependency ${dependency}`);
  }
}
const visited = new Set();
const active = new Set();
const visit = (id) => {
  if (visited.has(id)) return;
  check(!active.has(id), `no disclosure cycle at ${id}`);
  active.add(id);
  for (const dependency of [...oracle.gates[id].all, ...oracle.gates[id].any]) {
    if (oracle.gates[dependency]) visit(dependency);
  }
  active.delete(id);
  visited.add(id);
};
Object.keys(oracle.gates).forEach(visit);
for (const [name, route] of Object.entries(oracle.routes)) {
  const obtained = new Set([...route.clues, ...route.statements]);
  check(route.clues.length === 4 && route.statements.length === 8, `${name}: finite minimum set`);
  for (const id of obtained) check(known.has(id), `${name}: known source ${id}`);
  for (const id of route.omits) check(!obtained.has(id), `${name}: truly omits ${id}`);
  for (const id of route.statements) {
    const gate = oracle.gates[id];
    if (!gate) continue;
    check(gate.all.every((dep) => obtained.has(dep)), `${name}: all prerequisites ${id}`);
    check(!gate.any.length || gate.any.some((dep) => obtained.has(dep)), `${name}: any prerequisite ${id}`);
  }
  check(graph.includes(`**${route.statements.join(', ')}**`), `${name}: graph source set agrees`);
  const expectedWalk = name === 'A' ? 'O0/R0/R-F/J-B/J-P/I0/I-S/I-F' : 'O0/R0/R-F/M-S/J-B/J-P/J-C/I0';
  check(walk.includes(expectedWalk), `${name}: walkthrough source set agrees`);
}
check(!oracle.routes.A.statements.some((id) => id.startsWith('M')), 'A skips mother entirely');
check(!oracle.routes.A.statements.includes('J-C'), 'A cannot borrow spoken call');
check(['I-S', 'I-F', 'G5'].every((id) => oracle.routes.B.omits.includes(id)), 'B skips key visual route');
check(!oracle.gates['J-C'], 'ordinary call account has no inspection gate');
check(disclosure.includes('J-C is **ungated**'), 'call availability documented');
check(!/J-C requires \*\*G3\*\*|J-C already gated G3/.test(disclosure + clarifications), 'no stale call gate');

for (const [id, text] of Object.entries(oracle.utterances)) {
  check(text.length > 40 && text.length <= 1200, `${id}: bounded reviewed anchor`);
  check(disclosure.includes(text), `${id}: disclosure literal agrees`);
  if (id === 'I-F') check(clarifications.includes(text), 'I-F clarification literal agrees');
  else check(dossier.includes(text), `${id}: dossier literal agrees`);
}
check(oracle.utterances['R-F'].includes('cupboard later'), 'collection and storage separated');
check(oracle.utterances['M-S'].includes('read forty-one and Bell original'), 'positive cover identification');
check(oracle.utterances.O0.includes('could not hear the caller'), 'Owen cannot identify caller');
check(oracle.utterances['I-F'].includes('I did not read a number on what she carried'), 'no invented visual exit identifier');
check(oracle.utterances['I-F'].includes('From the bench I could see the threshold, not the desk'), 'bench versus close view');
check(oracle.utterances['J-C'].includes('Come in, Ruth'), 'heard address');
check(oracle.utterances['J-C'].includes('I came for the original, Adrian'), 'heard answering voice');
check(oracle.call.origin === 'C' && oracle.call.answerLocation === 'F', 'call endpoints');
check(oracle.call.start === events.T06.start && oracle.call.end === events.T06.end, 'call recorded minute labels');
check(events.T07.start <= oracle.call.end && oracle.call.end < events.T08.start, 'arrival heard near end; no strike heard');
check(oracle.call.recorded.length === 2 && !oracle.call.recorded.includes('Ruth identity'), 'log is not audio transcript');
check(evidence.includes('The book does not record the folder wording'), 'log/source boundary explicit');
check(evidence.includes('fixed corded house handset') && evidence.includes('Chart room—direct line'), 'visible endpoints established');
check(!evidence.includes('next to Ruth\'s nursing bag'), 'no bag proximity shortcut');
check(evidence.includes('No draft confession'), 'no convenient written confession');
check(oracle.observations.length === 9, 'nine observation audit entries');
for (const observation of oracle.observations) {
  check(timeline.includes(`| ${observation.id} `), `${observation.id}: perceptual row exists`);
  check(known.has(observation.source) || (observation.id === 'S7' && observation.source === null && observation.release.includes('developer-only')), `${observation.id}: public source or explicitly withheld observation`);
  if (observation.id === 'S9') {
    check(observation.start === events.T13.start && observation.subject === 'Adrian', 'discovery observation at T13');
    continue;
  }
  for (let time = observation.start; time < observation.end; time += 1) {
    check(at(observation.observer, time) === observation.at, `${observation.id}: observer occupancy`);
    check(at(observation.subject, time) === observation.subjectAt, `${observation.id}: subject occupancy`);
  }
}
check(timeline.includes('not a calibrated minimum for running'), 'travel precision limitation');
check(review.includes('Route A: complete public set') && review.includes('Route B: complete public set'), 'separate adversarial reviews');
check((review.match(/^\| Claim \| Supporting public evidence/gm) ?? []).length === 2, 'both full adversarial tables');
check(review.includes('planned revenge') && review.includes('chosen escalation (recommended)'), 'two motive versions');
check(review.includes('After M1/M2') && review.includes('First 2-3 clues'), 'suspicion progression');
check((clarifications.match(/^\| (?:J-|I0|I-|M0|M1|M2|M-|O0|O1|R0|R-)/gm) ?? []).length === 20, 'twenty clarification bodies');
check((acceptance.match(/^\| GH\d\d /gm) ?? []).length === 34, '34 future acceptance scenarios');
check(!acceptance.includes('\n\n| GH27'), 'acceptance extension remains in rendered table');
const tasks = read('tasks.md');
check((tasks.match(/- \[[x ]\]/g) ?? []).length === 32, '32 planning tasks including technical roadmap');

// The approval changes administrative status only, not the narrative payload.
const frozenNarrativeFiles = [
  'greyhaven-story-bible.md', 'greyhaven-canonical-timeline.md',
  'greyhaven-character-dossiers.md', 'greyhaven-relationships.md',
  'greyhaven-evidence-catalog.md', 'greyhaven-deduction-graph.md',
  'greyhaven-disclosure-design.md', 'greyhaven-clarification-examples.md',
  'greyhaven-player-walkthroughs.md', 'greyhaven-narrative-review.md',
  'greyhaven-review-and-acceptance.md',
];
for (const file of frozenNarrativeFiles) {
  check(read(file).includes('> APPROVAL BASELINE (2026-11-06):'), `${file}: approval recorded`);
}
const narrativePayload = { ...oracle };
delete narrativePayload.status;
const narrativeHash = createHash('sha256').update(JSON.stringify(narrativePayload)).digest('hex');
const approvedHash = '5fc7e5b7c8ad430a03f8f70d456072abf5be3b84279875377024523cdd7eec94';
check(narrativeHash === approvedHash, 'approved narrative payload unchanged');
check(oracle.status.startsWith('Approved narrative baseline'), 'fixture approval status');
const decisions = read('greyhaven-implementation-decisions.md');
check(decisions.includes(approvedHash), 'review register agrees with baseline hash');

const technicalFiles = [
  'greyhaven-implementation-roadmap.md', 'greyhaven-architecture-gap-analysis.md',
  'greyhaven-case-data-design.md', 'greyhaven-disclosure-state-machine.md',
  'greyhaven-clarification-design.md', 'greyhaven-vertical-slice.md',
  'greyhaven-regression-strategy.md', 'greyhaven-implementation-decisions.md',
];
for (const file of technicalFiles) check(fs.existsSync(path.join(dir, file)), `${file}: roadmap deliverable`);
const roadmap = read('greyhaven-implementation-roadmap.md');
const stages = [...roadmap.matchAll(/^## Milestone ([A-F]) /gm)];
check(stages.map((m) => m[1]).join('') === 'ABCDEF', 'six stages in approved requested order');
for (let index = 0; index < stages.length; index += 1) {
  const section = roadmap.slice(stages[index].index, stages[index + 1]?.index ?? roadmap.length);
  for (const field of ['Scope/dependency', 'Likely modules', 'State/transitions', 'Risks/tests', 'Acceptance/definition of done']) {
    check(section.includes(field), `stage ${stages[index][1]}: ${field}`);
  }
}
const packages = [...roadmap.matchAll(/\*\*([A-F][1-4])\*\*/g)].map((m) => m[1]);
check(packages.length === 21 && new Set(packages).size === 21, '21 distinct roadmap implementation packages');
check(roadmap.includes('C is merged through PR #16') && roadmap.includes('D is implemented and verified') && roadmap.includes('E-F remain proposed, unstarted and unapproved'), 'execution status preserves separate milestone approvals');
check(!/- \[[x ]\]/.test(roadmap), 'roadmap is not a falsely completed implementation checklist');
check(roadmap.includes('AC-HIDE') && roadmap.includes('AC-BELL'), 'both explicit narrative acceptance conditions');
check(decisions.includes('N-01') && decisions.includes('physically unable to leave'), 'narrow concealment limitation recorded');
for (let index = 1; index <= 10; index += 1) {
  check(decisions.includes(`T-${String(index).padStart(2, '0')}`), 'technical choice recorded');
}
const caseDesign = read('greyhaven-case-data-design.md');
check(caseDesign.includes('data.case') && caseDesign.includes('nested `state`'), 'additive envelope rather than nested state change');
check(caseDesign.includes('GET /api/cases') && caseDesign.includes('immutable'), 'manifest and immutable session');
check(caseDesign.includes('colliding local IDs') && caseDesign.includes('bare string cannot prove'), 'honest cross-case ID boundary');
const slice = read('greyhaven-vertical-slice.md');
check(slice.includes("Do not promise Mara's M1"), 'slice avoids missing-witness shortcut');
check(slice.includes('O0 + G4 + G8') && slice.includes('no solution'), 'approved O1 branch and no preview verdict');
check(slice.includes('mode `preview`'), 'preview mode documented explicitly');
check(slice.includes('declared subset') && slice.includes('full-mode sparse catalogs'), 'restricted preview topic exception');
check((slice.match(/^\| D\d+ /gm) ?? []).length === 10, 'ten future browser slice actions');
const regression = read('greyhaven-regression-strategy.md');
check(regression.includes('knowledge-leak-protection') && regression.includes('test/demeanor.test.js'), 'original security and professor coverage retained');
check(regression.includes('cannot prove') && regression.includes('independent'), 'test epistemic limits retained');

let protectedFiles = null;
const baselineIndex = process.argv.indexOf('--baseline');
if (baselineIndex !== -1) {
  const snapshot = process.argv[baselineIndex + 1];
  check(Boolean(snapshot), 'baseline argument supplied');
  const fingerprints = JSON.parse(fs.readFileSync(path.join(snapshot, 'protected-hashes.json'), 'utf8'));
  for (const [file, expected] of Object.entries(fingerprints)) {
    const current = createHash('sha256').update(fs.readFileSync(path.join(repo, file))).digest('hex');
    check(current === expected, `protected file unchanged: ${file}`);
  }
  const originalLog = fs.readFileSync(path.join(snapshot, 'PLANNING_LOG.md'));
  check(originalLog.length > 1000, 'nonempty original log');
  check(fs.readFileSync(path.join(repo, 'PLANNING_LOG.md')).subarray(0, originalLog.length).equals(originalLog), 'pre-revision log bytes preserved');
  for (const file of frozenNarrativeFiles) {
    const original = fs.readFileSync(path.join(snapshot, file), 'utf8').replace(/\r\n/g, '\n');
    const current = read(file).replace(/\r\n/g, '\n').replace(/\n> APPROVAL BASELINE[^\n]*\n/, '');
    check(current === original, `${file}: pre-approval narrative body preserved`);
  }
  protectedFiles = Object.keys(fingerprints).length;
}
console.log(JSON.stringify({
  result: 'PASS', assertions, files: files.length, events: oracle.events.length,
  observations: oracle.observations.length, routes: 2, facets: 20, futureAcceptanceScenarios: 34,
  milestones: 6, roadmapImplementationPackages: packages.length, approvedNarrativeHash: narrativeHash,
  pendingPlanningTasks: (tasks.match(/- \[ \]/g) ?? []).length, protectedFiles,
  scope: 'Documentation consistency only; no game tests or human fairness certification',
}, null, 2));
