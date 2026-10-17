import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createInvestigation, validateSpatialData } from '../src/game.js';
import { caseData } from '../src/data/case.js';
import { createSessionStore } from '../src/investigation-sessions.js';
import { runCli } from '../src/cli.js';

test('room metadata leaves original case content unchanged and invalid spatial references never fall back to global access', () => {
  const originalContent = structuredClone(caseData); delete originalContent.rooms; delete originalContent.initialLocationId;
  for (const entity of [...originalContent.suspects, ...originalContent.evidence]) { delete entity.locationId; delete entity.publicDossier; }
  // Checksum of committed pre-room case content, captured before this implementation.
  assert.equal(createHash('sha256').update(JSON.stringify(originalContent)).digest('hex'), '07f998eaaa1614a4b7e4b9d4d055140b81150a8a460fdb3515f28a6106b6f6f0');
  for (const mutate of [
    (data) => { delete data.rooms; }, (data) => { data.initialLocationId = 'unknown'; },
    (data) => { data.rooms[1].id = 'study'; }, (data) => { data.evidence[0].locationId = 'unknown'; },
    (data) => { data.suspects[0].id = data.evidence[0].id; }, (data) => { delete data.suspects[0].publicDossier; },
    (data) => { data.suspects[0].publicDossier.relationships = [{ targetSuspectId: 'unknown', kind: 'family', label: 'Not approved' }]; },
  ]) { const data = structuredClone(caseData); mutate(data); assert.ok(validateSpatialData(data).length); assert.throws(() => createInvestigation({ data }), /Invalid investigation configuration/); }
});

test('engine owns independent starting rooms and static placements; same-room travel is a no-op', () => {
  const a = createInvestigation(); const b = createInvestigation();
  assert.equal(a.getPublicView().currentLocationId, 'study');
  assert.deepEqual(a.travelTo('garden'), { kind: 'travel', locationId: 'garden', changed: true });
  const context = a.getLocationContext();
  assert.deepEqual(a.travelTo('garden'), { kind: 'travel', locationId: 'garden', changed: false });
  assert.deepEqual(a.getLocationContext(), context);
  assert.equal(b.getPublicView().currentLocationId, 'study');
  assert.deepEqual(a.getPublicView().suspects.map(({ id, locationId }) => [id, locationId]), [['alice-mercer', 'study'], ['ben-carter', 'garden'], ['clara-voss', 'library']]);
  assert.deepEqual(a.getPublicView().evidence.map(({ id, locationId }) => [id, locationId]), [['muddy-footprints', 'garden'], ['torn-contract', 'study'], ['silver-cufflink', 'study']]);
  assert.equal(a.travelTo('unknown').code, 'location_not_found'); assert.deepEqual(a.getLocationContext(), context);
});

test('remote cached and unsupported questions and both inspection paths reject before generation or disclosure', async () => {
  let calls = 0; const game = createInvestigation({ phraser: { async phrase({ approvedContent }) { calls++; return approvedContent; } } });
  for (const question of ['Where were you?', 'Tell me a joke']) assert.equal((await game.askSuspect('ben-carter', question)).code, 'suspect_not_present');
  for (const inspect of [game.inspectEvidence, game.inspectPublicEvidence]) assert.equal(inspect('muddy-footprints').code, 'evidence_not_here');
  assert.equal(calls, 0); game.travelTo('garden');
  const answer = await game.askSuspect('ben-carter', 'Where were you?'); assert.equal(calls, 1);
  game.travelTo('study'); assert.equal((await game.askSuspect('ben-carter', 'Where were you?')).code, 'suspect_not_present');
  game.travelTo('garden'); const cached = await game.askSuspect('ben-carter', 'Where were you?');
  assert.equal(cached.cached, true); assert.equal(cached.text, answer.text); assert.equal(calls, 1);
});

for (const returnHome of [false, true]) test(`pending dialogue discards after travel${returnHome ? ' away and back' : ' away'}`, async () => {
  let release; let calls = 0;
  const game = createInvestigation({ phraser: { phrase() { calls++; return new Promise((resolve) => { release = resolve; }); } } });
  const pending = game.askSuspect('alice-mercer', 'Where were you?'); game.travelTo('garden'); if (returnHome) game.travelTo('study');
  release('OBSOLETE_REPLY'); assert.equal((await pending).code, 'stale_response');
  game.travelTo('study'); const next = game.askSuspect('alice-mercer', 'Where were you?'); assert.equal(calls, 2); release('Current reply'); assert.equal((await next).cached, false);
});

test('public dossier relationships and room summaries are recursively allowlisted and detached', () => {
  const data = structuredClone(caseData); const secret = 'PRIVATE_ROOM_CANARY';
  data.rooms[0].secret = secret; data.suspects[0].publicDossier.privateFacts = secret;
  data.evidence[1].kind = 'error'; data.evidence[1].text = secret;
  data.suspects[0].publicDossier.relationships = [{ targetSuspectId: 'ben-carter', kind: 'social', label: 'Public test connection', secret }];
  const game = createInvestigation({ data }); const view = game.getPublicView();
  assert.deepEqual(game.inspectPublicEvidence('torn-contract'), { id: 'torn-contract', name: 'Torn contract', description: caseData.evidence[1].description });
  assert.doesNotMatch(JSON.stringify(view), /PRIVATE_ROOM_CANARY|epoch|description.*Fresh muddy/);
  view.rooms[0].id = 'changed'; view.suspects[0].dossier.relationships[0].label = 'Changed'; view.currentLocationId = 'garden';
  assert.equal(game.getPublicView().currentLocationId, 'study');
  assert.deepEqual(game.getPublicSuspect('alice-mercer').dossier.relationships, [{ targetSuspectId: 'ben-carter', kind: 'social', label: 'Public test connection' }]);
});

test('ended travel rejects before target lookup and cannot alter a remote accusation outcome', () => {
  for (const id of ['alice-mercer', 'clara-voss']) {
    const game = createInvestigation(); game.travelTo('garden');
    assert.equal(game.resolveAccusation(id, false).ended, false); const final = game.resolveAccusation(id, true);
    for (const room of ['study', 'garden', 'unknown', null]) { assert.equal(game.travelTo(room).code, 'investigation_ended'); assert.equal(game.getPublicView().currentLocationId, 'garden'); assert.deepEqual(game.getLifecycle().finalResult, final); }
  }
});

test('session commit rejects a cached reply invalidated during its await gap', async () => {
  const store = createSessionStore(); const entry = store.create();
  await entry.game.askSuspect('alice-mercer', 'Where were you?');
  const pending = store.run(entry, 0, true, () => entry.game.prepareDialogue('alice-mercer', { question: 'Where were you?' }));
  entry.game.travelTo('garden'); entry.game.travelTo('study');
  await assert.rejects(pending, { code: 'stale_response' }); assert.equal(entry.revision, 0); assert.equal(entry.reservation, null);
});

test('CLI explicitly travels and completes offline with invalid navigation and a room containing no evidence', async () => {
  const game = createInvestigation(); const answers = ['6', '99', '6', '2', '2', '1', '1', 'Where were you?', '6', '3', '1', '1', 'Where were you?', '2', '1', '4', '3', 'no', '6', '1', '2', '1', '4', '1', 'yes'];
  let output = '';
  await runCli({ ask: async () => { assert.ok(answers.length); return answers.shift(); }, write: (text) => { output += text; } }, { game });
  assert.equal(answers.length, 0); assert.match(output, /Please choose a valid room/); assert.match(output, /no evidence to inspect here/);
  assert.match(output, /greenhouse window/); assert.match(output, /Muddy footprints/); assert.match(output, /Incorrect\. Alice/);
});
