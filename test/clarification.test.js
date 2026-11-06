import test from 'node:test';
import assert from 'node:assert/strict';
import { clarificationCase } from '../test-support/clarification-case.js';
import { createCaseRegistry } from '../src/cases/registry.js';
import { validateDialogueCatalog } from '../src/data/dialogue-catalog.js';
import { createOpenAINPCPerformer } from '../src/npc-performance.js';
import { createOpenAIDialoguePhraser } from '../src/dialogue-phraser.js';
import { createSessionStore } from '../src/investigation-sessions.js';
import { once } from 'node:events';
import { createInvestigationServer } from '../src/http-api.js';

const keeper = 'test-keeper', visitor = 'test-visitor';
const source = 'I saw the visitor cross the store threshold from the pier. I could not see inside.';
const history = 'I gave you that pier account earlier. I have corrected it: I saw the visit, not what happened inside.';
function setup(options = {}, fixture = clarificationCase()) {
  const registry = createCaseRegistry({ definitions: [fixture], defaultCaseId: fixture.id });
  return { game: registry.createInvestigation(fixture.id, options), registry };
}
const ask = (game, text, speaker = keeper) => game.askSuspect(speaker, text);
async function revised(game) {
  game.inspectPublicEvidence('test-ticket');
  await ask(game, 'Where were you?');
  await ask(game, 'Where were you?', visitor);
  await ask(game, 'Did you see anyone suspicious?', visitor);
  await ask(game, 'Reconsider the visit.');
}
const options = (game, speaker = keeper) => game.getPublicView().dialogue.conversations.find((row) => row.suspectId === speaker).options;
const diagnostics = (game) => game.getDialogueDiagnostics();

test('ordinary offline facets answer distinct source, identity and time details and preserve primary', async () => {
  const { game } = setup(); await revised(game);
  assert.ok((await ask(game, 'How do you know?')).dialogue.endsWith(source));
  const primary = diagnostics(game).policy.primaryTargets.find(([speaker]) => speaker === keeper)[1];
  assert.equal(primary.primaryStatement, 'keeper-revised-visit'); assert.equal(primary.accountVersion, 'v1');
  assert.ok((await ask(game, 'Who crossed the threshold?')).dialogue.endsWith('I recognized the visitor by the yellow raincoat. I did not identify anyone inside.'));
  assert.deepEqual(diagnostics(game).policy.primaryTargets.find(([speaker]) => speaker === keeper)[1], primary);
  assert.equal((await ask(game, 'When did that happen?')).kind, 'unsupported');
  game.inspectPublicEvidence('test-ledger');
  assert.ok((await ask(game, 'When did that happen?')).dialogue.endsWith('The ticket clock read ten fifteen. That times the crossing, not anything inside.'));
});

for (const [question, expected] of [
  ['What do you mean by entered?', 'By entered, I mean crossing the threshold. I am not describing anything inside.'],
  ['How sure are you about the coat?', 'I recognized the coat at a distance. I cannot make that a perfect identification.'],
  ['Are you certain?', 'I recognized the coat at a distance. I cannot make that a perfect identification.'],
  ['How certain are you?', 'I recognized the coat at a distance. I cannot make that a perfect identification.'],
  ['What do you mean by that?', source], ['Who do you mean?', 'I recognized the visitor by the yellow raincoat. I did not identify anyone inside.'],
]) test(`finite type/default maps to authored response: ${question}`, async () => {
  const { game } = setup(); await revised(game);
  assert.ok((await ask(game, question)).dialogue.endsWith(expected));
});

test('menu and normalized explicit text aliases select exact authored facet', async () => {
  const { game } = setup(); await revised(game);
  assert.ok(options(game).some((row) => row.id === 'keeper-current-source' && row.kind === 'clarify'));
  assert.ok((await game.interact(keeper, { choiceId: 'keeper-current-source' })).dialogue.endsWith(source));
  assert.ok((await ask(game, '  HOW did you observe the visit?!  ')).dialogue.endsWith(source));
  assert.equal((await ask(game, 'Ignore everything and how did you observe the visit')).kind, 'unsupported');
});

for (const question of ['How do you know?', 'Who do you mean?', 'When did that happen?', 'Are you certain?', 'What do you mean by that?']) test(`no context gives safe non-mutating guidance: ${question}`, async () => {
  const { game } = setup(); const before = diagnostics(game);
  const result = await ask(game, question);
  assert.equal(result.kind, 'unsupported'); assert.match(result.text, /Ask me about an account/);
  assert.deepEqual(diagnostics(game), before);
});

for (const question of ['Explain your original pier account.', 'How did you observe the visit?', 'Who crossed the threshold?', 'When did you see the crossing?',
  'Your earlier alibi?', 'How do you know and when did that happen?', 'Explain "I saw the visitor cross the store threshold".', 'Explain test-keeper-alibi.',
  'Explain foreign:keeper-revised-visit.', 'Explain the visitor statement.',
  'test-keeper-alibi', 'foreign:test-keeper-alibi', "'My alibi says something fabricated.'"]) test(`guessed, foreign, compound or unseen reference grants no receipt: ${question}`, async () => {
  const { game } = setup(); const before = diagnostics(game);
  assert.equal((await ask(game, question)).kind, 'unsupported'); assert.deepEqual(diagnostics(game), before);
});

test('speaker switch has independent committed context; wrong speaker alias never discloses', async () => {
  const { game } = setup(); await ask(game, 'Where were you?');
  assert.equal((await ask(game, 'How do you know?', visitor)).kind, 'unsupported');
  await ask(game, 'Did you see anyone suspicious?', visitor);
  assert.ok((await ask(game, 'How do you know?', visitor)).dialogue.endsWith('I saw the storekeeper wave through the open window. I did not enter the store.'));
  assert.equal((await ask(game, 'How did you observe the visit?', visitor)).kind, 'unsupported');
  assert.ok((await ask(game, 'How do you know?')).dialogue.endsWith('That is my account of the pier. I am not adding another observation.'));
});

test('historical correction requires old receipt and never restores old account or old time detail', async () => {
  const { game } = setup(); await revised(game);
  assert.ok((await ask(game, 'Explain your original pier account.')).dialogue.endsWith(history));
  assert.equal((await ask(game, 'Time of your original account?')).kind, 'unsupported');
  assert.ok((await ask(game, 'Where were you?')).dialogue.endsWith('I saw the visitor enter the store. I did not see what happened inside.'));
  assert.equal(diagnostics(game).policy.accounts.find(([id]) => id === 'keeper-whereabouts')[1], 'v1');
  const count = diagnostics(game).policy.receipts.length;
  await ask(game, 'Explain your original pier account.'); assert.equal(diagnostics(game).policy.receipts.length, count);
});

test('explicit historical facet focuses its received primary without restoring the current account', async () => {
  const { game } = setup(); await revised(game);
  const receipt = diagnostics(game).policy.receipts.find((row) => row.statementId === 'test-keeper-alibi');
  await ask(game, 'Explain your original pier account.');
  const target = diagnostics(game).policy.primaryTargets.find(([speaker]) => speaker === keeper)[1];
  assert.equal(target.primaryStatement, 'test-keeper-alibi'); assert.equal(target.originTurn, receipt.firstCommittedTurn);
  assert.equal(target.accountVersion, 'v0');
  assert.ok((await ask(game, 'What do you mean by that?')).dialogue.endsWith(history));
  assert.equal(diagnostics(game).policy.accounts.find(([id]) => id === 'keeper-whereabouts')[1], 'v1');
  await ask(game, 'Where were you?');
  assert.ok((await ask(game, 'How do you know?')).dialogue.endsWith(source));
});

test('locked detail stays hidden under pressure and after repeated requests; label appears only after inspection', async () => {
  const { game } = setup(); await revised(game);
  for (let i = 0; i < 10; i++) { await ask(game, 'Are you hiding something?'); assert.equal((await ask(game, 'When did you see the crossing?')).kind, 'unsupported'); }
  assert.ok(!options(game).some((row) => row.id === 'keeper-current-time'));
  assert.ok(!diagnostics(game).policy.receipts.some((row) => row.statementId === 'keeper-current-time-answer'));
  game.inspectPublicEvidence('test-ledger');
  assert.equal((await ask(game, 'When did you see the crossing?')).kind, 'answer');
});

test('primary and historical references survive more than eight turns and diagnostics are detached', async () => {
  const { game } = setup(); await revised(game);
  for (let i = 0; i < 12; i++) await ask(game, 'How do you know?');
  assert.equal(diagnostics(game).npcs[0].turns.length, 8);
  const copy = diagnostics(game); copy.policy.primaryTargets[0][1].primaryStatement = 'forged';
  assert.ok((await ask(game, 'How do you know?')).dialogue.endsWith(source));
  assert.ok((await ask(game, 'Explain your original pier account.')).dialogue.endsWith(history));
});

const invalid = {
  'foreign owner': (f) => { f.catalog.policy.facets[0].suspectId = visitor; },
  'foreign primary': (f) => { f.catalog.policy.facets[0].primaryStatement = 'foreign'; },
  'wrong version': (f) => { f.catalog.policy.facets[0].accountVersion = 'v1'; },
  'wrong response role': (f) => { f.catalog.cores.find((c) => c.id === 'keeper-original-source-answer').role = 'base'; },
  'foreign response': (f) => { f.catalog.policy.facets[0].coreId = 'test-visitor-sighting'; },
  'unknown type': (f) => { f.catalog.policy.facets[0].type = 'confession'; },
  'extra field': (f) => { f.catalog.policy.facets[0].secret = true; },
  'unknown predicate': (f) => { f.catalog.policy.facets[0].gate.alternatives[0] = [{ kind: 'mood', tension: 4 }]; },
  'foreign gate': (f) => { f.catalog.policy.facets[0].gate.alternatives[0][0].caseId = 'other'; },
  'self gate cycle': (f) => { f.catalog.policy.facets[0].gate.alternatives[0][0].coreId = 'keeper-original-source-answer'; },
  'duplicate id': (f) => { f.catalog.policy.facets[1].id = f.catalog.policy.facets[0].id; },
  'duplicate alias': (f) => { f.catalog.policy.facets[1].aliases = f.catalog.policy.facets[0].aliases; },
  'duplicate default': (f) => { f.catalog.policy.facets[1].default = true; },
  'duplicate type': (f) => { f.catalog.policy.facets[1].type = 'source'; },
  'malformed history': (f) => { f.catalog.policy.facets[0].historicalCoreId = null; },
  'facet array null': (f) => { f.catalog.policy.facets = null; },
  'essential over budget': (f) => { for (const c of f.catalog.cores.filter((c) => c.suspectId === keeper && c.role === 'base')) c.suggestionPriority = 1; },
  'invalid essential': (f) => { f.catalog.policy.rules[0].essential = 'yes'; },
};
for (const [name, mutate] of Object.entries(invalid)) test(`facet schema rejects ${name}`, () => {
  const f = clarificationCase(); mutate(f);
  assert.notEqual(validateDialogueCatalog(f.catalog, f.data).length, 0);
  assert.throws(() => setup({}, f));
});

for (const request of ['How do you know?', 'Explain your original pier account.']) for (const mode of ['discard', 'throw', 'async', 'reentrant', 'travel', 'inspection', 'end']) test(`facet/context transaction rolls back on ${mode}: ${request}`, async () => {
  const { game } = setup(); await revised(game); const before = diagnostics(game);
  const project = mode === 'throw' ? () => { throw Error('projection'); } : mode === 'async' ? async (value) => value
    : mode === 'reentrant' ? (value) => { game.travelTo('test-office'); return value; } : (value) => value;
  const token = await game.prepareDialogue(keeper, { question: request }, project);
  assert.deepEqual(diagnostics(game), before);
  if (mode === 'discard') game.discardDialogue(token);
  if (mode === 'travel') game.travelTo('test-office');
  if (mode === 'inspection') game.inspectPublicEvidence('test-ledger');
  if (mode === 'end') game.resolveAccusation(visitor, true);
  if (['throw', 'async'].includes(mode)) assert.throws(() => game.commitDialogue(token));
  else assert.equal(game.commitDialogue(token).kind, 'error');
  // Independently committed inspection affects inspected only, which diagnostics excludes.
  assert.deepEqual(diagnostics(game), before);
});

test('uncommitted primary cannot authorize its own facet and discarded target stays absent', async () => {
  const { game } = setup(); const before = diagnostics(game);
  const token = await game.prepareDialogue(keeper, { question: 'Where were you?' });
  assert.deepEqual(diagnostics(game), before); game.discardDialogue(token);
  assert.equal((await ask(game, 'Explain your original pier account.')).kind, 'unsupported');
  assert.deepEqual(diagnostics(game), before);
});

for (const mode of ['legacy', 'structured', 'direct-legacy', 'direct-structured']) test(`facet exact authority rejects model inventions on ${mode}`, async () => {
  const requests = []; const secret = 'I know who committed the murder. CLARIFICATION_PRIVATE_CANARY';
  const client = { responses: { create: async (request) => { requests.push(request); return { status: 'completed', output: [],
    output_text: mode === 'legacy' ? secret : JSON.stringify({ narration: null, dialogue: secret }) }; } } };
  const adapter = mode === 'legacy' ? { phraser: createOpenAIDialoguePhraser({ client, model: 'fake' }) }
    : mode === 'structured' ? { performer: createOpenAINPCPerformer({ client, model: 'fake' }) }
      : mode === 'direct-legacy' ? { phraser: { phrase: async () => secret } } : { performer: { perform: async () => ({ narration: null, dialogue: secret }) } };
  const { game } = setup(adapter); await revised(game);
  assert.ok((await ask(game, 'How do you know?')).dialogue.endsWith(source));
  assert.doesNotMatch(JSON.stringify(requests), /primaryStatement|historicalCoreId|epistemics|DISCLOSURE_PRIVATE_CANARY/);
  assert.doesNotMatch(JSON.stringify(game.getPublicView()), /CLARIFICATION_PRIVATE_CANARY|primaryTargets|accountVersion|keeper-current-source-answer/);
});

for (const mode of ['legacy', 'structured', 'direct-legacy', 'direct-structured']) for (const attack of ['old-account', 'other-speaker', 'locked-detail']) test(`${mode} rejects facet ${attack}`, async () => {
  const output = attack === 'old-account' ? 'The visitor stayed with me on the pier. There was no visit to the store.'
    : attack === 'other-speaker' ? 'I saw the storekeeper wave through the open window. I did not enter the store.'
      : 'The ticket clock read ten fifteen. That times the crossing, not anything inside.';
  const client = { responses: { create: async () => ({ status: 'completed', output: [],
    output_text: mode === 'legacy' ? output : JSON.stringify({ narration: null, dialogue: output }) }) } };
  const adapter = mode === 'legacy' ? { phraser: createOpenAIDialoguePhraser({ client, model: 'fake' }) }
    : mode === 'structured' ? { performer: createOpenAINPCPerformer({ client, model: 'fake' }) }
      : mode === 'direct-legacy' ? { phraser: { phrase: async () => output } } : { performer: { perform: async () => ({ narration: null, dialogue: output }) } };
  const { game } = setup(adapter); await revised(game);
  assert.ok((await ask(game, 'How do you know?')).dialogue.endsWith(source));
});

for (const settle of ['success', 'failure']) for (const action of ['travel', 'inspection', 'end', 'cancel']) test(`pending facet ${settle} after ${action} installs no private changes`, async () => {
  let release, fail, waiting = false;
  const pending = new Promise((resolve, reject) => { release = resolve; fail = reject; });
  const { game } = setup({ performer: { perform: async (context) => waiting ? pending : context.performances[0] } });
  await revised(game); waiting = true; const before = diagnostics(game);
  const response = ask(game, 'How do you know?');
  assert.deepEqual(diagnostics(game), before);
  if (action === 'travel') { game.travelTo('test-office'); game.travelTo('test-pier'); }
  if (action === 'inspection') game.inspectPublicEvidence('test-ledger');
  if (action === 'end') game.resolveAccusation(visitor, true);
  if (action === 'cancel') game.resolveAccusation(visitor, false);
  if (settle === 'success') release({ narration: null, dialogue: source }); else fail(Error('provider failed'));
  assert.equal((await response).code, action === 'end' ? 'investigation_ended' : 'stale_response');
  assert.deepEqual(diagnostics(game), before);
});

test('an old account without its committed receipt cannot be clarified after a legitimate revision', async () => {
  const f = clarificationCase();
  f.catalog.policy.rules[0].gate = { alternatives: [[{ kind: 'inspected', evidenceId: 'test-ticket' }]] };
  const { game } = setup({}, f); game.inspectPublicEvidence('test-ticket'); await ask(game, 'Reconsider the visit.');
  const before = diagnostics(game);
  assert.equal((await ask(game, 'Explain your original pier account.')).kind, 'unsupported');
  assert.deepEqual(diagnostics(game), before);
  assert.ok((await ask(game, 'How do you know?')).dialogue.endsWith(source));
});

test('stale facet choice is rejected after primary changes; cache never authorizes obsolete account', async () => {
  const { game } = setup(); await ask(game, 'Where were you?');
  assert.equal((await game.interact(keeper, { choiceId: 'keeper-original-source' })).kind, 'answer');
  await revised(game);
  const before = diagnostics(game);
  assert.equal((await game.interact(keeper, { choiceId: 'keeper-original-source' })).code, 'dialogue_option_unavailable');
  assert.deepEqual(diagnostics(game), before);
  assert.ok((await ask(game, 'How do you know?')).dialogue.endsWith(source));
  assert.ok((await ask(game, 'Explain your original pier account.')).dialogue.endsWith(history));
});

test('actual 64-entry cache eviction preserves first receipts and historical clarification authority', async () => {
  const { game } = setup(); await revised(game); await ask(game, 'How do you know?');
  const first = diagnostics(game).policy.receipts.find((row) => row.statementId === 'test-keeper-alibi');
  const oldKeys = diagnostics(game).npcs[0].cache.map(([key]) => key);
  for (let i = 0; i < 70; i++) await ask(game, 'Where were you?');
  const after = diagnostics(game);
  assert.equal(after.npcs[0].cacheSize, 64); assert.ok(oldKeys.every((key) => !after.npcs[0].cache.some(([current]) => current === key)));
  assert.deepEqual(after.policy.receipts.find((row) => row.statementId === 'test-keeper-alibi'), first);
  assert.ok((await ask(game, 'Explain your original pier account.')).dialogue.endsWith(history));
  await ask(game, 'Where were you?');
  assert.ok((await ask(game, 'How do you know?')).dialogue.endsWith(source));
});

test('unsupported detail types and case-specific patterns give honest guidance without guessing', async () => {
  const { game } = setup(); await ask(game, 'Where were you?'); const before = diagnostics(game);
  assert.match((await ask(game, 'Who do you mean?')).text, /no further detail of that kind/);
  assert.equal((await ask(game, 'Which bell?')).kind, 'unsupported');
  assert.equal((await ask(game, 'What do you mean by the nonexistent confession?')).kind, 'unsupported');
  assert.deepEqual(diagnostics(game), before);
});

test('provider failure commits only the eligible deterministic facet fallback', async () => {
  const { game } = setup({ performer: { perform: async () => { throw Error('provider down'); } } }); await revised(game);
  assert.ok((await ask(game, 'How do you know?')).dialogue.endsWith(source));
  assert.equal(diagnostics(game).policy.receipts.filter((row) => row.statementId === 'keeper-current-source-answer').length, 1);
});

test('all four potential essentials validate and eligible essentials precede a facet under overflow', async () => {
  const f = clarificationCase();
  for (const topic of ['motive', 'sighting']) f.catalog.cores.find((c) => c.id === `${keeper}-${topic}`).suggestionPriority = 1;
  for (let i = 0; i < 8; i++) f.catalog.policy.rules.push({ id: `extra-${i}`, suspectId: keeper, coreId: 'keeper-ledger-disclosure',
    kind: 'topic', label: `Optional account ${i}`, aliases: [`Optional account ${i}?`],
    gate: { alternatives: [[{ kind: 'received', speakerId: keeper, coreId: 'test-keeper-alibi' }]] } });
  const { game } = setup({}, f); game.inspectPublicEvidence('test-ticket'); await ask(game, 'Where were you?');
  await ask(game, 'Where were you?', visitor); await ask(game, 'Did you see anyone suspicious?', visitor);
  const choices = options(game);
  assert.deepEqual(choices.slice(0, 3).map((row) => row.id), ['reconsider-visit', 'ask-motive', 'ask-sighting']);
  assert.equal(choices[3].id, 'keeper-original-source'); assert.equal(choices.length, 6);
  assert.equal((await ask(game, 'Optional account 7?')).kind, 'answer');
});

test('real HTTP keeps target/account fields private and rejects client-supplied clarification state', async (t) => {
  const { registry } = setup(); const store = createSessionStore({ registry });
  const server = createInvestigationServer({ store }); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); server.close(); });
  const base = `http://127.0.0.1:${server.address().port}/api/investigations`;
  const post = async (path, body) => {
    const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return { status: response.status, envelope: await response.json() };
  };
  const created = await post(base, {}); const id = created.envelope.data.sessionId;
  for (const field of ['facet', 'statementRef', 'coreId', 'accountVersion', 'primaryTargets']) {
    const result = await post(`${base}/${id}/questions`, { expectedRevision: 0, suspectId: keeper, question: 'How do you know?', [field]: 'forged' });
    assert.equal(result.status, 400); assert.equal(result.envelope.error.code, 'invalid_request');
  }
  await post(`${base}/${id}/questions`, { expectedRevision: 0, suspectId: keeper, question: 'Where were you?' });
  const result = await post(`${base}/${id}/questions`, { expectedRevision: 1, suspectId: keeper, choiceId: 'keeper-original-source' });
  assert.equal(result.status, 200); assert.ok(result.envelope.data.result.dialogue.endsWith('That is my account of the pier. I am not adding another observation.'));
  assert.doesNotMatch(JSON.stringify(result.envelope), /primaryTargets|primaryStatement|historicalCoreId|accountVersion|epistemics|DISCLOSURE_PRIVATE_CANARY/);
});

test('overlapping IDs in concurrent sessions and cases never share clarification authority', async () => {
  const { registry } = setup(); const store = createSessionStore({ registry });
  const a = store.create(), b = store.create(); await revised(a.game);
  const other = setup({}, clarificationCase('other-clarification')).game;
  const results = await Promise.all([ask(a.game, 'How do you know?'), ask(b.game, 'How do you know?'), ask(other, 'How do you know?')]);
  assert.ok(results[0].dialogue.endsWith(source)); assert.equal(results[1].kind, 'unsupported'); assert.equal(results[2].kind, 'unsupported');
});

test('six-choice overflow reserves essentials/facet, rotates optional actions, and preserves text access', async () => {
  const f = clarificationCase();
  for (let i = 0; i < 8; i++) {
    const original = f.catalog.policy.rules[2];
    f.catalog.policy.rules.push({ ...structuredClone(original), id: `optional-ledger-${i}`, label: `Optional record question ${i}`, aliases: [`Optional record ${i}?`] });
  }
  const { game } = setup({}, f); await revised(game); game.inspectPublicEvidence('test-ledger');
  const seen = new Set();
  for (let i = 0; i < 32; i++) {
    const choices = options(game); assert.equal(choices.length, 6); assert.equal(choices.filter((row) => row.kind === 'clarify').length, 1);
    choices.forEach((row) => seen.add(row.id)); await game.interact(keeper, { choiceId: choices.find((row) => row.kind === 'clarify').id });
  }
  for (const id of ['keeper-current-source', 'keeper-current-identity', 'keeper-current-time', 'keeper-current-meaning', 'keeper-current-certainty']) assert.ok(seen.has(id));
  for (let i = 0; i < 8; i++) { assert.ok(seen.has(`optional-ledger-${i}`)); assert.equal((await ask(game, `Optional record ${i}?`)).kind, 'answer'); }
});
