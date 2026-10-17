import { createServer } from 'node:http';
import { ApiError, createSessionStore } from './investigation-sessions.js';

const errors = {
  invalid_request: [400, 'Invalid request.'], invalid_json: [400, 'Invalid JSON body.'],
  invalid_session_id: [400, 'Invalid session identifier.'], invalid_id: [400, 'Invalid entity identifier.'],
  invalid_route: [400, 'Invalid route.'], forbidden_origin: [403, 'Origin is not permitted.'],
  forbidden_host: [403, 'Host is not permitted.'], route_not_found: [404, 'Route not found.'],
  session_not_found: [404, 'Investigation not found.'], suspect_not_found: [404, 'Suspect not found.'],
  evidence_not_found: [404, 'Evidence not found.'], method_not_allowed: [405, 'Method not allowed.'],
  location_not_found: [404, 'Room not found.'], suspect_not_present: [409, 'That suspect is in another room.'],
  evidence_not_here: [409, 'That evidence is in another room.'],
  dialogue_option_unavailable: [409, 'That dialogue option is not available. Refresh state before trying again.'],
  investigation_ended: [409, 'The investigation has ended.'], stale_revision: [409, 'Refresh state before retrying.'],
  session_busy: [409, 'A command is already running.'], stale_response: [409, 'The command response is no longer current.'],
  request_too_large: [413, 'Request body is too large.'], unsupported_media_type: [415, 'Use UTF-8 application/json.'],
  unsupported_encoding: [415, 'Content encoding is not supported.'], question_capacity: [429, 'Question capacity reached.'],
  session_capacity: [503, 'Session capacity reached.'], internal_error: [500, 'Internal server error.'],
};
const headers = {
  'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
};

function send(res, status, body, extra = {}) {
  if (res.destroyed || res.writableEnded) return;
  const text = JSON.stringify(body);
  res.writeHead(status, { ...headers, ...extra, 'Content-Length': Buffer.byteLength(text) });
  res.end(text);
}

function fail(code) { throw new ApiError(code); }

function route(path) {
  if (!path || !path.startsWith('/') || /[%?#\\]|\/\.|\/\//.test(path)) fail('invalid_route');
  if (path === '/api/investigations') return { action: 'create', method: 'POST' };
  const match = /^\/api\/investigations\/([^/]+)(?:\/(questions|evidence\/inspect|accusations|travel))?$/.exec(path);
  if (!match) fail('route_not_found');
  if (!/^[a-f0-9]{64}$/.test(match[1])) fail('invalid_session_id');
  return { id: match[1], action: match[2] ?? 'read', method: match[2] ? 'POST' : 'GET' };
}

function validateBody(action, body) {
  const keys = {
    create: [], questions: ['suspectId', Object.hasOwn(body ?? {}, 'choiceId') ? 'choiceId' : 'question', 'expectedRevision'],
    'evidence/inspect': ['evidenceId', 'expectedRevision'], accusations: ['suspectId', 'confirmed', 'expectedRevision'],
    travel: ['locationId', 'expectedRevision'],
  }[action];
  if (!body || Array.isArray(body) || typeof body !== 'object'
    || Object.keys(body).length !== keys.length || keys.some((key) => !Object.hasOwn(body, key))) fail('invalid_request');
  if (action === 'create') return;
  if (!Number.isSafeInteger(body.expectedRevision) || body.expectedRevision < 0) fail('invalid_request');
  const id = action === 'travel' ? body.locationId : action === 'evidence/inspect' ? body.evidenceId : body.suspectId;
  if (typeof id !== 'string' || id.length > 64 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) fail('invalid_id');
  if (action === 'questions') {
    if (Object.hasOwn(body, 'choiceId')) {
      if (typeof body.choiceId !== 'string' || body.choiceId.length > 64 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.choiceId)) fail('invalid_request');
    } else {
      if (typeof body.question !== 'string') fail('invalid_request');
      body.question = body.question.trim();
      if ([...body.question].length < 1 || [...body.question].length > 1000) fail('invalid_request');
    }
  }
  if (action === 'accusations' && typeof body.confirmed !== 'boolean') fail('invalid_request');
}

function readBody(req, limit) {
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?\s*$/i.test(req.headers['content-type'] ?? '')) fail('unsupported_media_type');
  if (req.headers['content-encoding'] && req.headers['content-encoding'].toLowerCase() !== 'identity') fail('unsupported_encoding');
  if (Number(req.headers['content-length']) > limit) fail('request_too_large');
  return new Promise((resolve, reject) => {
    const chunks = [];
    let bytes = 0;
    function cleanup() {
      req.removeListener('data', data);
      req.removeListener('end', end);
      req.removeListener('aborted', aborted);
    }
    function aborted() { cleanup(); reject(new ApiError('invalid_request')); }
    function data(chunk) {
      bytes += chunk.length;
      if (bytes > limit) { cleanup(); req.pause(); reject(new ApiError('request_too_large')); }
      else chunks.push(chunk);
    }
    function end() {
      cleanup();
      try { resolve(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)))); }
      catch { reject(new ApiError('invalid_json')); }
    }
    req.on('data', data);
    req.once('end', end);
    req.once('aborted', aborted);
    req.once('error', aborted);
  });
}

function projectResult(action, result) {
  if (result?.kind === 'error') {
    if (Object.hasOwn(errors, result.code)) fail(result.code);
    throw new Error('Invalid command result');
  }
  if (action === 'travel') return { kind: 'travel', locationId: result.locationId, changed: result.changed };
  if (action === 'questions') {
    if (!['answer', 'unsupported'].includes(result?.kind) || typeof result.text !== 'string') throw new Error('Invalid answer');
    const value = { kind: result.kind, text: result.text };
    if (typeof result.topic === 'string') value.topic = result.topic;
    if (typeof result.cached === 'boolean') value.cached = result.cached;
    if (result.narration !== null && typeof result.narration !== 'string') throw new Error('Invalid narration');
    if (typeof result.dialogue !== 'string' || result.dialogue !== result.text) throw new Error('Invalid dialogue');
    value.narration = result.narration;
    value.dialogue = result.dialogue;
    if (result.kind === 'answer') {
      if (!Number.isSafeInteger(result.turnId) || result.turnId < 1 || !['neutral', 'receptive', 'irritated', 'uneasy'].includes(result.demeanor)) throw new Error('Invalid turn');
      value.turnId = result.turnId;
      value.demeanor = result.demeanor;
    }
    return value;
  }
  if (action === 'evidence/inspect') {
    if (!result) fail('evidence_not_found');
    return { id: result.id, name: result.name, description: result.description };
  }
  if (!['cancelled', 'correct', 'incorrect'].includes(result?.result)) throw new Error('Invalid accusation');
  return { ended: result.ended, result: result.result, text: result.text };
}

export function createInvestigationServer({ store = createSessionStore(), bodyLimit = 16384 } = {}) {
  const server = createServer({ maxHeaderSize: 8192, headersTimeout: 5000, requestTimeout: 10000,
    keepAliveTimeout: 5000, connectionsCheckingInterval: 1000 }, (req, res) => {
    void handle(req, res);
  });

  async function handle(req, res) {
    let entry = null;
    let allow;
    req.on('error', () => {}); // Transport errors must not expose details or crash the process.
    try {
      const port = server.address().port;
      const hosts = [`127.0.0.1:${port}`, `localhost:${port}`];
      if (!hosts.includes(req.headers.host)) fail('forbidden_host');
      const origins = [...hosts.map((host) => `http://${host}`), 'http://localhost:5173', 'http://127.0.0.1:5173'];
      if ((req.headers.origin !== undefined && !origins.includes(req.headers.origin))
        || req.headers['sec-fetch-site'] === 'cross-site') fail('forbidden_origin');
      const target = route(req.url);
      allow = target.method;
      if (req.method !== target.method) fail('method_not_allowed');
      let body;
      if (req.method === 'POST') {
        body = await readBody(req, bodyLimit);
        validateBody(target.action, body);
      } else if (req.headers['transfer-encoding'] || Number(req.headers['content-length'] ?? 0) !== 0) fail('invalid_request');
      if (req.aborted || res.destroyed) return; // Incomplete/disconnected input is not admitted.
      if (target.action === 'create') {
        entry = store.create();
        send(res, 201, { ok: true, data: { sessionId: entry.id, revision: 0, state: entry.game.getPublicView() }, error: null });
        return;
      }
      entry = store.get(target.id);
      if (target.action === 'read') {
        store.touch(entry);
        send(res, 200, { ok: true, data: { sessionId: entry.id, revision: entry.revision, state: entry.game.getPublicView() }, error: null });
        return;
      }
      const action = target.action;
      const invoke = () => action === 'travel' ? entry.game.travelTo(body.locationId) : action === 'questions' ? entry.game.prepareDialogue(body.suspectId,
        Object.hasOwn(body, 'choiceId') ? { choiceId: body.choiceId } : { question: body.question }, (result) => projectResult('questions', result))
        : action === 'evidence/inspect' ? entry.game.inspectPublicEvidence(body.evidenceId)
          : entry.game.resolveAccusation(body.suspectId, body.confirmed);
      if (entry.game.getLifecycle().status === 'ended') { await invoke(); fail('investigation_ended'); }
      if (action === 'travel') {
        if (!entry.game.getPublicView().rooms.some(({ id }) => id === body.locationId)) fail('location_not_found');
      } else if (action === 'evidence/inspect') {
        if (!entry.game.listEvidence().some(({ id }) => id === body.evidenceId)) fail('evidence_not_found');
      } else if (!entry.game.getPublicSuspect(body.suspectId)) fail('suspect_not_found');
      const data = await store.run(entry, body.expectedRevision, action === 'questions', async () => {
        const result = await invoke();
        if (result?.code === 'investigation_ended') return result;
        if (action === 'questions' && entry.game.isDialogueCandidate(result)) return result;
        return projectResult(action, result);
      }, action === 'accusations' && body.confirmed);
      send(res, 200, { ok: true, data, error: null });
    } catch (error) {
      const code = error instanceof ApiError && Object.hasOwn(errors, error.code) ? error.code : 'internal_error';
      const [status, message] = errors[code];
      // Session IDs are bearer credentials: never reflect them in error details.
      const session = entry ? { revision: entry.revision } : null;
      res.once('finish', () => { if (!req.complete) req.destroy(); });
      send(res, status, { ok: false, data: null, error: { code, message, session } }, {
        Connection: 'close', ...(status === 405 ? { Allow: allow } : {}),
      });
    }
  }

  server.on('clientError', (_error, socket) => {
    if (!socket.writable) return socket.destroy();
    const body = JSON.stringify({ ok: false, data: null, error: { code: 'invalid_request', message: 'Invalid request.', session: null } });
    socket.end(`HTTP/1.1 400 Bad Request\r\nConnection: close\r\nContent-Type: application/json; charset=utf-8\r\nCache-Control: no-store\r\nX-Content-Type-Options: nosniff\r\nReferrer-Policy: no-referrer\r\nContent-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`);
  });
  return server;
}
