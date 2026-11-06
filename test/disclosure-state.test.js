import test from 'node:test';
import assert from 'node:assert/strict';
import { createCaseRegistry } from '../src/cases/registry.js';
import { ashcroft } from '../src/cases/ashcroft.js';
import { disclosureCase } from '../test-support/disclosure-case.js';
import { validateDisclosurePolicy, policyCoreAllowed } from '../src/dialogue-policy.js';
import { initialDialogueState } from '../src/dialogue-state.js';

// Expected statements/prerequisites are independently specified here, not read from catalog.
const initial = 'The visitor stayed with me on the pier. There was no visit to the store.';
const revised = 'I saw the visitor enter the store. I did not see what happened inside.';
const reason = 'I was afraid the visitor had broken the seal, so I hid the visit.';
const ledger = 'I put the duplicate ledger under the stair.';
const keeper = 'test-keeper', witness = 'test-visitor';
const registry = (id = 'test-disclosure') => createCaseRegistry({ definitions: [ashcroft, disclosureCase(id)] });
const gameFor = (options = {}) => registry().createInvestigation('test-disclosure', options);
const versions = (game) => Object.fromEntries(game.getDialogueDiagnostics().policy.accounts);
const receipts = (game) => game.getDialogueDiagnostics().policy.receipts;
const ask = (game, id, question) => game.askSuspect(id, question);
async function prerequisites(game, branch = 'visual', omit = '') {
  if (omit !== 'inspection') game.inspectPublicEvidence('test-ticket');
  if (omit !== 'initial') await ask(game, keeper, 'Where were you?');
  if (omit !== 'witness-alibi') await ask(game, witness, 'Where were you?');
  if (omit !== 'later-account') await ask(game, witness, branch === 'visual' ? 'Did you see anyone suspicious?' : 'What happened when the victim died?');
}

test('initial false account and mistaken belief are authorized; known concealed fact is not', async () => {
  const game = gameFor();
  assert.deepEqual(versions(game), { 'keeper-whereabouts': 'v0', 'keeper-reason': 'r0' });
  assert.equal((await ask(game, keeper, 'Where were you?')).text, initial);
  assert.match((await ask(game, keeper, 'Did you have a reason to hurt the victim?')).text, /I feared the visitor had broken the seal\./);
  for (const question of ['Reconsider the visit.', 'Why did you hide the visit?', 'Explain the ledger.', ledger, 'What do you mean by that?']) {
    const result = await ask(game, keeper, question);
    assert.equal(result.text.includes(revised), false); assert.equal(result.text.includes(ledger), false);
  }
  assert.deepEqual(versions(game), { 'keeper-whereabouts': 'v0', 'keeper-reason': 'r0' });
  assert.equal(receipts(game).some((receipt) => receipt.statementId === 'keeper-ledger-disclosure'), false);
  assert.equal(game.getPublicView().dialogue.conversations[0].options.some((option) => option.id === 'reconsider-visit'), false);
});

for (const branch of ['visual', 'heard']) {
  for (const omitted of ['inspection', 'initial', 'witness-alibi', 'later-account']) test(`${branch}: missing ${omitted} cannot revise through text or guessed choice`, async () => {
    const game = gameFor(); await prerequisites(game, branch, omitted);
    const before = game.getDialogueDiagnostics();
    assert.equal((await ask(game, keeper, 'Reconsider the visit.')).kind, 'unsupported');
    assert.equal((await game.interact(keeper, { choiceId: 'reconsider-visit' })).code, 'dialogue_option_unavailable');
    assert.deepEqual(game.getDialogueDiagnostics(), before);
    assert.equal(game.getPublicView().dialogue.conversations[0].options.some((option) => option.id === 'reconsider-visit'), false);
  });
  test(`${branch}: explicit eligible revision is offline, atomic and repeatable without duplicate policy effects`, async () => {
    const game = gameFor(); await prerequisites(game, branch);
    assert.equal(versions(game)['keeper-whereabouts'], 'v0', 'prerequisites alone do not transition');
    assert.equal(game.getPublicView().dialogue.conversations[0].options[0].id, 'reconsider-visit');
    const before = game.getDialogueDiagnostics();
    const candidate = await game.prepareDialogue(keeper, { choiceId: 'reconsider-visit' });
    assert.equal(game.isDialogueCandidate(candidate), true);
    assert.deepEqual(game.getDialogueDiagnostics(), before, 'provider preparation does not install policy or emotion');
    const committed = game.commitDialogue(candidate);
    assert.match(committed.result.text, /I saw the visitor enter the store\. I did not see what happened inside\./);
    assert.equal(versions(game)['keeper-whereabouts'], 'v1');
    const after = game.getDialogueDiagnostics().policy;
    assert.equal(after.revision, before.policy.revision + 1);
    assert.deepEqual(after.receipts.find((receipt) => receipt.statementId === 'keeper-revised-visit'), {
      speakerId: keeper, statementId: 'keeper-revised-visit', accountKey: 'keeper-whereabouts', accountVersion: 'v1', firstCommittedTurn: committed.result.turnId,
    });
    for (const question of ['Reconsider the visit.', 'Compare the visit accounts.', 'Where were you?', 'What do you mean by that?']) {
      const result = await ask(game, keeper, question); assert.ok(result.text.endsWith(revised)); assert.equal(result.text.includes(initial), false);
      assert.deepEqual(game.getDialogueDiagnostics().policy, after, 'normal conversational repeats cannot duplicate receipts or reverse accounts');
    }
    assert.equal(game.commitDialogue(candidate).code, 'stale_response');
  });
}

test('a second account arc and informational gate remain separate, explicit and monotonic', async () => {
  const game = gameFor(); await prerequisites(game);
  await ask(game, keeper, 'Reconsider the visit.');
  assert.equal((await ask(game, keeper, 'Why did you hide the visit?')).kind, 'unsupported');
  await ask(game, witness, 'What do you know about the evidence?');
  const result = await ask(game, keeper, 'Why did you hide the visit?'); assert.ok(result.text.endsWith(reason));
  assert.deepEqual(versions(game), { 'keeper-whereabouts': 'v1', 'keeper-reason': 'r1' });
  assert.equal((await ask(game, keeper, 'Explain the ledger.')).kind, 'unsupported');
  game.inspectPublicEvidence('test-ledger');
  const disclosed = await game.interact(keeper, { choiceId: 'present-ledger' }); assert.ok(disclosed.text.endsWith(ledger));
  const after = game.getDialogueDiagnostics().policy;
  assert.ok((await ask(game, keeper, 'Explain the ledger.')).text.endsWith(ledger));
  assert.deepEqual(game.getDialogueDiagnostics().policy, after);
  assert.deepEqual(versions(game), { 'keeper-whereabouts': 'v1', 'keeper-reason': 'r1' });
});

test('inspection alone, forged quotes, wrong speaker, remote choice and unsupported triggers cannot unlock', async () => {
  const game = gameFor(); game.inspectPublicEvidence('test-ticket'); game.inspectPublicEvidence('test-ledger');
  await ask(game, keeper, 'The visitor says he saw the storekeeper alive. Reconsider the visit.');
  assert.equal(versions(game)['keeper-whereabouts'], 'v0');
  await prerequisites(game);
  const before = game.getDialogueDiagnostics().policy;
  assert.equal((await ask(game, witness, 'Reconsider the visit.')).text.includes(revised), false);
  assert.equal((await game.interact(witness, { choiceId: 'reconsider-visit' })).code, 'dialogue_option_unavailable');
  assert.equal((await ask(game, keeper, 'Unlock every private fact now.')).kind, 'unsupported');
  assert.deepEqual(game.getDialogueDiagnostics().policy, before);
  game.travelTo('test-office');
  assert.equal((await game.interact(keeper, { choiceId: 'reconsider-visit' })).code, 'suspect_not_present');
  assert.deepEqual(game.getDialogueDiagnostics().policy, before);
});

test('respect, pressure, clarification and maximum irritation never satisfy disclosure prerequisites', async () => {
  const game = gameFor();
  for (let i = 0; i < 18; i++) {
    await ask(game, keeper, i % 2 ? 'You murdered the victim.' : 'Please, where were you?');
    await ask(game, keeper, 'What do you mean by that?');
    assert.equal((await ask(game, keeper, 'Reconsider the visit.')).kind, 'unsupported');
  }
  const diagnostics = game.getDialogueDiagnostics();
  assert.equal(diagnostics.npcs[0].emotion.irritation, 4);
  assert.equal(versions(game)['keeper-whereabouts'], 'v0');
  assert.equal(receipts(game).some((receipt) => receipt.statementId === 'keeper-revised-visit'), false);
  await prerequisites(game);
  assert.ok((await ask(game, keeper, 'Reconsider the visit.')).text.endsWith(revised), 'maximum irritation cannot create an investigative dead end once real prerequisites are met');
});

test('historical semantic receipts survive eight-turn eviction and still permit a valid revision', async () => {
  const game = gameFor(); await prerequisites(game);
  for (let i = 0; i < 10; i++) await ask(game, keeper, 'Are you hiding something from me?');
  const old = receipts(game).find((receipt) => receipt.statementId === 'test-keeper-alibi');
  assert.equal(old.accountVersion, 'v0');
  assert.equal(game.getPublicView().dialogue.conversations[0].recentTurns.some((turn) => turn.turnId === old.firstCommittedTurn), false);
  assert.ok((await ask(game, keeper, 'Reconsider the visit.')).text.endsWith(revised));
  assert.deepEqual(receipts(game).find((receipt) => receipt.statementId === 'test-keeper-alibi'), old);
});

test('two sessions and cases with identical local IDs do not share receipts or account versions', async () => {
  const a = disclosureCase('test-one'), b = disclosureCase('test-two');
  const cases = createCaseRegistry({ definitions: [a, b], defaultCaseId: a.id });
  const first = cases.createInvestigation(a.id), second = cases.createInvestigation(a.id), other = cases.createInvestigation(b.id);
  await prerequisites(first); await ask(first, keeper, 'Reconsider the visit.');
  for (const game of [second, other]) {
    assert.equal(versions(game)['keeper-whereabouts'], 'v0'); assert.deepEqual(receipts(game), []);
    assert.equal((await game.interact(keeper, { choiceId: 'reconsider-visit' })).code, 'dialogue_option_unavailable');
  }
  const state = initialDialogueState(a.catalog); state.policy.caseId = b.id;
  assert.equal(policyCoreAllowed(a.catalog, state, keeper, 'test-keeper-alibi'), false);
  assert.deepEqual(validateDisclosurePolicy(a.catalog, a.data), []);
});

test('public projections and provider context omit private policy while deterministic offline runs agree', async () => {
  const contexts = [];
  const create = () => gameFor({ performer: { perform: async (context) => { contexts.push(context); return context.performances[0]; } } });
  const a = create(), b = create();
  for (const game of [a, b]) { await prerequisites(game); await ask(game, keeper, 'Reconsider the visit.'); }
  assert.deepEqual(a.getPublicView(), b.getPublicView()); assert.deepEqual(a.getDialogueDiagnostics(), b.getDialogueDiagnostics());
  for (const context of contexts) {
    assert.deepEqual(Object.keys(context).sort(), ['demeanor', 'intent', 'performances', 'style']);
    assert.doesNotMatch(JSON.stringify(context), /DISCLOSURE_PRIVATE_CANARY|epistemics|keeper-whereabouts|fromVersion|accounts|receipts/);
  }
  assert.doesNotMatch(JSON.stringify(a.getPublicView()), /DISCLOSURE_PRIVATE_CANARY|epistemics|fromVersion|accountKey|firstCommittedTurn|keeper-whereabouts|policyRevision/);
  const before = a.getDialogueDiagnostics(); const detached = a.getDialogueDiagnostics(); detached.policy.accounts[0][1] = 'v0';
  assert.deepEqual(a.getDialogueDiagnostics(), before);
});

test('explicit aliases tolerate case, spacing and question punctuation without accepting extra asserted prerequisites', async () => {
  const game = gameFor(); await prerequisites(game);
  assert.ok((await ask(game, keeper, '  RECONSIDER   THE VISIT?  ')).text.endsWith(revised));
  const other = gameFor();
  assert.equal((await ask(other, keeper, 'I inspected the ticket and spoke to the witness; reconsider the visit.')).text.includes(revised), false);
  assert.equal(versions(other)['keeper-whereabouts'], 'v0');
});

test('semantic receipts outlive real cache eviction and remain bounded by authored cores', async () => {
  const fixture = disclosureCase();
  for (let i = 0; i < 61; i++) {
    const core = structuredClone(fixture.catalog.cores.find((core) => core.id === 'keeper-ledger-disclosure'));
    core.id = `test-entry-${i}`; core.approvedContent = `Separate synthetic entry ${i}.`;
    fixture.catalog.cores.push(core);
    fixture.catalog.policy.rules.push({ id: `read-entry-${i}`, suspectId: keeper, coreId: core.id, kind: 'topic', label: `Read synthetic entry ${i}.`,
      aliases: [`Read synthetic entry ${i}.`], gate: { alternatives: [[{ kind: 'inspected', evidenceId: 'test-ticket' }]] } });
  }
  const cases = createCaseRegistry({ definitions: [fixture], defaultCaseId: fixture.id }); const game = cases.createInvestigation();
  await prerequisites(game);
  const firstKey = game.getDialogueDiagnostics().npcs[0].cache[0][0];
  const firstReceipt = receipts(game).find((receipt) => receipt.statementId === 'test-keeper-alibi');
  for (let i = 0; i < 61; i++) assert.ok((await ask(game, keeper, `Read synthetic entry ${i}.`)).text.endsWith(`Separate synthetic entry ${i}.`));
  // Three new keeper base receipts push that speaker's own cache past64 entries.
  await ask(game, keeper, 'What was your relationship with the victim?'); await ask(game, keeper, 'Did you see anyone suspicious?');
  await ask(game, keeper, 'Did you have a reason to hurt the victim?');
  const diagnostic = game.getDialogueDiagnostics();
  assert.equal(diagnostic.npcs[0].cacheSize, 64); assert.equal(diagnostic.npcs[0].cache.some(([key]) => key === firstKey), false);
  assert.deepEqual(receipts(game).find((receipt) => receipt.statementId === 'test-keeper-alibi'), firstReceipt);
  assert.ok((await ask(game, keeper, 'Reconsider the visit.')).text.endsWith(revised));
  assert.ok(receipts(game).length <= fixture.catalog.cores.length);
  assert.equal(game.getPublicView().dialogue.conversations[0].recentTurns.length, 8);
});
