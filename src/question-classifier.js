const TOPIC_RULES = [
  ['alibi', /\b(where|when|alibi|were you|doing)\b/],
  ['relationship_with_victim', /\b(relationship|know victor|feel about victor|with victor|employer|partner)\b/],
  ['motive', /\b(motive|reason|why.*(kill|harm|hurt)|want.*(dead|kill|harm))\b/],
  ['sighting', /\b(saw|see|sighting|anyone|suspicious|near the)\b/],
  ['evidence', /\b(evidence|footprint|footprints|contract|cufflink|clue|mud)\b/],
  ['crime_details', /\b(murder|crime|died|death|happened|study|alarm)\b/],
];

export function normalizeQuestion(question) {
  return String(question ?? '').trim().toLowerCase().replace(/[^a-z0-9?\s]/g, ' ').replace(/\s+/g, ' ');
}

export function classifyQuestion(question) {
  const normalized = normalizeQuestion(question);
  if (!normalized) return 'unsupported';
  return TOPIC_RULES.find(([, pattern]) => pattern.test(normalized))?.[0] ?? 'unsupported';
}

export const supportedTopicsText = 'alibi, relationship with the victim, motive, sightings, evidence, or the crime';
export const unsupportedQuestionText = `I’m not sure what you mean. Try asking about an ${supportedTopicsText}.`;
