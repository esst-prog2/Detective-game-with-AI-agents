import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFileSync } from 'node:fs';
import { greyhavenPreview } from '../src/cases/greyhaven-preview.js';
import { ashcroft } from '../src/cases/ashcroft.js';
import { caseRegistry, createCaseRegistry } from '../src/cases/registry.js';
import { validateCasePackage } from '../src/cases/validate-package.js';
import { validateDialogueCatalog } from '../src/data/dialogue-catalog.js';
import { createInvestigation } from '../src/game.js';
import { createSessionStore } from '../src/investigation-sessions.js';
import { createInvestigationServer } from '../src/http-api.js';
import { createOpenAINPCPerformer } from '../src/npc-performance.js';
import { createOpenAIDialoguePhraser } from '../src/dialogue-phraser.js';
import { createInvestigationClient } from '../web/src/api/investigation-client.js';
import { investigationReducer, initialState } from '../web/src/state/investigation-state.js';
import { runCli } from '../src/cli.js';
import { M0, O0, O1, work, guarded, reason, presentation } from '../test-support/greyhaven-preview-oracle.js';

const mara = 'mara-vale', owen = 'owen-vale';
const game = (adapters) => caseRegistry.createInvestigation('greyhaven-preview', adapters);
const ask = (g, q, id = owen) => g.askSuspect(id, q);
const snapshot = (g) => g.getDialogueDiagnostics();
const choices = (g, id = owen) => g.getPublicView().dialogue.conversations.find((row) => row.suspectId === id).options;
async function ready(g, order = ['pump-worksheet', 'repayment-demand']) {
  g.travelTo('boathouse'); await ask(g, 'Where were you?'); for (const id of order) g.inspectPublicEvidence(id);
}

test('real preview is validated, has exactly approved entities and contains no solution or future cores', () => {
  assert.deepEqual(validateCasePackage(greyhavenPreview), []);
  assert.deepEqual(greyhavenPreview.data.suspects.map((p) => p.name), ['Mara Vale', 'Owen Vale']);
  assert.deepEqual(greyhavenPreview.data.rooms.map((r) => r.id), ['reception', 'boathouse']);
  assert.deepEqual(greyhavenPreview.data.evidence.map((e) => e.id), ['pump-worksheet', 'repayment-demand']);
  assert.equal(Object.hasOwn(greyhavenPreview, 'solution'), false); assert.equal(Object.hasOwn(greyhavenPreview.data, 'murdererId'), false);
  assert.doesNotMatch(JSON.stringify(greyhavenPreview), /Ruth|20:38|Bell original|mara-revised|mara-reason/);
  assert.equal(caseRegistry.defaultCaseId, 'ashcroft'); assert.equal(caseRegistry.resolve('greyhaven'), null);
});

const invalid = {
  'solution': (p) => { p.solution = { murdererId: owen }; },
  'murderer data': (p) => { p.data.murdererId = owen; },
  'private full canon': (p) => { p.privateCanon = { murderer: 'hidden' }; },
  'unknown capability': (p) => { p.canAccuse = true; },
  'untrusted skip validation': (p) => { p.skipValidation = true; },
  'absent profile': (p) => { delete p.previewProfile; },
  'unknown profile field': (p) => { p.previewProfile.skipTopics = true; },
  'foreign profile owner': (p) => { p.previewProfile.subjects[0].suspectId = 'ruth-bell'; },
  'duplicate profile owner': (p) => { p.previewProfile.subjects[0].suspectId = owen; },
  'empty topics': (p) => { p.previewProfile.subjects[0].topics = []; },
  'unknown subject': (p) => { p.previewProfile.subjects[0].topics = ['secret']; },
  'duplicate subject': (p) => { p.previewProfile.subjects[0].topics = ['alibi', 'alibi']; },
  'declared missing subject': (p) => { p.previewProfile.subjects[0].topics.push('motive'); },
  'undeclared base subject': (p) => { p.previewProfile.subjects[0].topics = ['motive']; },
  'undeclared response': (p) => { p.data.suspects[0].responses.motive = { approvedContent: 'hidden', fallbackText: 'hidden' }; },
  'foreign gate': (p) => { p.catalog.policy.rules[0].gate.alternatives[0][1].evidenceId = 'silver-cufflink'; },
  'cross-owner facet': (p) => { p.catalog.policy.facets[0].suspectId = owen; },
  'foreign case': (p) => { p.catalog.policy.caseId = 'ashcroft'; },
  'unsafe public metadata': (p) => { p.publicMetadata.murdererId = owen; },
  'unknown mode': (p) => { p.mode = 'demo'; },
  'wrong metadata mode': (p) => { p.publicMetadata.mode = 'full'; },
  'executable loader': (p) => { p.load = () => {}; },
};
for (const [name, mutate] of Object.entries(invalid)) test(`preview profile rejects ${name}`, () => {
  const p = structuredClone(greyhavenPreview); mutate(p);
  assert.notEqual(validateCasePackage(p).length, 0);
  assert.throws(() => createCaseRegistry({ definitions: [p], defaultCaseId: p.id }));
});

test('full profile remains strict and preview construction requires explicit trusted mode/profile', () => {
  assert.notEqual(validateDialogueCatalog(greyhavenPreview.catalog, greyhavenPreview.data).length, 0);
  const p = structuredClone(greyhavenPreview); p.mode = 'full'; p.publicMetadata.mode = 'full';
  p.solution = { murdererId: owen }; p.data.murdererId = owen;
  assert.notEqual(validateCasePackage(p).length, 0); delete p.previewProfile;
  assert.notEqual(validateCasePackage(p).length, 0);
  const full = structuredClone(ashcroft); full.previewProfile = greyhavenPreview.previewProfile;
  assert.notEqual(validateCasePackage(full).length, 0);
  assert.throws(() => createInvestigation({ data: greyhavenPreview.data, dialogueCatalog: greyhavenPreview.catalog,
    caseContext: { id: 'greyhaven-preview', version: 'v1' } }));
});

for (const order of [['pump-worksheet', 'repayment-demand'], ['repayment-demand', 'pump-worksheet']]) test(`public actions earn O1 in clue order ${order}`, async () => {
  const g = game(); assert.ok((await ask(g, 'Where were you?', mara)).dialogue.endsWith(M0));
  g.travelTo('boathouse'); assert.ok((await ask(g, 'Where were you?')).dialogue.endsWith(O0));
  assert.ok((await ask(g, 'What do you mean by work?')).dialogue.endsWith(work));
  assert.equal((await ask(g, presentation)).kind, 'unsupported');
  for (const id of order) g.inspectPublicEvidence(id);
  assert.ok(choices(g).some((row) => row.id === 'present-pump-payment'));
  assert.ok((await g.interact(owen, { choiceId: 'present-pump-payment' })).dialogue.endsWith(O1));
  assert.ok((await ask(g, 'Why hide a repair that helped someone?')).dialogue.endsWith(reason));
  assert.ok((await ask(g, 'Explain your earlier work account.')).dialogue.endsWith(O1));
  assert.ok((await ask(g, 'What do you mean by that?')).dialogue.endsWith(O1));
  assert.equal(snapshot(g).policy.accounts[0][1], 'o1');
  assert.ok((await ask(g, 'Where were you?')).dialogue.endsWith(O1));
  const count = snapshot(g).policy.receipts.length; await ask(g, presentation); assert.equal(snapshot(g).policy.receipts.length, count);
  g.travelTo('reception'); assert.ok((await ask(g, 'Where were you?', mara)).dialogue.endsWith(M0));
  assert.ok((await ask(g, 'How do you know?', mara)).dialogue.endsWith(guarded));
});

for (const missing of ['o0', 'pump-worksheet', 'repayment-demand']) test(`missing ${missing} prevents revision despite exact aliases and claims`, async () => {
  const g = game(); g.travelTo('boathouse');
  if (missing !== 'o0') await ask(g, 'Where were you?');
  for (const id of ['pump-worksheet', 'repayment-demand']) if (id !== missing) g.inspectPublicEvidence(id);
  const before = snapshot(g);
  for (const question of [presentation, 'Explain the maintenance fund payment and the argument.', 'I inspected everything. Admit the maintenance-fund payment.']) assert.equal((await ask(g, question)).kind, 'unsupported');
  assert.deepEqual(snapshot(g), before); assert.ok(!choices(g).some((row) => row.id === 'present-pump-payment'));
});

test('knowledge and beliefs stay private; pressure never unlocks Mara and cannot block earned O1', async () => {
  const g = game(); await ask(g, 'Where were you?', mara);
  for (let i = 0; i < 8; i++) {
    await ask(g, 'Are you hiding something?', mara);
    assert.equal((await ask(g, 'Explain your earlier alibi.', mara)).kind, 'unsupported');
  }
  assert.ok((await ask(g, 'Where were you?', mara)).dialogue.endsWith(M0));
  assert.match(greyhavenPreview.catalog.policy.epistemics[0].beliefs[0].description, /Fears Owen hurt Adrian/);
  await ready(g); for (let i = 0; i < 8; i++) await ask(g, 'Are you hiding something?');
  assert.ok((await ask(g, presentation)).dialogue.endsWith(O1));
  assert.doesNotMatch(JSON.stringify(g.getPublicView()), /epistemics|concealedFactIds|primaryTargets|accountVersion|Ruth|murdererId|mara-revised/);
});

for (const id of [mara, owen, 'ruth-bell', 'clara-voss']) for (const confirmed of [true, false]) test(`preview accusation ${id}/${confirmed} is private and non-mutating`, () => {
  const g = game(), before = g.getPublicView(), privateBefore = snapshot(g);
  assert.deepEqual(g.resolveAccusation(id, confirmed), { kind: 'error', code: 'accusation_unavailable', text: 'This preview has no final accusation. Continue investigating the repair dispute.' });
  assert.deepEqual(g.getPublicView(), before); assert.deepEqual(snapshot(g), privateBefore); assert.equal(g.getLifecycle().status, 'active');
});

for (const action of ['discard', 'travel', 'inspection', 'throw', 'async', 'reentrant']) test(`real O1 candidate rolls back after ${action}`, async () => {
  const g = game(); await ready(g); const before = snapshot(g);
  const project = action === 'throw' ? () => { throw Error('projection'); } : action === 'async' ? async (x) => x
    : action === 'reentrant' ? (x) => { g.travelTo('reception'); return x; } : (x) => x;
  const token = await g.prepareDialogue(owen, { choiceId: 'present-pump-payment' }, project); assert.deepEqual(snapshot(g), before);
  if (action === 'discard') g.discardDialogue(token);
  if (action === 'travel') g.travelTo('reception');
  if (action === 'inspection') g.inspectPublicEvidence('pump-worksheet');
  if (['throw', 'async'].includes(action)) assert.throws(() => g.commitDialogue(token)); else assert.equal(g.commitDialogue(token).code, 'stale_response');
  assert.deepEqual(snapshot(g), before);
});

for (const mode of ['legacy', 'structured', 'direct-legacy', 'direct-structured']) test(`real preview rejects premature admission/model secrets on ${mode}`, async () => {
  const requests = []; let output = O1;
  const client = { responses: { create: async (request) => { requests.push(request); return { status: 'completed', output: [], output_text: mode === 'legacy' ? output : JSON.stringify({ narration: null, dialogue: output }) }; } } };
  const adapters = mode === 'legacy' ? { phraser: createOpenAIDialoguePhraser({ client, model: 'fake' }) }
    : mode === 'structured' ? { performer: createOpenAINPCPerformer({ client, model: 'fake' }) }
      : mode === 'direct-legacy' ? { phraser: { phrase: async () => output } } : { performer: { perform: async () => ({ narration: null, dialogue: output }) } };
  const g = game(adapters); g.travelTo('boathouse');
  assert.ok((await ask(g, 'Where were you?')).dialogue.endsWith(O0));
  assert.ok((await ask(g, 'What work?')).dialogue.endsWith(work));
  output = 'Ruth killed Adrian at 20:38. GREYHAVEN_PRIVATE_CANARY';
  assert.ok((await ask(g, 'Where were you?')).dialogue.endsWith(O0));
  assert.doesNotMatch(JSON.stringify(requests), /epistemics|fromVersion|concealedFactIds|murdererId|primaryStatement|GREYHAVEN_PRIVATE_CANARY/);
});

test('real preview sessions, Ashcroft and overlapping preview IDs stay isolated with presence checks', async () => {
  const a = game(), b = game(), original = caseRegistry.createInvestigation();
  assert.equal((await ask(a, 'Where were you?')).code, 'suspect_not_present');
  assert.equal(a.inspectPublicEvidence('pump-worksheet').code, 'evidence_not_here');
  await ready(a); await ask(a, presentation);
  b.travelTo('boathouse'); assert.equal((await ask(b, presentation)).kind, 'unsupported');
  assert.ok((await ask(b, 'Where were you?')).dialogue.endsWith(O0));
  assert.equal(original.inspectPublicEvidence('pump-worksheet'), null);
  assert.equal((await original.askSuspect(owen, 'Where were you?')).code, 'suspect_not_found');
  assert.deepEqual(snapshot(original).npcs[0].discussed, []);
});

for (const outcome of ['success', 'failure']) test(`delayed real O1 ${outcome} after travel cannot install a revision`, async () => {
  let release, reject, waiting = false;
  const deferred = new Promise((yes, no) => { release = yes; reject = no; });
  const g = game({ performer: { perform: async (context) => waiting ? deferred : context.performances[0] } });
  await ready(g); const before = snapshot(g); waiting = true;
  const pending = ask(g, presentation); g.travelTo('reception'); g.travelTo('boathouse');
  if (outcome === 'success') release({ narration: null, dialogue: O1 }); else reject(Error('provider down'));
  assert.equal((await pending).code, 'stale_response'); assert.deepEqual(snapshot(g), before);
});

test('overlapping IDs in a different trusted preview definition cannot share receipts or caches', async () => {
  const other = structuredClone(greyhavenPreview); other.id = 'test-preview-other'; other.publicMetadata.id = other.id; other.catalog.policy.caseId = other.id;
  const registry = createCaseRegistry({ definitions: [greyhavenPreview, other], defaultCaseId: 'greyhaven-preview' });
  const a = registry.createInvestigation('greyhaven-preview'), b = registry.createInvestigation(other.id);
  await ready(a); await ask(a, presentation); b.travelTo('boathouse');
  assert.equal((await ask(b, presentation)).kind, 'unsupported'); assert.equal(snapshot(b).policy.caseId, other.id);
  assert.deepEqual(snapshot(b).policy.receipts, []); assert.equal(snapshot(b).npcs[1].cacheSize, 0);
});

test('all authored semantic bodies match independently reviewed literal anchors', () => {
  const bodies = greyhavenPreview.catalog.cores.map((row) => row.approvedContent);
  assert.deepEqual(bodies, [M0, O0, O1, guarded, work, O1, reason]);
  const docs = ['greyhaven-character-dossiers.md', 'greyhaven-disclosure-design.md', 'greyhaven-clarification-examples.md'].map((p) => readFileSync(`openspec/changes/design-relationship-driven-mystery/${p}`, 'utf8')).join('\n');
  for (const text of [M0, O0, O1, guarded, work, reason]) assert.ok(docs.includes(text));
});

test('HTTP rejects preview verdicts/client capabilities without incrementing revision and still admits O1 normally', async (t) => {
  const store = createSessionStore(), server = createInvestigationServer({ store }); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); server.close(); });
  const root = `http://127.0.0.1:${server.address().port}/api/investigations`;
  const post = async (url, body) => { const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); return { status: res.status, body: await res.json() }; };
  const created = (await post(root, { caseId: 'greyhaven-preview' })).body.data, url = `${root}/${created.sessionId}`;
  for (const id of [mara, owen, 'ruth-bell']) {
    const result = await post(`${url}/accusations`, { expectedRevision: 0, suspectId: id, confirmed: true });
    assert.equal(result.status, 409); assert.equal(result.body.error.code, 'accusation_unavailable'); assert.equal(store.get(created.sessionId).revision, 0);
  }
  assert.equal((await post(`${url}/questions`, { expectedRevision: 0, suspectId: mara, question: 'Where were you?', mode: 'full' })).status, 400);
  let revision = 0;
  for (const [action, body] of [['travel', { locationId: 'boathouse' }], ['questions', { suspectId: owen, question: 'Where were you?' }],
    ['evidence/inspect', { evidenceId: 'pump-worksheet' }], ['evidence/inspect', { evidenceId: 'repayment-demand' }], ['questions', { suspectId: owen, choiceId: 'present-pump-payment' }]]) {
    const result = await post(`${url}/${action}`, { ...body, expectedRevision: revision++ }); assert.equal(result.status, 200);
    assert.doesNotMatch(JSON.stringify(result.body), /Ruth|20:38|epistemics|primaryTargets|accountVersion|murdererId/);
    if (action === 'questions' && body.choiceId) assert.ok(result.body.data.result.dialogue.endsWith(O1));
  }
});

test('client binds manifest preview mode and starts a clean default case after receiving preview testimony', async () => {
  const g = game(); await ready(g); await ask(g, presentation); let state = initialState;
  const client = createInvestigationClient({ emit: (action) => { state = investigationReducer(state, action); }, fetchImpl: async (url, options) => ({ ok: true, status: 200, json: async () => ({ ok: true, error: null,
    data: url === '/api/cases' ? { cases: caseRegistry.list() } : JSON.parse(options.body).caseId === 'greyhaven-preview'
      ? { sessionId: 'a'.repeat(64), revision: 0, case: { id: 'greyhaven-preview', mode: 'preview' }, state: g.getPublicView() }
      : { sessionId: 'b'.repeat(64), revision: 0, case: { id: 'ashcroft', mode: 'full' }, state: caseRegistry.createInvestigation().getPublicView() } }) }) });
  await client.listCases(); assert.equal(await client.start('greyhaven-preview'), true); assert.equal(state.case.mode, 'preview');
  assert.ok(state.transcripts[owen].some((row) => row.dialogue.includes(O1)));
  assert.equal(await client.start(), true); assert.deepEqual(state.case, { id: 'ashcroft', mode: 'full' }); assert.deepEqual(state.transcripts, {}); assert.deepEqual(state.inspected, {});
});

test('client rejects a preview session relabeled as a full case after manifest selection', async () => {
  let state = initialState;
  const client = createInvestigationClient({ emit: (action) => { state = investigationReducer(state, action); }, fetchImpl: async (url) => ({ ok: true, status: 200,
    json: async () => ({ ok: true, error: null, data: url === '/api/cases' ? { cases: caseRegistry.list() }
      : { sessionId: 'a'.repeat(64), revision: 0, case: { id: 'greyhaven-preview', mode: 'full' }, state: game().getPublicView() } }) }) });
  await client.listCases(); assert.equal(await client.start('greyhaven-preview'), false); assert.equal(state.snapshot, null);
});

test('preview CLI example questions advertise only currently eligible options', async () => {
  const inputs = ['3', '5'], output = [];
  await runCli({ write: (line) => output.push(line), ask: async () => inputs.shift() }, { game: game(), caseId: 'greyhaven-preview' });
  assert.doesNotMatch(output.join(''), /Why hide a repair|maintenance-fund payment and the argument|four hundred and eighty/);
  assert.ok(output.join('').includes('Where were you when the victim died?'));
});

test('actual CLI can explore the preview, clarify, earn O1 and continue without a verdict', async () => {
  const inputs = ['1', '1', 'Where were you?', '6', '2', '1', '1', 'Where were you?', '1', '1', 'What work?', '2', '1', '2', '2', '1', '1', presentation, '1', '1', 'Why hide a repair that helped someone?', '4', '5'];
  const output = []; const g = game();
  await runCli({ write: (text) => output.push(text), ask: async () => { assert.ok(inputs.length); return inputs.shift(); } }, { game: g, caseId: 'greyhaven-preview' });
  assert.equal(inputs.length, 0); assert.ok(output.join('').includes(O1)); assert.ok(output.join('').includes(work)); assert.ok(output.join('').includes(reason));
  assert.doesNotMatch(output.join(''), /Choose the murderer|Correct\.|Incorrect\.|Ruth/); assert.equal(g.getLifecycle().status, 'active');
});
