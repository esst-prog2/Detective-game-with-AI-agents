import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { disclosureCase } from '../test-support/disclosure-case.js';
import { createCaseRegistry, caseRegistry } from '../src/cases/registry.js';
import { createSessionStore } from '../src/investigation-sessions.js';
import { createInvestigationServer } from '../src/http-api.js';
import { createOpenAINPCPerformer } from '../src/npc-performance.js';
import { createOpenAIDialoguePhraser } from '../src/dialogue-phraser.js';

const keeper = 'test-keeper', witness = 'test-visitor';
const initial = 'The visitor stayed with me on the pier. There was no visit to the store.';
const revised = 'I saw the visitor enter the store. I did not see what happened inside.';
const ledger = 'I put the duplicate ledger under the stair.';
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
function setup(options = {}) {
  const definition = disclosureCase();
  const registry = createCaseRegistry({ definitions: [definition], defaultCaseId: definition.id });
  return { registry, game: registry.createInvestigation(definition.id, options) };
}
async function ready(game) {
  game.inspectPublicEvidence('test-ticket');
  await game.askSuspect(keeper, 'Where were you?');
  await game.askSuspect(witness, 'Where were you?');
  await game.askSuspect(witness, 'Did you see anyone suspicious?');
}

for (const action of ['travel', 'inspection', 'cancel', 'end']) for (const settle of ['success', 'failure']) test(`disclosure ${settle} invalidated by ${action} installs no account/receipt/emotion/cache changes`, async () => {
  const pending = deferred(); let wait = false;
  const { game } = setup({ performer: { perform: async (context) => wait ? pending.promise : context.performances[0] } });
  await ready(game); const before = game.getDialogueDiagnostics(); wait = true;
  const question = game.askSuspect(keeper, 'Reconsider the visit.');
  assert.equal((await game.askSuspect(keeper, 'Reconsider the visit.')).code, 'session_busy');
  if (action === 'travel') { game.travelTo('test-office'); game.travelTo('test-pier'); }
  if (action === 'inspection') game.inspectPublicEvidence('test-ledger');
  if (action === 'cancel') game.resolveAccusation(keeper, false);
  if (action === 'end') game.resolveAccusation(witness, true);
  if (settle === 'success') pending.resolve({ narration: null, dialogue: revised }); else pending.reject(Error('DISCLOSURE_PRIVATE_CANARY'));
  assert.equal((await question).code, action === 'end' ? 'investigation_ended' : 'stale_response');
  assert.deepEqual(game.getDialogueDiagnostics(), before);
  assert.equal(game.getPublicView().dialogue.conversations[0].recentTurns.some((turn) => turn.dialogue.includes(revised)), false);
  if (action === 'end') assert.equal(game.getLifecycle().finalResult.text, 'Incorrect. Test Visitor is innocent. The investigation is over.');
});

test('explicit discard and throwing/asynchronous/reentrant projections install none of a prepared transition', async () => {
  for (const mode of ['discard', 'throw', 'async', 'reentrant']) {
    const { game } = setup(); await ready(game); const before = game.getDialogueDiagnostics();
    const project = mode === 'throw' ? () => { throw Error('projection'); }
      : mode === 'async' ? async (value) => value : mode === 'reentrant' ? (value) => { game.travelTo('test-office'); return value; } : (value) => value;
    const candidate = await game.prepareDialogue(keeper, { choiceId: 'reconsider-visit' }, project);
    if (mode === 'discard') game.discardDialogue(candidate);
    if (mode === 'throw') assert.throws(() => game.commitDialogue(candidate), /projection/);
    else if (mode === 'async') assert.throws(() => game.commitDialogue(candidate), /synchronous/);
    else assert.equal(game.commitDialogue(candidate).code, 'stale_response');
    assert.deepEqual(game.getDialogueDiagnostics(), before);
    assert.equal(game.isDialogueCandidate(candidate), false);
  }
});

for (const guard of ['reservation', 'revision', 'identity', 'game', 'projection']) test(`session ${guard} rejection discards all staged disclosure changes`, async () => {
  const { registry } = setup();
  const store = createSessionStore({ registry }); const entry = store.create(); const game = entry.game;
  await ready(game); const before = game.getDialogueDiagnostics(); const started = deferred(), release = deferred();
  const operation = async () => { const candidate = await game.prepareDialogue(keeper, { choiceId: 'reconsider-visit' }); started.resolve(); await release.promise; return candidate; };
  const pending = store.run(entry, 0, true, operation); await started.promise;
  if (guard === 'reservation') entry.reservation = Symbol('replaced');
  if (guard === 'revision') entry.revision = 7;
  if (guard === 'identity') entry.id = 'f'.repeat(64);
  if (guard === 'game') entry.game = registry.createInvestigation();
  if (guard === 'projection') entry.game.getPublicView = () => { throw Error('projection'); };
  release.resolve();
  await assert.rejects(pending, guard === 'projection' ? /projection/ : { code: 'stale_response' });
  assert.deepEqual(game.getDialogueDiagnostics(), before);
});

for (const mode of ['legacy', 'structured', 'injected-legacy', 'injected-structured']) {
  for (const attack of ['premature-secret', 'old-account', 'other-speaker', 'invented-fact']) test(`${mode} rejects ${attack} at current disclosure authority`, async () => {
    let output = attack === 'premature-secret' ? ledger : attack === 'old-account' ? initial
      : attack === 'other-speaker' ? 'I saw the storekeeper alive after that visit.' : 'I committed the murder. DISCLOSURE_PRIVATE_CANARY';
    const seen = [];
    const client = { responses: { create: async (request) => { seen.push(request); return { status: 'completed', output: [],
      output_text: mode === 'legacy' ? output : JSON.stringify({ narration: null, dialogue: output }) }; } } };
    const options = mode === 'legacy' ? { phraser: createOpenAIDialoguePhraser({ client, model: 'offline-fake' }) }
      : mode === 'structured' ? { performer: createOpenAINPCPerformer({ client, model: 'offline-fake' }) }
        : mode === 'injected-legacy' ? { phraser: { phrase: async () => output } } : { performer: { perform: async () => ({ narration: null, dialogue: output }) } };
    const { game } = setup(options);
    if (attack !== 'premature-secret') await ready(game);
    const result = await game.askSuspect(keeper, attack === 'premature-secret' ? 'Where were you?' : 'Reconsider the visit.');
    assert.ok(result.text.endsWith(attack === 'premature-secret' ? initial : revised));
    const diagnostics = game.getDialogueDiagnostics();
    assert.equal(diagnostics.policy.receipts.some((receipt) => receipt.statementId === 'keeper-ledger-disclosure'), false);
    assert.equal(diagnostics.npcs[0].turns.at(-1).dialogue, result.text);
    assert.equal(diagnostics.npcs[0].cache.some(([, value]) => value.text.includes('DISCLOSURE_PRIVATE_CANARY') || value.text === ledger), false);
    if (attack === 'old-account') {
      const fresh = await game.askSuspect(keeper, 'Where were you?'); assert.ok(fresh.text.endsWith(revised)); assert.equal(fresh.text.includes(initial), false);
    }
    for (const request of seen) {
      assert.equal(request.store, false);
      assert.doesNotMatch(JSON.stringify(request), /DISCLOSURE_PRIVATE_CANARY|epistemics|keeper-whereabouts|fromVersion|firstCommittedTurn|raw question|privateFacts/);
      const context = JSON.parse(request.input);
      assert.deepEqual(Object.keys(context).sort(), mode === 'legacy' ? ['performances', 'style'] : ['demeanor', 'intent', 'performances', 'style']);
    }
  });
}

test('cached old account cannot be selected after revision; cache identity contains case/version/policy revision', async () => {
  const { game } = setup(); await ready(game);
  const before = game.getDialogueDiagnostics().npcs[0].cache;
  assert.ok(before.some(([key, value]) => key.startsWith('test-disclosure:test-v1:') && value.text === initial));
  await game.askSuspect(keeper, 'Reconsider the visit.');
  for (let i = 0; i < 6; i++) assert.ok((await game.askSuspect(keeper, 'Where were you?')).text.endsWith(revised));
  assert.equal(Object.fromEntries(game.getDialogueDiagnostics().policy.accounts)['keeper-whereabouts'], 'v1');
  const candidate = await game.prepareDialogue(keeper, { question: 'Where were you?' });
  const beforeInvalidation = game.getDialogueDiagnostics(); game.inspectPublicEvidence('test-ticket');
  assert.equal(game.commitDialogue(candidate).code, 'stale_response'); assert.deepEqual(game.getDialogueDiagnostics(), beforeInvalidation);
});

test('configured performer timeout uses authorized revised fallback and an ignored late result cannot alter policy', async () => {
  const late = deferred(); let delay = false;
  const performer = createOpenAINPCPerformer({ model: 'offline-fake', timeoutMs: 10, client: { responses: { create: async (request) => {
    if (delay) return late.promise;
    return { status: 'completed', output: [], output_text: JSON.stringify(JSON.parse(request.input).performances[0]) };
  } } } });
  const { game } = setup({ performer }); await ready(game); delay = true;
  assert.ok((await game.askSuspect(keeper, 'Reconsider the visit.')).text.endsWith(revised));
  const after = game.getDialogueDiagnostics();
  late.resolve({ status: 'completed', output: [], output_text: JSON.stringify({ narration: null, dialogue: initial }) });
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(game.getDialogueDiagnostics(), after);
});

test('an opaque candidate cannot cross games or case identities even with identical local IDs', async () => {
  const one = setup(), two = setup(); await ready(one.game); const before = two.game.getDialogueDiagnostics();
  const candidate = await one.game.prepareDialogue(keeper, { choiceId: 'reconsider-visit' });
  assert.equal(two.game.commitDialogue(candidate).code, 'stale_response'); assert.deepEqual(two.game.getDialogueDiagnostics(), before);
  one.game.discardDialogue(candidate);
});

test('real revisioned HTTP actions exercise two-route disclosure without adding public/private fields or production fixtures', async (t) => {
  const { registry } = setup(); const store = createSessionStore({ registry }); const server = createInvestigationServer({ store });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise((done) => { server.close(done); server.closeAllConnections(); }));
  const call = async (path, body) => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`, { method: body === undefined ? 'GET' : 'POST',
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
    return { status: response.status, body: await response.json() };
  };
  for (const branch of ['sighting', 'crime_details']) {
    let data = (await call('/api/investigations', {})).body.data;
    const path = `/api/investigations/${data.sessionId}`;
    const early = await call(path + '/questions', { suspectId: keeper, choiceId: 'reconsider-visit', expectedRevision: 0 });
    assert.equal(early.status, 409); assert.equal(early.body.error.code, 'dialogue_option_unavailable');
    assert.equal(store.get(data.sessionId).revision, 0);
    const commands = [
      ['evidence/inspect', { evidenceId: 'test-ticket' }], ['questions', { suspectId: keeper, question: 'Where were you?' }],
      ['questions', { suspectId: witness, question: 'Where were you?' }],
      ['questions', { suspectId: witness, question: branch === 'sighting' ? 'Did you see anyone suspicious?' : 'What happened when the victim died?' }],
      ['questions', { suspectId: keeper, choiceId: 'reconsider-visit' }],
    ];
    for (const [action, input] of commands) {
      const response = await call(path + '/' + action, { ...input, expectedRevision: data.revision });
      assert.equal(response.status, 200); data = response.body.data;
      assert.doesNotMatch(JSON.stringify(data), /DISCLOSURE_PRIVATE_CANARY|epistemics|keeper-whereabouts|accountKey|firstCommittedTurn|fromVersion/);
      assert.deepEqual(Object.keys(data).sort(), ['case', 'result', 'revision', 'sessionId', 'state']);
    }
    assert.ok(data.result.text.endsWith(revised)); assert.equal(data.revision, 5);
    const after = store.get(data.sessionId).game.getDialogueDiagnostics();
    const foreign = await call(path + '/questions', { suspectId: 'alice-mercer', question: 'Reconsider the visit.', expectedRevision: data.revision });
    assert.equal(foreign.status, 404);
    const extra = await call(path + '/questions', { suspectId: keeper, question: 'Reconsider the visit.', accountVersion: 'v1', expectedRevision: data.revision });
    assert.equal(extra.status, 400); assert.deepEqual(store.get(data.sessionId).game.getDialogueDiagnostics(), after);
    const ended = await call(path + '/accusations', { suspectId: witness, confirmed: true, expectedRevision: data.revision });
    assert.equal(ended.body.data.result.text, 'Incorrect. Test Visitor is innocent. The investigation is over.');
    assert.doesNotMatch(JSON.stringify(ended.body), /murdered|DISCLOSURE_PRIVATE_CANARY/);
  }
  assert.deepEqual(caseRegistry.list(), [{ id: 'ashcroft', title: 'The Ashcroft Manor Murder', mode: 'full' }, { id: 'greyhaven-preview', title: 'The Last Bell at Greyhaven — Repair Dispute Preview', mode: 'preview' }]);
});
