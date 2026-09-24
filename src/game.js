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

  function findSuspect(suspectId) {
    return data.suspects.find((suspect) => suspect.id === suspectId) ?? null;
  }

  async function askSuspect(suspectId, question) {
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
    cachedResponses.set(cacheKey, text);
    return { kind: 'answer', topic, text, cached: false };
  }

  function listEvidence() {
    return data.evidence.map(({ id, name }) => ({ id, name }));
  }

  function inspectEvidence(evidenceId) {
    return data.evidence.find((evidence) => evidence.id === evidenceId) ?? null;
  }

  function resolveAccusation(suspectId, confirmed) {
    if (!confirmed) return { ended: false, result: 'cancelled', text: 'The accusation was cancelled. Continue investigating.' };
    const suspect = findSuspect(suspectId);
    if (!suspect) return { ended: false, result: 'invalid', text: 'That suspect is not available.' };
    const correct = suspect.id === data.murdererId;
    return {
      ended: true,
      result: correct ? 'correct' : 'incorrect',
      text: correct ? `Correct. ${suspect.name} murdered ${data.victim.name}.` : `Incorrect. ${suspect.name} is innocent. The investigation is over.`,
    };
  }

  return { data, findSuspect, askSuspect, listEvidence, inspectEvidence, resolveAccusation };
}
