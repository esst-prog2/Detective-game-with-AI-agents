const messages = {
  dialogue_option_unavailable: 'That conversation option is no longer available. Refresh the investigation to see current options.',
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
const bounded = (value, max, min = 1) => { string(value); if ([...value].length < min || [...value].length > max) throw new Error('protocol'); return value; };
const slug = (value) => { if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(bounded(value, 64))) throw new Error('protocol'); return value; };
const enumeration = (value, allowed) => { if (!allowed.includes(value)) throw new Error('protocol'); return value; };
const demeanor = (value) => enumeration(value, ['neutral', 'receptive', 'irritated', 'uneasy']);
const topic = (value) => enumeration(value, ['alibi', 'relationship_with_victim', 'motive', 'sighting', 'evidence', 'crime_details', 'social']);
const turnId = (value) => { if (!Number.isSafeInteger(value) || value < 1) throw new Error('protocol'); return value; };
const performance = (value) => ({ narration: value.narration === null ? null : bounded(value.narration, 240), dialogue: bounded(value.dialogue, 1200) });
function dialogueView(value, suspects, evidence, locationId, ended) {
  if (!Array.isArray(value?.inspectedEvidenceIds) || !Array.isArray(value.conversations)) throw new Error('protocol');
  const inspectedEvidenceIds = value.inspectedEvidenceIds.map(slug);
  if (new Set(inspectedEvidenceIds).size !== inspectedEvidenceIds.length || inspectedEvidenceIds.some((id) => !evidence.some((item) => item.id === id))) throw new Error('protocol');
  const conversations = value.conversations.map((conversation) => {
    const suspectId = slug(conversation.suspectId);
    const suspect = suspects.find((item) => item.id === suspectId);
    if (!suspect || !Array.isArray(conversation.recentTurns) || conversation.recentTurns.length > 8 || !Array.isArray(conversation.options) || conversation.options.length > 6) throw new Error('protocol');
    const recentTurns = conversation.recentTurns.map((turn) => ({ turnId: turnId(turn.turnId), question: bounded(turn.question, 1000), kind: enumeration(turn.kind, ['answer']), topic: topic(turn.topic), ...performance(turn) }));
    const options = conversation.options.map((option) => ({ id: slug(option.id), label: bounded(option.label, 1000), kind: enumeration(option.kind, ['topic', 'clarify', 'revisit', 'evidence', 'contradiction', 'social']) }));
    if (new Set(recentTurns.map((turn) => turn.turnId)).size !== recentTurns.length || new Set(options.map((option) => option.id)).size !== options.length || ((ended || suspect.locationId !== locationId) && options.length)) throw new Error('protocol');
    return { suspectId, demeanor: demeanor(conversation.demeanor), recentTurns, options };
  });
  if (new Set(conversations.map((item) => item.suspectId)).size !== conversations.length) throw new Error('protocol');
  return { inspectedEvidenceIds, conversations };
}
const identity = (value) => ({ id: slug(value.id), name: string(value.name) });
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
  const evidence = value.evidence.map(located);
  if (new Set(suspects.map((item) => item.id)).size !== suspects.length || new Set(evidence.map((item) => item.id)).size !== evidence.length) throw new Error('protocol');
  if (suspects.some((suspect) => suspect.dossier.relationships.some((edge) => edge.targetSuspectId === suspect.id || !suspects.some((target) => target.id === edge.targetSuspectId)))) throw new Error('protocol');
  return {
    title: string(value.title), victim: { name: string(value.victim.name), description: string(value.victim.description) },
    locations: value.locations.map(string), rooms, currentLocationId: string(value.currentLocationId), suspects, evidence,
    dialogue: dialogueView(value.dialogue, suspects, evidence, value.currentLocationId, value.lifecycle.status === 'ended'),
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
    const result = { kind: value.kind, text: bounded(value.text, 1200), ...performance(value) };
    if (result.text !== result.dialogue) throw new Error('protocol');
    if (value.kind === 'answer') {
      if (typeof value.cached !== 'boolean') throw new Error('protocol');
      Object.assign(result, { topic: topic(value.topic), cached: value.cached, turnId: turnId(value.turnId), demeanor: demeanor(value.demeanor) });
    } else { if (value.topic !== 'unsupported' || value.narration !== null) throw new Error('protocol'); result.topic = 'unsupported'; }
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
  let acceptedDialogue = null;
  const controllers = new Set();

  async function request(command, input = {}) {
    if (command === 'questions') {
      try {
        slug(input.suspectId);
        if (Object.hasOwn(input, 'question') === Object.hasOwn(input, 'choiceId')) return false;
        if (Object.hasOwn(input, 'choiceId')) slug(input.choiceId); else bounded(input.question.trim(), 1000);
      } catch { return false; }
    }
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
    emit({ type: 'BEGIN', id, generation, mutation, label: command === 'create' ? 'Opening the caseâ€¦' : command === 'read' ? 'Refreshing the investigationâ€¦' : command === 'travel' ? 'Travelling through the manorâ€¦' : command === 'questions' ? 'Questioningâ€¦' : command === 'accusations' ? 'Recording your decisionâ€¦' : 'Examining the evidenceâ€¦' });
    try {
      let body;
      if (command === 'create') body = {};
      if (command === 'questions') body = { suspectId: input.suspectId, ...(Object.hasOwn(input, 'choiceId') ? { choiceId: input.choiceId } : { question: input.question.trim() }), expectedRevision: revision };
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
      if (command === 'questions' && state.lifecycle.status === 'ended' && acceptedDialogue) {
        state.dialogue = { inspectedEvidenceIds: [...acceptedDialogue.inspectedEvidenceIds], conversations: acceptedDialogue.conversations.map((conversation) => ({ ...conversation, options: [] })) };
      }
      if (result?.kind === 'answer') {
        const received = state.dialogue.conversations.find((item) => item.suspectId === input.suspectId)?.recentTurns.find((turn) => turn.turnId === result.turnId);
        if (!received || received.dialogue !== result.dialogue || received.narration !== result.narration || received.topic !== result.topic) throw new Error('protocol');
      }
      if (command === 'create') { capability = data.sessionId; ended = false; }
      revision = data.revision;
      if (command === 'create' || currentRoom !== state.currentLocationId) roomGeneration += 1;
      currentRoom = state.currentLocationId;
      ended = ended || state.lifecycle.status === 'ended';
      acceptedDialogue = state.dialogue;
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
    choose: (suspectId, choiceId) => request('questions', { suspectId, choiceId }),
    inspect: (evidenceId) => request('evidence/inspect', { evidenceId }),
    travel: (locationId) => request('travel', { locationId }),
    accuse: (suspectId, confirmed) => request('accusations', { suspectId, confirmed }),
    dispose() { generation += 1; gate = null; for (const controller of controllers) controller.abort(); controllers.clear(); },
  };
}
