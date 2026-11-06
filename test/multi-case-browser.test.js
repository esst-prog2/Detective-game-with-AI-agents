import test from 'node:test';
import assert from 'node:assert/strict';
import { createInvestigationClient } from '../web/src/api/investigation-client.js';
import { initialState, investigationReducer } from '../web/src/state/investigation-state.js';
import { caseRegistry, createCaseRegistry } from '../src/cases/registry.js';
import { ashcroft } from '../src/cases/ashcroft.js';
import { secondCase } from '../test-support/second-case.js';

const registry = createCaseRegistry({ definitions: [ashcroft, secondCase()] });
const deferred = () => { let resolve; const promise = new Promise((done) => { resolve = done; }); return { resolve, promise }; };
const response = (data) => ({ ok: true, status: 200, json: async () => ({ ok: true, error: null, data }) });
const snapshot = (id = 'ashcroft', token = 'a', revision = 0) => ({ sessionId: token.repeat(64), revision, case: { id, mode: 'full' }, state: registry.createInvestigation(id).getPublicView() });
function app(fetchImpl) {
  let state = initialState;
  const dispatch = (action) => { state = investigationReducer(state, action); };
  return { client: createInvestigationClient({ fetchImpl, emit: dispatch }), get state() { return state; }, dispatch };
}

test('manifest client validates and projects safe metadata without starting a session', async () => {
  const calls = [];
  const application = app(async (url, options) => { calls.push([url, options]); return response({ cases: registry.list().map((item) => ({ ...item, privateCanon: 'MULTICASE_PRIVATE_CANARY' })) }); });
  assert.deepEqual(await application.client.listCases(), registry.list());
  assert.equal(calls[0][0], '/api/cases'); assert.equal(calls[0][1].method, 'GET');
  assert.equal(application.state.snapshot, null);
  for (const cases of [[], [{ id: '../case', title: 'Bad', mode: 'full' }], [{ id: 'bad', title: '', mode: 'full' }], [{ id: 'bad', title: 'Bad', mode: 'preview' }], [...caseRegistry.list(), ...caseRegistry.list()]]) {
    await assert.rejects(app(async () => response({ cases })).client.listCases());
  }
});

test('client preserves {} default; explicit selection sends only caseId and installs matching identity', async () => {
  let body;
  const defaultApp = app(async (_url, options) => { body = JSON.parse(options.body); return response(snapshot()); });
  assert.equal(await defaultApp.client.start(), true); assert.deepEqual(body, {});
  const selected = app(async (_url, options) => { body = JSON.parse(options.body); return response(snapshot('test-harbor')); });
  assert.equal(await selected.client.start('test-harbor'), true);
  assert.deepEqual(body, { caseId: 'test-harbor' });
  assert.deepEqual(selected.state.case, { id: 'test-harbor', mode: 'full' });
  assert.equal(selected.state.snapshot.title, 'Synthetic Harbor Test');
});

test('missing, malformed or mismatched case envelopes fail closed before installing state', async () => {
  for (const identity of [undefined, null, { id: 'test-harbor', mode: 'full' }, { id: 'ashcroft', mode: 'preview' }, { id: '../case', mode: 'full' }]) {
    const data = snapshot(); data.case = identity;
    const application = app(async () => response(data));
    assert.equal(await application.client.start(), false);
    assert.equal(application.state.snapshot, null); assert.equal(application.state.case, null);
  }
});

test('wrong-case mutation and reads cannot install observations, history or state even with correct bearer/revision', async () => {
  for (const command of ['inspect', 'refresh']) {
    let calls = 0;
    const data = snapshot('test-harbor', 'a', 1); data.result = { id: 'silver-cufflink', name: 'Forged clue', description: 'MULTICASE_PRIVATE_CANARY' };
    const application = app(async () => response(++calls === 1 ? snapshot() : data));
    await application.client.start(); const before = application.state.snapshot;
    assert.equal(await application.client[command]('silver-cufflink'), false);
    assert.deepEqual(application.state.snapshot, before); assert.deepEqual(application.state.inspected, {});
    assert.deepEqual(application.state.transcripts, {}); assert.equal(application.state.uncertain, true);
    assert.doesNotMatch(JSON.stringify(application.state), /MULTICASE_PRIVATE_CANARY/);
  }
});

test('failed new selection preserves old case/notes and allows reconciliation only against the old identity', async () => {
  let calls = 0;
  const application = app(async () => {
    calls++;
    if (calls === 2) return { ok: false, status: 400, json: async () => ({ ok: false, data: null, error: { code: 'invalid_request' } }) };
    return response(snapshot());
  });
  await application.client.start(); application.dispatch({ type: 'DRAFT', id: 'alice-mercer', text: 'Keep this draft' });
  assert.equal(await application.client.start('test-harbor'), false);
  assert.deepEqual(application.state.case, { id: 'ashcroft', mode: 'full' });
  assert.equal(application.state.drafts['alice-mercer'], 'Keep this draft');
  assert.equal(await application.client.refresh(), true);
  assert.equal(application.state.snapshot.title, 'The Ashcroft Manor Murder');
});

test('successful different case clears local history, clues, drafts and selection; late old read is discarded', async () => {
  const late = deferred(); let calls = 0;
  const application = app(async () => ++calls === 1 ? response(snapshot()) : calls === 2 ? late.promise : response(snapshot('test-harbor', 'b')));
  await application.client.start();
  application.dispatch({ type: 'DRAFT', id: 'alice-mercer', text: 'Old draft' });
  application.dispatch({ type: 'SUSPECT', id: 'alice-mercer' });
  const pending = application.client.refresh();
  assert.equal(await application.client.start('test-harbor'), true);
  late.resolve(response(snapshot('ashcroft', 'a', 5))); assert.equal(await pending, false);
  assert.equal(application.state.case.id, 'test-harbor'); assert.equal(application.state.revision, 0);
  assert.deepEqual(application.state.drafts, {}); assert.deepEqual(application.state.transcripts, {});
  assert.deepEqual(application.state.inspected, {}); assert.equal(application.state.suspectId, null);
});

test('cancelled former-client generation cannot install a late old-case question', async () => {
  const late = deferred(); let calls = 0;
  const application = app(async () => ++calls === 1 ? response(snapshot()) : calls === 2 ? late.promise : response(snapshot('test-harbor', 'b')));
  await application.client.start(); const question = application.client.ask('alice-mercer', 'Where were you?');
  application.client.dispose(); await application.client.start('test-harbor');
  late.resolve(response({ ...snapshot('ashcroft', 'a', 1), result: { kind: 'answer', text: 'OLD_CASE_REPLY' } }));
  assert.equal(await question, false); assert.deepEqual(application.state.transcripts, {});
  assert.equal(application.state.case.id, 'test-harbor'); assert.doesNotMatch(JSON.stringify(application.state), /OLD_CASE_REPLY/);
});
