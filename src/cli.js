import { caseRegistry } from './cases/registry.js';
import { createConfiguredNPCPerformer } from './npc-performance.js';
import { topicQuestions } from './dialogue-state.js';

export const exampleQuestions = [
  'Where were you when Victor died?',
  'What was your relationship with Victor?',
  'Did you have a reason to hurt Victor?',
  'Did you see anyone suspicious?',
  'What do you know about the evidence?',
  'What happened when Victor died?',
];

export function parseCaseArguments(args) {
  if (!args.length) return {};
  if (args.length === 1 && args[0] === '--list-cases') return { listCases: true };
  if (args.length === 2 && args[0] === '--case' && caseRegistry.resolve(args[1])) return { caseId: args[1] };
  throw new Error('Use --list-cases or --case <available-id>.');
}

export async function runCli(io, { game = null, caseId = 'ashcroft', listCases = false, registry = caseRegistry, createPerformer = createConfiguredNPCPerformer } = {}) {
  if (listCases) {
    for (const item of registry.list()) io.write(`${item.id}: ${item.title}\n`);
    return;
  }
  if (!game && !registry.resolve(caseId)) { io.write('That case is not available. Use --list-cases.\n'); return; }
  const investigation = game ?? registry.createInvestigation(caseId, { performer: await createPerformer() });
  const lifecycle = investigation.getLifecycle();
  if (lifecycle.status === 'ended') {
    io.write(`${lifecycle.finalResult.text}\n`);
    return;
  }
  io.write(`\n${investigation.data.title}\n${investigation.data.victim.description}\n`);
  io.write(`One of the ${caseId === 'ashcroft' ? 'three' : investigation.data.suspects.length} suspects is the murderer. Inspect evidence, ask questions, then make one final accusation.\n`);
  let running = true;
  while (running) {
    const currentLifecycle = investigation.getLifecycle();
    if (currentLifecycle.status === 'ended') {
      io.write(`${currentLifecycle.finalResult.text}\n`);
      return;
    }
    const view = investigation.getPublicView();
    io.write(`\nCurrent room: ${view.rooms.find((room) => room.id === view.currentLocationId).name}\n`);
    io.write('\n1. Question a suspect\n2. Inspect evidence\n3. Show example questions\n4. Make an accusation\n5. Quit\n6. Travel to another room\n');
    const action = (await io.ask('Choose an action: ')).trim();
    if (action === '1') await questionSuspect(io, investigation);
    else if (action === '2') await inspectEvidence(io, investigation);
    else if (action === '3') io.write(`${(caseId === 'ashcroft' ? exampleQuestions : Object.values(topicQuestions)).map((question) => `- ${question}`).join('\n')}\n`);
    else if (action === '4') running = await accuse(io, investigation);
    else if (action === '5') { io.write('Investigation closed.\n'); running = false; }
    else if (action === '6') await travel(io, investigation);
    else io.write('Please choose a number from 1 to 6.\n');
  }
}

async function chooseSuspect(io, investigation, local = false) {
  const view = investigation.getPublicView();
  const choices = view.suspects.filter((suspect) => !local || suspect.locationId === view.currentLocationId);
  if (!choices.length) { io.write('There is nobody to question here.\n'); return null; }
  choices.forEach((suspect, index) => io.write(`${index + 1}. ${suspect.name}\n`));
  const value = Number((await io.ask('Choose a suspect: ')).trim());
  return choices[value - 1] ?? null;
}

async function questionSuspect(io, investigation) {
  const suspect = await chooseSuspect(io, investigation, true);
  if (!suspect) return io.write('Please choose a valid suspect number.\n');
  const question = await io.ask(`Ask ${suspect.name} (or /choices): `);
  let answer;
  if (question.trim() === '/choices') {
    const options = investigation.getPublicView().dialogue.conversations.find((c) => c.suspectId === suspect.id)?.options ?? [];
    options.forEach((option, i) => io.write(`${i + 1}. ${option.label}\n`));
    const choice = options[Number((await io.ask('Choose a question: ')).trim()) - 1];
    if (!choice) return io.write('Please choose a valid question number.\n');
    answer = await investigation.interact(suspect.id, { choiceId: choice.id });
  } else answer = await investigation.askSuspect(suspect.id, question);
  if (answer.narration) io.write(`*${answer.narration}*\n`);
  io.write(`${suspect.name}: ${answer.text}\n`);
}

async function inspectEvidence(io, investigation) {
  const choices = investigation.listEvidence().filter((clue) => clue.locationId === investigation.getLocationContext().locationId);
  if (!choices.length) return io.write('There is no evidence to inspect here.\n');
  choices.forEach((evidence, index) => io.write(`${index + 1}. ${evidence.name}\n`));
  const value = Number((await io.ask('Choose evidence to inspect: ')).trim());
  const selected = choices[value - 1];
  const evidence = selected ? investigation.inspectEvidence(selected.id) : null;
  if (evidence?.kind === 'error') return io.write(`${evidence.text}\n`);
  io.write(evidence ? `${evidence.name}: ${evidence.description}\n` : 'Please choose a valid evidence number.\n');
}

async function travel(io, investigation) {
  const view = investigation.getPublicView();
  view.rooms.forEach((room, i) => io.write(`${i + 1}. ${room.name}\n`));
  const room = view.rooms[Number((await io.ask('Choose a room: ')).trim()) - 1];
  if (!room) return io.write('Please choose a valid room number.\n');
  const result = investigation.travelTo(room.id);
  io.write(result.kind === 'error' ? `${result.text}\n` : `You are in ${room.name}.\n`);
}

async function accuse(io, investigation) {
  io.write('Choose the murderer:\n');
  const suspect = await chooseSuspect(io, investigation);
  if (!suspect) { io.write('Please choose a valid suspect number.\n'); return true; }
  io.write('Confirming ends the investigation, whether the accusation is correct or incorrect.\n');
  const confirmation = (await io.ask(`Accuse ${suspect.name}? (yes/no): `)).trim().toLowerCase();
  const result = investigation.resolveAccusation(suspect.id, confirmation === 'yes');
  io.write(`${result.text}\n`);
  return !result.ended;
}
