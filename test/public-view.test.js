import assert from 'node:assert/strict';
import test from 'node:test';
import { createInvestigation } from '../src/game.js';
import { caseData } from '../src/data/case.js';

// Independently specified public contract, rather than a copy of a raw case record.
const expectedView = {
  title: 'The Ashcroft Manor Murder',
  victim: {
    name: 'Victor Hale',
    description: 'The owner of Ashcroft Manor, found dead in his study after a stormy dinner.',
  },
  locations: ['the study', 'the library', 'the garden'],
  suspects: [
    { id: 'alice-mercer', name: 'Alice Mercer' },
    { id: 'ben-carter', name: 'Ben Carter' },
    { id: 'clara-voss', name: 'Clara Voss' },
  ],
  evidence: [
    { id: 'muddy-footprints', name: 'Muddy footprints' },
    { id: 'torn-contract', name: 'Torn contract' },
    { id: 'silver-cufflink', name: 'Silver cufflink' },
  ],
};

test('public overview contains exactly the authored player-visible fields in order', () => {
  const view = createInvestigation().getPublicView();
  assert.deepEqual(view, expectedView);
  assert.deepEqual(JSON.parse(JSON.stringify(view)), expectedView);
});

test('public lookups expose identities and inspected descriptions, with null for unknown IDs', () => {
  const game = createInvestigation();
  for (const identity of expectedView.suspects) {
    assert.deepEqual(game.getPublicSuspect(identity.id), identity);
  }
  for (const evidence of caseData.evidence) {
    assert.deepEqual(game.inspectPublicEvidence(evidence.id), {
      id: evidence.id, name: evidence.name, description: evidence.description,
    });
  }
  for (const id of ['missing', '__proto__', '', undefined, null]) {
    assert.equal(game.getPublicSuspect(id), null);
    assert.equal(game.inspectPublicEvidence(id), null);
  }
});

test('private fields planted at every record level stay out of serialized public results', () => {
  const data = structuredClone(caseData);
  const secret = 'FORBIDDEN_CANARY_hidden_passage';
  data.murdererId = secret;
  data.intendedSolution = [secret];
  data.futurePrivateField = { secret };
  data.victim.privateHistory = secret;
  for (const suspect of data.suspects) {
    for (const field of ['personality', 'relationshipToVictim', 'motive', 'privateFacts',
      'permittedLie', 'responses', 'knowledge', 'beliefs', 'secrets', 'disclosureConditions',
      'truthfulness', 'concealmentReason', 'futurePrivateField']) {
      suspect[field] = { secret };
    }
  }
  for (const evidence of data.evidence) evidence.solutionMetadata = { secret };
  const game = createInvestigation({ data });
  assert.deepEqual(game.getPublicView(), expectedView);
  const results = [game.getPublicView(), game.listEvidence(),
    ...data.suspects.map(({ id }) => game.getPublicSuspect(id)),
    ...data.evidence.map(({ id }) => game.inspectPublicEvidence(id))];
  assert.equal(JSON.stringify(results).includes(secret), false);
  for (const suspect of data.suspects) {
    assert.deepEqual(game.getPublicSuspect(suspect.id), { id: suspect.id, name: suspect.name });
  }
  for (const evidence of data.evidence) {
    assert.deepEqual(game.inspectPublicEvidence(evidence.id), {
      id: evidence.id, name: evidence.name, description: evidence.description,
    });
  }
});

test('mutating public results cannot change case data, later reads or gameplay', async () => {
  const data = structuredClone(caseData);
  const original = structuredClone(data);
  let calls = 0;
  const game = createInvestigation({ data, phraser: {
    async phrase({ approvedContent }) { calls += 1; return `quietly: ${approvedContent}`; },
  } });
  const view = game.getPublicView();
  const identity = game.getPublicSuspect('clara-voss');
  const inspection = game.inspectPublicEvidence('muddy-footprints');
  const summaries = game.listEvidence();
  assert.notStrictEqual(view, game.getPublicView());
  assert.notStrictEqual(view.victim, game.getPublicView().victim);
  assert.notStrictEqual(view.locations, data.locations);
  assert.notStrictEqual(view.suspects[0], game.getPublicView().suspects[0]);
  assert.notStrictEqual(view.evidence[0], game.getPublicView().evidence[0]);
  assert.notStrictEqual(identity, game.getPublicSuspect('clara-voss'));
  assert.notStrictEqual(inspection, game.inspectPublicEvidence('muddy-footprints'));
  view.title = 'Changed';
  view.victim.name = 'Changed';
  view.victim.description = 'Changed';
  view.locations[0] = 'Changed';
  view.locations.push('Added');
  view.suspects[0].id = 'Changed';
  view.suspects[0].name = 'Changed';
  view.suspects.splice(1);
  view.evidence[0].name = 'Changed';
  view.evidence.pop();
  identity.id = 'alice-mercer';
  identity.name = 'Changed';
  inspection.description = 'Changed';
  inspection.id = 'Changed';
  summaries[0].name = 'Changed';
  assert.equal(calls, 0, 'public reads must not call the dialogue adapter');
  assert.deepEqual(data, original);
  assert.deepEqual(game.getPublicView(), expectedView);
  assert.equal(game.getPublicSuspect('clara-voss').name, 'Clara Voss');
  assert.deepEqual(game.inspectPublicEvidence('muddy-footprints'), original.evidence[0]);
  assert.deepEqual(game.inspectEvidence('muddy-footprints'), original.evidence[0]);
  const answer = await game.askSuspect('alice-mercer', 'Where were you?');
  assert.equal(answer.text, `quietly: ${original.suspects[0].responses.alibi.approvedContent}`);
  game.getPublicView();
  const repeat = await game.askSuspect('alice-mercer', 'Where were you?');
  assert.equal(repeat.text, answer.text);
  assert.equal(repeat.cached, true);
  assert.equal(calls, 1);
  assert.equal(game.resolveAccusation('clara-voss', false).ended, false);
  assert.equal(game.resolveAccusation('clara-voss', true).result, 'correct');
  assert.equal(createInvestigation({ data }).resolveAccusation('alice-mercer', true).result, 'incorrect');
  assert.strictEqual(game.data, data, 'legacy trusted contracts remain available');
  assert.strictEqual(game.findSuspect('alice-mercer'), data.suspects[0]);
});

test('public projections use injected case identities and collection sizes', () => {
  const data = {
    title: 'Another case', victim: { name: 'Robin', description: 'An authored introduction.', secret: 'hidden' },
    murdererId: 'suspect-7', intendedSolution: ['hidden'],
    locations: ['Atrium', 'Dock', 'Attic', 'Courtyard'],
    suspects: Array.from({ length: 8 }, (_, i) => ({ id: `suspect-${i}`, name: `Guest ${i}`, privateFacts: ['hidden'] })),
    evidence: [{ id: 'note', name: 'A note', description: 'An unsigned note.', privateOwner: 'hidden' }],
  };
  const game = createInvestigation({ data });
  assert.deepEqual(game.getPublicView(), {
    title: 'Another case', victim: { name: 'Robin', description: 'An authored introduction.' },
    locations: ['Atrium', 'Dock', 'Attic', 'Courtyard'],
    suspects: Array.from({ length: 8 }, (_, i) => ({ id: `suspect-${i}`, name: `Guest ${i}` })),
    evidence: [{ id: 'note', name: 'A note' }],
  });
  assert.deepEqual(game.getPublicSuspect('suspect-7'), { id: 'suspect-7', name: 'Guest 7' });
  assert.deepEqual(game.inspectPublicEvidence('note'), { id: 'note', name: 'A note', description: 'An unsigned note.' });
});
