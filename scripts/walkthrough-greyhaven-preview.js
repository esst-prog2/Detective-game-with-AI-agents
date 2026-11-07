import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { caseRegistry } from '../src/cases/registry.js';
import { runCli } from '../src/cli.js';
import { M0, O0, O1, work, guarded, reason, presentation } from '../test-support/greyhaven-preview-oracle.js';

const game = caseRegistry.createInvestigation('greyhaven-preview'), actions = [];
const record = (action, result) => { actions.push({ action, result }); return result; };
const ask = async (speaker, question, expected) => {
  const result = record({ question, speaker }, await game.askSuspect(speaker, question));
  if (expected) assert.ok(result.dialogue.endsWith(expected)); return result;
};
await ask('mara-vale', 'Where were you?', M0);
await ask('mara-vale', 'How do you know?', guarded);
record({ travel: 'boathouse' }, game.travelTo('boathouse'));
assert.equal((await ask('owen-vale', presentation)).kind, 'unsupported');
await ask('owen-vale', 'Where were you?', O0);
await ask('owen-vale', 'What do you mean by work?', work);
record({ inspect: 'pump-worksheet' }, game.inspectPublicEvidence('pump-worksheet'));
assert.equal((await ask('owen-vale', presentation)).kind, 'unsupported');
record({ inspect: 'repayment-demand' }, game.inspectPublicEvidence('repayment-demand'));
assert.ok(game.getPublicView().dialogue.conversations.find((row) => row.suspectId === 'owen-vale').options.some((row) => row.id === 'present-pump-payment'));
assert.ok(record({ choiceId: 'present-pump-payment', speaker: 'owen-vale' }, await game.interact('owen-vale', { choiceId: 'present-pump-payment' })).dialogue.endsWith(O1));
await ask('owen-vale', 'Why hide a repair that helped someone?', reason);
await ask('owen-vale', 'Explain your earlier work account.', O1);
await ask('owen-vale', 'What do you mean by that?', O1);
await ask('owen-vale', 'Where were you?', O1);
record({ travel: 'reception' }, game.travelTo('reception'));
await ask('mara-vale', 'Where were you?', M0);
assert.equal(record({ accuse: 'owen-vale' }, game.resolveAccusation('owen-vale', true)).code, 'accusation_unavailable');
assert.equal(game.getLifecycle().status, 'active');
assert.doesNotMatch(JSON.stringify(actions), /Ruth|20:38|epistemics|murdererId/);

const inputs = ['1', '1', 'Where were you?', '6', '2', '1', '1', 'Where were you?', '1', '1', 'What work?', '2', '1', '2', '2', '1', '1', '/choices', '1', '1', '1', 'Why hide a repair that helped someone?', '4', '5'];
const transcript = [];
await runCli({ write: (text) => transcript.push(text), ask: async (prompt) => { assert.ok(inputs.length); const answer = inputs.shift(); transcript.push(`${prompt}${answer}\n`); return answer; } },
  { caseId: 'greyhaven-preview', createPerformer: async () => null });
assert.equal(inputs.length, 0); assert.ok(transcript.join('').includes(O1));
assert.doesNotMatch(transcript.join(''), /Choose the murderer|Correct\.|Incorrect\.|Ruth/);
await mkdir('docs/greyhaven-preview', { recursive: true });
await writeFile('docs/greyhaven-preview/engine-public-actions.json', JSON.stringify({ caseId: 'greyhaven-preview', actions, finalLifecycle: game.getLifecycle() }, null, 2) + '\n');
await writeFile('docs/greyhaven-preview/cli-walkthrough.txt', transcript.join(''));
console.log(`Recorded ${actions.length} public preview actions and an actual CLI choices/text journey. No model calls or murder verdict.`);
