import assert from 'node:assert/strict';
import { M0, O0, O1, guarded, presentation, work } from './greyhaven-preview-oracle.js';

export const owen = 'owen-vale';
export const mara = 'mara-vale';
export const source = 'Are you saying you watched him the whole time?';

export async function prepareInterviews(game, history = 'clarification', snapshots = []) {
  async function question(who, text, expected) {
    const answer = await game.askSuspect(who, text);
    if (expected) assert.ok(answer.dialogue.endsWith(expected));
    else assert.equal(answer.kind, 'unsupported');
    snapshots.push(facts(game));
  }
  await question(mara, 'Where were you?', M0);
  game.travelTo('boathouse');
  snapshots.push(facts(game));
  await question(owen, presentation);
  await question(owen, 'Where were you?', O0);
  if (history === 'challenge') {
    assert.equal((await game.askSuspect(owen, 'Are you hiding something?')).kind, 'answer');
    snapshots.push(facts(game));
  }
  else await question(owen, 'What do you mean by work?', work);
  game.inspectPublicEvidence('pump-worksheet');
  snapshots.push(facts(game));
  await question(owen, presentation);
  game.inspectPublicEvidence('repayment-demand');
  snapshots.push(facts(game));
}

function facts(game) {
  const view = game.getPublicView();
  const diagnostics = game.getDialogueDiagnostics();
  return { location: view.currentLocationId, inspected: view.dialogue.inspectedEvidenceIds, lifecycle: view.lifecycle,
    options: view.dialogue.conversations.map(c => c.options), policy: diagnostics.policy,
    committed: diagnostics.npcs.map(n => n.turns.map(t => t.coreId)) };
}

export async function replay(game) {
  const snapshots = [], replies = [];
  await prepareInterviews(game, 'clarification', snapshots);
  async function timed(operation, body) {
    const start = performance.now();
    const answer = await operation();
    assert.ok(answer.dialogue.endsWith(body));
    replies.push({ dialogue: answer.dialogue, elapsedMs: Math.round(performance.now() - start) });
    snapshots.push(facts(game));
  }
  await timed(() => game.interact(owen, { choiceId: 'present-pump-payment' }), O1);
  game.travelTo('reception');
  snapshots.push(facts(game));
  await timed(() => game.askSuspect(mara, source), guarded);
  await timed(() => game.askSuspect(mara, source), guarded);
  assert.equal(game.getLifecycle().status, 'active');
  return { snapshots, replies, decisions: game.getCoordinationTrace() };
}
