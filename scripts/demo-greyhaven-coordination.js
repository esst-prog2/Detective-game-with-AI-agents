import assert from 'node:assert/strict';
import { caseRegistry } from '../src/cases/registry.js';
import { createConfiguredNPCPerformer } from '../src/npc-performance.js';
import { replay } from '../test-support/greyhaven-pilot-journey.js';

const mode = process.argv[2] ?? 'scripted';
if (!['offline', 'scripted', 'live'].includes(mode)) throw Error('Choose offline, scripted or live.');
const game = performer => caseRegistry.createInvestigation('greyhaven-preview', { performer });
const baseline = await replay(game(null));

function show(label, run, calls) {
  assert.deepEqual(run.snapshots, baseline.snapshots);
  assert.equal(run.replies[2].dialogue, baseline.replies[2].dialogue);
  const decisions = run.decisions.map(event => ({ ...event, source: event.source === 'provider'
    ? (label === 'scripted' ? 'scripted' : 'live') : 'fallback' }));
  console.log(JSON.stringify({ mode: label, factualParity: true, calls, decisions,
    replies: run.replies, returnToBaseline: true }));
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
if (mode === 'live') {
  const performer = await createConfiguredNPCPerformer({ env: { ...process.env, GREYHAVEN_AGENT_PILOT: '1' } });
  const calls = [];
  if (performer?.coordination) {
    const roles = performer.coordination;
    performer.coordination = Object.fromEntries(['direct', 'act'].map(method => [method, async (input, opts) => {
      const entry = { role: input.speaker ?? 'director', ordinal: calls.length + 1, elapsedMs: null, tokens: null };
      calls.push(entry);
      const start = performance.now();
      try {
        return await roles[method](input, { ...opts, onUsage(usage) {
          if (Number.isSafeInteger(usage?.input_tokens) && Number.isSafeInteger(usage.output_tokens)) {
            entry.tokens = { input: usage.input_tokens, output: usage.output_tokens };
          }
        } });
      } finally { entry.elapsedMs = Math.round(performance.now() - start); }
    }]));
  }
  const run = await replay(game(performer));
  const accepted = calls.length === 3 && run.decisions.length === 2 && run.decisions.every(d => d.source === 'provider');
  show(accepted ? 'live' : 'live-requested/fallback', run, calls);
  if (!accepted) { console.error('Live acceptance outstanding. Check local configuration and recorded role outcomes.'); process.exitCode = 1; }
}
