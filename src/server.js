import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createInvestigationServer } from './http-api.js';
import { createSessionStore } from './investigation-sessions.js';
import { createInvestigation } from './game.js';
import { createConfiguredNPCPerformer } from './npc-performance.js';

export async function startApi({ port = process.env.API_PORT ?? '3001', createPerformer = createConfiguredNPCPerformer } = {}) {
  if (!/^\d{1,5}$/.test(String(port)) || Number(port) < 1 || Number(port) > 65535) throw new Error('Invalid API port');
  const performer = await createPerformer();
  const store = createSessionStore({ investigationFactory: () => createInvestigation({ performer }) });
  const server = createInvestigationServer({ store });
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(Number(port), '127.0.0.1', () => { server.removeListener('error', reject); resolveListen(); });
  });
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  startApi().then((server) => {
    console.log(`Investigation API listening on http://127.0.0.1:${server.address().port}`);
    const shutdown = () => { server.close(); server.closeIdleConnections(); };
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  }).catch(() => { console.error('Could not start investigation API.'); process.exitCode = 1; });
}
