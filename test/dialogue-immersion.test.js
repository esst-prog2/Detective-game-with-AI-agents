import assert from 'node:assert/strict';
import test from 'node:test';
import { createOpenAIDialoguePhraser } from '../src/dialogue-phraser.js';

// Human-defined expectations chosen by the user before execution, recorded in
// PLANNING_LOG.md on 2026-10-10. They are independent of current validation.
const approvedContent = 'I was in the kitchen.';

function phraseCandidate(candidate) {
  const client = {
    responses: { create: async () => ({ output_text: candidate }) },
  };
  return createOpenAIDialoguePhraser({ client, model: 'test-model' }).phrase({
    approvedContent,
    personality: 'Nervous.',
  });
}

test('HW5 candidate A: reject Approved statement lead-in', async () => {
  await assert.rejects(
    () => phraseCandidate('Approved statement: I was in the kitchen.'),
    'Candidate A must be rejected because it exposes internal prompt language.',
  );
});

test('HW5 candidate B: reject Here is the approved text lead-in', async () => {
  await assert.rejects(
    () => phraseCandidate('Here is the approved text: I was in the kitchen.'),
    'Candidate B must be rejected because it exposes internal prompt language.',
  );
});

test('HW5 candidate C: accept I hesitated lead-in', async () => {
  const candidate = 'I hesitated: I was in the kitchen.';
  assert.equal(await phraseCandidate(candidate), candidate);
});
