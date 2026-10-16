import { randomBytes } from 'node:crypto';
import { createInvestigation } from './game.js';

// Error messages are fixed at the HTTP boundary; never return exception details.
export class ApiError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

export function createSessionStore({
  investigationFactory = () => createInvestigation(),
  clock = Date.now,
  generateId = () => randomBytes(32).toString('hex'),
  maxSessions = 100,
  idleMs = 30 * 60 * 1000,
  maxQuestions = 4,
} = {}) {
  const entries = new Map();
  let questions = 0;

  function prune() {
    const now = clock();
    for (const [id, entry] of entries) {
      if (!entry.reservation && now - entry.lastAccess >= idleMs) entries.delete(id);
    }
  }

  function create() {
    prune();
    if (entries.size >= maxSessions) throw new ApiError('session_capacity');
    let id;
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const candidate = generateId();
      if (!/^[a-f0-9]{64}$/.test(candidate)) throw new Error('Invalid generated identifier');
      if (!entries.has(candidate)) { id = candidate; break; }
    }
    if (!id) throw new ApiError('session_capacity');
    const entry = { id, game: investigationFactory(), revision: 0, lastAccess: clock(), reservation: null };
    entries.set(id, entry);
    return entry;
  }

  function get(id) {
    prune();
    const entry = entries.get(id);
    if (!entry) throw new ApiError('session_not_found');
    return entry;
  }

  function touch(entry) { entry.lastAccess = clock(); }

  async function run(entry, expectedRevision, isQuestion, operation, allowsEnding = false) {
    if (entry.revision !== expectedRevision) throw new ApiError('stale_revision');
    if (entry.reservation) throw new ApiError('session_busy');
    if (isQuestion && questions >= maxQuestions) throw new ApiError('question_capacity');
    const reservation = Symbol('command');
    const revision = entry.revision;
    entry.reservation = reservation;
    touch(entry);
    if (isQuestion) questions += 1;
    try {
      const result = await operation();
      if (result?.code === 'investigation_ended'
        || (entry.game.getLifecycle().status === 'ended' && !(allowsEnding && result?.ended === true))) {
        throw new ApiError('investigation_ended');
      }
      if (entries.get(entry.id) !== entry || entry.reservation !== reservation || entry.revision !== revision) {
        throw new ApiError('stale_response');
      }
      // Snapshot before committing so a projection failure cannot advance the revision.
      const state = entry.game.getPublicView();
      entry.revision += 1;
      return { sessionId: entry.id, revision: entry.revision, state, result };
    } finally {
      if (entry.reservation === reservation) entry.reservation = null;
      if (isQuestion) questions -= 1;
      touch(entry);
    }
  }

  return { create, get, touch, run };
}
