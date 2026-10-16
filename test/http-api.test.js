import assert from 'node:assert/strict';
import test from 'node:test';
import { request as httpRequest } from 'node:http';
import { connect } from 'node:net';
import { once } from 'node:events';
import { createInvestigationServer } from '../src/http-api.js';
import { createSessionStore } from '../src/investigation-sessions.js';
import { createInvestigation } from '../src/game.js';
import { caseData } from '../src/data/case.js';
import { startApi } from '../src/server.js';

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

async function setup(t, options = {}) {
  const store = createSessionStore(options);
  const server = createInvestigationServer({ store });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); }));
  const port = server.address().port;
  const call = (method, path, body, extra = {}) => new Promise((resolve, reject) => {
    const wire = extra.raw ?? (body === undefined ? undefined : JSON.stringify(body));
    const req = httpRequest({ host: '127.0.0.1', port, method, path, agent: false,
      headers: { ...(wire === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(method === 'GET' && wire !== undefined ? { 'Content-Length': Buffer.byteLength(wire) } : {}), ...extra.headers },
    }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('error', reject);
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString();
        try { resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(text), text }); }
        catch { reject(new Error(`Non-JSON response with status ${res.statusCode}`)); }
      });
    });
    req.on('error', reject);
    if (extra.chunks) for (const chunk of extra.chunks) req.write(chunk);
    else if (wire !== undefined) req.write(wire);
    req.end();
  });
  const create = async () => {
    const response = await call('POST', '/api/investigations', {});
    assert.equal(response.status, 201);
    return response.body.data;
  };
  return { server, store, port, call, create };
}

const pathFor = (id, action = '') => `/api/investigations/${id}${action ? `/${action}` : ''}`;
const question = (expectedRevision = 0) => ({ suspectId: 'ben-carter', question: 'Where were you?', expectedRevision });

function errorIs(response, status, code) {
  assert.equal(response.status, status);
  assert.deepEqual(Object.keys(response.body).sort(), ['data', 'error', 'ok']);
  assert.equal(response.body.ok, false);
  assert.equal(response.body.data, null);
  assert.deepEqual(Object.keys(response.body.error).sort(), ['code', 'message', 'session']);
  assert.equal(response.body.error.code, code);
  assert.equal(typeof response.body.error.message, 'string');
  if (response.body.error.session) assert.deepEqual(Object.keys(response.body.error.session), ['revision']);
}

test('HTTP supports a complete offline investigation, cancellation and stable correct ending', async (t) => {
  const { call, create } = await setup(t);
  let data = await create();
  assert.match(data.sessionId, /^[a-f0-9]{64}$/);
  assert.equal(data.revision, 0);
  assert.deepEqual(data.state, createInvestigation().getPublicView());
  const base = pathFor(data.sessionId);
  const read = await call('GET', base);
  assert.deepEqual(read.body, { ok: true, data, error: null });
  assert.equal(read.headers['cache-control'], 'no-store');
  assert.equal(read.headers['x-content-type-options'], 'nosniff');
  assert.equal(read.headers['referrer-policy'], 'no-referrer');
  assert.match(read.headers['content-type'], /application\/json/);
  const ask = await call('POST', `${base}/questions`, question());
  assert.equal(ask.status, 200);
  data = ask.body.data;
  assert.equal(data.result.text, 'I was repairing the greenhouse window when Victor died.');
  assert.equal(data.revision, 1);
  const cached = await call('POST', `${base}/questions`, question(1));
  assert.equal(cached.body.data.result.cached, true);
  data = cached.body.data;
  const unsupported = await call('POST', `${base}/questions`, { ...question(data.revision), question: 'Tell me a joke' });
  assert.equal(unsupported.body.data.result.kind, 'unsupported');
  data = unsupported.body.data;
  for (const clue of caseData.evidence) {
    const inspected = await call('POST', `${base}/evidence/inspect`, { evidenceId: clue.id, expectedRevision: data.revision });
    assert.equal(inspected.status, 200);
    assert.deepEqual(inspected.body.data.result, clue);
    data = inspected.body.data;
  }
  const cancel = await call('POST', `${base}/accusations`, { suspectId: 'clara-voss', confirmed: false, expectedRevision: data.revision });
  assert.equal(cancel.body.data.result.result, 'cancelled');
  assert.equal(cancel.body.data.state.lifecycle.status, 'active');
  data = cancel.body.data;
  const end = await call('POST', `${base}/accusations`, { suspectId: 'clara-voss', confirmed: true, expectedRevision: data.revision });
  assert.equal(end.status, 200);
  data = end.body.data;
  assert.equal(data.result.result, 'correct');
  assert.equal(data.revision, 8);
  assert.deepEqual(data.state.lifecycle.finalResult, data.result);
  for (const [action, body] of [
    ['questions', question(0)], ['questions', { ...question(0), suspectId: 'unknown' }],
    ['evidence/inspect', { evidenceId: 'unknown', expectedRevision: 0 }],
    ['accusations', { suspectId: 'alice-mercer', confirmed: true, expectedRevision: 0 }],
    ['accusations', { suspectId: 'unknown', confirmed: false, expectedRevision: 0 }],
  ]) {
    const rejected = await call('POST', `${base}/${action}`, body);
    errorIs(rejected, 409, 'investigation_ended');
    assert.equal(rejected.text.includes(data.sessionId), false);
    assert.equal(rejected.body.error.session.revision, 8);
  }
  assert.deepEqual((await call('GET', base)).body.data, { sessionId: data.sessionId, revision: 8, state: data.state });
});

test('HTTP incorrect accusations and independent sessions do not reveal the solution or share caches', async (t) => {
  let calls = 0;
  const { call, create } = await setup(t, { investigationFactory: () => createInvestigation({ phraser: {
    async phrase({ approvedContent }) { calls += 1; return `quietly: ${approvedContent}`; },
  } }) });
  const a = await create();
  const b = await create();
  for (const data of [a, b]) assert.equal((await call('POST', pathFor(data.sessionId, 'questions'), question())).body.data.result.cached, false);
  assert.equal(calls, 2);
  const ended = await call('POST', pathFor(a.sessionId, 'accusations'), { suspectId: 'alice-mercer', confirmed: true, expectedRevision: 1 });
  assert.equal(ended.body.data.result.result, 'incorrect');
  assert.equal(JSON.stringify(ended.body.data.state.lifecycle).includes('Clara'), false);
  assert.equal((await call('GET', pathFor(b.sessionId))).body.data.state.lifecycle.status, 'active');
  assert.equal((await call('POST', pathFor(b.sessionId, 'questions'), question(1))).body.data.result.cached, true);
  assert.equal(calls, 2);
});

test('HTTP validation rejects malformed routes, bodies, identifiers and private command injection without mutation', async (t) => {
  let calls = 0;
  const { call, create } = await setup(t, { investigationFactory: () => createInvestigation({ phraser: {
    async phrase() { calls += 1; return 'unused'; },
  } }) });
  const { sessionId } = await create();
  const base = pathFor(sessionId);
  const cases = [
    ['GET', '/api/investigations', undefined, 405, 'method_not_allowed'],
    ['GET', '/api/private', undefined, 404, 'route_not_found'],
    ['GET', `${base}/data`, undefined, 404, 'route_not_found'],
    ['GET', `${base}?raw=true`, undefined, 400, 'invalid_route'],
    ['GET', '/api/investigations/%ZZ', undefined, 400, 'invalid_route'],
    ['GET', '/api/investigations/not-a-session', undefined, 400, 'invalid_session_id'],
    ['GET', pathFor('f'.repeat(64)), undefined, 404, 'session_not_found'],
    ['GET', base, {}, 400, 'invalid_request'],
    ['POST', `${base}/questions`, null, 400, 'invalid_request'],
    ['POST', `${base}/questions`, [], 400, 'invalid_request'],
    ['POST', `${base}/questions`, {}, 400, 'invalid_request'],
    ['POST', `${base}/questions`, { ...question(), model: 'private' }, 400, 'invalid_request'],
    ['POST', `${base}/questions`, { ...question(), sessionId }, 400, 'invalid_request'],
    ['POST', `${base}/questions`, { ...question(), method: 'findSuspect' }, 400, 'invalid_request'],
    ['POST', `${base}/questions`, { ...question(), question: ' ' }, 400, 'invalid_request'],
    ['POST', `${base}/questions`, { ...question(), question: 'x'.repeat(1001) }, 400, 'invalid_request'],
    ['POST', `${base}/questions`, { ...question(), question: {} }, 400, 'invalid_request'],
    ['POST', `${base}/questions`, { ...question(), suspectId: '../clara' }, 400, 'invalid_id'],
    ['POST', `${base}/questions`, { ...question(), suspectId: 'x'.repeat(65) }, 400, 'invalid_id'],
    ['POST', `${base}/questions`, { ...question(), suspectId: 'unknown' }, 404, 'suspect_not_found'],
    ['POST', `${base}/questions`, { ...question(), expectedRevision: -1 }, 400, 'invalid_request'],
    ['POST', `${base}/questions`, { ...question(), expectedRevision: '0' }, 400, 'invalid_request'],
    ['POST', `${base}/questions`, { ...question(), expectedRevision: Number.MAX_SAFE_INTEGER + 1 }, 400, 'invalid_request'],
    ['POST', `${base}/accusations`, { suspectId: 'clara-voss', confirmed: 'yes', expectedRevision: 0 }, 400, 'invalid_request'],
    ['POST', `${base}/accusations`, { suspectId: 'unknown', confirmed: false, expectedRevision: 0 }, 404, 'suspect_not_found'],
    ['POST', `${base}/evidence/inspect`, { evidenceId: 'unknown', expectedRevision: 0 }, 404, 'evidence_not_found'],
    ['POST', '/api/investigations', { case: 'another' }, 400, 'invalid_request'],
  ];
  for (const [method, path, body, status, code] of cases) {
    const response = await call(method, path, body);
    errorIs(response, status, code);
    assert.equal(response.text.includes(sessionId), false);
    if (status === 405) assert.equal(response.headers.allow, 'POST');
  }
  assert.equal(calls, 0);
  assert.equal((await call('GET', base)).body.data.revision, 0);
  for (const raw of ['{', '', '{"__proto__":{}}', '{"constructor":{}}']) {
    errorIs(await call('POST', '/api/investigations', undefined, { raw }), 400, raw === '{' || raw === '' ? 'invalid_json' : 'invalid_request');
  }
});

test('HTTP enforces UTF-8, media/encoding and 16 KiB streamed limits including chunked and declared bodies', async (t) => {
  const { call } = await setup(t);
  const path = '/api/investigations';
  errorIs(await call('POST', path, {}, { headers: { 'Content-Type': 'text/plain' } }), 415, 'unsupported_media_type');
  errorIs(await call('POST', path, {}, { headers: { 'Content-Encoding': 'gzip' } }), 415, 'unsupported_encoding');
  errorIs(await call('POST', path, undefined, { raw: Buffer.from([0xff]) }), 400, 'invalid_json');
  errorIs(await call('POST', path, undefined, { raw: ' '.repeat(16385), headers: { 'Content-Length': '16385' } }), 413, 'request_too_large');
  errorIs(await call('POST', path, undefined, { raw: '', chunks: [' '.repeat(8192), ' '.repeat(8193)] }), 413, 'request_too_large');
  const exact = await call('POST', path, undefined, { raw: `${' '.repeat(16382)}{}` });
  assert.equal(exact.status, 201);
});

test('HTTP loopback Host/Origin boundary permits Vite proxy origins and blocks foreign/null/cross-site requests', async (t) => {
  const { call, server } = await setup(t);
  assert.equal(server.headersTimeout, 5000);
  assert.equal(server.requestTimeout, 10000);
  assert.equal(server.keepAliveTimeout, 5000);
  for (const origin of ['http://localhost:5173', 'http://127.0.0.1:5173']) {
    const response = await call('POST', '/api/investigations', {}, { headers: { Origin: origin } });
    assert.equal(response.status, 201);
    assert.equal(response.headers['access-control-allow-origin'], undefined);
  }
  for (const origin of ['null', 'https://evil.example', 'http://localhost:5173.evil.example']) {
    errorIs(await call('POST', '/api/investigations', {}, { headers: { Origin: origin } }), 403, 'forbidden_origin');
  }
  errorIs(await call('POST', '/api/investigations', {}, { headers: { 'Sec-Fetch-Site': 'cross-site' } }), 403, 'forbidden_origin');
  errorIs(await call('POST', '/api/investigations', {}, { headers: { Host: 'evil.example' } }), 403, 'forbidden_host');
});

test('HTTP session expiry and default 100-session capacity produce safe structured errors', async (t) => {
  let now = 0;
  const { call, create } = await setup(t, { clock: () => now });
  const first = await create();
  for (let i = 1; i < 100; i += 1) await create();
  errorIs(await call('POST', '/api/investigations', {}), 503, 'session_capacity');
  now = 30 * 60 * 1000;
  const expired = await call('GET', pathFor(first.sessionId));
  errorIs(expired, 404, 'session_not_found');
  assert.equal(expired.text.includes(first.sessionId), false);
  assert.deepEqual(expired.body, (await call('GET', pathFor('a'.repeat(64)))).body);
  assert.equal((await call('POST', '/api/investigations', {})).status, 201);
});

test('HTTP same-session overlap, reads while busy, replay and independent-session progress', async (t) => {
  const started = deferred();
  const gate = deferred();
  let calls = 0;
  const { call, create } = await setup(t, { investigationFactory: () => createInvestigation({ phraser: {
    async phrase({ approvedContent }) { calls += 1; started.resolve(); await gate.promise; return approvedContent; },
  } }) });
  const a = await create();
  const b = await create();
  const pending = call('POST', pathFor(a.sessionId, 'questions'), question());
  await started.promise;
  errorIs(await call('POST', pathFor(a.sessionId, 'accusations'), { suspectId: 'clara-voss', confirmed: true, expectedRevision: 0 }), 409, 'session_busy');
  assert.equal((await call('GET', pathFor(a.sessionId))).body.data.revision, 0);
  assert.equal((await call('POST', pathFor(b.sessionId, 'evidence/inspect'), { evidenceId: 'muddy-footprints', expectedRevision: 0 })).status, 200);
  gate.resolve();
  assert.equal((await pending).body.data.revision, 1);
  const stale = await call('POST', pathFor(a.sessionId, 'questions'), question());
  errorIs(stale, 409, 'stale_revision');
  assert.equal(stale.body.error.session.revision, 1);
  assert.equal(calls, 1);
});

test('HTTP caps concurrent question operations at four and releases slots after fallback', async (t) => {
  const started = deferred();
  const gate = deferred();
  let calls = 0;
  const { call, create } = await setup(t, { investigationFactory: () => createInvestigation({ phraser: {
    async phrase() { calls += 1; if (calls === 4) started.resolve(); await gate.promise; throw new Error('provider failed'); },
  } }) });
  const sessions = await Promise.all(Array.from({ length: 5 }, create));
  const pending = sessions.slice(0, 4).map(({ sessionId }) => call('POST', pathFor(sessionId, 'questions'), question()));
  await started.promise;
  errorIs(await call('POST', pathFor(sessions[4].sessionId, 'questions'), question()), 429, 'question_capacity');
  gate.resolve();
  for (const response of await Promise.all(pending)) assert.equal(response.status, 200);
  assert.equal((await call('POST', pathFor(sessions[4].sessionId, 'questions'), question())).status, 200);
});

for (const settle of ['success', 'failure']) {
  test(`HTTP discards late dialogue ${settle} after an out-of-band ending without revision changes`, async (t) => {
    const started = deferred();
    const gate = deferred();
    let game;
    const { call, create } = await setup(t, { investigationFactory: () => {
      game = createInvestigation({ phraser: { phrase() { started.resolve(); return gate.promise; } } });
      return game;
    } });
    const { sessionId } = await create();
    const pending = call('POST', pathFor(sessionId, 'questions'), question());
    await started.promise;
    const final = game.resolveAccusation('alice-mercer', true);
    if (settle === 'success') gate.resolve('FORBIDDEN_LATE_RESPONSE');
    else gate.reject(new Error('FORBIDDEN_PROVIDER_ERROR'));
    const response = await pending;
    errorIs(response, 409, 'investigation_ended');
    assert.equal(response.text.includes('FORBIDDEN'), false);
    assert.equal(response.text.includes(sessionId), false);
    const state = (await call('GET', pathFor(sessionId))).body.data;
    assert.equal(state.revision, 0);
    assert.deepEqual(state.state.lifecycle.finalResult, final);
  });
}

test('HTTP concurrent accusations resolve only once and later attempts cannot overwrite the result', async (t) => {
  const { create, call } = await setup(t);
  const { sessionId } = await create();
  const responses = await Promise.all(['clara-voss', 'alice-mercer'].map((suspectId) => call('POST', pathFor(sessionId, 'accusations'), {
    suspectId, confirmed: true, expectedRevision: 0,
  })));
  assert.equal(responses.filter(({ status }) => status === 200).length, 1);
  errorIs(responses.find(({ status }) => status !== 200), 409, 'investigation_ended');
  const success = responses.find(({ status }) => status === 200).body.data;
  assert.equal(success.revision, 1);
  assert.deepEqual((await call('GET', pathFor(sessionId))).body.data.state.lifecycle.finalResult, success.result);
});

test('HTTP public responses exclude private fields and generic errors do not expose exceptions or bearer IDs', async (t) => {
  const secret = 'FORBIDDEN_PRIVATE_CANARY';
  const data = structuredClone(caseData);
  data.intendedSolution = [secret];
  data.privateConfig = secret;
  data.victim.secret = secret;
  for (const npc of data.suspects) { npc.privateFacts = [secret]; npc.internalPrompt = secret; }
  for (const clue of data.evidence) clue.privateOwner = secret;
  let failRead = false;
  const { call, create } = await setup(t, { investigationFactory: () => {
    const game = createInvestigation({ data, phraser: { async phrase() { throw new Error(secret); } } });
    const read = game.getPublicView;
    game.getPublicView = () => { if (failRead) throw new Error(secret); return read(); };
    return game;
  } });
  const initial = await create();
  assert.equal(JSON.stringify(initial).includes(secret), false);
  assert.equal(JSON.stringify(initial).includes('murdererId'), false);
  const answer = await call('POST', pathFor(initial.sessionId, 'questions'), { ...question(), question: `Where were you? ${secret}` });
  assert.equal(answer.status, 200);
  assert.equal(answer.text.includes(secret), false);
  const evidence = await call('POST', pathFor(initial.sessionId, 'evidence/inspect'), { evidenceId: 'muddy-footprints', expectedRevision: 1 });
  assert.deepEqual(Object.keys(evidence.body.data.result).sort(), ['description', 'id', 'name']);
  assert.equal(evidence.text.includes(secret), false);
  failRead = true;
  const error = await call('GET', pathFor(initial.sessionId));
  errorIs(error, 500, 'internal_error');
  assert.equal(error.text.includes(secret), false);
  assert.equal(error.text.includes(initial.sessionId), false);
  assert.equal(error.text.includes('stack'), false);
});

test('server factory imports stay inert and invalid launch configuration is rejected safely', async () => {
  const server = createInvestigationServer();
  assert.equal(server.listening, false);
  await assert.rejects(startApi({ port: 'not-a-port' }));
});

test('HTTP parser errors and oversized headers are handled without echoing bytes', async (t) => {
  const { port } = await setup(t);
  for (const request of ['BAD REQUEST\r\n\r\n', `GET / HTTP/1.1\r\nHost: localhost\r\nX-Secret: ${'x'.repeat(9000)}\r\n\r\n`]) {
    const socket = connect(port, '127.0.0.1');
    const chunks = [];
    socket.on('data', (chunk) => chunks.push(chunk));
    const closed = once(socket, 'close');
    await once(socket, 'connect');
    socket.write(request);
    await closed;
    const wire = Buffer.concat(chunks).toString();
    assert.match(wire, /HTTP\/1.1 400/);
    assert.equal(wire.includes('X-Secret'), false);
    assert.equal(JSON.parse(wire.split('\r\n\r\n')[1]).error.code, 'invalid_request');
  }
});

test('HTTP disconnect after admission retains the reservation and commits once before retry', async (t) => {
  const started = deferred();
  const gate = deferred();
  const settled = deferred();
  const { create, call, port, store } = await setup(t, { investigationFactory: () => createInvestigation({ phraser: {
    phrase() { started.resolve(); return gate.promise; },
  } }) });
  const run = store.run;
  store.run = async (...args) => {
    try { return await run(...args); }
    finally { settled.resolve(); }
  };
  const { sessionId } = await create();
  const req = httpRequest({ host: '127.0.0.1', port, path: pathFor(sessionId, 'questions'), method: 'POST',
    headers: { 'Content-Type': 'application/json' }, agent: false });
  req.on('error', () => {});
  req.end(JSON.stringify(question()));
  await started.promise;
  const closed = new Promise((resolve) => req.once('close', resolve));
  req.destroy();
  await closed;
  errorIs(await call('POST', pathFor(sessionId, 'questions'), question()), 409, 'session_busy');
  gate.resolve('An approved late delivery to a disconnected client.');
  await settled.promise;
  const state = await call('GET', pathFor(sessionId));
  assert.equal(state.body.data.revision, 1);
  errorIs(await call('POST', pathFor(sessionId, 'questions'), question()), 409, 'stale_revision');
  assert.equal((await call('POST', pathFor(sessionId, 'questions'), question(1))).body.data.result.cached, true);
});

test('HTTP incomplete aborted input never creates a session', async (t) => {
  let creations = 0;
  const { port, create } = await setup(t, { maxSessions: 1, investigationFactory: () => {
    creations += 1;
    return createInvestigation();
  } });
  const socket = connect(port, '127.0.0.1');
  socket.on('error', () => {});
  await once(socket, 'connect');
  await new Promise((resolve) => socket.write(`POST /api/investigations HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\nContent-Type: application/json\r\nContent-Length: 20\r\n\r\n{`, resolve));
  const closed = new Promise((resolve) => socket.once('close', resolve));
  socket.destroy();
  await closed;
  await create();
  assert.equal(creations, 1);
});

test('HTTP unexpected command failure releases the session reservation without exposing details', async (t) => {
  let broken = true;
  const { call, create } = await setup(t, { investigationFactory: () => {
    const game = createInvestigation();
    const ask = game.askSuspect;
    game.askSuspect = (...args) => { if (broken) throw new Error('FORBIDDEN_COMMAND_FAILURE'); return ask(...args); };
    return game;
  } });
  const { sessionId } = await create();
  const failed = await call('POST', pathFor(sessionId, 'questions'), question());
  errorIs(failed, 500, 'internal_error');
  assert.equal(failed.text.includes('FORBIDDEN_COMMAND_FAILURE'), false);
  assert.equal(failed.body.error.session.revision, 0);
  broken = false;
  assert.equal((await call('POST', pathFor(sessionId, 'questions'), question())).status, 200);
});

test('HTTP discards a response whose reserved revision was superseded before completion', async (t) => {
  const started = deferred();
  const gate = deferred();
  const { call, create, store } = await setup(t, { investigationFactory: () => createInvestigation({ phraser: {
    phrase() { started.resolve(); return gate.promise; },
  } }) });
  const { sessionId } = await create();
  const pending = call('POST', pathFor(sessionId, 'questions'), question());
  await started.promise;
  store.get(sessionId).revision = 7; // Simulate an out-of-band replacement of committed state.
  gate.resolve('FORBIDDEN_SUPERSEDED_RESPONSE');
  const response = await pending;
  errorIs(response, 409, 'stale_response');
  assert.equal(response.text.includes('FORBIDDEN_SUPERSEDED_RESPONSE'), false);
  assert.equal(response.body.error.session.revision, 7);
  assert.equal((await call('GET', pathFor(sessionId))).body.data.revision, 7);
  assert.equal((await call('POST', pathFor(sessionId, 'questions'), question(7))).status, 200);
});

test('HTTP slow incomplete headers time out without admitting a session or exposing input', { timeout: 12000 }, async (t) => {
  let creations = 0;
  const { port, create } = await setup(t, { investigationFactory: () => { creations += 1; return createInvestigation(); } });
  const socket = connect(port, '127.0.0.1');
  t.after(() => socket.destroy());
  const chunks = [];
  socket.on('data', (chunk) => chunks.push(chunk));
  socket.on('error', () => {});
  const closed = new Promise((resolve) => socket.once('close', resolve));
  await once(socket, 'connect');
  socket.write(`POST /api/investigations HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\nX-Private: FORBIDDEN_PARTIAL_HEADER`);
  await closed;
  const wire = Buffer.concat(chunks).toString();
  assert.equal(wire.includes('FORBIDDEN_PARTIAL_HEADER'), false);
  assert.match(wire, /HTTP\/1.1 400/);
  assert.equal(creations, 0);
  await create();
  assert.equal(creations, 1);
});

test('production launch without model configuration serves fallback dialogue on loopback', async (t) => {
  const probe = createInvestigationServer();
  probe.listen(0, '127.0.0.1');
  await once(probe, 'listening');
  const port = probe.address().port;
  await new Promise((resolve) => probe.close(resolve));
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.OPENAI_MODEL;
  delete process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_MODEL;
  let server;
  try { server = await startApi({ port }); }
  finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.OPENAI_MODEL; else process.env.OPENAI_MODEL = previousModel;
  }
  t.after(() => new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); }));
  assert.equal(server.address().address, '127.0.0.1');
  const created = await fetch(`http://127.0.0.1:${port}/api/investigations`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
  }).then((res) => res.json());
  const answer = await fetch(`http://127.0.0.1:${port}${pathFor(created.data.sessionId, 'questions')}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(question()),
  }).then((res) => res.json());
  assert.equal(answer.data.result.text, 'I was repairing the greenhouse window when Victor died.');
});
