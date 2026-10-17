import test from 'node:test';
import assert from 'node:assert/strict';
import { createInvestigation } from '../src/game.js';
import { caseData } from '../src/data/case.js';
import { caseDialogueCatalog, validateDialogueCatalog } from '../src/data/dialogue-catalog.js';
import { validatePerformance } from '../src/npc-performance.js';
import { assertEquivalent, reviewedTestimony } from '../test-support/reviewed-testimony.js';
import { evaluate, metrics } from '../scripts/evaluate-dialogue-naturalness.js';

const ids = ['alice-mercer', 'ben-carter', 'clara-voss'];
const room = (id) => ({ 'alice-mercer': 'study', 'ben-carter': 'garden', 'clara-voss': 'library' })[id];
const memory = (g, id = ids[0]) => g.getDialogueDiagnostics().npcs.find((n) => n.id === id);

test('every authored utterance matches a frozen editorial fixture; original records and Alice debt remain unchanged', () => {
  assert.deepEqual(validateDialogueCatalog(caseDialogueCatalog, caseData), []);
  assert.equal(Object.keys(reviewedTestimony).length, 18);
  for (const core of caseDialogueCatalog.cores) {
    const expected = reviewedTestimony[core.id];
    assert.equal(expected.original, caseData.suspects.find((s) => s.id === core.suspectId).responses[core.topic].approvedContent);
    assert.deepEqual(core.deliveries.map((d) => d.dialogue), expected.speeches);
    assert.equal(core.deliveries[0].dialogue, expected.original);
    assert.ok(expected.speeches.every((s) => !/let me answer carefully|plainly put|allow me to be clear/i.test(s)));
  }
  assert.equal(reviewedTestimony['alice-mercer-motive'].speeches.length, 1);
  assert.equal(caseData.suspects[0].responses.motive.concealmentReason, 'Alice does not mention the debt.');
});

test('full-delivery schema rejects missing originals, duplicate text, invalid eligibility/IDs and oversize speech', () => {
  for (const mutate of [
    (c) => c.cores[0].deliveries[0].dialogue = 'Different alibi.',
    (c) => c.cores[0].deliveries[1].dialogue = c.cores[0].deliveries[0].dialogue,
    (c) => c.cores[0].deliveries[1].mode = 'secret',
    (c) => c.cores[0].deliveries[1].id = '../private',
    (c) => c.cores[0].deliveries[1].structure = '',
    (c) => c.cores[0].deliveries[1].dialogue = 'x'.repeat(1201),
    (c) => c.profiles[0].socialDeliveries = [],
    (c) => c.profiles[0].socialDeliveries.forEach((r) => { r.mode = 'clarify'; }),
    (c) => c.profiles[0].mannerisms[0].family = 'guilty',
  ]) { const c = structuredClone(caseDialogueCatalog); mutate(c); assert.throws(() => createInvestigation({ dialogueCatalog: c }), /Invalid dialogue configuration/); }
});

for (const id of ids) test(`${id}: neutral, clarification and pressure have distinct useful reviewed speech`, async () => {
  const neutral = createInvestigation(); neutral.travelTo(room(id));
  const plain = await neutral.askSuspect(id, 'Where were you?');
  const clarified = await neutral.askSuspect(id, 'What do you mean by that?');
  const pressure = createInvestigation(); pressure.travelTo(room(id));
  await pressure.askSuspect(id, 'You killed Victor.'); await pressure.askSuspect(id, 'You killed Victor.');
  const sharp = await pressure.askSuspect(id, 'Where were you?');
  const core = caseData.suspects.find((s) => s.id === id).responses.alibi.approvedContent;
  for (const reply of [plain, clarified, sharp]) assertEquivalent(reply.dialogue, core);
  assert.equal(plain.demeanor, 'neutral'); assert.equal(sharp.demeanor, 'irritated');
  assert.notEqual(plain.dialogue, clarified.dialogue); assert.notEqual(plain.dialogue, sharp.dialogue);
});

test('actual recent speech filters before cache, remains bounded/private and is isolated per session', async () => {
  const seen = [];
  const a = createInvestigation({ performer: { perform: async (ctx) => { seen.push(ctx); return ctx.performances[0]; } } });
  const b = createInvestigation(); const replies = [];
  for (let i = 0; i < 40; i++) replies.push(await a.askSuspect(ids[0], 'Where were you?'));
  assert.ok(replies.slice(1).every((r, i) => r.dialogue !== replies[i].dialogue));
  assert.ok(replies.some((r) => r.cached)); assert.ok(memory(a).cacheSize <= 64);
  assert.equal(memory(a).recentDeliveries.length, 3); assert.equal(memory(b).recentDeliveries.length, 0);
  assert.equal(memory(a, ids[1]).recentDeliveries.length, 0);
  assert.doesNotMatch(JSON.stringify(a.getPublicView()), /speechId|gestureCursor|gestureFamilies|comparisonReacted|recentDeliveries/);
  assert.ok(seen.every((c) => Object.keys(c).sort().join(',') === 'demeanor,intent,performances,style'));
});

test('provider cannot replay a formerly allowed speech or consume unselected gesture/cooldown state', async () => {
  let old; let current;
  const g = createInvestigation({ performer: { perform: async (ctx) => { current = ctx; old ??= ctx.performances[0]; return old; } } });
  await g.askSuspect(ids[0], 'Where were you?');
  const next = await g.askSuspect(ids[0], 'Where were you?');
  assert.throws(() => validatePerformance(old, current.performances));
  assert.notEqual(next.dialogue, old.dialogue); assert.equal(next.narration, null);
  assert.deepEqual(memory(g).gestures, []); assert.equal(memory(g).speechOnly, 2);
});

test('prefer-narration obeys default pacing; first grounded comparison has only one contextual exception', async () => {
  const g = createInvestigation({ performer: { perform: async (ctx) => ctx.performances.find((p) => p.narration !== null) ?? ctx.performances[0] } });
  await g.askSuspect(ids[0], 'Did you see anyone suspicious?'); g.travelTo('library');
  await g.askSuspect(ids[2], 'Did you see anyone suspicious?');
  assert.equal(memory(g, ids[2]).speechOnly, 1);
  const compared = await g.interact(ids[2], { choiceId: 'compare-garden-accounts' });
  assert.ok(compared.narration); assert.equal(memory(g, ids[2]).recentDeliveries.at(-1).comparisonException, true);
  const repeated = await g.interact(ids[2], { choiceId: 'compare-garden-accounts' });
  assert.equal(repeated.narration, null); assert.equal(memory(g, ids[2]).recentDeliveries.at(-1).comparisonException, false);
  const unknown = createInvestigation(); unknown.travelTo('library');
  assert.equal((await unknown.interact(ids[2], { choiceId: 'compare-garden-accounts' })).code, 'dialogue_option_unavailable');
});

for (const [id, question, attack] of [
  [ids[0], 'Where were you?', 'I was at home all evening.'],
  [ids[0], 'Did you see anyone suspicious?', 'I saw Clara go to the study shortly before the alarm.'],
  [ids[1], 'Did you see anyone suspicious?', 'I saw nobody from the greenhouse.'],
  [ids[2], 'Where were you?', 'I was reading in the library while the storm passed.'],
  [ids[2], 'What happened when Victor died?', 'I saw Alice call for help and then went to the study.'],
]) test(`rephrasing cannot omit a qualification or change epistemic stance: ${attack}`, async () => {
  const g = createInvestigation({ performer: { perform: async () => ({ narration: null, dialogue: attack }) } }); g.travelTo(room(id));
  const reply = await g.askSuspect(id, question);
  assert.notEqual(reply.dialogue, attack);
  const original = caseData.suspects.find((s) => s.id === id).responses[reply.topic].approvedContent;
  assertEquivalent(reply.dialogue, original);
  assert.ok(!memory(g, id).cache.some(([, pair]) => pair.text === attack));
});

test('quality metrics count actual repeated strings rather than trusting distinct catalog IDs', () => {
  const turns = Array.from({ length: 18 }, () => ({ dialogue: 'Plainly put: Same opening. Same words.', narration: 'Ben folds his arms.' }));
  const m = metrics(turns); assert.equal(m.signatureCount, 18); assert.equal(m.maxOpening, 18);
  assert.equal(m.repeatedFullResponses, 17); assert.equal(m.narrated, 18); assert.equal(m.consecutiveSameSpeech, 17);
});

for (const mode of ['offline', 'fake-last-pair', 'first-pair', 'prefer-null', 'prefer-narration', 'invalid', 'error']) test(`fixed 18-question quality sequence is reproducible and passes mechanical gates: ${mode}`, async () => {
  const first = await evaluate(mode); assert.deepEqual(await evaluate(mode), first);
  assert.equal(first.length, 3);
  for (const row of first) { assert.equal(row.turns.length, 18); assert.ok(Object.values(row.gates).every(Boolean), JSON.stringify(row.gates)); }
});
