import assert from 'node:assert/strict';
import test from 'node:test';
import { infrastructureCase } from '../test-support/infrastructure-case.js';
import { caseRegistry, createCaseRegistry } from '../src/cases/registry.js';
import { validateCasePackage } from '../src/cases/validate-package.js';
import { once } from 'node:events';
import { createInvestigationServer } from '../src/http-api.js';
import { createSessionStore } from '../src/investigation-sessions.js';
import { runCli } from '../src/cli.js';
import { prepareInterviews, owen, mara } from '../test-support/greyhaven-pilot-journey.js';

const keeper = 'test-keeper', visitor = 'test-visitor';
function start(adapters) {
  const definition = infrastructureCase();
  return createCaseRegistry({ definitions: [definition], defaultCaseId: definition.id }).createInvestigation(definition.id, adapters);
}
const interview = (game, id = keeper) => game.getPublicView().dialogue.conversations.find(c => c.suspectId === id);
const actions = row => [...row.options, ...row.moreOptions];
const choose = (game, id, choiceId) => game.interact(id, { choiceId });

test('optional graph and eligibility validate at package loading', () => {
  assert.deepEqual(validateCasePackage(infrastructureCase()), []);
  for (const breakCase of [
    d => delete d.rooms[0].connections,
    d => d.rooms[0].connections.push('missing'),
    d => d.rooms[0].connections.push('test-pier'),
    d => d.rooms[0].connections.push('test-office'),
    d => d.rooms[1].connections.pop(),
    d => { d.rooms[1].connections.pop(); d.rooms[2].connections = []; },
    d => { d.suspects[1].accusationEligible = 0; },
    d => { d.suspects[0].accusationEligible = false; },
    d => { d.initialLocationId = 'other'; },
  ]) {
    const f = infrastructureCase(); breakCase(f.data);
    assert.ok(validateCasePackage(f).length);
  }
  const legacy = caseRegistry.createInvestigation();
  assert.equal(legacy.travelTo('garden').changed, true);
  assert.equal(legacy.resolveAccusation('clara-voss', true).result, 'correct');
  assert.equal(caseRegistry.createInvestigation('greyhaven-preview').resolveAccusation('owen-vale', true).code, 'accusation_unavailable');
});

test('rejected commands preserve state; navigation creates no testimony, calls or inspection', async () => {
  let calls = 0;
  const game = start({ performer: { perform() { calls++; } } });
  const before = game.getPublicView();
  assert.equal(before.suspects.find(p => p.id === visitor).accusationEligible, false);
  for (const confirm of [true, false]) assert.equal(game.resolveAccusation(visitor, confirm).code, 'ineligible_accusation');
  assert.equal(game.travelTo('test-lobby').code, 'travel_unavailable');
  assert.deepEqual(game.getPublicView(), before);
  const diagnostics = game.getDialogueDiagnostics();
  for (const id of ['test-office', 'test-lobby', 'test-office', 'test-pier']) assert.equal(game.travelTo(id).changed, true);
  assert.deepEqual(game.getDialogueDiagnostics(), diagnostics);
  assert.equal(calls, 0);
  assert.equal((await choose(game, visitor, 'ask-alibi')).kind, 'answer');
  assert.equal(game.resolveAccusation(keeper, true).result, 'correct');
});

test('HTTP rejects non-edges and ineligible contacts with an unchanged session revision', async t => {
  const definition = infrastructureCase();
  const registry = createCaseRegistry({ definitions: [definition], defaultCaseId: definition.id });
  const server = createInvestigationServer({ store: createSessionStore({ registry }) });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const root = 'http://127.0.0.1:' + server.address().port + '/api/investigations';
  const post = (url, body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const initial = (await (await post(root, {})).json()).data;
  const url = root + '/' + initial.sessionId;
  for (const [command, body, expected] of [
    ['travel', { locationId: 'test-lobby' }, 'travel_unavailable'],
    ['accusations', { suspectId: visitor, confirmed: true }, 'ineligible_accusation'],
    ['accusations', { suspectId: visitor, confirmed: false }, 'ineligible_accusation'],
  ]) {
    const response = await post(url + '/' + command, { ...body, expectedRevision: 0 });
    assert.equal(response.status, 409);
    assert.equal((await response.json()).error.code, expected);
    assert.deepEqual((await (await fetch(url)).json()).data, initial);
  }
});

test('pages expose every ordinary topic without turns and received history retains version-bound follow-ups', async () => {
  const game = start(), other = start();
  const initial = interview(game);
  const ids = actions(initial).map(a => a.id);
  assert.equal(initial.options.length, 6);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ids.length, 7);
  assert.ok(!ids.includes('reconsider-visit'));
  assert.deepEqual(initial.statements, []);
  const before = game.getDialogueDiagnostics();
  initial.moreOptions.pop(); assert.deepEqual(interview(game).moreOptions.length, 1);
  assert.deepEqual(before, game.getDialogueDiagnostics());
  await choose(game, keeper, ids.at(-1));
  const original = await choose(game, keeper, 'ask-alibi');
  await choose(game, visitor, 'ask-alibi'); await choose(game, visitor, 'ask-sighting');
  game.inspectPublicEvidence('test-ticket');
  assert.ok(actions(interview(game)).some(o => o.id === 'reconsider-visit'));
  await choose(game, keeper, 'reconsider-visit');
  assert.equal((await choose(game, keeper, 'keeper-original-source')).code, 'dialogue_option_unavailable');
  for (let i = 0; i < 9; i++) await choose(game, keeper, 'ask-alibi');
  const current = interview(game);
  assert.ok(!current.recentTurns.some(t => t.turnId === original.turnId));
  const row = current.statements.find(s => s.turnId === original.turnId);
  assert.equal(row.dialogue, original.dialogue);
  assert.equal(row.accountStatus, 'historical');
  assert.ok(current.statements.some(s => s.accountStatus === 'current'));
  assert.ok(!actions(current).some(o => o.id === 'keeper-current-time'));
  assert.match((await choose(game, keeper, row.followUps[0])).dialogue, /I have corrected it/);
  assert.deepEqual(interview(other).statements, []);
  game.travelTo('test-office');
  assert.deepEqual(actions(interview(game)), []);
  game.travelTo('test-pier'); game.resolveAccusation(keeper, true);
  assert.ok(interview(game).statements.every(s => !s.followUps.length));
  assert.deepEqual(actions(interview(game)), []);
  assert.doesNotMatch(JSON.stringify(interview(game)), /PRIVATE_CANARY|primaryStatement|accountKey/);
});

test('reading interview pages and received statements preserves the E1 handoff and call budget', async () => {
  let calls = 0;
  const game = caseRegistry.createInvestigation('greyhaven-preview', { performer: { coordination: {
    direct() { calls++; return { strategy: 'invite-account' }; },
    act(ctx) { calls++; return ctx.performances[0]; },
  } } });
  await prepareInterviews(game);
  await choose(game, owen, 'present-pump-payment');
  game.travelTo('reception');
  const before = game.getDialogueDiagnostics();
  for (let i = 0; i < 4; i++) { actions(interview(game, mara)); interview(game, owen).statements; }
  assert.equal(calls, 2);
  assert.deepEqual(game.getDialogueDiagnostics(), before);
  await choose(game, mara, 'mara-source');
  assert.equal(calls, 3);
  assert.equal(game.getCoordinationTrace().at(-1).source, 'provider');
});

test('CLI supports connected travel, filtered accusation, paging and received statement review', async () => {
  const game = start(), output = [];
  const input = ['6','1','6','2','6','1','6','1', '1','2','/choices','next','1',
    '1','2','/statements','1','return','4','1','no','5'];
  await runCli({ write: s => output.push(s), ask: async prompt => { output.push(prompt); assert.ok(input.length); return input.shift(); } },
    { game, caseId: 'test-clarification' });
  const log = output.join('');
  assert.match(log, /You are in the test lobby/);
  assert.match(log, /Test Visitor · Turn 1/);
  assert.doesNotMatch(log.split('Choose the murderer:')[1], /Test Visitor/);
  assert.equal(game.getLifecycle().status, 'active');
});
