import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { caseRegistry } from '../src/cases/registry.js';
import { createConfiguredNPCPerformer } from '../src/npc-performance.js';
import { demoRetestDeadlines } from '../src/greyhaven-coordination.js';
import { createSessionStore } from '../src/investigation-sessions.js';
import { runCli } from '../src/cli.js';
import { prepareInterviews, replay, owen, mara, source } from '../test-support/greyhaven-pilot-journey.js';
import { guarded, O1, presentation } from '../test-support/greyhaven-preview-oracle.js';

const make = coordination => caseRegistry.createInvestigation('greyhaven-preview', { performer: coordination && { coordination } });
const defaults = { direct: () => ({ strategy: 'invite-account' }), act: ctx => ctx.performances[0] };
async function configured(create, enabled = true) {
  return createConfiguredNPCPerformer({ env: { OPENAI_API_KEY: 'KEY_CANARY', OPENAI_MODEL: 'fixture', GREYHAVEN_AGENT_PILOT: enabled ? '1' : '0' },
    createClient: async () => ({ responses: { create } }) });
}
const completed = value => ({ status: 'completed', output_text: JSON.stringify(value) });
const present = g => g.askSuspect(owen, presentation);
const returns = g => { g.travelTo('reception'); return g.askSuspect(mara, source); };

test('retest runner reports timings, usage and rejected output against a loopback provider', async t => {
  const requests = [];
  let invalid = false;
  const server = createServer(async (request, response) => {
    let raw = '';
    for await (const chunk of request) raw += chunk;
    const body = JSON.parse(raw), ctx = JSON.parse(body.input);
    requests.push([ctx.speaker ?? 'director', body.model, body.text.format.strict]);
    const result = ctx.speaker ? ctx.performances[0] : { strategy: 'invite-account' };
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ ...completed(invalid && ctx.speaker === 'Owen' ? { invalid: true } : result),
      usage: { input_tokens: 12, output_tokens: 4 } }));
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const model = 'gpt-4.1-mini-2025-04-14';
  const run = () => promisify(execFile)(process.execPath, ['scripts/demo-greyhaven-coordination.js', 'live-retest'], {
    env: { ...process.env, OPENAI_BASE_URL: 'http://127.0.0.1:' + server.address().port + '/v1',
      OPENAI_API_KEY: 'fixture', OPENAI_MODEL: model }
  });
  const success = JSON.parse((await run()).stdout);
  assert.deepEqual(requests, ['director','Owen','Mara'].map(role => [role, model, true]));
  assert.equal(success.handoffUsed, true);
  assert.deepEqual(success.deadlines, { directorMs: 5000, turnMs: 10000 });
  assert.ok(success.totalElapsedMs >= success.replayElapsedMs);
  assert.ok(success.calls.every(call => call.responseReceived && call.outcome === 'adapter-validated'
    && Number.isInteger(call.sdkElapsedMs) && call.sdkElapsedMs >= 0
    && call.elapsedMs >= call.sdkElapsedMs && call.tokens.input === 12 && call.tokens.output === 4));
  invalid = true;
  await assert.rejects(run(), error => {
    const report = JSON.parse(error.stdout);
    assert.equal(error.code, 1);
    assert.deepEqual(report.calls.map(c => c.outcome), ['adapter-validated','response-rejected']);
    assert.equal(report.calls[1].tokens.output, 4);
    assert.equal(report.decisions[0].source, 'fallback');
    assert.equal(report.handoffUsed, false);
    assert.equal(report.factualParity, true);
    return true;
  });
  assert.equal(requests.length, 5);
});

test('demo retest gives Owen the remainder and Mara a fresh turn, with offline factual parity', async t => {
  let clock = 0;
  t.mock.method(performance, 'now', () => clock);
  const baseline = await replay(make(null));
  const calls = [];
  const roles = { deadlines: demoRetestDeadlines,
    direct(ctx, opts) {
      calls.push(['director', opts.timeout]); clock += 3750;
      return { strategy: 'set-boundary' };
    },
    act(ctx, opts) {
      calls.push([ctx.speaker, opts.timeout]); clock += ctx.speaker === 'Owen' ? 5400 : 8200;
      return ctx.performances[1];
    }
  };
  const run = await replay(make(roles));
  assert.deepEqual(calls, [['director', 5000], ['Owen', 6250], ['Mara', 10000]]);
  assert.deepEqual(run.replies.map(r => r.elapsedMs), [9150, 8200, 0]);
  assert.deepEqual(run.snapshots, baseline.snapshots);
  assert.deepEqual(run.decisions.map(e => [e.role, e.strategy, e.source]),
    [['Owen','set-boundary','provider'], ['Mara','set-boundary','provider']]);
});

for (const delayed of ['director', 'Owen', 'Mara']) test('demo retest discards late ' + delayed + ' result', async t => {
  let clock = 0;
  t.mock.method(performance, 'now', () => clock);
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const started = Promise.withResolvers(), late = Promise.withResolvers();
  const baseline = await replay(make(null));
  const wait = (opts, value) => { started.resolve({ opts, value }); return late.promise; };
  const calls = [];
  const g = make({ deadlines: demoRetestDeadlines,
    direct(ctx, opts) {
      calls.push('director');
      if (delayed === 'director') return wait(opts, defaults.direct());
      clock += 3200;
      return defaults.direct();
    },
    act(ctx, opts) {
      calls.push(ctx.speaker);
      return delayed === ctx.speaker ? wait(opts, ctx.performances[0]) : ctx.performances[0];
    }
  });
  const pending = replay(g);
  const { opts, value } = await started.promise;
  assert.equal(opts.timeout, { director: 5000, Owen: 6800, Mara: 10000 }[delayed]);
  clock += opts.timeout;
  t.mock.timers.tick(opts.timeout);
  const run = await pending;
  assert.equal(opts.signal.aborted, true);
  assert.deepEqual(run.snapshots, baseline.snapshots);
  assert.equal(run.decisions.at(-1).source, 'fallback');
  assert.equal(calls.length, { director: 1, Owen: 2, Mara: 3 }[delayed]);
  const before = g.getDialogueDiagnostics();
  late.resolve(value);
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(g.getDialogueDiagnostics(), before);
  assert.deepEqual(g.getCoordinationTrace(), run.decisions);
});

test('four wire-level replays preserve every factual snapshot and offer eight distinct approved whole performances', async () => {
  const baseline = await replay(make(null));
  const moves = new Set();
  for (const strategy of ['invite-account', 'set-boundary']) for (const index of [0, 1]) {
    const requests = [];
    const performer = await configured((request, opts) => {
      const ctx = JSON.parse(request.input);
      requests.push(ctx);
      assert.equal(request.store, false); assert.equal(request.text.format.strict, true); assert.equal(opts.maxRetries, 0);
      assert.doesNotMatch(JSON.stringify(request), /KEY_CANARY|RAW_CANARY|epistemics|murdererId|own-observations|fromVersion/);
      if (!ctx.speaker) {
        assert.deepEqual(Object.keys(ctx).sort(), ['actions', 'speakers', 'strategies']);
        assert.deepEqual(ctx.actions, ['account', 'clarification', 'inspection', 'inspection']);
        return completed({ strategy });
      }
      assert.deepEqual(Object.keys(ctx).sort(), ['demeanor','goal','instruction','intent','memory','performances','speaker','style']);
      assert.equal(ctx.performances.length, 2);
      for (const pair of ctx.performances) {
        assert.equal(pair.narration, null);
        assert.ok(pair.dialogue.endsWith(ctx.speaker === 'Owen' ? O1 : guarded));
        assert.ok(Buffer.byteLength(JSON.stringify(pair)) <= 4096);
      }
      assert.deepEqual(ctx.memory, ctx.speaker === 'Owen' ? ['gave-account', 'clarified'] : ['gave-account']);
      if (ctx.speaker === 'Mara') assert.ok(!request.input.includes(O1));
      moves.add(ctx.performances[index].dialogue);
      return completed(ctx.performances[index]);
    });
    const g = caseRegistry.createInvestigation('greyhaven-preview', { performer });
    await g.askSuspect(mara, 'RAW_CANARY');
    const run = await replay(g);
    assert.deepEqual(run.snapshots, baseline.snapshots);
    assert.deepEqual(requests.map(r => r.speaker ?? 'director'), ['director','Owen','Mara']);
    assert.ok(run.decisions.every(e => e.strategy === strategy && e.source === 'provider'));
    assert.notEqual(requests[1].goal, requests[2].goal);
    assert.notEqual(requests[1].instruction, requests[2].instruction);
    assert.equal(run.replies[2].dialogue, baseline.replies[2].dialogue);
    assert.doesNotMatch(JSON.stringify(g.getPublicView()), /invite-account|set-boundary|own-the-explanation/);
  }
  assert.equal(moves.size, 8);
});

test('history-sensitive director can select either strategy for identical eligible cores', async () => {
  for (const history of ['challenge', 'clarification']) {
    const strategy = history === 'challenge' ? 'set-boundary' : 'invite-account';
    const g = make({ ...defaults, direct: ctx => ({ strategy: ctx.actions.includes('challenge') ? 'set-boundary' : 'invite-account' }) });
    await prepareInterviews(g, history);
    await present(g); await returns(g);
    assert.deepEqual(g.getCoordinationTrace().map(e => e.strategy), [strategy, strategy]);
  }
});

for (const failed of ['director','Owen','Mara']) test('invalid ' + failed + ' outcomes fall back exactly once', async () => {
  for (const invalid of [null, { strategy: 'invent' }, { strategy: 'invite-account', extra: true },
    { narration: 'new gesture', dialogue: O1 }, { narration: null, dialogue: 'PRIVATE_CANARY' },
    { narration: null, dialogue: failed === 'Mara' ? O1 : guarded }]) {
    const g = make({ direct: () => failed === 'director' ? invalid : defaults.direct(),
      act: ctx => ctx.speaker === failed ? invalid : defaults.act(ctx) });
    const run = await replay(g);
    assert.equal(run.decisions.at(-1).source, 'fallback');
    assert.equal(run.decisions.length, failed === 'Mara' ? 2 : 1);
    assert.doesNotMatch(JSON.stringify(run), /PRIVATE_CANARY/);
  }
});

test('wire adapters reject malformed, oversized, refused and incomplete replies for each role', async () => {
  for (const role of ['director','Owen','Mara']) for (const invalid of [
    { status: 'incomplete' }, { ...completed({}), output: [{ content: [{ type: 'refusal' }] }] },
    { status: 'completed', output_text: 'bad json' }, { status: 'completed', output_text: 'ë'.repeat(4096) },
    completed({ strategy: 'invent' }), completed({ narration: null, dialogue: 'PRIVATE_CANARY' })
  ]) {
    const performer = await configured(request => {
      const ctx = JSON.parse(request.input);
      return (ctx.speaker ?? 'director') === role ? invalid : completed(ctx.speaker ? ctx.performances[0] : defaults.direct());
    });
    const run = await replay(caseRegistry.createInvestigation('greyhaven-preview', { performer }));
    assert.equal(run.decisions.at(-1).source, 'fallback');
    assert.doesNotMatch(JSON.stringify(run), /PRIVATE_CANARY/);
  }
});

test('handoff expires after two intervening substantive interviews and cannot cross sessions', async () => {
  for (const turns of [0,1,2]) {
    const a = make(defaults), b = make(defaults);
    await Promise.all([prepareInterviews(a),prepareInterviews(b)]);
    await present(a);
    for (let i=0; i<turns; i++) await a.askSuspect(owen, 'Where were you?');
    await a.askSuspect(owen, '???');
    await returns(a); await returns(a); await returns(b);
    assert.deepEqual(a.getCoordinationTrace().map(e => e.role), turns === 2 ? ['Owen'] : ['Owen','Mara']);
    assert.deepEqual(b.getCoordinationTrace(), []);
  }
});

for (const pendingRole of ['director','Owen','Mara']) for (const settle of ['success','failure']) test('travel invalidates pending ' + pendingRole + ' ' + settle, async () => {
  const started = Promise.withResolvers(), late = Promise.withResolvers();
  let count = 0;
  function wait() { count++; started.resolve(); return late.promise; }
  const g = make({ direct: ctx => pendingRole === 'director' ? wait() : defaults.direct(ctx),
    act: ctx => ctx.speaker === pendingRole ? wait() : defaults.act(ctx) });
  await prepareInterviews(g);
  if (pendingRole === 'Mara') { await present(g); g.travelTo('reception'); }
  const before = g.getDialogueDiagnostics(), events = g.getCoordinationTrace();
  const ask = () => pendingRole === 'Mara' ? g.askSuspect(mara,source) : present(g);
  const reply = ask(); await started.promise;
  const room = g.getPublicView().currentLocationId;
  g.travelTo(room === 'reception' ? 'boathouse' : 'reception'); g.travelTo(room);
  assert.equal((await reply).code, 'stale_response');
  if (settle === 'success') late.resolve(defaults.direct()); else late.reject(Error('provider failed'));
  assert.deepEqual(g.getDialogueDiagnostics(), before); assert.deepEqual(g.getCoordinationTrace(), events);
  await ask(); assert.equal(count, 1);
});

test('discard, projection errors and transport authority loss cannot install steering', async () => {
  for (const guard of ['discard','projection','revision','replacement','reservation']) {
    const store = createSessionStore({ investigationFactory: () => make(defaults) });
    const entry = store.create('greyhaven-preview'), g = entry.game;
    await prepareInterviews(g); const before = g.getDialogueDiagnostics();
    const ready = await g.prepareDialogue(owen, { question: presentation }, value => {
      if (guard === 'projection') throw Error('projection');
      return value;
    });
    if (guard === 'discard') g.discardDialogue(ready);
    else if (guard === 'projection') assert.throws(() => g.commitDialogue(ready));
    else await assert.rejects(store.run(entry, 0, true, () => {
      if (guard === 'revision') entry.revision++;
      if (guard === 'replacement') entry.game = make(defaults);
      if (guard === 'reservation') entry.reservation = null;
      return ready;
    }), { code: 'stale_response' });
    assert.deepEqual(g.getDialogueDiagnostics(), before); assert.deepEqual(g.getCoordinationTrace(), []);
  }
});

test('session expiry drops the committed handoff', async () => {
  let now = 0;
  const store = createSessionStore({ clock: () => now, idleMs: 1, investigationFactory: () => make(defaults) });
  const first = store.create('greyhaven-preview');
  await prepareInterviews(first.game); await present(first.game);
  now++;
  assert.throws(() => store.get(first.id), {code:'session_not_found'});
  const other = store.create('greyhaven-preview').game;
  await other.askSuspect(mara,'Where were you?'); await other.askSuspect(mara,source);
  assert.deepEqual(other.getCoordinationTrace(), []);
});

test('monotonic shared deadline includes director time and races an actor ignoring abort', async t => {
  let clock = 0;
  t.mock.method(performance, 'now', () => clock);
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const started = Promise.withResolvers();
  const g = make({ direct(ctx, opts) { assert.equal(opts.timeout, 1500); clock += 1250; return defaults.direct(); },
    act(ctx, opts) { assert.equal(opts.timeout, 2750); started.resolve(opts.signal); return new Promise(() => {}); } });
  await prepareInterviews(g);
  const turn = present(g), signal = await started.promise;
  clock = 4000; t.mock.timers.tick(2750);
  assert.ok((await turn).dialogue.endsWith(O1)); assert.equal(signal.aborted,true);
  await returns(g); assert.deepEqual(g.getCoordinationTrace().map(e=>e.source), ['fallback']);
});

test('configured CLI uses both witnesses, while default routing and missing credentials preserve normal play', async () => {
  const create = request => { const c = JSON.parse(request.input); return completed(c.performances?.[1] ?? defaults.direct()); };
  const performer = await configured(create);
  const inputs = ['1','1','Where were you?','6','2','1','1','Where were you?','2','1','2','2','1','1',presentation,'6','1','1','1',source,'5'];
  const output = [];
  await runCli({ write: value => output.push(value), ask: async () => { assert.ok(inputs.length); return inputs.shift(); } },
    { caseId:'greyhaven-preview', createPerformer: async () => performer });
  assert.ok(output.join('').includes("Fair question. I'll answer it straight."));
  assert.ok(output.join('').includes('Please finish your question.'));
  assert.equal((await configured(create,false)).coordination, undefined);
  assert.equal(await createConfiguredNPCPerformer({ env: { GREYHAVEN_AGENT_PILOT:'1' } }), null);
  const ashcroft = caseRegistry.createInvestigation('ashcroft', { performer });
  await ashcroft.askSuspect('alice-mercer','Where were you?');
  assert.deepEqual(ashcroft.getCoordinationTrace(), []);
});
