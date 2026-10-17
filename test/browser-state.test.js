import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createInvestigationClient, publicState } from '../web/src/api/investigation-client.js';
import { initialState, investigationReducer } from '../web/src/state/investigation-state.js';

const token = 'a'.repeat(64);
const profile = { role: 'Guest', relationshipToVictim: 'A known guest.', background: 'Public introduction.', relationships: [] };
const state = { title: 'Public case', victim: { name: 'Victim', description: 'Public introduction' }, locations: ['the study', 'the garden'], rooms: [{ id: 'study', name: 'the study' }, { id: 'garden', name: 'the garden' }], currentLocationId: 'study', suspects: [{ id: 'guest', name: 'Guest', locationId: 'study', dossier: profile }, { id: 'another', name: 'Another Guest', locationId: 'study', dossier: profile }], evidence: [{ id: 'clue', name: 'Clue', locationId: 'study' }], lifecycle: { status: 'active', finalResult: null }, dialogue: { inspectedEvidenceIds: [], conversations: [] } };
const closed = { ...state, lifecycle: { status: 'ended', finalResult: { ended: true, result: 'incorrect', text: 'An authoritative conclusion.' } } };
// Additive dialogue-contract fixture migration; substantive replies carry their server turn.
const response = (revision = 0, snapshot = state, result, sessionId = token) => {
  snapshot = structuredClone(snapshot);
  if (result?.kind === 'answer' && snapshot.lifecycle.status === 'active') {
    result = { topic: 'alibi', cached: false, turnId: 1, narration: null, ...result, dialogue: result.dialogue ?? result.text };
    if (!snapshot.dialogue.conversations.length) snapshot.dialogue.conversations.push({ suspectId: 'guest', demeanor: 'neutral', options: [], recentTurns: [{ turnId: result.turnId, question: 'Where were you?', kind: 'answer', topic: result.topic, narration: result.narration, dialogue: result.dialogue }] });
    result.demeanor ??= 'neutral';
  }
  return { ok: true, status: 200, json: async () => ({ ok: true, data: { sessionId, revision, state: snapshot, result }, error: null }) };
};
const error = (code, status = 409) => ({ ok: false, status, json: async () => ({ ok: false, data: null, error: { code, message: 'PRIVATE_CANARY_DO_NOT_RENDER' } }) });
const deferred = () => { let resolve; const promise = new Promise((done) => { resolve = done; }); return { promise, resolve }; };
function setup(fetchImpl, options = {}) {
  let current = initialState;
  const actions = [];
  const client = createInvestigationClient({ fetchImpl, ...options, emit(action) { actions.push(action); current = investigationReducer(current, action); } });
  return { client, actions, get state() { return current; }, dispatch(action) { current = investigationReducer(current, action); } };
}

test('browser client projects only approved fields, keeps capability out of state and constructs exact commands', async () => {
  const calls = [];
  const fixture = structuredClone(state); fixture.privateFacts = 'PRIVATE_CANARY'; fixture.suspects[0].secret = 'PRIVATE_CANARY';
  const app = setup(async (url, options) => { calls.push({ url, ...options }); return response(calls.length - 1, fixture, calls.length === 2 ? { kind: 'answer', text: 'Received reply', internalPrompt: 'PRIVATE_CANARY' } : undefined); });
  assert.equal(await app.client.start(), true);
  assert.equal(await app.client.ask('guest', '  Where were you?  '), true);
  assert.deepEqual(JSON.parse(calls[0].body), {});
  assert.deepEqual(JSON.parse(calls[1].body), { suspectId: 'guest', question: 'Where were you?', expectedRevision: 0 });
  assert.equal(calls[1].url, `/api/investigations/${token}/questions`);
  assert.equal(calls[1].cache, 'no-store');
  assert.equal(JSON.stringify(app.state).includes(token), false);
  assert.equal(JSON.stringify(app.state).includes('PRIVATE_CANARY'), false);
  assert.equal(app.state.transcripts.guest[0].text, 'Received reply');
});

test('synchronous mutation gate prevents duplicate starts and accusations; cancellation uses false', async () => {
  let calls = 0; const pending = deferred();
  const app = setup(async () => ++calls === 1 ? pending.promise : response(1, state, { ended: false, result: 'cancelled', text: 'Continue.' }));
  const first = app.client.start();
  assert.equal(await app.client.start(), false); assert.equal(calls, 1);
  pending.resolve(response()); await first;
  assert.equal(await app.client.accuse('guest', false), true);
  assert.equal(app.state.endedKnown, false); assert.match(app.state.notice, /canceled/);
});

test('received replies stay attributed to original suspect and preserve edits made while waiting', async () => {
  const pending = deferred(); let calls = 0;
  const app = setup(async () => ++calls === 1 ? response() : pending.promise);
  await app.client.start(); app.dispatch({ type: 'DRAFT', id: 'guest', text: 'Where were you?' });
  const ask = app.client.ask('guest', 'Where were you?');
  assert.equal(await app.client.inspect('clue'), false);
  app.dispatch({ type: 'SUSPECT', id: 'another' }); app.dispatch({ type: 'DRAFT', id: 'guest', text: 'My next question' });
  pending.resolve(response(1, state, { kind: 'answer', text: 'Only received testimony.' })); await ask;
  assert.equal(app.state.suspectId, 'another'); assert.equal(app.state.transcripts.guest.length, 1);
  assert.equal(app.state.transcripts.another, undefined); assert.equal(app.state.drafts.guest, 'My next question');
  const accepted = app.actions.find((action) => action.type === 'DATA'); app.dispatch(accepted);
  assert.equal(app.state.transcripts.guest.length, 1);
});

test('only successful inspection stores a description; reading notes is purely local', async () => {
  let calls = 0;
  const app = setup(async () => ++calls === 1 ? response() : calls === 2 ? error('session_busy') : response(1, state, { id: 'clue', name: 'Clue', description: 'Observed detail.', secret: 'PRIVATE' }));
  await app.client.start(); await app.client.inspect('clue'); assert.deepEqual(app.state.inspected, {});
  await app.client.inspect('clue'); assert.deepEqual(app.state.inspected.clue, { id: 'clue', name: 'Clue', description: 'Observed detail.' });
  app.dispatch({ type: 'NAVIGATE', screen: 'journal' }); assert.equal(calls, 3);
});

test('network ambiguity preserves draft, requires explicit refresh, and never replays accusation', async () => {
  let calls = 0;
  const app = setup(async () => { calls++; if (calls === 2) throw Error('sensitive URL'); return response(); });
  await app.client.start(); app.dispatch({ type: 'DRAFT', id: 'guest', text: 'Unsent thought' });
  await app.client.accuse('guest', true);
  assert.equal(calls, 2); assert.equal(app.state.uncertain, true); assert.equal(app.state.drafts.guest, 'Unsent thought');
  assert.equal(JSON.stringify(app.state).includes('sensitive URL'), false);
  await app.client.refresh(); assert.equal(calls, 3); assert.equal(app.state.uncertain, false);
});

test('malformed envelopes and raw server errors yield safe recovery notices', async () => {
  for (const bad of [error('stale_revision'), { ok: true, status: 200, json: async () => ({ ok: true, error: null, data: { sessionId: token, revision: -1, state } }) }, { ok: true, status: 200, json: async () => { throw Error('SECRET_STACK'); } }]) {
    let calls = 0; const app = setup(async () => ++calls === 1 ? response() : bad);
    await app.client.start(); assert.equal(await app.client.ask('guest', 'Question'), false);
    assert.equal(app.state.uncertain, true); assert.equal(app.state.transcripts.guest, undefined);
    assert.doesNotMatch(JSON.stringify(app.state), /PRIVATE_CANARY|SECRET_STACK/);
  }
  assert.throws(() => publicState({ ...state, lifecycle: { status: 'active', finalResult: closed.lifecycle.finalResult } }));
});

test('lower revisions are discarded; equal revision can end and an ended view cannot reopen', async () => {
  const replies = [response(2), response(1), response(2, closed), response(3, state)];
  const app = setup(async () => replies.shift()); await app.client.start();
  assert.equal(await app.client.refresh(), false); assert.equal(app.state.revision, 2);
  assert.equal(await app.client.refresh(), true); assert.equal(app.state.endedKnown, true); assert.equal(app.state.screen, 'conclusion');
  assert.equal(await app.client.refresh(), false); assert.deepEqual(app.state.snapshot.lifecycle, closed.lifecycle);
});

test('late question result attached to ended snapshot is discarded, never cached in received notes', async () => {
  let calls = 0; const app = setup(async () => ++calls === 1 ? response() : response(1, closed, { kind: 'answer', text: 'LATE_PRIVATE_REPLY' }));
  await app.client.start(); await app.client.ask('guest', 'Question');
  assert.equal(app.state.endedKnown, true); assert.deepEqual(app.state.transcripts, {}); assert.doesNotMatch(JSON.stringify(app.state), /LATE_PRIVATE_REPLY/);
});

test('new session ignores old-generation replies and resets received history atomically', async () => {
  const pending = deferred(); let calls = 0;
  const app = setup(async () => ++calls === 1 ? response() : calls === 2 ? pending.promise : response(0, state, undefined, 'b'.repeat(64)));
  await app.client.start(); const ask = app.client.ask('guest', 'Old question');
  app.client.dispose(); await app.client.start();
  pending.resolve(response(1, state, { kind: 'answer', text: 'OLD_REPLY' })); await ask;
  assert.deepEqual(app.state.transcripts, {}); assert.equal(app.state.revision, 0); assert.equal(app.state.pending, null);
});

test('expired session rejects old completions, preserves notes and offers no further command path', async () => {
  const pending = deferred(); let calls = 0;
  const app = setup(async () => ++calls === 1 ? response() : calls === 2 ? pending.promise : error('session_not_found', 404));
  await app.client.start(); const ask = app.client.ask('guest', 'Question'); await app.client.refresh();
  pending.resolve(response(1, state, { kind: 'answer', text: 'EXPIRED_REPLY' })); await ask;
  assert.equal(app.state.expired, true); assert.deepEqual(app.state.transcripts, {});
  assert.equal(await app.client.ask('guest', 'Again'), false); assert.equal(calls, 3);
});

test('timeout aborts receipt without pretending the command rolled back', async () => {
  let calls = 0;
  const app = setup(async (_url, { signal }) => ++calls === 1 ? response() : new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(Error('aborted')), { once: true })), { timeoutMs: 10 });
  await app.client.start(); await app.client.accuse('guest', true);
  assert.equal(app.state.uncertain, true); assert.equal(app.state.endedKnown, false); assert.equal(app.state.pending, null); assert.equal(calls, 2);
});

test('web production source uses public modules only and local script-free decorative SVG', async () => {
  async function files(dir) { return (await Promise.all((await readdir(dir, { withFileTypes: true })).map((entry) => entry.isDirectory() ? files(`${dir}/${entry.name}`) : `${dir}/${entry.name}`))).flat(); }
  for (const path of await files('web/src')) {
    const content = await readFile(path, 'utf8');
    assert.doesNotMatch(content, /(?:\.\.\/){2,}src\/|node:|openai|process\.env|dangerouslySetInnerHTML|localStorage|sessionStorage|console\./i, path);
  }
  const arts = await files('web/public/art'); assert.equal(arts.filter((file) => file.endsWith('.svg')).length, 17);
  for (const path of arts) assert.doesNotMatch(await readFile(path, 'utf8'), /<script|<foreignObject|(?:href|src)=["'](?:https?:|data:)|murderer|guilty|innocent|privateFact/i, path);
});

test('visual palette meets text and essential control contrast thresholds', () => {
  function luminance(hex) { const [r, g, b] = hex.match(/../g).map((part) => parseInt(part, 16) / 255).map((c) => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4); return r * .2126 + g * .7152 + b * .0722; }
  for (const [foreground, background, minimum] of [
    ['f4e9d6', '242126', 4.5], ['c4b9a7', '242126', 4.5], ['d4ac6a', '242126', 4.5],
    ['f4e9d6', '733b48', 4.5], ['231c17', 'd4ac6a', 4.5], ['302b29', 'eee0c6', 4.5],
    ['594839', 'eee0c6', 4.5], ['655341', 'eee0c6', 4.5], ['82705b', '242126', 3],
    ['74604b', 'eee0c6', 3], ['f0c878', '242126', 3],
  ]) { const a = luminance(foreground); const b = luminance(background); assert.ok((Math.max(a, b) + .05) / (Math.min(a, b) + .05) >= minimum, `${foreground}/${background}`); }
});

test('travel projects exact commands, commits position only on success and preserves received notes', async () => {
  const garden = { ...state, currentLocationId: 'garden' }; const calls = [];
  const app = setup(async (_url, options) => { calls.push(options); return calls.length === 1 || calls.length === 3 ? response() : calls.length === 2 ? error('session_busy') : response(1, garden, { kind: 'travel', locationId: 'garden', changed: true }); });
  await app.client.start(); await app.client.travel('garden'); assert.equal(app.state.snapshot.currentLocationId, 'study');
  await app.client.refresh(); assert.equal(app.state.snapshot.currentLocationId, 'study'); assert.equal(app.state.uncertain, false);
  assert.equal(calls.length, 3); await app.client.travel('garden');
  assert.equal(app.state.snapshot.currentLocationId, 'garden'); assert.equal(app.state.screen, 'room');
  assert.deepEqual(JSON.parse(calls[1].body), { locationId: 'garden', expectedRevision: 0 });
});

test('equal-revision movement closes remote interrogation but retains its draft and accepted observations', async () => {
  let calls = 0;
  const app = setup(async () => ++calls === 1 ? response() : response(0, { ...state, currentLocationId: 'garden' }));
  await app.client.start(); app.dispatch({ type: 'SUSPECT', id: 'guest' }); app.dispatch({ type: 'DRAFT', id: 'guest', text: 'Remember this' });
  await app.client.refresh(); assert.equal(app.state.screen, 'room'); assert.equal(app.state.suspectId, null); assert.equal(app.state.drafts.guest, 'Remember this');
});

test('reply from old room context is rejected after a public read reconciles movement', async () => {
  const pending = deferred(); let calls = 0;
  const app = setup(async () => ++calls === 1 ? response() : calls === 2 ? pending.promise : response(0, { ...state, currentLocationId: 'garden' }));
  await app.client.start(); const ask = app.client.ask('guest', 'Question'); await app.client.refresh();
  pending.resolve(response(1, state, { kind: 'answer', text: 'OBSOLETE_ROOM_REPLY' }));
  assert.equal(await ask, false); assert.deepEqual(app.state.transcripts, {}); assert.equal(app.state.snapshot.currentLocationId, 'garden');
});

test('nested dossier metadata is discarded and invalid placement is rejected at the browser boundary', () => {
  const fixture = structuredClone(state); fixture.suspects[0].dossier.secret = 'PRIVATE_NESTED'; fixture.rooms[0].secret = 'PRIVATE_NESTED';
  fixture.suspects[0].dossier = { ...fixture.suspects[0].dossier, relationships: [{ targetSuspectId: 'another', kind: 'social', label: 'Public relationship', secret: 'PRIVATE_NESTED' }] };
  assert.doesNotMatch(JSON.stringify(publicState(fixture)), /PRIVATE_NESTED/);
  fixture.suspects[0].locationId = 'missing'; assert.throws(() => publicState(fixture));
});

test('ended-command rejection reconciles to the first authoritative conclusion on refresh', async () => {
  let calls = 0; const app = setup(async () => ++calls === 1 ? response() : calls === 2 ? error('investigation_ended') : response(1, closed));
  await app.client.start(); app.dispatch({ type: 'SUSPECT', id: 'guest' }); await app.client.ask('guest', 'Question');
  assert.equal(app.state.endedKnown, true); assert.equal(app.state.snapshot.lifecycle.finalResult, null);
  await app.client.refresh(); assert.equal(app.state.screen, 'conclusion'); assert.deepEqual(app.state.snapshot.lifecycle.finalResult, closed.lifecycle.finalResult);
});

function conversationSnapshot(turns = [], options = [], extra = {}) {
  return { ...structuredClone(state), dialogue: { inspectedEvidenceIds: [], conversations: [{ suspectId: 'guest', demeanor: 'uneasy', recentTurns: turns, options, ...extra }] } };
}
const turn = (id, narration = null) => ({ turnId: id, question: 'Authorized question ' + id, kind: 'answer', topic: 'alibi', narration, dialogue: 'Received speech ' + id });
const answer = (record) => ({ ...record, text: record.dialogue, cached: false, demeanor: 'uneasy' });

test('choice bodies use only identity and revision; duplicate gate and typed drafts survive success', async () => {
  const waiting = deferred(); const calls = [];
  const app = setup(async (_url, options) => { calls.push(JSON.parse(options.body)); return calls.length === 1 ? response() : waiting.promise; });
  await app.client.start(); app.dispatch({ type: 'DRAFT', id: 'guest', text: 'My independent question' });
  const choice = app.client.choose('guest', 'ask-alibi');
  assert.equal(await app.client.ask('guest', 'Where were you?'), false);
  assert.equal(await app.client.choose('guest', 'ask-alibi'), false);
  const record = turn(1, 'A controlled pause.');
  waiting.resolve(response(1, conversationSnapshot([record]), answer(record)));
  assert.equal(await choice, true);
  assert.deepEqual(calls[1], { suspectId: 'guest', choiceId: 'ask-alibi', expectedRevision: 0 });
  assert.equal(app.state.drafts.guest, 'My independent question');
  assert.equal(app.state.transcripts.guest[0].question, record.question);
  assert.equal(app.state.transcripts.guest[0].narration, record.narration);
});

test('malformed choices and empty/oversized text never reach HTTP', async () => {
  let calls = 0; const app = setup(async () => { calls++; return response(); }); await app.client.start();
  for (const id of ['', 'ask/alibi', 'A'.repeat(65), null]) assert.equal(await app.client.choose('guest', id), false);
  for (const input of ['', ' ', 'x'.repeat(1001), null]) assert.equal(await app.client.ask('guest', input), false);
  assert.equal(calls, 1);
});

test('unavailable choice preserves draft and testimony, requires deliberate refresh without replay', async () => {
  let calls = 0; const app = setup(async () => ++calls === 1 ? response() : calls === 2 ? error('dialogue_option_unavailable') : response(1));
  await app.client.start(); app.dispatch({ type: 'DRAFT', id: 'guest', text: 'Keep this' });
  assert.equal(await app.client.choose('guest', 'present-clue'), false);
  assert.equal(app.state.drafts.guest, 'Keep this'); assert.equal(app.state.uncertain, true);
  assert.match(app.state.error.message, /Refresh/); assert.deepEqual(app.state.transcripts, {});
  await app.client.refresh(); assert.equal(calls, 3); assert.equal(app.state.uncertain, false);
});

test('reconciliation recovers lost replies once, retains older local turns beyond the eight-turn window', async () => {
  let snapshot = conversationSnapshot([turn(1)]);
  const app = setup(async () => response(1, snapshot)); await app.client.start();
  snapshot = conversationSnapshot(Array.from({ length: 8 }, (_, i) => turn(i + 2)));
  await app.client.refresh(); await app.client.refresh();
  assert.deepEqual(app.state.transcripts.guest.map((record) => record.turnId), [1,2,3,4,5,6,7,8,9]);
  assert.equal(app.state.transcripts.guest[0].question, 'Authorized question 1');
  assert.equal(app.state.transcripts.guest[0].narration, null);
  assert.equal(app.state.transcripts.guest.at(-1).dialogue, 'Received speech 9');
});

test('GET overtaking command deduplicates testimony using speaker and server turn ID', async () => {
  const delayed = deferred(); let calls = 0; const record = turn(1);
  const app = setup(async () => ++calls === 1 ? response() : calls === 2 ? delayed.promise : response(1, conversationSnapshot([record])));
  await app.client.start(); const command = app.client.choose('guest', 'ask-alibi'); await app.client.refresh();
  assert.equal(app.state.pending.mutation, true, 'a read cannot clear the pending mutation indicator');
  delayed.resolve(response(1, conversationSnapshot([record]), answer(record))); await command;
  assert.equal(app.state.transcripts.guest.length, 1);
  assert.equal(app.state.transcripts.guest[0].question, record.question);
});

test('unsupported guidance is browser-local, separately keyed and does not manufacture a server turn', async () => {
  let calls = 0; const guidance = { kind: 'unsupported', topic: 'unsupported', narration: null, dialogue: 'Please ask about this case.', text: 'Please ask about this case.' };
  const app = setup(async () => ++calls === 1 ? response() : response(1, state, guidance));
  await app.client.start(); await app.client.ask('guest', 'Purple planets?');
  assert.equal(app.state.transcripts.guest[0].localGuidance, true);
  assert.equal(app.state.transcripts.guest[0].turnId, undefined);
  assert.equal(app.state.transcripts.guest[0].question, 'Purple planets?');
});

test('inspected IDs from reconciliation never fabricate clue descriptions or clear drafts', async () => {
  const snapshot = conversationSnapshot(); snapshot.dialogue.inspectedEvidenceIds = ['clue'];
  const app = setup(async () => response(1, snapshot)); await app.client.start();
  assert.deepEqual(app.state.snapshot.dialogue.inspectedEvidenceIds, ['clue']); assert.deepEqual(app.state.inspected, {});
  app.dispatch({ type: 'DRAFT', id: 'guest', text: 'Remember' }); await app.client.refresh();
  assert.equal(app.state.drafts.guest, 'Remember'); assert.deepEqual(app.state.inspected, {});
});

test('nested public dialogue projections discard metadata and reject invalid bounds and identities', () => {
  const option = { id: 'ask-alibi', label: 'Ask about the evening', kind: 'topic', secret: 'PRIVATE_NESTED' };
  const snapshot = conversationSnapshot([{ ...turn(1), secret: 'PRIVATE_NESTED' }], [option], { privateEmotion: 'PRIVATE_NESTED' });
  snapshot.dialogue.secret = 'PRIVATE_NESTED';
  assert.doesNotMatch(JSON.stringify(publicState(snapshot)), /PRIVATE_NESTED/);
  for (const mutate of [
    (v) => v.dialogue.conversations[0].demeanor = 'guilty',
    (v) => v.dialogue.conversations[0].recentTurns[0].narration = '',
    (v) => v.dialogue.conversations[0].recentTurns[0].dialogue = 'x'.repeat(1201),
    (v) => v.dialogue.conversations[0].recentTurns[0].turnId = -1,
    (v) => v.dialogue.conversations[0].options[0].kind = 'secret',
    (v) => v.dialogue.conversations[0].options.push(...Array(6).fill(option)),
    (v) => v.dialogue.inspectedEvidenceIds = ['missing'],
    (v) => v.dialogue.conversations[0].suspectId = 'missing',
    (v) => v.currentLocationId = 'garden',
  ]) { const bad = structuredClone(snapshot); mutate(bad); assert.throws(() => publicState(bad)); }
});

test('mismatched legacy speech, invalid narration and unpaired turn results cannot enter state', async () => {
  for (const result of [{ ...answer(turn(1)), text: 'Different meaning' }, { ...answer(turn(1)), narration: 'x'.repeat(241) }, answer(turn(2))]) {
    let calls = 0; const app = setup(async () => ++calls === 1 ? response() : response(1, conversationSnapshot([turn(1)]), result));
    await app.client.start(); assert.equal(await app.client.ask('guest', 'Where were you?'), false);
    assert.deepEqual(app.state.transcripts, {}); assert.equal(app.state.uncertain, true);
  }
});

test('ended late structured response cannot change narration, demeanor or history; explicit GET can recover pre-end testimony', async () => {
  const snapshot = conversationSnapshot([turn(1, 'Late gesture.')]); snapshot.lifecycle = closed.lifecycle;
  let calls = 0; const app = setup(async () => ++calls === 1 ? response(0, conversationSnapshot()) : response(1, snapshot, answer(turn(1, 'Late gesture.'))));
  await app.client.start(); await app.client.choose('guest', 'ask-alibi');
  assert.equal(app.state.endedKnown, true); assert.deepEqual(app.state.transcripts, {});
  assert.doesNotMatch(JSON.stringify(app.state), /Late gesture/);
  await app.client.refresh(); assert.equal(app.state.transcripts.guest[0].narration, 'Late gesture.');
});
