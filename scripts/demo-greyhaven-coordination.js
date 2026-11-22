import assert from 'node:assert/strict';
import { caseRegistry } from '../src/cases/registry.js';
import { createConfiguredNPCPerformer } from '../src/npc-performance.js';
import { replay } from '../test-support/greyhaven-pilot-journey.js';
import { demoRetestDeadlines } from '../src/greyhaven-coordination.js';
import { roleRejection } from '../src/role-rejection.js';

const demoStart = performance.now();
const mode = process.argv[2] ?? 'scripted';
if (!['offline', 'scripted', 'live', 'live-retest'].includes(mode)) throw Error('Choose offline, scripted, live or live-retest.');
const retest = mode === 'live-retest';
if (retest && process.env.OPENAI_MODEL !== 'gpt-4.1-mini-2025-04-14') throw Error('Retest requires the approved model snapshot.');
const game = performer => caseRegistry.createInvestigation('greyhaven-preview', { performer });
const baseline = await replay(game(null));

function show(label, run, calls, measurements = {}) {
  assert.deepEqual(run.snapshots, baseline.snapshots);
  assert.equal(run.replies[2].dialogue, baseline.replies[2].dialogue);
  const decisions = run.decisions.map(event => ({ ...event, source: event.source === 'provider'
    ? (label === 'scripted' ? 'scripted' : 'live') : 'fallback' }));
  const replies = retest ? run.replies.map(({ elapsedMs }) => ({ elapsedMs })) : run.replies;
  console.log(JSON.stringify({ mode: label, factualParity: true, calls, decisions,
    replies, returnToBaseline: true, ...measurements }));
}

if (mode === 'offline') show(mode, baseline, []);
if (mode === 'scripted') {
  for (const strategy of ['invite-account', 'set-boundary']) {
    for (const index of [0, 1]) {
      const calls = [];
      const coordination = {
        direct(input) { calls.push({ role: 'director', actions: input.actions }); return { strategy }; },
        act(input) { calls.push({ role: input.speaker, memory: input.memory }); return input.performances[index]; }
      };
      const run = await replay(game({ coordination }));
      assert.equal(calls.length, 3);
      assert.ok(run.decisions.every(d => d.source === 'provider'));
      show(mode, run, calls);
    }
  }
}
if (mode === 'live' || retest) {
  const performer = await createConfiguredNPCPerformer({ env: { ...process.env, GREYHAVEN_AGENT_PILOT: '1' } });
  const calls = [];
  if (performer?.coordination) {
    const roles = performer.coordination;
    performer.coordination = Object.fromEntries(['direct', 'act'].map(method => [method, async (input, opts) => {
      const entry = { role: input.speaker ?? 'director', ordinal: calls.length + 1, timeoutMs: opts.timeout,
        elapsedMs: null, outcome: 'pending', responseReceived: false, tokens: null };
      calls.push(entry);
      const start = performance.now();
      let sdkStart;
      entry.sdkElapsedMs = null;
      const markRequestElapsed = () => {
        if (sdkStart !== undefined) entry.sdkElapsedMs ??= Math.round(performance.now() - sdkStart);
      };
      const markElapsed = () => { entry.elapsedMs ??= Math.round(performance.now() - start); };
      const onAbort = () => {
        entry.outcome = 'locally-aborted';
        entry.aborted = true;
        entry.rejection = roleRejection(opts.signal.reason);
        markRequestElapsed();
        markElapsed();
      };
      opts.signal.addEventListener('abort', onAbort, { once: true });
      try {
        const result = await roles[method](input, { ...opts, onRequestStart() { sdkStart = performance.now(); }, onUsage(usage) {
          markRequestElapsed();
          entry.responseReceived = true;
          if (Number.isSafeInteger(usage?.input_tokens) && Number.isSafeInteger(usage.output_tokens)) {
            entry.tokens = { input: usage.input_tokens, output: usage.output_tokens };
          }
        } });
        if (!opts.signal.aborted) entry.outcome = 'adapter-validated';
        return result;
      } catch (error) {
        markRequestElapsed();
        if (Number.isInteger(error?.status)) entry.httpStatus = error.status;
        if (!opts.signal.aborted) {
          entry.outcome = entry.responseReceived ? 'response-rejected' : 'request-error';
          entry.rejection = roleRejection(error);
        }
        throw error;
      } finally {
        opts.signal.removeEventListener('abort', onAbort);
        markElapsed();
      }
    }]));
    if (retest) performer.coordination.deadlines = demoRetestDeadlines;
  }
  const replayStart = performance.now();
  const run = await replay(game(performer));
  const accepted = calls.length === 3 && run.decisions.length === 2 && run.decisions.every(d => d.source === 'provider');
  show(accepted ? 'live' : 'live-requested/fallback', run, calls, {
    model: process.env.OPENAI_MODEL, ...(retest && { deadlines: demoRetestDeadlines }),
    handoffUsed: run.decisions.some(d => d.role === 'Mara' && d.instruction !== null),
    replayElapsedMs: Math.round(performance.now() - replayStart), totalElapsedMs: Math.round(performance.now() - demoStart)
  });
  if (!accepted) { console.error('Live acceptance outstanding. Check local configuration and recorded role outcomes.'); process.exitCode = 1; }
}
