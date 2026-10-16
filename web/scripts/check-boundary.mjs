import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('..', import.meta.url));
async function files(dir) {
  return (await Promise.all((await readdir(dir, { withFileTypes: true })).map((entry) => entry.isDirectory() ? files(resolve(dir, entry.name)) : resolve(dir, entry.name)))).flat();
}
for (const path of await files(resolve(root, 'dist'))) {
  assert.equal(path.endsWith('.map'), false, 'Public build must not ship source maps');
  const text = await readFile(path, 'utf8');
  assert.doesNotMatch(text, /SERVER_ONLY_CANARY_6fd298|murdererId|intendedSolution|privateFacts|permittedLie|concealmentReason|approvedContent|OPENAI_API_KEY|sk-proj-|src\/data\/case\.js/, 'Forbidden server information in built artifact');
}
console.log('Built artifact privacy boundary passed; no source maps or forbidden server markers.');
