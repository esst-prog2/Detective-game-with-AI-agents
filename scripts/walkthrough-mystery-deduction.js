import { mkdir, writeFile } from 'node:fs/promises';
import { createInvestigation } from '../src/game.js';
import { publicMysteryJourney, cliMysteryJourney } from '../test-support/mystery-journey.js';

// Offline, public actions only; no provider configuration or raw case records.
const output = new URL('../docs/mystery-deduction/', import.meta.url);
await mkdir(output, { recursive: true });
const actions = [];
const result = await publicMysteryJourney(createInvestigation(), (record) => actions.push(record));
const transcript = await cliMysteryJourney(createInvestigation());
await writeFile(new URL('engine-public-actions.json', output), JSON.stringify({ mode: 'offline', actions, result }, null, 2) + '\n');
await writeFile(new URL('cli-walkthrough.txt', output), transcript);
console.log(`Recorded ${actions.length} public engine actions and a complete CLI walkthrough. No model calls.`);
