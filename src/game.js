import { caseData, TOPICS } from './data/case.js';
import { defaultDialogueCatalog, validateDialogueCatalog, freezeCatalog } from './data/dialogue-catalog.js';
import { initialDialogueState, resolveDialogue, dialogueOptions, prepareTurn, cachePerformance, publicDialogue, guidance, dialogueDiagnostics } from './dialogue-state.js';
import { validateAuthoredPerformances, offerPerformances, applyPerformance } from './authored-performances.js';
import { validatePerformance } from './npc-performance.js';

export function validateSpatialData(data) {
  const slug = (id) => typeof id === 'string' && id.length <= 64 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
  const text = (value) => typeof value === 'string' && value.trim().length > 0;
  if (!Array.isArray(data.rooms) || !data.rooms.length || !Array.isArray(data.locations)
    || !Array.isArray(data.suspects) || !Array.isArray(data.evidence)) return ['Missing spatial data.'];
  const roomIds = data.rooms.map((room) => room.id);
  const suspectIds = data.suspects.map((suspect) => suspect.id);
  const errors = [];
  if (new Set(roomIds).size !== roomIds.length || data.rooms.some((room) => !slug(room.id) || !text(room.name))) errors.push('Invalid rooms.');
  if (!roomIds.includes(data.initialLocationId) || data.locations.length !== data.rooms.length
    || data.rooms.some((room, i) => room.name !== data.locations[i])) errors.push('Invalid room configuration.');
  const entities = [...data.suspects, ...data.evidence];
  if (new Set(entities.map((entity) => entity.id)).size !== entities.length
    || entities.some((entity) => !slug(entity.id) || !roomIds.includes(entity.locationId))) errors.push('Invalid placements.');
  for (const suspect of data.suspects) {
    const dossier = suspect.publicDossier;
    if (!dossier || !['role', 'relationshipToVictim', 'background'].every((field) => text(dossier[field]))
      || !Array.isArray(dossier.relationships) || dossier.relationships.some((edge) => !edge || !suspectIds.includes(edge.targetSuspectId)
        || edge.targetSuspectId === suspect.id || !['family', 'social'].includes(edge.kind) || !text(edge.label))) errors.push('Invalid public dossier.');
  }
  return errors;
}

export function validateCase(data = caseData) {
  const errors = validateSpatialData(data);
  if (data.suspects.length !== 3) errors.push('The case must have exactly three suspects.');
  if (!data.suspects.some((suspect) => suspect.id === data.murdererId)) errors.push('The murderer must be a suspect.');
  if (data.locations.length < 2 || data.locations.length > 3) errors.push('The case must have two or three locations.');
  for (const suspect of data.suspects) {
    for (const field of ['name', 'personality', 'relationshipToVictim', 'motive', 'privateFacts', 'permittedLie', 'responses']) {
      if (!suspect[field]) errors.push(`${suspect.id} is missing ${field}.`);
    }
    for (const topic of TOPICS) {
      if (!suspect.responses?.[topic]) errors.push(`${suspect.id} lacks a response for ${topic}.`);
      else if (!suspect.responses[topic].fallbackText) errors.push(`${suspect.id} lacks fallback text for ${topic}.`);
    }
  }
  return errors;
}

export function createInvestigation({ data = caseData, phraser = null, dialogueCatalog = defaultDialogueCatalog(data), performer = null } = {}) {
  if (validateSpatialData(data).length) throw new Error('Invalid investigation configuration.');
  if (performer && phraser) throw new Error('Cannot combine dialogue adapters.');
  if (performer && typeof performer.perform !== 'function') throw new Error('Invalid performance adapter.');
  if (validateDialogueCatalog(dialogueCatalog, data).length) throw new Error('Invalid dialogue configuration.');
  if (validateAuthoredPerformances(dialogueCatalog).length) throw new Error('Invalid dialogue configuration.');
  const catalog = freezeCatalog(structuredClone(dialogueCatalog));
  let dialogueState = initialDialogueState(catalog);
  let mutationGeneration = 0;
  let pendingDialogue = null;
  const candidates = new Map();
  function invalidateDialogue() {
    mutationGeneration += 1;
    for (const candidate of candidates.values()) candidate.controller.abort();
  }
  let status = 'active';
  let finalResult = null;
  let currentLocationId = data.initialLocationId;
  let locationEpoch = 0;
  const getLocationContext = () => ({ locationId: currentLocationId, epoch: locationEpoch });
  const rejected = (code, text) => ({ kind: 'error', code, text });

  function travelTo(locationId) {
    if (status === 'ended') return endedError();
    if (!data.rooms.some((room) => room.id === locationId)) return rejected('location_not_found', 'That room is not available.');
    const changed = currentLocationId !== locationId;
    if (changed) { currentLocationId = locationId; locationEpoch += 1; }
    invalidateDialogue();
    return { kind: 'travel', locationId, changed };
  }

  function getLifecycle() {
    return {
      status,
      finalResult: finalResult ? { ended: finalResult.ended, result: finalResult.result, text: finalResult.text } : null,
    };
  }

  function endedError() {
    return { kind: 'error', code: 'investigation_ended', text: 'The investigation has ended.' };
  }

  function findSuspect(suspectId) {
    return data.suspects.find((suspect) => suspect.id === suspectId) ?? null;
  }

  // Explicit public projections: never spread authoritative records into these views.
  function getPublicSuspect(suspectId) {
    const suspect = findSuspect(suspectId);
    if (!suspect) return null;
    const dossier = suspect.publicDossier;
    return { id: suspect.id, name: suspect.name, locationId: suspect.locationId, dossier: {
      role: dossier.role, relationshipToVictim: dossier.relationshipToVictim, background: dossier.background,
      relationships: dossier.relationships.map((edge) => ({ targetSuspectId: edge.targetSuspectId, kind: edge.kind, label: edge.label })),
    } };
  }

  function publicViewFrom(conversations) {
    return {
      title: data.title,
      victim: { name: data.victim.name, description: data.victim.description },
      locations: [...data.locations],
      rooms: data.rooms.map(({ id, name }) => ({ id, name })),
      currentLocationId,
      suspects: data.suspects.map(({ id }) => getPublicSuspect(id)),
      evidence: listEvidence(),
      lifecycle: getLifecycle(),
      dialogue: publicDialogue(catalog, conversations, data, status, currentLocationId),
    };
  }

  function getPublicView() { return publicViewFrom(dialogueState); }

  const commandError = (code) => rejected(code, {
    invalid_request: 'Invalid dialogue command.', suspect_not_found: 'That suspect is not available.',
    session_busy: 'A command is already running.', stale_response: 'That reply is no longer current.',
    dialogue_option_unavailable: 'That dialogue option is not available. Refresh state before trying again.',
  }[code]);

  function candidateError(candidate) {
    if (status === 'ended') return endedError();
    if (!candidate || candidate.generation !== mutationGeneration || candidate.epoch !== locationEpoch
      || findSuspect(candidate.suspectId)?.locationId !== currentLocationId) return commandError('stale_response');
    return null;
  }

  // Opaque, engine-owned candidates keep all changes staged until the adapter's guards pass.
  async function prepareDialogue(suspectId, input, project = (value) => value) {
    if (status === 'ended') return endedError();
    const suspect = findSuspect(suspectId);
    if (!suspect) return commandError('suspect_not_found');
    if (suspect.locationId !== currentLocationId) return rejected('suspect_not_present', 'That suspect is in another room.');
    if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length !== 1
      || (!Object.hasOwn(input, 'question') && !Object.hasOwn(input, 'choiceId'))) return commandError('invalid_request');
    if (Object.hasOwn(input, 'question') && (typeof input.question !== 'string' || !input.question.trim()
      || [...input.question.trim()].length > 1000)) return commandError('invalid_request');
    if (Object.hasOwn(input, 'choiceId') && (typeof input.choiceId !== 'string' || input.choiceId.length > 64
      || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.choiceId))) return commandError('invalid_request');
    if (pendingDialogue) return commandError('session_busy');
    const plan = resolveDialogue(catalog, dialogueState, data, suspectId, input);
    if (!plan && Object.hasOwn(input, 'choiceId')) return commandError('dialogue_option_unavailable');
    const token = Symbol('dialogue-candidate');
    pendingDialogue = token;
    const candidate = { generation: mutationGeneration, epoch: locationEpoch, suspectId, next: dialogueState, result: guidance(), project, controller: new AbortController() };
    candidates.set(token, candidate);
    try {
      if (plan) {
        const question = input.question?.trim() ?? dialogueOptions(catalog, dialogueState, suspectId).find((o) => o.id === input.choiceId).label;
        const turn = prepareTurn(catalog, dialogueState, suspectId, plan, question);
        let { text, narration } = turn.result;
        let reused = false;
        // Explicit historical injection retains its exact topic-string cache contract.
        const legacy = phraser && turn.core;
        const offer = !legacy && (performer || turn.core?.deliveries || (!turn.core && catalog.profiles.find((p) => p.suspectId === suspectId)?.socialDeliveries)) ? offerPerformances(catalog, dialogueState, suspectId, plan, turn) : null;
        const cacheKey = legacy ? `legacy:${turn.core.topic}` : offer?.cacheKey ?? turn.cacheKey;
        const cached = turn.npc.cache.get(cacheKey);
        if (offer) {
          let pair;
          if (cached) {
            try { pair = validatePerformance({ narration: cached.narration, dialogue: cached.text }, offer.context.performances); reused = true; }
            catch { turn.npc.cache.delete(cacheKey); }
          }
          if (!pair) {
            try {
              const output = performer ? await performer.perform(freezeCatalog(structuredClone(offer.context)), { signal: candidate.controller.signal }) : offer.fallback;
              pair = validatePerformance(output, offer.context.performances);
            } catch {
              pair = validatePerformance(offer.fallback ?? { narration, dialogue: text }, offer.context.performances);
            }
          }
          applyPerformance(turn, dialogueState.npcs.get(suspectId), offer, pair);
          text = pair.dialogue; narration = pair.narration;
          candidate.performances = offer.context.performances;
        }
        else if (cached) { text = cached.text; narration = legacy ? null : cached.narration; reused = true; }
        else if (legacy) {
          narration = null;
          text = turn.core.approvedContent;
          try {
            const phrased = await phraser.phrase({ approvedContent: text, personality: suspect.personality });
            if (typeof phrased === 'string' && phrased.trim()) text = phrased.trim();
          } catch { /* Historical adapter failure uses the unchanged approved core. */ }
        }
        turn.result.text = text; turn.result.dialogue = text; turn.result.narration = narration; turn.result.cached = reused;
        turn.record.dialogue = text; turn.record.narration = narration;
        cachePerformance(turn.npc, cacheKey, { text, narration });
        candidate.next = turn.next;
        candidate.result = turn.result;
      }
      const error = candidateError(candidate);
      if (error) { discardDialogue(token); return error; }
      return token;
    } catch (error) {
      discardDialogue(token);
      throw error;
    }
  }

  function discardDialogue(token) {
    candidates.get(token)?.controller.abort();
    candidates.delete(token);
    if (pendingDialogue === token) pendingDialogue = null;
  }

  function commitDialogue(token) {
    const candidate = candidates.get(token);
    if (!candidate) return commandError('stale_response');
    try {
      const error = candidateError(candidate);
      if (error) return error;
      if (candidate.performances) validatePerformance({ narration: candidate.result.narration, dialogue: candidate.result.dialogue }, candidate.performances);
      const state = publicViewFrom(candidate.next);
      const result = candidate.project(structuredClone(candidate.result));
      // Projection is synchronous and may throw; never install a partially projected candidate.
      if (result instanceof Promise) throw new Error('Dialogue projection must be synchronous.');
      const afterProjection = candidateError(candidate);
      if (afterProjection) return afterProjection;
      dialogueState = candidate.next;
      mutationGeneration += 1;
      return { result, state };
    } finally { discardDialogue(token); }
  }

  async function interact(suspectId, input) {
    const candidate = await prepareDialogue(suspectId, input);
    if (!candidates.has(candidate)) return candidate;
    const committed = commitDialogue(candidate);
    return committed.kind === 'error' ? committed : committed.result;
  }

  function askSuspect(suspectId, question) {
    return interact(suspectId, { question });
  }

  function listEvidence() {
    return data.evidence.map(({ id, name, locationId }) => ({ id, name, locationId }));
  }

  function selectEvidence(evidenceId) {
    if (status === 'ended') return { error: endedError() };
    const evidence = data.evidence.find((evidence) => evidence.id === evidenceId) ?? null;
    if (evidence && evidence.locationId !== currentLocationId) return { error: rejected('evidence_not_here', 'That evidence is in another room.') };
    return { evidence };
  }

  function inspectEvidence(evidenceId) {
    const selection = selectEvidence(evidenceId);
    if (selection.evidence) { dialogueState.inspected.add(selection.evidence.id); invalidateDialogue(); }
    return selection.error ?? selection.evidence;
  }

  function inspectPublicEvidence(evidenceId) {
    const { evidence, error } = selectEvidence(evidenceId);
    if (error) return error;
    if (evidence) { dialogueState.inspected.add(evidence.id); invalidateDialogue(); }
    return evidence ? { id: evidence.id, name: evidence.name, description: evidence.description } : null;
  }

  function resolveAccusation(suspectId, confirmed) {
    if (status === 'ended') return { ...endedError(), ended: true, result: 'rejected' };
    if (confirmed !== true) { invalidateDialogue(); return { ended: false, result: 'cancelled', text: 'The accusation was cancelled. Continue investigating.' }; }
    const suspect = findSuspect(suspectId);
    if (!suspect) return { ended: false, result: 'invalid', text: 'That suspect is not available.' };
    const correct = suspect.id === data.murdererId;
    finalResult = {
      ended: true,
      result: correct ? 'correct' : 'incorrect',
      text: correct ? `Correct. ${suspect.name} murdered ${data.victim.name}.` : `Incorrect. ${suspect.name} is innocent. The investigation is over.`,
    };
    status = 'ended';
    invalidateDialogue();
    return getLifecycle().finalResult;
  }

  // data, findSuspect and inspectEvidence remain trusted internal APIs for CLI compatibility.
  return {
    data, findSuspect, askSuspect, listEvidence, inspectEvidence, resolveAccusation,
    getPublicView, getPublicSuspect, inspectPublicEvidence, getLifecycle,
    travelTo, getLocationContext,
    interact, prepareDialogue, commitDialogue, discardDialogue,
    isDialogueCandidate: (token) => candidates.has(token),
    getDialogueDiagnostics: () => structuredClone(dialogueDiagnostics(dialogueState)),
  };
}
