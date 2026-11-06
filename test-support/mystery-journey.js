import { runCli } from '../src/cli.js';

// Public commands only. Selection uses displayed labels, never case/private data.
export async function publicMysteryJourney(game, record = () => {}) {
  const action = async (name, operation) => { const result = await operation(); record({ action: name, result }); return result; };
  await action('Inspect contract in study', () => game.inspectPublicEvidence('torn-contract'));
  await action('Inspect cufflink in study', () => game.inspectPublicEvidence('silver-cufflink'));
  for (const [label, id] of [['recognizes', 'alice-mercer'], ['suspicious', 'alice-mercer']]) {
    const option = game.getPublicView().dialogue.conversations.find((c) => c.suspectId === id).options.find((o) => o.label.includes(label));
    if (!option) throw new Error('Essential question is not visible');
    await action(option.label, () => game.interact(id, { choiceId: option.id }));
  }
  await action('Travel to garden', () => game.travelTo('garden'));
  await action('Inspect footprints', () => game.inspectPublicEvidence('muddy-footprints'));
  await action('Ask Ben about footprints', () => game.askSuspect('ben-carter', 'What about the muddy footprints?'));
  await action('Travel to library', () => game.travelTo('library'));
  for (const label of ['suspicious', 'Alice described']) {
    const option = game.getPublicView().dialogue.conversations.find((c) => c.suspectId === 'clara-voss').options.find((o) => o.label.includes(label));
    if (!option) throw new Error('Essential question is not visible');
    await action(option.label, () => game.interact('clara-voss', { choiceId: option.id }));
  }
  return action('Confirm Clara accusation', () => game.resolveAccusation('clara-voss', true));
}

export async function cliMysteryJourney(game) {
  const chooseLabel = (label) => (output) => {
    const line = output.split('\n').findLast((row) => row.includes(label));
    const match = line?.match(/^(\d+)\. /);
    if (!match) throw new Error('Required CLI choice is not visible');
    return match[1];
  };
  const inputs = ['2', '1', '2', '2', '1', '1', '/choices', chooseLabel('recognizes'),
    '1', '1', '/choices', chooseLabel('suspicious'), '6', '3', '2', '1',
    '1', '1', 'What about the muddy footprints?', '6', '2',
    '1', '1', '/choices', chooseLabel('suspicious'),
    '1', '1', '/choices', chooseLabel('Alice described'), '4', '3', 'yes'];
  let transcript = ''; let displayed = '';
  await runCli({
    write: (value) => { transcript += value; displayed += value; },
    ask: async (prompt) => {
      if (!inputs.length) throw new Error('Unexpected CLI prompt');
      const input = inputs.shift(); const value = typeof input === 'function' ? input(displayed) : input;
      transcript += `${prompt}${value}\n`;
      displayed = '';
      return value;
    },
  }, { game });
  if (inputs.length) throw new Error('CLI did not complete the planned journey');
  return transcript;
}
