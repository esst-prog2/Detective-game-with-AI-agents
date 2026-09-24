import assert from 'node:assert/strict';
import test from 'node:test';
import { TOPICS, caseData } from '../src/data/case.js';
import { createInvestigation, validateCase } from '../src/game.js';
import { classifyQuestion, unsupportedQuestionText } from '../src/question-classifier.js';
import { createConfiguredOpenAIPhraser, createOpenAIDialoguePhraser } from '../src/dialogue-phraser.js';
import { runCli } from '../src/cli.js';

test('the MVP case has exactly three complete suspects and a valid murderer', () => {
  assert.deepEqual(validateCase(), []);
  assert.equal(caseData.suspects.length, 3);
  assert.ok(caseData.suspects.some((suspect) => suspect.id === caseData.murdererId));
  for (const suspect of caseData.suspects) {
    assert.deepEqual(Object.keys(suspect.responses).sort(), [...TOPICS].sort());
    assert.ok(suspect.privateFacts.length > 0);
    assert.ok(suspect.permittedLie.reason);
  }
});

test('keyword classifier recognizes all six categories and unsupported questions', () => {
  assert.equal(classifyQuestion('Where were you when Victor died?'), 'alibi');
  assert.equal(classifyQuestion('What was your relationship with Victor?'), 'relationship_with_victim');
  assert.equal(classifyQuestion('Why did you want to hurt Victor?'), 'motive');
  assert.equal(classifyQuestion('Did you see anyone suspicious?'), 'sighting');
  assert.equal(classifyQuestion('What do you know about the cufflink evidence?'), 'evidence');
  assert.equal(classifyQuestion('What happened during the murder?'), 'crime_details');
  assert.equal(classifyQuestion('Tell me a joke.'), 'unsupported');
});

test('interrogation selects only the addressed suspect response and has safe fallback', async () => {
  const game = createInvestigation();
  const alice = await game.askSuspect('alice-mercer', 'Where were you?');
  const clara = await game.askSuspect('clara-voss', 'Where were you?');
  const unsupported = await game.askSuspect('alice-mercer', 'Tell me a joke');
  assert.equal(alice.text, caseData.suspects[0].responses.alibi.fallbackText);
  assert.equal(clara.text, caseData.suspects[2].responses.alibi.fallbackText);
  assert.notEqual(alice.text, clara.text);
  assert.equal(unsupported.text, unsupportedQuestionText);
});

test('a repeated topic response is cached as identical display text', async () => {
  let calls = 0;
  const game = createInvestigation({ phraser: { async phrase({ approvedContent }) { calls += 1; return `quietly: ${approvedContent}`; } } });
  const first = await game.askSuspect('alice-mercer', 'Where were you?');
  const repeated = await game.askSuspect('alice-mercer', 'What were you doing?');
  assert.equal(first.text, repeated.text);
  assert.equal(repeated.cached, true);
  assert.equal(calls, 1);
});

test('evidence is inspectable and named evidence questions remain general category questions', async () => {
  const game = createInvestigation();
  assert.equal(game.listEvidence().length, 3);
  assert.match(game.inspectEvidence('muddy-footprints').description, /garden door/);
  const answer = await game.askSuspect('ben-carter', 'What about the cufflink?');
  assert.equal(answer.topic, 'evidence');
  assert.equal(answer.text, caseData.suspects[1].responses.evidence.fallbackText);
});

test('accusations can be cancelled and resolve correct or incorrect outcomes', () => {
  const game = createInvestigation();
  assert.equal(game.resolveAccusation('clara-voss', false).ended, false);
  assert.equal(game.resolveAccusation('clara-voss', true).result, 'correct');
  assert.equal(game.resolveAccusation('alice-mercer', true).result, 'incorrect');
});

test('OpenAI adapter validates output and configured adapter falls back when no credentials exist', async () => {
  const client = { responses: { create: async () => ({ output_text: 'quietly: I was home.' }) } };
  const adapter = createOpenAIDialoguePhraser({ client, model: 'test-model' });
  assert.equal(await adapter.phrase({ approvedContent: 'I was home.', personality: 'nervous' }), 'quietly: I was home.');
  const invalidClient = { responses: { create: async () => ({ output_text: 'I was somewhere else.' }) } };
  await assert.rejects(() => createOpenAIDialoguePhraser({ client: invalidClient, model: 'test-model' }).phrase({ approvedContent: 'I was home.', personality: 'nervous' }));
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.OPENAI_MODEL;
  delete process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_MODEL;
  await assert.rejects(() => createConfiguredOpenAIPhraser().then((phraser) => phraser.phrase()));
  if (previousKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = previousKey;
  if (previousModel === undefined) delete process.env.OPENAI_MODEL; else process.env.OPENAI_MODEL = previousModel;
});

test('scripted CLI session shows help, evidence, cancellation, and a final accusation', async () => {
  const answers = ['3', '2', '1', '4', '3', 'no', '4', '3', 'yes'];
  let output = '';
  const io = {
    ask: async () => answers.shift() ?? '5',
    write: (text) => { output += text; },
  };
  await runCli(io, { game: createInvestigation() });
  assert.match(output, /Where were you when Victor died/);
  assert.match(output, /Muddy footprints/);
  assert.match(output, /accusation was cancelled/i);
  assert.match(output, /Correct\. Clara Voss murdered Victor Hale/);
});
