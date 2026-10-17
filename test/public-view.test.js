import assert from 'node:assert/strict';
import test from 'node:test';
import { createInvestigation } from '../src/game.js';
import { caseData } from '../src/data/case.js';

// Independently authored initial dialogue contract; no production resolver imports.
function expectedDialogue(room = 'study', inspected = []) {
  const topicOptions = [
    { id: 'ask-hiding', label: 'Are you hiding something from me?', kind: 'social' },
    { id: 'ask-alibi', label: 'Where were you when the victim died?', kind: 'topic' },
    { id: 'ask-relationship-with-victim', label: 'What was your relationship with the victim?', kind: 'topic' },
    { id: 'ask-motive', label: 'Did you have a reason to hurt the victim?', kind: 'topic' },
    { id: 'ask-sighting', label: 'Did you see anyone suspicious?', kind: 'topic' },
    { id: 'ask-evidence', label: 'What do you know about the evidence?', kind: 'topic' },
  ];
  return { inspectedEvidenceIds: [...inspected], conversations: [
    ['alice-mercer', 'study'], ['ben-carter', 'garden'], ['clara-voss', 'library'],
  ].map(([suspectId, location]) => ({ suspectId, demeanor: 'neutral', recentTurns: [],
    options: location !== room ? [] : suspectId === 'ben-carter' && inspected.includes('muddy-footprints')
      ? [{ id: 'present-footprints', label: 'Present the inspected muddy footprints.', kind: 'evidence' }, ...topicOptions].slice(0, 6) : structuredClone(topicOptions),
  })) };
}

// Independently specified public contract, rather than a copy of a raw case record.
const expectedView = {
  dialogue: expectedDialogue(),
  lifecycle: { status: 'active', finalResult: null },
  title: 'The Ashcroft Manor Murder',
  victim: {
    name: 'Victor Hale',
    description: 'The owner of Ashcroft Manor, found dead in his study after a stormy dinner.',
  },
  locations: ['the study', 'the library', 'the garden'],
  rooms: [{ id: 'study', name: 'the study' }, { id: 'library', name: 'the library' }, { id: 'garden', name: 'the garden' }],
  currentLocationId: 'study',
  suspects: [
    { id: 'alice-mercer', name: 'Alice Mercer', locationId: 'study', dossier: { role: 'Housekeeper', relationshipToVictim: 'Employed by Victor Hale.', background: 'Alice Mercer works as the housekeeper at Ashcroft Manor.', relationships: [] } },
    { id: 'ben-carter', name: 'Ben Carter', locationId: 'garden', dossier: { role: 'Gardener', relationshipToVictim: 'Employed by Victor Hale.', background: "Ben Carter works as Victor Hale's gardener.", relationships: [] } },
    { id: 'clara-voss', name: 'Clara Voss', locationId: 'library', dossier: { role: 'Business partner', relationshipToVictim: 'Business partner of Victor Hale.', background: "Clara Voss is Victor Hale's business partner and a frequent guest at Ashcroft Manor.", relationships: [] } },
  ],
  evidence: [
    { id: 'muddy-footprints', name: 'Muddy footprints', locationId: 'garden' },
    { id: 'torn-contract', name: 'Torn contract', locationId: 'study' },
    { id: 'silver-cufflink', name: 'Silver cufflink', locationId: 'study' },
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
    game.travelTo(evidence.locationId);
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
  for (const evidence of data.evidence) {
    evidence.solutionMetadata = { secret };
    evidence.code = 'investigation_ended'; // Private metadata is not a lifecycle signal.
  }
  const game = createInvestigation({ data });
  assert.deepEqual(game.getPublicView(), expectedView);
  const results = [game.getPublicView(), game.listEvidence(),
    ...data.suspects.map(({ id }) => game.getPublicSuspect(id)),
    ...data.evidence.map(({ id }) => game.inspectPublicEvidence(id))];
  assert.equal(JSON.stringify(results).includes(secret), false);
  for (const suspect of data.suspects) {
    assert.deepEqual(game.getPublicSuspect(suspect.id), expectedView.suspects.find(({ id }) => id === suspect.id));
  }
  for (const evidence of data.evidence) {
    game.travelTo(evidence.locationId);
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
  game.travelTo('garden');
  const inspection = game.inspectPublicEvidence('muddy-footprints');
  const summaries = game.listEvidence();
  assert.notStrictEqual(view, game.getPublicView());
  assert.notStrictEqual(view.victim, game.getPublicView().victim);
  assert.notStrictEqual(view.lifecycle, game.getPublicView().lifecycle);
  assert.notStrictEqual(view.locations, data.locations);
  assert.notStrictEqual(view.suspects[0], game.getPublicView().suspects[0]);
  assert.notStrictEqual(view.evidence[0], game.getPublicView().evidence[0]);
  assert.notStrictEqual(identity, game.getPublicSuspect('clara-voss'));
  assert.notStrictEqual(inspection, game.inspectPublicEvidence('muddy-footprints'));
  view.title = 'Changed';
  view.lifecycle.status = 'ended';
  view.lifecycle.finalResult = { ended: true, result: 'incorrect', text: 'Changed' };
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
  assert.deepEqual(game.getPublicView(), { ...expectedView, currentLocationId: 'garden', dialogue: expectedDialogue('garden', ['muddy-footprints']) });
  assert.equal(game.getPublicSuspect('clara-voss').name, 'Clara Voss');
  const { locationId: _placement, ...publicClue } = original.evidence[0];
  assert.deepEqual(game.inspectPublicEvidence('muddy-footprints'), publicClue);
  assert.deepEqual(game.inspectEvidence('muddy-footprints'), original.evidence[0]);
  game.travelTo('study');
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
    rooms: ['Atrium', 'Dock', 'Attic', 'Courtyard'].map((name) => ({ id: name.toLowerCase(), name })), initialLocationId: 'atrium',
    suspects: Array.from({ length: 8 }, (_, i) => ({ id: `suspect-${i}`, name: `Guest ${i}`, locationId: 'atrium', publicDossier: { role: 'Guest', relationshipToVictim: 'Known guest.', background: 'An authored public guest.', relationships: [] }, privateFacts: ['hidden'] })),
    evidence: [{ id: 'note', name: 'A note', locationId: 'atrium', description: 'An unsigned note.', privateOwner: 'hidden' }],
  };
  const game = createInvestigation({ data });
  assert.deepEqual(game.getPublicView(), {
    dialogue: { inspectedEvidenceIds: [], conversations: [] },
    lifecycle: { status: 'active', finalResult: null },
    title: 'Another case', victim: { name: 'Robin', description: 'An authored introduction.' },
    locations: ['Atrium', 'Dock', 'Attic', 'Courtyard'],
    rooms: ['Atrium', 'Dock', 'Attic', 'Courtyard'].map((name) => ({ id: name.toLowerCase(), name })), currentLocationId: 'atrium',
    suspects: Array.from({ length: 8 }, (_, i) => ({ id: `suspect-${i}`, name: `Guest ${i}`, locationId: 'atrium', dossier: { role: 'Guest', relationshipToVictim: 'Known guest.', background: 'An authored public guest.', relationships: [] } })),
    evidence: [{ id: 'note', name: 'A note', locationId: 'atrium' }],
  });
  assert.deepEqual(game.getPublicSuspect('suspect-7'), { id: 'suspect-7', name: 'Guest 7', locationId: 'atrium', dossier: { role: 'Guest', relationshipToVictim: 'Known guest.', background: 'An authored public guest.', relationships: [] } });
  assert.deepEqual(game.inspectPublicEvidence('note'), { id: 'note', name: 'A note', description: 'An unsigned note.' });
});
