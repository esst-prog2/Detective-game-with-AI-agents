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
  const preview = investigation.getCaseMode?.() === 'preview';
  io.write(preview ? 'Preview objective: inspect both boathouse records, question Mara and Owen, and use an available evidence question. This excerpt has no murder verdict. Continue exploring after the repair explanation.\n'
    : `One of the ${caseId === 'ashcroft' ? 'three' : investigation.data.suspects.filter(person => person.accusationEligible !== false).length} suspects is the murderer. Inspect evidence, ask questions, then make one final accusation.\n`);
  let running = true;
  while (running) {
    const currentLifecycle = investigation.getLifecycle();
    if (currentLifecycle.status === 'ended') {
      io.write(`${currentLifecycle.finalResult.text}\n`);
      return;
    }
    const view = investigation.getPublicView();
    io.write(`\nCurrent room: ${view.rooms.find((room) => room.id === view.currentLocationId).name}\n`);
    io.write(`\n1. Question a suspect\n2. Inspect evidence\n3. Show example questions\n${preview ? '4. Final accusation unavailable in this preview' : '4. Make an accusation'}\n5. Quit\n6. Travel to another room\n7. Review inspected evidence\n`);
    const action = (await io.ask('Choose an action: ')).trim();
    if (action === '1') await questionSuspect(io, investigation);
    else if (action === '2') await inspectEvidence(io, investigation);
    else if (action === '3') io.write(`${(preview ? view.dialogue.conversations.flatMap((conversation) => conversation.options.map((option) => option.label)) : caseId === 'ashcroft' ? exampleQuestions : Object.values(topicQuestions)).map((question) => `- ${question}`).join('\n')}\n`);
    else if (action === '4') { if (preview) io.write(`${investigation.resolveAccusation(null, true).text}\n`); else running = await accuse(io, investigation); }
    else if (action === '5') { io.write('Investigation closed.\n'); running = false; }
    else if (action === '6') await travel(io, investigation);
    else if (action === '7') {
      const observations = investigation.receivedObservations();
      if (!observations.length) io.write('No evidence inspected.\n');
      for (const item of observations) io.write(`${item.name}: ${item.description}\n`);
    } else io.write('Please choose a number from 1 to 7.\n');
  }
}

async function chooseSuspect(io, investigation, local = false) {
  const view = investigation.getPublicView();
  const choices = view.suspects.filter((suspect) => local ? suspect.locationId === view.currentLocationId : suspect.accusationEligible !== false);
  if (!choices.length) { io.write('There is nobody to question here.\n'); return null; }
  choices.forEach((suspect, index) => io.write(`${index + 1}. ${suspect.name}\n`));
  const value = Number((await io.ask('Choose a suspect: ')).trim());
  return choices[value - 1] ?? null;
}

async function questionSuspect(io, investigation) {
  const suspect = await chooseSuspect(io, investigation, true);
  if (!suspect) return io.write('Please choose a valid suspect number.\n');
  const question = await io.ask(`Ask ${suspect.name} (or /choices, /statements): `);
  let answer;
  if (['/choices', '/statements'].includes(question.trim())) {
    const conversation = investigation.getPublicView().dialogue.conversations.find(c => c.suspectId === suspect.id);
    let options = [...conversation.options, ...conversation.moreOptions];
    if (question.trim() === '/statements') {
      if (!conversation.statements.length) return io.write('No statements received.\n');
      conversation.statements.forEach((item, i) => io.write(`${i + 1}. ${suspect.name} · Turn ${item.turnId} (${item.accountStatus})\n`));
      const item = conversation.statements[Number(await io.ask('Review statement: ')) - 1];
      if (!item) return;
      io.write(`${item.dialogue}\n`);
      options = options.filter(option => item.followUps.includes(option.id));
      if (!options.length) return;
    }
    const choice = await chooseInterviewAction(io, options);
    if (!choice) return;
    answer = await investigation.interact(suspect.id, { choiceId: choice.id });
  } else answer = await investigation.askSuspect(suspect.id, question);
  if (answer.narration) io.write(`*${answer.narration}*\n`);
  io.write(`${suspect.name}: ${answer.text}\n`);
}

async function chooseInterviewAction(io, options) {
  let start = 0;
  while (true) {
    const page = options.slice(start, start + 6);
    page.forEach((option, i) => io.write(`${i + 1}. ${option.label}\n`));
    const input = (await io.ask(`Choose a question${start ? ', back' : ''}${start + 6 < options.length ? ', next' : ''}, or return: `)).trim();
    if (input === 'next' && start + 6 < options.length) start += 6;
    else if (input === 'back' && start) start -= 6;
    else return page[Number(input) - 1];
  }
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
  const exits = view.rooms.find(room => room.id === view.currentLocationId).connections;
  const destinations = view.rooms.filter(room => !exits || exits.includes(room.id));
  destinations.forEach((room, i) => io.write(`${i + 1}. ${room.name}\n`));
  const room = destinations[Number((await io.ask('Choose a room: ')).trim()) - 1];
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
