import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { request as httpRequest } from 'node:http';
import { createCaseRegistry, caseRegistry } from '../src/cases/registry.js';
import { ashcroft } from '../src/cases/ashcroft.js';
import { createSessionStore } from '../src/investigation-sessions.js';
import { createInvestigationServer } from '../src/http-api.js';
import { secondCase } from '../test-support/second-case.js';
import { runCli, parseCaseArguments, exampleQuestions } from '../src/cli.js';
import { createInvestigationClient as legacyClient } from '../test-support/legacy-investigation-client.js';

const registryFor = (...fixtures) => createCaseRegistry({ definitions: [ashcroft, ...fixtures] });
async function api(t, options = {}) {
  const store = createSessionStore(options);
  const server = createInvestigationServer({ store });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise((done) => { server.close(done); server.closeAllConnections(); }));
  async function call(path, body, options = {}) {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`, {
      method: body === undefined ? 'GET' : 'POST', headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body), ...options,
    });
    return { status: response.status, body: await response.json() };
  }
  const raw = (headers) => new Promise((resolve, reject) => {
    const req = httpRequest({ hostname: '127.0.0.1', port: server.address().port, path: '/api/cases', headers }, (res) => {
      let text = ''; res.on('data', (chunk) => { text += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(text) }));
    });
    req.on('error', reject); req.end();
  });
  return { store, call, raw };
}
const path = (data, command = '') => `/api/investigations/${data.sessionId}${command ? '/' + command : ''}`;
const assertError = (reply, status, code) => {
  assert.equal(reply.status, status); assert.equal(reply.body.error.code, code); assert.equal(reply.body.data, null);
  assert.doesNotMatch(JSON.stringify(reply.body), /MULTICASE_PRIVATE_CANARY|murdererId|privateCanon/);
};

test('case resolution precedes allocation and permanent identity resists reassignment', () => {
  let allocations = 0, factories = 0;
  const registry = registryFor(secondCase());
  const store = createSessionStore({ registry, generateId: () => (++allocations).toString(16).padStart(64, '0'), investigationFactory: (definition) => { factories++; return registry.createInvestigation(definition.id); } });
  for (const id of [null, 0, '', '../case.js', 'greyhaven', 'missing']) assert.throws(() => store.create(id), { code: 'invalid_request' });
  assert.equal(allocations, 0); assert.equal(factories, 0);
  const entry = store.create('test-harbor');
  for (const key of ['caseId', 'caseVersion', 'case']) assert.throws(() => { entry[key] = 'ashcroft'; }, TypeError);
  assert.throws(() => { entry.case.id = 'ashcroft'; }, TypeError);
  assert.equal(entry.caseId, 'test-harbor'); assert.equal(entry.caseVersion, 'test-v1');
  assert.equal(entry.game.travelTo('test-pier').kind, 'travel');
});

test('manifest is safe and allocation/provider-free; transports retain host/origin/method guards', async (t) => {
  let allocated = 0;
  const { call, raw } = await api(t, { investigationFactory: () => { allocated++; throw Error('Must not execute'); } });
  const list = await call('/api/cases');
  assert.equal(list.status, 200); assert.deepEqual(list.body, { ok: true, data: { cases: caseRegistry.list() }, error: null });
  assert.equal(allocated, 0);
  assertError(await call('/api/cases', {}), 405, 'method_not_allowed');
  assertError(await call('/api/cases', undefined, { headers: { Origin: 'https://evil.example' } }), 403, 'forbidden_origin');
  assertError(await raw({ Host: 'evil.example' }), 403, 'forbidden_host');
  assertError(await call('/api/cases?private=1'), 400, 'invalid_route');
});

test('optional create contract preserves default and additive envelopes, and rejects invalid or unpublished inputs', async (t) => {
  const registry = createCaseRegistry({ definitions: [ashcroft, secondCase()], publishedIds: ['ashcroft'] });
  let ids = 0;
  const { call } = await api(t, { registry, generateId: () => (++ids).toString(16).padStart(64, '0') });
  for (const body of [{ caseId: null }, { caseId: 5 }, { caseId: '' }, { caseId: '../case.js' }, { caseId: 'greyhaven' }, { caseId: 'test-harbor' }, { caseId: 'ashcroft', extra: true }, { mode: 'full' }]) {
    assertError(await call('/api/investigations', body), 400, 'invalid_request');
  }
  assert.equal(ids, 0);
  const implicit = (await call('/api/investigations', {})).body.data;
  const explicit = (await call('/api/investigations', { caseId: 'ashcroft' })).body.data;
  assert.deepEqual(implicit.state, explicit.state);
  for (const data of [implicit, explicit, (await call(path(implicit))).body.data]) {
    assert.deepEqual(Object.keys(data).sort(), ['case', 'revision', 'sessionId', 'state']);
    assert.deepEqual(data.case, { id: 'ashcroft', mode: 'full' });
    assert.equal(Object.hasOwn(data.state, 'case'), false);
  }
});

test('frozen pre-Milestone A browser client completes default HTTP play with additive case envelopes', async (t) => {
  const { call } = await api(t);
  const actions = [], bodies = [];
  const client = legacyClient({ emit: (action) => actions.push(action), fetchImpl: async (url, options) => {
    const body = options.body === undefined ? undefined : JSON.parse(options.body);
    if (body) bodies.push(body);
    const reply = await call(url, body);
    return { ok: reply.status < 400, status: reply.status, json: async () => reply.body };
  } });
  t.after(() => client.dispose());
  assert.equal(await client.start(), true); assert.deepEqual(bodies[0], {});
  assert.equal(await client.ask('alice-mercer', 'Where were you?'), true);
  assert.equal(actions.find((action) => action.command === 'questions' && action.type === 'DATA').result.text, 'I was at home in my room all evening.');
  assert.equal(await client.accuse('clara-voss', true), true);
  assert.equal(actions.at(-2).state.lifecycle.finalResult.result, 'correct');
  assert.equal(await client.refresh(), true);
});

test('two HTTP cases reject foreign actions and switching without revision or private leakage', async (t) => {
  const { call } = await api(t, { registry: registryFor(secondCase()) });
  const a = (await call('/api/investigations', {})).body.data;
  const b = (await call('/api/investigations', { caseId: 'test-harbor' })).body.data;
  assert.equal(b.state.title, 'Synthetic Harbor Test');
  for (const [data, ids] of [[a, ['test-ticket', 'test-keeper', 'test-pier']], [b, ['silver-cufflink', 'clara-voss', 'study']]]) {
    for (const [command, body, code] of [
      ['evidence/inspect', { evidenceId: ids[0] }, 'evidence_not_found'],
      ['questions', { suspectId: ids[1], question: 'Where were you?' }, 'suspect_not_found'],
      ['travel', { locationId: ids[2] }, 'location_not_found'],
      ['accusations', { suspectId: ids[1], confirmed: true }, 'suspect_not_found'],
    ]) assertError(await call(path(data, command), { ...body, expectedRevision: 0 }), 404, code);
    for (const [command, body] of [
      ['questions', { suspectId: data.state.suspects[0].id, question: 'Where were you?' }],
      ['evidence/inspect', { evidenceId: data.state.evidence[0].id }],
      ['travel', { locationId: data.state.currentLocationId }],
      ['accusations', { suspectId: data.state.suspects[0].id, confirmed: true }],
    ]) assertError(await call(path(data, command), { ...body, expectedRevision: 0, caseId: 'ashcroft' }), 400, 'invalid_request');
    const current = (await call(path(data))).body.data;
    assert.equal(current.revision, 0); assert.deepEqual(current.case, data.case); assert.deepEqual(current.state, data.state);
  }
  assert.doesNotMatch(JSON.stringify([a, b]), /MULTICASE_PRIVATE_CANARY|murdererId|privateCanon|approvedContent/);
});

test('concurrent selected sessions keep inspections, testimony, emotion, caches and solutions separate', async (t) => {
  const { call, store } = await api(t, { registry: registryFor(secondCase()) });
  let a = (await call('/api/investigations', {})).body.data;
  let b = (await call('/api/investigations', { caseId: 'test-harbor' })).body.data;
  const b0 = structuredClone(b.state);
  a = (await call(path(a, 'questions'), { suspectId: 'alice-mercer', question: 'Where were you?', expectedRevision: a.revision })).body.data;
  assert.equal(a.result.text, 'I was at home in my room all evening.');
  a = (await call(path(a, 'evidence/inspect'), { evidenceId: 'silver-cufflink', expectedRevision: a.revision })).body.data;
  assert.deepEqual((await call(path(b))).body.data.state, b0);
  b = (await call(path(b, 'questions'), { suspectId: 'test-keeper', question: 'Where were you?', expectedRevision: b.revision })).body.data;
  assert.equal(b.result.text, 'I stayed by the harbor gate.');
  assert.deepEqual(b.state.dialogue.inspectedEvidenceIds, []);
  assert.equal(b.state.dialogue.conversations[0].recentTurns.length, 1);
  assert.equal(a.state.dialogue.conversations[0].recentTurns.length, 1);
  assert.notDeepEqual(store.get(a.sessionId).game.getDialogueDiagnostics(), store.get(b.sessionId).game.getDialogueDiagnostics());
  const wrong = await call(path(b, 'accusations'), { suspectId: 'test-visitor', confirmed: true, expectedRevision: b.revision });
  assert.equal(wrong.body.data.result.text, 'Incorrect. Test Visitor is innocent. The investigation is over.');
  assert.doesNotMatch(JSON.stringify(wrong.body), /test-keeper.*murdered|Clara|MULTICASE_PRIVATE_CANARY/);
  assert.equal((await call(path(a))).body.data.state.lifecycle.status, 'active');
  const correct = await call(path(a, 'accusations'), { suspectId: 'clara-voss', confirmed: true, expectedRevision: a.revision });
  assert.equal(correct.body.data.result.result, 'correct');
  assert.match(correct.body.data.result.text, /complete supporting chain/);
  assertError(await call(path(b, 'travel'), { locationId: 'test-pier', expectedRevision: wrong.body.data.revision }), 409, 'investigation_ended');
});

test('colliding local IDs resolve only within the session, including different culprits and fresh memories', async () => {
  const registry = registryFor(secondCase({ id: 'test-overlap', sharedIds: true }));
  const store = createSessionStore({ registry });
  const a = store.create(), b = store.create('test-overlap'), c = store.create('test-overlap');
  assert.equal(a.game.inspectPublicEvidence('silver-cufflink').name, 'Silver cufflink');
  assert.equal(b.game.inspectPublicEvidence('silver-cufflink').description, 'A stamped harbor ticket.');
  assert.deepEqual(c.game.getPublicView().dialogue.inspectedEvidenceIds, []);
  const [aa, bb] = await Promise.all([a.game.askSuspect('alice-mercer', 'Where were you?'), b.game.askSuspect('alice-mercer', 'Where were you?')]);
  assert.equal(aa.text, 'I was at home in my room all evening.'); assert.equal(bb.text, 'I stayed by the harbor gate.');
  assert.equal(c.game.getPublicView().dialogue.conversations[0].recentTurns.length, 0);
  assert.equal(a.game.resolveAccusation('alice-mercer', true).result, 'incorrect');
  assert.equal(b.game.resolveAccusation('alice-mercer', true).text, 'Correct. Test Keeper murdered Test Victim.');
});

test('pending response in one case cannot commit across replacement or contaminate another', async () => {
  let release; const deferred = new Promise((resolve) => { release = resolve; });
  const registry = registryFor(secondCase());
  const store = createSessionStore({ registry, investigationFactory: (definition) => registry.createInvestigation(definition.id, { performer: { perform: async (context) => { await deferred; return context.performances[0]; } } }) });
  const a = store.create(), b = store.create('test-harbor');
  const before = b.game.getPublicView(); const original = a.game;
  const pending = store.run(a, 0, true, () => original.prepareDialogue('alice-mercer', { question: 'Where were you?' }));
  a.game = registry.createInvestigation('ashcroft');
  release(); await assert.rejects(pending, { code: 'stale_response' });
  assert.equal(a.revision, 0); assert.deepEqual(b.game.getPublicView(), before);
  assert.equal(original.getPublicView().dialogue.conversations[0].recentTurns.length, 0);
});

test('opaque prepared candidates cannot be committed by another case even with colliding local IDs', async () => {
  const registry = registryFor(secondCase({ id: 'test-overlap', sharedIds: true }));
  const a = registry.createInvestigation('ashcroft'), b = registry.createInvestigation('test-overlap');
  const before = b.getPublicView();
  const candidate = await a.prepareDialogue('alice-mercer', { question: 'Where were you?' });
  assert.equal(b.isDialogueCandidate(candidate), false);
  assert.equal(b.commitDialogue(candidate).code, 'stale_response');
  assert.deepEqual(b.getPublicView(), before);
  a.discardDialogue(candidate);
  assert.equal(a.getPublicView().dialogue.conversations[0].recentTurns.length, 0);
});

test('CLI defaults retain prompts/examples; flags select, list and reject without provider work', async () => {
  assert.deepEqual(parseCaseArguments([]), {});
  assert.deepEqual(parseCaseArguments(['--case', 'ashcroft']), { caseId: 'ashcroft' });
  assert.deepEqual(parseCaseArguments(['--list-cases']), { listCases: true });
  for (const args of [['--case'], ['--case', '../case.js'], ['--case', 'greyhaven'], ['--list-cases', 'extra']]) assert.throws(() => parseCaseArguments(args));
  const registry = registryFor(secondCase());
  let output = '', calls = 0;
  const io = { write: (text) => { output += text; }, ask: async () => '5' };
  const createPerformer = async () => { calls++; return null; };
  await runCli(io, { registry, listCases: true, createPerformer });
  assert.match(output, /ashcroft: The Ashcroft Manor Murder/); assert.match(output, /test-harbor: Synthetic Harbor Test/); assert.equal(calls, 0);
  output = ''; await runCli(io, { registry, caseId: 'missing', createPerformer }); assert.equal(calls, 0); assert.match(output, /not available/);
  output = ''; await runCli(io, { createPerformer }); assert.match(output, /One of the three suspects/); assert.match(output, /Investigation closed/);
  assert.equal(exampleQuestions[0], 'Where were you when Victor died?');
  output = ''; await runCli(io, { registry, caseId: 'test-harbor', createPerformer }); assert.match(output, /Synthetic Harbor Test/); assert.match(output, /One of the 2 suspects/);
});
