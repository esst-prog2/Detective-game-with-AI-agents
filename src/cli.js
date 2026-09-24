import { createInvestigation } from './game.js';
import { createConfiguredOpenAIPhraser } from './dialogue-phraser.js';

export const exampleQuestions = [
  'Where were you when Victor died?',
  'What was your relationship with Victor?',
  'Did you have a reason to hurt Victor?',
  'Did you see anyone suspicious?',
  'What do you know about the evidence?',
  'What happened when Victor died?',
];

export async function runCli(io, { game = null } = {}) {
  const investigation = game ?? createInvestigation({ phraser: await createConfiguredOpenAIPhraser() });
  io.write(`\n${investigation.data.title}\n${investigation.data.victim.description}\n`);
  io.write('One of the three suspects is the murderer. Inspect evidence, ask questions, then make one final accusation.\n');
  let running = true;
  while (running) {
    io.write('\n1. Question a suspect\n2. Inspect evidence\n3. Show example questions\n4. Make an accusation\n5. Quit\n');
    const action = (await io.ask('Choose an action: ')).trim();
    if (action === '1') await questionSuspect(io, investigation);
    else if (action === '2') await inspectEvidence(io, investigation);
    else if (action === '3') io.write(`${exampleQuestions.map((question) => `- ${question}`).join('\n')}\n`);
    else if (action === '4') running = await accuse(io, investigation);
    else if (action === '5') { io.write('Investigation closed.\n'); running = false; }
    else io.write('Please choose a number from 1 to 5.\n');
  }
}

async function chooseSuspect(io, investigation) {
  investigation.data.suspects.forEach((suspect, index) => io.write(`${index + 1}. ${suspect.name}\n`));
  const value = Number((await io.ask('Choose a suspect: ')).trim());
  return investigation.data.suspects[value - 1] ?? null;
}

async function questionSuspect(io, investigation) {
  const suspect = await chooseSuspect(io, investigation);
  if (!suspect) return io.write('Please choose a valid suspect number.\n');
  const question = await io.ask(`Ask ${suspect.name}: `);
  const answer = await investigation.askSuspect(suspect.id, question);
  io.write(`${suspect.name}: ${answer.text}\n`);
}

async function inspectEvidence(io, investigation) {
  investigation.listEvidence().forEach((evidence, index) => io.write(`${index + 1}. ${evidence.name}\n`));
  const value = Number((await io.ask('Choose evidence to inspect: ')).trim());
  const evidence = investigation.data.evidence[value - 1];
  io.write(evidence ? `${evidence.name}: ${evidence.description}\n` : 'Please choose a valid evidence number.\n');
}

async function accuse(io, investigation) {
  io.write('Choose the murderer:\n');
  const suspect = await chooseSuspect(io, investigation);
  if (!suspect) { io.write('Please choose a valid suspect number.\n'); return true; }
  const confirmation = (await io.ask(`Accuse ${suspect.name}? (yes/no): `)).trim().toLowerCase();
  const result = investigation.resolveAccusation(suspect.id, confirmation === 'yes');
  io.write(`${result.text}\n`);
  return !result.ended;
}
