import assert from 'node:assert/strict';
import test from 'node:test';
import { createInvestigation } from '../src/game.js';
import { caseData } from '../src/data/case.js';
import { runCli } from '../src/cli.js';

const active = { status: 'active', finalResult: null };
const endedError = { kind: 'error', code: 'investigation_ended', text: 'The investigation has ended.' };
const accusationError = { ...endedError, ended: true, result: 'rejected' };
const outcomes = [
  ['clara-voss', { ended: true, result: 'correct', text: 'Correct. Clara Voss murdered Victor Hale.' }],
  ['alice-mercer', { ended: true, result: 'incorrect', text: 'Incorrect. Alice Mercer is innocent. The investigation is over.' }],
];

test('investigations start active with independent state and detached lifecycle reads', () => {
  const first = createInvestigation();
  const second = createInvestigation();
  const snapshot = first.getLifecycle();
  assert.deepEqual(snapshot, active);
  snapshot.status = 'ended';
  snapshot.finalResult = { text: 'forged' };
  assert.deepEqual(first.getLifecycle(), active);
  first.resolveAccusation('clara-voss', true);
  assert.deepEqual(second.getLifecycle(), active);
});

test('cancellation, non-Boolean confirmation and invalid active suspects do not end play', async () => {
  const game = createInvestigation();
  for (const confirmation of [false, undefined, null, 0, 1, '', 'yes', 'true', {}, []]) {
    assert.deepEqual(game.resolveAccusation('clara-voss', confirmation), {
      ended: false, result: 'cancelled', text: 'The accusation was cancelled. Continue investigating.',
    });
    assert.deepEqual(game.getLifecycle(), active);
  }
  for (const id of ['unknown', '', null, undefined]) {
    assert.deepEqual(game.resolveAccusation(id, true), {
      ended: false, result: 'invalid', text: 'That suspect is not available.',
    });
    assert.deepEqual(game.getLifecycle(), active);
  }
  assert.equal((await game.askSuspect('ben-carter', 'Where were you?')).kind, 'answer');
  assert.match(game.inspectEvidence('muddy-footprints').description, /garden door/);
  assert.equal(game.inspectEvidence('unknown'), null);
  assert.equal(game.inspectPublicEvidence('unknown'), null);
});

for (const [suspectId, expected] of outcomes) {
  test(`${expected.result} accusation ends once and rejects every later accusation without changing the result`, () => {
    const data = structuredClone(caseData);
    const game = createInvestigation({ data });
    assert.deepEqual(game.resolveAccusation(suspectId, true), expected);
    const ended = { status: 'ended', finalResult: expected };
    assert.deepEqual(game.getLifecycle(), ended);
    // Changing trusted authoring data must not cause final-result recomputation.
    data.murdererId = 'ben-carter';
    data.victim.name = 'Changed victim';
    data.suspects[0].name = 'Changed suspect';
    for (const id of [suspectId, 'ben-carter', 'clara-voss', 'unknown', null]) {
      for (const confirmed of [true, false, undefined, 'yes']) {
        assert.deepEqual(game.resolveAccusation(id, confirmed), accusationError);
        assert.deepEqual(game.getLifecycle(), ended);
      }
    }
  });
}

test('ended investigations reject cached, uncached, unsupported and invalid questions without generation', async () => {
  let calls = 0;
  const game = createInvestigation({ phraser: { async phrase() { calls += 1; return 'An active answer.'; } } });
  assert.equal((await game.askSuspect('ben-carter', 'Where were you?')).kind, 'answer');
  const finalResult = game.resolveAccusation('alice-mercer', true);
  for (const [id, question] of [
    ['ben-carter', 'Where were you?'], ['alice-mercer', 'Where were you?'],
    ['ben-carter', 'Tell me a joke'], ['unknown', 'Where were you?'], [null, undefined],
    ['ben-carter', { toString() { throw new Error('Ended commands must not classify input'); } }],
  ]) {
    assert.deepEqual(await game.askSuspect(id, question), endedError);
  }
  assert.equal(calls, 1);
  assert.deepEqual(game.getLifecycle(), { status: 'ended', finalResult });
});

test('both evidence inspection paths reject known and unknown post-game IDs while safe reads remain available', () => {
  const game = createInvestigation();
  const summaries = game.listEvidence();
  const finalResult = game.resolveAccusation('clara-voss', true);
  for (const id of [...summaries.map(({ id }) => id), 'unknown', '', null, undefined]) {
    assert.deepEqual(game.inspectEvidence(id), endedError);
    assert.deepEqual(game.inspectPublicEvidence(id), endedError);
  }
  assert.deepEqual(game.listEvidence(), summaries);
  assert.deepEqual(game.getPublicSuspect('alice-mercer'), { id: 'alice-mercer', name: 'Alice Mercer' });
  assert.equal(game.getPublicSuspect('unknown'), null);
  assert.deepEqual(game.getPublicView().evidence, summaries);
  assert.deepEqual(game.getLifecycle(), { status: 'ended', finalResult });
});

test('safe public lifecycle snapshots are exact, detached and exclude private data after a wrong accusation', () => {
  const data = structuredClone(caseData);
  data.internalLifecycle = { secret: 'FORBIDDEN_LIFECYCLE_CANARY' };
  data.suspects[0].secrets = ['FORBIDDEN_LIFECYCLE_CANARY'];
  let calls = 0;
  const game = createInvestigation({ data, phraser: { async phrase() { calls += 1; throw new Error('unused'); } } });
  assert.deepEqual(game.getPublicView().lifecycle, active);
  const resolution = game.resolveAccusation('alice-mercer', true);
  const expected = { status: 'ended', finalResult: outcomes[1][1] };
  const view = game.getPublicView();
  const snapshot = game.getLifecycle();
  assert.deepEqual(view.lifecycle, expected);
  assert.deepEqual(JSON.parse(JSON.stringify(view.lifecycle)), expected);
  assert.equal(JSON.stringify(view).includes('FORBIDDEN_LIFECYCLE_CANARY'), false);
  assert.equal(JSON.stringify(view.lifecycle).includes('Clara'), false);
  assert.deepEqual(Object.keys(view).sort(), ['title', 'victim', 'locations', 'suspects', 'evidence', 'lifecycle'].sort());
  assert.notStrictEqual(view.lifecycle.finalResult, snapshot.finalResult);
  resolution.result = 'correct';
  resolution.text = 'Changed';
  snapshot.status = 'active';
  snapshot.finalResult.ended = false;
  view.lifecycle.status = 'active';
  view.lifecycle.finalResult.text = 'Changed';
  assert.deepEqual(game.getLifecycle(), expected);
  assert.deepEqual(game.getPublicView().lifecycle, expected);
  assert.equal(calls, 0);
});

for (const settle of ['success', 'failure']) {
  test(`pending dialogue ${settle} after ending is discarded and cannot change the final result`, async () => {
    let resolveResponse;
    let rejectResponse;
    let calls = 0;
    const response = new Promise((resolve, reject) => { resolveResponse = resolve; rejectResponse = reject; });
    const game = createInvestigation({ phraser: { phrase() { calls += 1; return response; } } });
    const pending = game.askSuspect('ben-carter', 'Where were you?');
    assert.equal(calls, 1, 'generation started while the investigation was active');
    const finalResult = game.resolveAccusation('clara-voss', true);
    if (settle === 'success') resolveResponse('LATE_RESPONSE_MUST_NOT_BE_DISPLAYED');
    else rejectResponse(new Error('Delayed generation failure'));
    assert.deepEqual(await pending, endedError);
    assert.deepEqual(await game.askSuspect('ben-carter', 'Where were you?'), endedError);
    assert.deepEqual(game.getLifecycle(), { status: 'ended', finalResult });
    assert.equal(calls, 1);
  });
}

async function play(game, answers, onAsk = () => {}) {
  const remaining = [...answers];
  let output = '';
  await runCli({
    ask: async (prompt) => {
      assert.ok(remaining.length, `Unexpected gameplay input: ${prompt}`);
      onAsk(prompt);
      return remaining.shift();
    },
    write: (text) => { output += text; },
  }, { game });
  assert.equal(remaining.length, 0, 'scripted inputs must all be consumed');
  return output;
}

test('CLI preserves cancellation, guarded inspection, normalized confirmation and correct ending', async () => {
  const game = createInvestigation();
  const inspect = game.inspectEvidence;
  const inspected = [];
  game.inspectEvidence = (id) => {
    inspected.push(id);
    const evidence = inspect(id);
    return { ...evidence, description: 'ENGINE_INSPECTION_DISPLAY' };
  };
  let checkedAfterCancel = false;
  const output = await play(game, ['4', '3', 'no', '2', '1', '4', '3', ' YES '], (prompt) => {
    if (prompt === 'Choose evidence to inspect: ') {
      assert.deepEqual(game.getLifecycle(), active);
      checkedAfterCancel = true;
    }
  });
  assert.equal(checkedAfterCancel, true);
  assert.deepEqual(inspected, ['muddy-footprints']);
  assert.match(output, /accusation was cancelled/i);
  assert.match(output, /Muddy footprints: ENGINE_INSPECTION_DISPLAY/);
  assert.match(output, /Correct\. Clara Voss murdered Victor Hale/);
  assert.equal(game.getLifecycle().status, 'ended');
});

test('CLI reports incorrect accusations and already-ended investigations without more gameplay input', async () => {
  const game = createInvestigation();
  const output = await play(game, ['4', '1', 'yes']);
  assert.match(output, /Incorrect\. Alice Mercer is innocent\. The investigation is over\./);
  for (const [suspectId, expected] of outcomes) {
    const ended = createInvestigation();
    ended.resolveAccusation(suspectId, true);
    assert.equal(await play(ended, []), `${expected.text}\n`);
  }
});

test('CLI renders ended inspection errors without an undefined evidence record', async () => {
  const game = createInvestigation();
  const output = await play(game, ['2', '1'], (prompt) => {
    if (prompt === 'Choose evidence to inspect: ') game.resolveAccusation('alice-mercer', true);
  });
  assert.match(output, /The investigation has ended\./);
  assert.equal(output.includes('undefined'), false);
  assert.equal(output.includes(caseData.evidence[0].description), false);
  assert.equal(output.split('1. Question a suspect').length - 1, 1, 'do not show another gameplay menu');
  assert.match(output, /Incorrect\. Alice Mercer is innocent/);
});

test('CLI handles invalid evidence selection and quitting without fabricating a result', async () => {
  const game = createInvestigation();
  const output = await play(game, ['2', '99', '5']);
  assert.match(output, /Please choose a valid evidence number/);
  assert.match(output, /Investigation closed/);
  assert.deepEqual(game.getLifecycle(), active);
});
