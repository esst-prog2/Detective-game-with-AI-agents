import { caseData, TOPICS } from './data/case.js';
import { classifyQuestion, unsupportedQuestionText } from './question-classifier.js';

export function validateCase(data = caseData) {
  const errors = [];
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
  const cachedResponses = new Map();
  let status = 'active';
  let finalResult = null;

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
    return suspect ? { id: suspect.id, name: suspect.name } : null;
  }

  function getPublicView() {
    return {
      title: data.title,
      victim: { name: data.victim.name, description: data.victim.description },
      locations: [...data.locations],
      suspects: data.suspects.map(({ id, name }) => ({ id, name })),
      evidence: listEvidence(),
      lifecycle: getLifecycle(),
    };
  }

  async function askSuspect(suspectId, question) {
    if (status === 'ended') return endedError();
    const suspect = findSuspect(suspectId);
    if (!suspect) return { kind: 'error', text: 'That suspect is not available.' };
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
    cachedResponses.set(cacheKey, text);
    return { kind: 'answer', topic, text, cached: false };
  }

  function listEvidence() {
    return data.evidence.map(({ id, name }) => ({ id, name }));
  }

  function inspectEvidence(evidenceId) {
    if (status === 'ended') return endedError();
    return data.evidence.find((evidence) => evidence.id === evidenceId) ?? null;
  }

  function inspectPublicEvidence(evidenceId) {
    if (status === 'ended') return endedError();
    const evidence = inspectEvidence(evidenceId);
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
  };
}
