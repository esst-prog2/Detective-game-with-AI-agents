const messages = {
  suspect_not_present: 'That person is in another room. Refresh the investigation before travelling there.',
  evidence_not_here: 'That evidence is in another room. Refresh the investigation before travelling there.',
  location_not_found: 'That room is not available. Refresh the investigation.',
  session_busy: 'Another action is still finishing. Refresh the investigation, then try again.',
  stale_revision: 'Your investigation has changed. Refresh before trying again.',
  stale_response: 'That reply is no longer current. Refresh the investigation.',
  investigation_ended: 'This investigation has ended. Refresh to read the final result.',
  question_capacity: 'The interview service is busy. Please try again shortly.',
  session_capacity: 'The manor is busy. Please try starting again shortly.',
  invalid_request: 'Check your question or selection and try again.',
  suspect_not_found: 'That contact is no longer available. Refresh the investigation.',
  evidence_not_found: 'That clue is no longer available. Refresh the investigation.',
};
const string = (value) => { if (typeof value !== 'string') throw new Error('protocol'); return value; };
const identity = (value) => ({ id: string(value.id), name: string(value.name) });
const dossier = (value) => ({ role: string(value.role), relationshipToVictim: string(value.relationshipToVictim), background: string(value.background),
  relationships: value.relationships.map((edge) => { if (!['family', 'social'].includes(edge.kind)) throw new Error('protocol'); return { targetSuspectId: string(edge.targetSuspectId), kind: edge.kind, label: string(edge.label) }; }) });
export function publicState(value) {
  if (!value || !['active', 'ended'].includes(value.lifecycle?.status)) throw new Error('protocol');
  const final = value.lifecycle.finalResult;
  if (value.lifecycle.status === 'ended' && (!final || final.ended !== true || !['correct', 'incorrect'].includes(final.result))) throw new Error('protocol');
  if (value.lifecycle.status === 'active' && final !== null) throw new Error('protocol');
  const rooms = value.rooms.map(identity);
  if (!rooms.some((room) => room.id === value.currentLocationId) || new Set(rooms.map((room) => room.id)).size !== rooms.length) throw new Error('protocol');
  const located = (entity) => { if (!rooms.some((room) => room.id === entity.locationId)) throw new Error('protocol'); return { ...identity(entity), locationId: entity.locationId }; };
  const suspects = value.suspects.map((suspect) => ({ ...located(suspect), dossier: dossier(suspect.dossier) }));
  if (suspects.some((suspect) => suspect.dossier.relationships.some((edge) => edge.targetSuspectId === suspect.id || !suspects.some((target) => target.id === edge.targetSuspectId)))) throw new Error('protocol');
  return {
    title: string(value.title), victim: { name: string(value.victim.name), description: string(value.victim.description) },
    locations: value.locations.map(string), rooms, currentLocationId: string(value.currentLocationId), suspects, evidence: value.evidence.map(located),
    lifecycle: { status: value.lifecycle.status, finalResult: final ? { ended: true, result: final.result, text: string(final.text) } : null },
  };
}

function resultFor(command, value, input) {
  if (command === 'travel') {
    if (value?.kind !== 'travel' || value.locationId !== input.locationId || typeof value.changed !== 'boolean') throw new Error('protocol');
    return { kind: 'travel', locationId: value.locationId, changed: value.changed };
  }
  if (command === 'questions') {
    if (!['answer', 'unsupported'].includes(value?.kind)) throw new Error('protocol');
    const result = { kind: value.kind, text: string(value.text) };
    if (typeof value.topic === 'string') result.topic = value.topic;
    if (typeof value.cached === 'boolean') result.cached = value.cached;
    return result;
  }
  if (command === 'evidence/inspect') {
    if (value?.id !== input.evidenceId) throw new Error('protocol');
    return { ...identity(value), description: string(value.description) };
  }
  if (command === 'accusations') {
    if (!['cancelled', 'correct', 'incorrect'].includes(value?.result) || typeof value.ended !== 'boolean') throw new Error('protocol');
    return { ended: value.ended, result: value.result, text: string(value.text) };
  }
}

export function createInvestigationClient({ emit, fetchImpl = globalThis.fetch, timeoutMs = 15000 } = {}) {
  let capability = null;
  let generation = 0;
  let revision = 0;
  let ended = false;
  let gate = null;
  let counter = 0;
  let currentRoom = null;
  let roomGeneration = 0;
  const controllers = new Set();

  async function request(command, input = {}) {
    const mutation = command !== 'read';
    if (mutation && gate !== null) return false;
    if (command !== 'create' && !capability) return false;
    const id = ++counter;
    if (mutation) gate = id;
    if (command === 'create') generation += 1;
    const currentGeneration = generation;
    const currentCapability = capability;
    const requestedRoom = currentRoom;
    const requestedRoomGeneration = roomGeneration;
    const controller = new AbortController();
    controllers.add(controller);
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    emit({ type: 'BEGIN', id, generation, label: command === 'create' ? 'Opening the case…' : command === 'read' ? 'Refreshing the investigation…' : command === 'travel' ? 'Travelling through the manor…' : command === 'questions' ? 'Questioning…' : command === 'accusations' ? 'Recording your decision…' : 'Examining the evidence…' });
    try {
      let body;
      if (command === 'create') body = {};
      if (command === 'questions') body = { suspectId: input.suspectId, question: input.question.trim(), expectedRevision: revision };
      if (command === 'evidence/inspect') body = { evidenceId: input.evidenceId, expectedRevision: revision };
      if (command === 'accusations') body = { suspectId: input.suspectId, confirmed: input.confirmed, expectedRevision: revision };
      if (command === 'travel') body = { locationId: input.locationId, expectedRevision: revision };
      const path = command === 'create' ? '/api/investigations' : `/api/investigations/${currentCapability}${command === 'read' ? '' : `/${command}`}`;
      const response = await fetchImpl(path, { method: command === 'read' ? 'GET' : 'POST',
        headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined, signal: controller.signal, cache: 'no-store' });
      const envelope = await response.json();
      if (currentGeneration !== generation || (command !== 'create' && currentCapability !== capability)) return false;
      if (!response.ok || envelope.ok !== true) {
        const code = typeof envelope.error?.code === 'string' ? envelope.error.code : 'protocol';
        if (code === 'session_not_found') {
          capability = null;
          emit({ type: 'EXPIRED', generation });
          generation += 1;
        } else emit({ type: 'FAIL', generation, code, message: messages[code] ?? 'The service could not complete that action. Check the local API connection and refresh before retrying.',
          uncertain: command !== 'create' && (response.status >= 500 || response.status === 409) });
        return false;
      }
      const data = envelope.data;
      if (envelope.error !== null || !/^[a-f0-9]{64}$/.test(data?.sessionId) || !Number.isSafeInteger(data.revision) || data.revision < 0) throw new Error('protocol');
      if (command !== 'create' && data.sessionId !== capability) throw new Error('protocol');
      const state = publicState(data.state);
      if (command !== 'create' && (data.revision < revision || (ended && state.lifecycle.status !== 'ended'))) return false;
      if (command === 'questions' && state.lifecycle.status !== 'ended' && (requestedRoomGeneration !== roomGeneration || requestedRoom !== state.currentLocationId)) {
        emit({ type: 'FAIL', generation, code: 'stale_response', uncertain: true, message: messages.stale_response }); return false;
      }
      // An ended snapshot may reconcile a read, but a late reply is never testimony.
      const result = state.lifecycle.status === 'ended' && ['questions', 'evidence/inspect'].includes(command)
        ? undefined : resultFor(command, data.result, input);
      if (command === 'create') { capability = data.sessionId; ended = false; }
      revision = data.revision;
      if (command === 'create' || currentRoom !== state.currentLocationId) roomGeneration += 1;
      currentRoom = state.currentLocationId;
      ended = ended || state.lifecycle.status === 'ended';
      emit({ type: command === 'create' ? 'SESSION' : 'DATA', id, generation, state, revision, result, command, input: body ?? input });
      return true;
    } catch {
      if (currentGeneration === generation) emit({ type: 'FAIL', generation, code: 'connection', uncertain: command !== 'create',
        message: 'The reply could not be received. Check that the local API is running. Refresh before deliberately retrying; your action may already have completed.' });
      return false;
    } finally {
      clearTimeout(timer);
      controllers.delete(controller);
      if (gate === id) gate = null;
      emit({ type: 'SETTLED', generation: currentGeneration, id });
    }
  }
  return {
    start: () => request('create'), refresh: () => request('read'),
    ask: (suspectId, question) => request('questions', { suspectId, question }),
    inspect: (evidenceId) => request('evidence/inspect', { evidenceId }),
    travel: (locationId) => request('travel', { locationId }),
    accuse: (suspectId, confirmed) => request('accusations', { suspectId, confirmed }),
    dispose() { generation += 1; gate = null; for (const controller of controllers) controller.abort(); controllers.clear(); },
  };
}
