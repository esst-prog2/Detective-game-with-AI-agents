import assert from 'node:assert/strict';
import test from 'node:test';
import { createOpenAIDialoguePhraser } from '../src/dialogue-phraser.js';
import { createInvestigation } from '../src/game.js';
import { caseData } from '../src/data/case.js';

function phraserReturning(output_text) {
  const client = { responses: { create: async () => ({ output_text }) } };
  return createOpenAIDialoguePhraser({ client, model: 'test-model' });
}

test('internal lead-in phrases are rejected regardless of capitalization', async () => {
  for (const leadIn of ['My statement is', 'APPROVED STATEMENT', 'Here is the Approved Text', 'MY STATEMENT IS']) {
    await assert.rejects(() => phraserReturning(`${leadIn}: I was in the kitchen.`).phrase({
      approvedContent: 'I was in the kitchen.', personality: 'Nervous.',
    }), /Invalid dialogue lead-in/);
  }
});

test('immersion check examines only the generated lead-in', async () => {
  const approvedContent = 'My statement is that I was in the kitchen.';
  const candidate = `I hesitated: ${approvedContent}`;
  assert.equal(await phraserReturning(candidate).phrase({ approvedContent, personality: 'Nervous.' }), candidate);
});

test('rejected internal lead-in uses and caches the existing game fallback', async () => {
  const approvedContent = caseData.suspects[1].responses.alibi.approvedContent;
  const game = createInvestigation({ phraser: phraserReturning(`Approved statement: ${approvedContent}`) });
  const first = await game.askSuspect('ben-carter', 'Where were you?');
  const repeated = await game.askSuspect('ben-carter', 'Where were you?');
  assert.equal(first.text, caseData.suspects[1].responses.alibi.fallbackText);
  assert.equal(repeated.text, first.text);
  assert.equal(repeated.cached, true);
});
