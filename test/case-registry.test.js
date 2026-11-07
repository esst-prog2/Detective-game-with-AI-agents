import test from 'node:test';
import assert from 'node:assert/strict';
import { createCaseRegistry, caseRegistry } from '../src/cases/registry.js';
import { ashcroft } from '../src/cases/ashcroft.js';
import { validateCasePackage } from '../src/cases/validate-package.js';
import { secondCase } from '../test-support/second-case.js';
import { createInvestigation } from '../src/game.js';

test('production manifest keeps Ashcroft default and publishes the bounded preview; unavailable inputs never become loaders', () => {
  assert.deepEqual(caseRegistry.list(), [{ id: 'ashcroft', title: 'The Ashcroft Manor Murder', mode: 'full' }, { id: 'greyhaven-preview', title: 'The Last Bell at Greyhaven — Repair Dispute Preview', mode: 'preview' }]);
  for (const id of ['greyhaven', 'test-harbor', '../data/case.js', 'C:\\case.js', '', null, 4, {}, '__proto__']) assert.equal(caseRegistry.resolve(id), null);
  assert.deepEqual(caseRegistry.createInvestigation().getPublicView(), createInvestigation().getPublicView());
});

test('registry snapshots deeply and filters metadata without sharing mutable authoring records', () => {
  const fixture = secondCase();
  const registry = createCaseRegistry({ definitions: [ashcroft, fixture] });
  fixture.data.evidence[0].description = 'Changed after registration';
  assert.equal(registry.createInvestigation('test-harbor').inspectPublicEvidence('test-ticket').description, 'A stamped harbor ticket.');
  const definition = registry.resolve('test-harbor');
  assert.throws(() => { definition.data.suspects[0].privateFacts.push('changed'); }, TypeError);
  assert.throws(() => { definition.catalog.cores[0].approvedContent = 'changed'; }, TypeError);
  const list = registry.list(); list[1].title = 'Changed';
  assert.equal(registry.list()[1].title, 'Synthetic Harbor Test');
  assert.doesNotMatch(JSON.stringify(registry.list()), /murderer|MULTICASE_PRIVATE_CANARY|catalog|privateCanon|test-keeper/);
  assert.deepEqual(Object.keys(list[0]).sort(), ['id', 'mode', 'title']);
});

test('duplicate identities and unavailable publication fail at registration', () => {
  assert.throws(() => createCaseRegistry({ definitions: [ashcroft, ashcroft] }), /Duplicate/);
  for (const publishedIds of [['missing'], ['ashcroft', 'ashcroft']]) assert.throws(() => createCaseRegistry({ publishedIds }));
  const registry = createCaseRegistry({ definitions: [ashcroft, secondCase()], publishedIds: ['ashcroft'] });
  assert.equal(registry.resolve('test-harbor'), null);
  assert.throws(() => registry.createInvestigation('test-harbor'), /Unavailable/);
});

const invalidPackages = {
  'invalid identity': (p) => { p.id = '../test'; },
  'mismatched metadata': (p) => { p.publicMetadata.id = 'ashcroft'; },
  'private public metadata': (p) => { p.publicMetadata.murdererId = 'test-keeper'; },
  'unsupported policy': (p) => { p.policy = {}; },
  'preview deferred': (p) => { p.mode = 'preview'; },
  'unsupported catalog schema': (p) => { p.catalog.schemaVersion = 2; },
  'foreign solution': (p) => { p.solution.murdererId = 'clara-voss'; },
  'conflicting solution': (p) => { p.data.murdererId = 'test-visitor'; },
  'foreign placement': (p) => { p.data.evidence[0].locationId = 'study'; },
  'duplicate entity': (p) => { p.data.evidence[0].id = 'test-keeper'; },
  'foreign relationship': (p) => { p.data.suspects[0].publicDossier.relationships.push({ targetSuspectId: 'clara-voss', kind: 'family', label: 'Cousin' }); },
  'missing profile': (p) => { p.catalog.profiles.pop(); },
  'missing subject': (p) => { p.catalog.cores.pop(); },
  'foreign speaker': (p) => { p.catalog.cores[0].suspectId = 'clara-voss'; },
  'foreign evidence gate': (p) => { p.catalog.cores[0].requiredEvidenceId = 'silver-cufflink'; },
  'foreign evidence option': (p) => { p.catalog.evidence.push({ id: 'present-ticket', label: 'Present ticket', suspectId: 'test-keeper', evidenceId: 'silver-cufflink', coreId: 'test-keeper-alibi' }); },
  'foreign comparison': (p) => { p.catalog.comparisons.push({ id: 'compare', label: 'Compare accounts', suspectId: 'test-keeper', coreId: 'test-keeper-alibi', requires: ['test-keeper-alibi', 'clara-voss-alibi'], triggers: ['compare'] }); },
  'missing public victim': (p) => { delete p.data.victim; },
  'missing fallback': (p) => { delete p.data.suspects[0].responses.alibi.fallbackText; },
  'reserved ending identity': (p) => { p.catalog.version = 'ashcroft-dialogue-v3'; },
  'mutable collection in canon': (p) => { p.privateCanon = new Map([['secret', 'value']]); },
  'executable loader': (p) => { p.privateCanon = () => 'secret'; },
  'sparse rooms': (p) => { delete p.data.rooms[0]; },
};
for (const [name, mutate] of Object.entries(invalidPackages)) test(`package rejects ${name}`, () => {
  const fixture = secondCase(); mutate(fixture);
  assert.notEqual(validateCasePackage(fixture).length, 0);
  assert.throws(() => createCaseRegistry({ definitions: [ashcroft, fixture] }));
});

test('second case has distinct authorized testimony and independent solution', async () => {
  const registry = createCaseRegistry({ definitions: [ashcroft, secondCase()] });
  const game = registry.createInvestigation('test-harbor');
  assert.equal((await game.askSuspect('test-keeper', 'Where were you?')).text, 'I stayed by the harbor gate.');
  assert.equal(game.resolveAccusation('test-keeper', true).text, 'Correct. Test Keeper murdered Test Victim.');
});

for (const mode of ['performer', 'phraser']) for (const caseId of ['ashcroft', 'test-harbor']) {
  test(`${mode} rejects another case's testimony without sharing private context (${caseId})`, async () => {
    const registry = createCaseRegistry({ definitions: [ashcroft, secondCase()] });
    const expected = caseId === 'ashcroft' ? 'I was at home in my room all evening.' : 'I stayed by the harbor gate.';
    const forged = caseId === 'ashcroft' ? 'I stayed by the harbor gate.' : 'I was at home in my room all evening.';
    let context;
    const adapter = mode === 'performer' ? { perform: async (input) => { context = input; return { narration: null, dialogue: forged }; } }
      : { phrase: async (input) => { context = input; return forged; } };
    const game = registry.createInvestigation(caseId, { [mode]: adapter });
    const reply = await game.askSuspect(caseId === 'ashcroft' ? 'alice-mercer' : 'test-keeper', 'Where were you?');
    assert.equal(reply.text, expected);
    assert.doesNotMatch(JSON.stringify(context), /MULTICASE_PRIVATE_CANARY|murdererId|privateCanon/);
    assert.equal(JSON.stringify(game.getPublicView()).includes(forged), false);
  });
}
