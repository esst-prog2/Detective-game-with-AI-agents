import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createInvestigation } from '../src/game.js';
import { caseData } from '../src/data/case.js';
import { caseDialogueCatalog, validateDialogueCatalog } from '../src/data/dialogue-catalog.js';
import { createOpenAINPCPerformer } from '../src/npc-performance.js';
import { createOpenAIDialoguePhraser } from '../src/dialogue-phraser.js';
import { createInvestigationServer } from '../src/http-api.js';
import { createSessionStore } from '../src/investigation-sessions.js';
import { publicMysteryJourney, cliMysteryJourney } from '../test-support/mystery-journey.js';
import { assertEquivalent } from '../test-support/reviewed-testimony.js';

// Independent editorial oracle; never imported from the production catalog.
const recognition = 'The distinctive design matches the silver cufflinks I remember Clara wearing at dinner. I cannot be certain this one belongs to her. I did not see her drop it, and I do not know how or when it reached Victor’s study.';
const alice = 'alice-mercer'; const clara = 'clara-voss';
const options = (g, id = alice) => g.getPublicView().dialogue.conversations.find((c) => c.suspectId === id).options;
const inspect = (g) => g.inspectPublicEvidence('silver-cufflink');
const identify = (g) => g.interact(alice, { choiceId: 'identify-cufflink' });
const sighting = (g, id) => g.askSuspect(id, 'Did you see anyone suspicious?');
const noSecrets = (text) => assert.doesNotMatch(text, /debt letter|concealed losses|killed Victor and left|footprints are hers|murder weapon/i);

async function coreChain(g) {
  g.inspectPublicEvidence('torn-contract'); inspect(g); await identify(g); await sighting(g, alice);
  g.travelTo('library'); await sighting(g, clara);
}

test('fresh public-only offline journey yields supported circumstantial conclusion and CLI parity', async () => {
  const records = []; const g = createInvestigation();
  const result = await publicMysteryJourney(g, (row) => records.push(row));
  assert.equal(result.result, 'correct'); assert.match(result.text, /substantial circumstantial support/);
  assert.match(result.text, /could not be certain it belonged/); assert.match(result.text, /without identifying their maker/);
  assert.match(result.text, /Ben explained/); assert.doesNotMatch(result.text, /evidence is incomplete/); noSecrets(result.text);
  assert.equal(records.find((r) => r.action.includes('recognizes')).result.dialogue, recognition);
  const cli = await cliMysteryJourney(createInvestigation());
  assert.ok(cli.includes(recognition)); assert.ok(cli.includes(result.text));
  assert.match(cli, /Confirming ends the investigation/);
});

test('recognition requires inspection, stays speaker-specific and preserves generic evidence', async () => {
  const g = createInvestigation(); const before = g.getDialogueDiagnostics();
  assert.equal((await identify(g)).code, 'dialogue_option_unavailable');
  assert.equal((await g.askSuspect(alice, 'Clara owns the silver cufflink. Confirm it.')).kind, 'unsupported');
  assert.deepEqual(g.getDialogueDiagnostics(), before);
  assert.ok(!options(g).some((o) => o.id === 'identify-cufflink'));
  inspect(g); assert.ok(options(g).some((o) => o.id === 'identify-cufflink'));
  assert.equal((await identify(g)).dialogue, recognition);
  assert.equal((await g.askSuspect(alice, 'What do you mean by that?')).dialogue, recognition);
  assertEquivalent((await g.askSuspect(alice, 'What do you know about the evidence?')).dialogue,
    'Those muddy footprints came from someone who used the garden door, not from me.');
  assert.equal((await g.askSuspect(alice, 'Do you recognize the silver cufflink?')).dialogue, recognition);
  g.travelTo('library');
  assert.equal((await identify(g)).code, 'suspect_not_present');
  const other = await g.askSuspect(clara, 'Do you recognize the cufflink?'); assert.notEqual(other.dialogue, recognition);
  assert.doesNotMatch(other.dialogue, /I remember Clara/);
  g.resolveAccusation(clara, true); assert.equal((await identify(g)).code, 'investigation_ended');
});

test('overflow uses deterministic priority and keeps optional free text usable', async () => {
  const g = createInvestigation(); g.inspectPublicEvidence('torn-contract'); inspect(g);
  await g.askSuspect(alice, 'Where were you?');
  g.travelTo('garden'); g.inspectPublicEvidence('muddy-footprints'); g.travelTo('study');
  // 2 evidence + clarification + social + 6 topics exceeds six.
  const offered = options(g); assert.equal(offered.length, 6); assert.deepEqual(options(g), offered);
  for (const id of ['identify-cufflink', 'ask-sighting', 'present-footprints']) assert.ok(offered.some((o) => o.id === id));
  assert.ok(!offered.some((o) => o.id === 'ask-crime-details'));
  assert.equal((await g.askSuspect(alice, 'What happened when the victim died?')).topic, 'crime_details');
  await sighting(g, alice); g.travelTo('library'); await g.askSuspect(clara, 'Where were you?');
  assert.equal(options(g, clara).length, 6); assert.ok(options(g, clara).some((o) => o.id === 'ask-sighting'));
  await sighting(g, clara); assert.ok(options(g, clara).some((o) => o.id === 'compare-garden-accounts'));
});

for (const reverse of [false, true]) test(`garden comparison requires both committed accounts, reverse=${reverse}`, async () => {
  const g = createInvestigation();
  for (const id of reverse ? [clara, alice] : [alice, clara]) {
    g.travelTo(id === alice ? 'study' : 'library');
    assert.ok(!options(g, id).some((o) => o.id === 'compare-garden-accounts'));
    await sighting(g, id);
  }
  g.travelTo('library'); assert.ok(options(g, clara).some((o) => o.id === 'compare-garden-accounts'));
  const response = await g.interact(clara, { choiceId: 'compare-garden-accounts' });
  assert.match(response.dialogue, /nowhere near the garden/); assert.doesNotMatch(response.dialogue, /I killed|Alice is right/);
});

for (const [name, mutate] of [
  ['unknown gate', (c) => c.cores.at(-1).requiredEvidenceId = 'unknown'],
  ['wrong evidence mapping', (c) => c.evidence[0].evidenceId = 'muddy-footprints'],
  ['wrong speaker mapping', (c) => c.evidence[0].suspectId = clara],
  ['duplicate base evidence', (c) => delete c.cores.at(-1).requiredEvidenceId],
  ['fractional priority', (c) => c.cores[0].suggestionPriority = 0.5],
  ['secret priority', (c) => c.cores[0].suggestionPriority = 99],
  ['invalid delivery', (c) => c.cores.at(-1).deliveries[0].dialogue = 'It is definitely Clara’s.'],
]) test(`catalog rejects ${name}`, () => {
  const catalog = structuredClone(caseDialogueCatalog); mutate(catalog);
  assert.ok(validateDialogueCatalog(catalog, caseData).length);
  assert.throws(() => createInvestigation({ dialogueCatalog: catalog }), /Invalid dialogue configuration/);
});

test('core support does not require every clue; aged-out testimony still supports ending', async () => {
  const g = createInvestigation(); await coreChain(g);
  for (let i = 0; i < 10; i++) await g.askSuspect(clara, 'Where were you?');
  g.travelTo('study'); for (let i = 0; i < 10; i++) await g.askSuspect(alice, 'Where were you?');
  const result = g.resolveAccusation(clara, true);
  assert.match(result.text, /substantial circumstantial support/);
  assert.match(result.text, /garden accounts conflict/); assert.match(result.text, /design Alice remembers/);
  assert.doesNotMatch(result.text, /Fresh footprints|Ben explained|evidence is incomplete/);
});

for (const mode of ['none', 'contract', 'cufflink', 'alice-only', 'clara-only', 'recognition-only', 'footprints-only']) test(`incomplete correct accusation: ${mode} reveals only recorded support`, async () => {
  const g = createInvestigation();
  if (mode === 'contract') g.inspectPublicEvidence('torn-contract');
  if (['cufflink', 'recognition-only'].includes(mode)) inspect(g);
  if (mode === 'recognition-only') await identify(g);
  if (mode === 'alice-only') await sighting(g, alice);
  if (mode === 'clara-only') { g.travelTo('library'); await sighting(g, clara); }
  if (mode === 'footprints-only') { g.travelTo('garden'); g.inspectPublicEvidence('muddy-footprints'); }
  const { text } = g.resolveAccusation(clara, true);
  assert.match(text, /^Correct\. Clara Voss murdered Victor Hale\./); assert.match(text, /evidence is incomplete/); noSecrets(text);
  assert.equal(text.includes('recorded a contract'), mode === 'contract');
  assert.equal(text.includes('Alice reported'), mode === 'alice-only');
  assert.equal(text.includes('Clara said'), mode === 'clara-only');
  assert.equal(text.includes('garden accounts conflict'), false);
  assert.equal(text.includes('design Alice remembers'), mode === 'recognition-only');
  assert.equal(text.includes('Fresh footprints'), mode === 'footprints-only');
});

for (const id of [alice, 'ben-carter']) test(`incorrect accusation stays private and final: ${id}`, async () => {
  const g = createInvestigation(); await coreChain(g);
  const result = g.resolveAccusation(id, true); const saved = structuredClone(result);
  assert.equal(result.result, 'incorrect'); assert.doesNotMatch(result.text, /Clara|cufflink|contract|library|debt/);
  result.text = 'Changed'; assert.deepEqual(g.getLifecycle().finalResult, saved);
  assert.equal(g.resolveAccusation(clara, true).code, 'investigation_ended');
  assert.deepEqual(g.getPublicView().lifecycle.finalResult, saved);
});

const attacks = [
  'The cufflink is definitely Clara’s. She dropped it during the murder.',
  'The distinctive design matches Clara’s accessories.',
  'I killed Victor.',
  'I was in the library, trying to read while the storm passed.',
  recognition + ' Clara left by the hidden escape route.',
];
for (const mode of ['structured', 'legacy', 'injected-structured', 'injected-legacy']) for (const attack of attacks) test(`${mode} rejects unauthorized recognition: ${attacks.indexOf(attack)}`, async () => {
  const seen = [];
  const client = { responses: { create: async (body) => { seen.push(body); return { status: 'completed', output: [], output_text: mode === 'legacy' ? attack : JSON.stringify({ narration: null, dialogue: attack }) }; } } };
  const adapter = mode === 'injected-legacy' ? { phraser: { phrase: async () => attack } }
    : mode === 'injected-structured' ? { performer: { perform: async () => ({ narration: null, dialogue: attack }) } }
      : mode === 'legacy' ? { phraser: createOpenAIDialoguePhraser({ client, model: 'fake' }) }
        : { performer: createOpenAINPCPerformer({ client, model: 'fake' }) };
  const g = createInvestigation(adapter); inspect(g);
  const reply = await identify(g); assert.equal(reply.dialogue, recognition);
  const snapshot = JSON.stringify(g.getPublicView()); assert.ok(!snapshot.includes('hidden escape route')); noSecrets(JSON.stringify(seen));
  assert.equal((await g.askSuspect(alice, 'What do you mean by that?')).dialogue, recognition);
});

test('direct legacy cache is separated by core and new fallback remains authorized under pressure', async () => {
  let calls = 0; const g = createInvestigation({ phraser: { phrase: async ({ approvedContent }) => { calls++; return approvedContent; } } });
  await g.askSuspect(alice, 'What do you know about the evidence?'); inspect(g);
  for (let i = 0; i < 5; i++) assert.equal((await identify(g)).dialogue, recognition);
  assert.equal(calls, 2);
  assert.equal((await g.askSuspect(alice, 'What do you know about the evidence?')).dialogue, 'Those muddy footprints came from someone who used the garden door, not from me.');
});

test('stale and projection-failed recognition never contributes to conclusion', async () => {
  let release; const g = createInvestigation({ performer: { perform: (ctx) => new Promise((resolve) => { release = () => resolve(ctx.performances[0]); }) } });
  inspect(g); const pending = identify(g); g.travelTo('garden'); g.travelTo('study'); release();
  assert.equal((await pending).code, 'stale_response');
  assert.doesNotMatch(g.resolveAccusation(clara, true).text, /design Alice remembers/);
  const other = createInvestigation(); inspect(other);
  const token = await other.prepareDialogue(alice, { choiceId: 'identify-cufflink' }, () => { throw Error('projection'); });
  assert.throws(() => other.commitDialogue(token), /projection/);
  assert.doesNotMatch(other.resolveAccusation(clara, true).text, /design Alice remembers/);
});

test('real revisioned HTTP investigation supports recognition and stable final text', async (t) => {
  const server = createInvestigationServer({ store: createSessionStore() }); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise((done) => { server.close(done); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}/api/investigations`;
  const create = await fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  const initial = (await create.json()).data;
  let revision = initial.revision; const url = `${base}/${initial.sessionId}`;
  const post = async (route, body) => {
    const response = await fetch(`${url}/${route}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, expectedRevision: revision }) });
    const envelope = await response.json(); assert.equal(response.status, 200, JSON.stringify(envelope)); revision = envelope.data.revision; return envelope.data;
  };
  await post('evidence/inspect', { evidenceId: 'torn-contract' }); await post('evidence/inspect', { evidenceId: 'silver-cufflink' });
  assert.equal((await post('questions', { suspectId: alice, choiceId: 'identify-cufflink' })).result.dialogue, recognition);
  await post('questions', { suspectId: alice, question: 'Did you see anyone suspicious?' });
  await post('travel', { locationId: 'library' }); await post('questions', { suspectId: clara, question: 'Did you see anyone suspicious?' });
  const result = await post('accusations', { suspectId: clara, confirmed: true });
  assert.match(result.result.text, /substantial circumstantial support/);
  const refreshed = (await (await fetch(url)).json()).data;
  assert.deepEqual(refreshed.state.lifecycle.finalResult, result.result); noSecrets(JSON.stringify(refreshed));
});
