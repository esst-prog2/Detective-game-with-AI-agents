import { caseData, TOPICS } from './data/case.js';
import { classifyQuestion, unsupportedQuestionText } from './question-classifier.js';

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

export function createInvestigation({ data = caseData, phraser = null } = {}) {
  if (validateSpatialData(data).length) throw new Error('Invalid investigation configuration.');
  const cachedResponses = new Map();
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

  function getPublicView() {
    return {
      title: data.title,
      victim: { name: data.victim.name, description: data.victim.description },
      locations: [...data.locations],
      rooms: data.rooms.map(({ id, name }) => ({ id, name })),
      currentLocationId,
      suspects: data.suspects.map(({ id }) => getPublicSuspect(id)),
      evidence: listEvidence(),
      lifecycle: getLifecycle(),
    };
  }

  async function askSuspect(suspectId, question) {
    if (status === 'ended') return endedError();
    const suspect = findSuspect(suspectId);
    if (!suspect) return { kind: 'error', text: 'That suspect is not available.' };
    if (suspect.locationId !== currentLocationId) return rejected('suspect_not_present', 'That suspect is in another room.');
    const epoch = locationEpoch;
    const topic = classifyQuestion(question);
    if (topic === 'unsupported') return { kind: 'unsupported', topic, text: unsupportedQuestionText };

    const cacheKey = `${suspectId}:${topic}`;
    if (cachedResponses.has(cacheKey)) return { kind: 'answer', topic, text: cachedResponses.get(cacheKey), cached: true };

    const selected = suspect.responses[topic];
    let text = selected.fallbackText;
    if (phraser) {
      try {
        const phrased = await phraser.phrase({ approvedContent: selected.approvedContent, personality: suspect.personality });
        if (typeof phrased === 'string' && phrased.trim()) text = phrased.trim();
      } catch {
        // The approved local fallback is intentionally used for every adapter failure.
      }
    }
    // An accusation may have ended play while the phraser was pending, even if it failed.
    if (status === 'ended') return endedError();
    if (epoch !== locationEpoch || suspect.locationId !== currentLocationId) return rejected('stale_response', 'That reply is no longer current.');
    cachedResponses.set(cacheKey, text);
    return { kind: 'answer', topic, text, cached: false };
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
    return selection.error ?? selection.evidence;
  }

  function inspectPublicEvidence(evidenceId) {
    const { evidence, error } = selectEvidence(evidenceId);
    if (error) return error;
    return evidence ? { id: evidence.id, name: evidence.name, description: evidence.description } : null;
  }

  function resolveAccusation(suspectId, confirmed) {
    if (status === 'ended') return { ...endedError(), ended: true, result: 'rejected' };
    if (confirmed !== true) return { ended: false, result: 'cancelled', text: 'The accusation was cancelled. Continue investigating.' };
    const suspect = findSuspect(suspectId);
    if (!suspect) return { ended: false, result: 'invalid', text: 'That suspect is not available.' };
    const correct = suspect.id === data.murdererId;
    finalResult = {
      ended: true,
      result: correct ? 'correct' : 'incorrect',
      text: correct ? `Correct. ${suspect.name} murdered ${data.victim.name}.` : `Incorrect. ${suspect.name} is innocent. The investigation is over.`,
    };
    status = 'ended';
    return getLifecycle().finalResult;
  }

  // data, findSuspect and inspectEvidence remain trusted internal APIs for CLI compatibility.
  return {
    data, findSuspect, askSuspect, listEvidence, inspectEvidence, resolveAccusation,
    getPublicView, getPublicSuspect, inspectPublicEvidence, getLifecycle,
    travelTo, getLocationContext,
  };
}
