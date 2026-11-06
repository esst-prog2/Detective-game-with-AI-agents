import test from 'node:test';
import assert from 'node:assert/strict';
import { disclosureCase } from '../test-support/disclosure-case.js';
import { validateDialogueCatalog } from '../src/data/dialogue-catalog.js';
import { validateCasePackage } from '../src/cases/validate-package.js';
import { createCaseRegistry } from '../src/cases/registry.js';
import { createInvestigation } from '../src/game.js';

const validate = (fixture) => validateDialogueCatalog(fixture.catalog, fixture.data);
test('malformed legacy catalog arrays still return validation errors rather than throwing in schema dispatch', () => {
  for (const cores of [null, {}, 'not-an-array', 4]) assert.notEqual(validateDialogueCatalog({ version: 'test-v1', cores }, disclosureCase().data).length, 0);
});
test('explicit v2 package validates without weakening six base subjects or changing public state shape', () => {
  const fixture = disclosureCase();
  assert.deepEqual(validate(fixture), []); assert.deepEqual(validateCasePackage(fixture), []);
  const registry = createCaseRegistry({ definitions: [fixture], defaultCaseId: fixture.id });
  assert.equal(registry.createInvestigation().getPublicView().title, 'Synthetic Harbor Test');
  assert.throws(() => createInvestigation({ data: fixture.data, dialogueCatalog: fixture.catalog }), /context/);
  assert.throws(() => createInvestigation({ data: fixture.data, dialogueCatalog: fixture.catalog, caseContext: { id: 'foreign', version: 'v1' } }), /context/);
});

const invalid = {
  'explicit null transition': (f) => { f.catalog.policy.rules[2].transition = null; },
  'explicit false transition': (f) => { f.catalog.policy.rules[2].transition = false; },
  'explicit zero transition': (f) => { f.catalog.policy.rules[2].transition = 0; },
  'explicit empty transition': (f) => { f.catalog.policy.rules[2].transition = ''; },
  'missing policy': (f) => { delete f.catalog.policy; },
  'policy without schema opt-in': (f) => { delete f.catalog.schemaVersion; },
  'unknown schema': (f) => { f.catalog.schemaVersion = 3; },
  'future facet role': (f) => { f.catalog.cores[0].role = 'facet'; },
  'missing base subject': (f) => { f.catalog.cores.splice(1, 1); },
  'unknown policy field': (f) => { f.catalog.policy.moodThreshold = 4; },
  'foreign known-fact owner': (f) => { f.catalog.policy.epistemics[0].suspectId = 'alice-mercer'; },
  'foreign basis': (f) => { f.catalog.cores[0].basis[0].id = 'foreign-secret'; },
  'foreign reference speaker': (f) => { f.catalog.policy.rules[0].gate.alternatives[0][1].speakerId = 'test-visitor'; },
  'foreign reference core': (f) => { f.catalog.policy.rules[0].gate.alternatives[0][1].coreId = 'alice-mercer-alibi'; },
  'foreign clue': (f) => { f.catalog.policy.rules[0].gate.alternatives[0][0].evidenceId = 'silver-cufflink'; },
  'unsupported mood predicate': (f) => { f.catalog.policy.rules[0].gate.alternatives[0][0] = { kind: 'emotion', irritation: 4 }; },
  'extra gate predicate': (f) => { f.catalog.policy.rules[0].gate.mood = 4; },
  'extra reference fields': (f) => { f.catalog.policy.rules[0].gate.alternatives[0][0].caseId = 'foreign'; },
  'empty conjunction': (f) => { f.catalog.policy.rules[0].gate.alternatives[0] = []; },
  'too many alternatives': (f) => { f.catalog.policy.rules[0].gate.alternatives.push(f.catalog.policy.rules[0].gate.alternatives[0]); },
  'too many references': (f) => { f.catalog.policy.rules[0].gate.alternatives[0] = Array(17).fill({ kind: 'inspected', evidenceId: 'test-ticket' }); },
  'missing initial version': (f) => { f.catalog.policy.accounts[0].initialVersion = 'missing'; },
  'duplicate account': (f) => { f.catalog.policy.accounts.push(f.catalog.policy.accounts[0]); },
  'foreign account speaker': (f) => { f.catalog.policy.accounts[0].suspectId = 'test-visitor'; },
  'invalid from version': (f) => { f.catalog.policy.rules[0].transition.fromVersion = 'missing'; },
  'wrong target core': (f) => { f.catalog.policy.rules[0].coreId = 'keeper-protection-reason'; },
  'self edge': (f) => { f.catalog.policy.rules[0].transition.fromVersion = 'v1'; },
  'unreachable from state': (f) => { f.catalog.policy.accounts[0].versions.push({ id: 'v2', coreId: 'keeper-extra' }); const c = structuredClone(f.catalog.cores.at(-3)); c.id = 'keeper-extra'; f.catalog.cores.push(c); },
  'duplicate normalized aliases': (f) => { f.catalog.policy.rules[1].aliases = [' RECONSIDER THE VISIT. ']; },
  'reserved choice ID': (f) => { f.catalog.policy.rules[0].id = 'ask-alibi'; },
  'duplicate rule IDs': (f) => { f.catalog.policy.rules[1].id = f.catalog.policy.rules[0].id; },
  'unguarded extra core': (f) => { f.catalog.policy.rules.pop(); },
  'future transition code': (f) => { f.catalog.policy.rules[0].transition.script = 'revealEverything()'; },
  'self-receipt requirement': (f) => { for (const branch of f.catalog.policy.rules[0].gate.alternatives) branch[1].coreId = 'keeper-revised-visit'; },
  'mutually unreachable gates': (f) => { for (const branch of f.catalog.policy.rules[0].gate.alternatives) branch[1].coreId = 'keeper-protection-reason'; },
};
for (const [name, mutate] of Object.entries(invalid)) test(`disclosure validation rejects ${name}`, () => {
  const fixture = disclosureCase(); mutate(fixture);
  assert.notEqual(validate(fixture).length, 0); assert.notEqual(validateCasePackage(fixture).length, 0);
});

test('catalog policy identity must match registered case and mutable private annotations are snapshotted', () => {
  const fixture = disclosureCase(); fixture.catalog.policy.caseId = 'foreign-case';
  assert.notEqual(validateCasePackage(fixture).length, 0);
  assert.throws(() => createCaseRegistry({ definitions: [fixture], defaultCaseId: fixture.id }));
  const valid = disclosureCase(); const registry = createCaseRegistry({ definitions: [valid], defaultCaseId: valid.id });
  valid.catalog.policy.epistemics[0].knownFacts[0].description = 'Changed';
  assert.match(registry.resolve(valid.id).catalog.policy.epistemics[0].knownFacts[0].description, /DISCLOSURE_PRIVATE_CANARY/);
  assert.throws(() => { registry.resolve(valid.id).catalog.policy.accounts[0].initialVersion = 'v1'; }, TypeError);
});

test('multi-version account cycles are rejected and completed transition aliases select the latest version', async () => {
  const fixture = disclosureCase();
  const finalCore = structuredClone(fixture.catalog.cores.find((core) => core.id === 'keeper-revised-visit'));
  finalCore.id = 'keeper-final-visit'; finalCore.approvedContent = 'The visit ended before the later living account.';
  fixture.catalog.cores.push(finalCore);
  fixture.catalog.policy.accounts[0].versions.push({ id: 'v2', coreId: finalCore.id });
  const forward = { id: 'confirm-sequence', suspectId: 'test-keeper', coreId: finalCore.id, kind: 'contradiction', label: 'Confirm the sequence.',
    aliases: ['Confirm the sequence.'], gate: { alternatives: [[{ kind: 'received', speakerId: 'test-keeper', coreId: 'keeper-revised-visit' }]] },
    transition: { accountId: 'keeper-whereabouts', fromVersion: 'v1', toVersion: 'v2' } };
  fixture.catalog.policy.rules.push(forward);
  assert.deepEqual(validate(fixture), []);
  const cyclic = structuredClone(fixture);
  cyclic.catalog.policy.rules.push({ ...forward, id: 'reverse-sequence', aliases: ['Reverse the sequence.'], coreId: 'keeper-revised-visit',
    gate: { alternatives: [[{ kind: 'received', speakerId: 'test-keeper', coreId: finalCore.id }]] },
    transition: { accountId: 'keeper-whereabouts', fromVersion: 'v2', toVersion: 'v1' } });
  assert.notEqual(validate(cyclic).length, 0);
  const registry = createCaseRegistry({ definitions: [fixture], defaultCaseId: fixture.id }); const game = registry.createInvestigation();
  game.inspectPublicEvidence('test-ticket');
  await game.askSuspect('test-keeper', 'Where were you?'); await game.askSuspect('test-visitor', 'Where were you?');
  await game.askSuspect('test-visitor', 'Did you see anyone suspicious?');
  await game.askSuspect('test-keeper', 'Reconsider the visit.'); await game.askSuspect('test-keeper', 'Confirm the sequence.');
  const after = game.getDialogueDiagnostics().policy;
  assert.equal(Object.fromEntries(after.accounts)['keeper-whereabouts'], 'v2');
  assert.ok((await game.askSuspect('test-keeper', 'Reconsider the visit.')).text.endsWith('The visit ended before the later living account.'));
  assert.deepEqual(game.getDialogueDiagnostics().policy, after);
});
