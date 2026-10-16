// Test process only: private canaries are never imported by the browser graph.
import { createInvestigation } from '../../src/game.js';
import { createInvestigationServer } from '../../src/http-api.js';
import { createSessionStore } from '../../src/investigation-sessions.js';
import { caseData } from '../../src/data/case.js';
const data = structuredClone(caseData);
data.privateCanary = 'SERVER_ONLY_CANARY_6fd298';
data.suspects[0].privateFacts.push('SERVER_ONLY_CANARY_6fd298');
data.suspects[1].permittedLie.privateCanary = 'SERVER_ONLY_CANARY_6fd298';
const store = createSessionStore({ investigationFactory: () => createInvestigation({ data }) });
const server = createInvestigationServer({ store });
server.listen(Number(process.env.API_PORT || 3001), '127.0.0.1');
const shutdown = () => { server.close(); server.closeIdleConnections(); };
process.once('SIGTERM', shutdown); process.once('SIGINT', shutdown);
