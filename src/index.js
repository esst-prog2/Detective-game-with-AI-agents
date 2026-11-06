import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { runCli, parseCaseArguments } from './cli.js';

const readlineInterface = readline.createInterface({ input, output });
const io = {
  ask: (prompt) => readlineInterface.question(prompt),
  write: (text) => output.write(text),
};

try {
  await runCli(io, parseCaseArguments(process.argv.slice(2)));
} catch {
  output.write('Could not start the investigation. Use --list-cases or --case <available-id>.\n');
  process.exitCode = 1;
} finally {
  readlineInterface.close();
}
