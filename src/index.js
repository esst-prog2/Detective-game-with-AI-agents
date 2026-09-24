import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { runCli } from './cli.js';

const readlineInterface = readline.createInterface({ input, output });
const io = {
  ask: (prompt) => readlineInterface.question(prompt),
  write: (text) => output.write(text),
};

try {
  await runCli(io);
} finally {
  readlineInterface.close();
}
