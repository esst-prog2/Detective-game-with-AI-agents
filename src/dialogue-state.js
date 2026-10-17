import { normalizeQuestion, classifyQuestion, unsupportedQuestionText } from './question-classifier.js';

export const topicQuestions = {
  alibi: 'Where were you when the victim died?', relationship_with_victim: 'What was your relationship with the victim?',
  motive: 'Did you have a reason to hurt the victim?', sighting: 'Did you see anyone suspicious?',
  evidence: 'What do you know about the evidence?', crime_details: 'What happened when the victim died?',
};
const dimensions = ['cooperation', 'irritation', 'tension'];
export const demeanor = (v) => v[1] >= 3 ? 'irritated' : v[2] >= 2 ? 'uneasy' : v[0] >= 3 ? 'receptive' : 'neutral';

export function initialDialogueState(catalog) {
  return { turnId: 0, inspected: new Set(), npcs: new Map(catalog.profiles.map((p) => [p.suspectId, {
    emotion: [...p.baseline], turns: [], discussed: new Set(), presented: new Set(), repeats: new Map(), lastCore: null,
    gestures: [], gestureFamilies: [], gestureCursor: 0, recentDeliveries: [], speechOnly: 0, comparisonReacted: false, deliveries: 0, cache: new Map(),
  }])) };
}

const coreFor = (catalog, id, topic) => catalog.cores.find((c) => c.suspectId === id && c.topic === topic);
const prerequisites = (state, catalog, comparison) => comparison.requires.every((id) => {
  const core = catalog.cores.find((c) => c.id === id);
  return state.npcs.get(core.suspectId)?.discussed.has(id);
});

export function dialogueOptions(catalog, state, suspectId) {
  const npc = state.npcs.get(suspectId);
  if (!npc) return [];
  const options = [];
  for (const c of catalog.comparisons.filter((c) => c.suspectId === suspectId && prerequisites(state, catalog, c))) options.push({ id: c.id, label: c.label, kind: 'contradiction', intent: 'compare_testimony', coreId: c.coreId });
  for (const e of catalog.evidence.filter((e) => e.suspectId === suspectId && state.inspected.has(e.evidenceId))) options.push({ id: e.id, label: e.label, kind: 'evidence', intent: 'present_evidence', coreId: e.coreId, evidenceId: e.evidenceId });
  if (npc.lastCore) options.push({ id: 'clarify-last', label: 'What do you mean by that?', kind: 'clarify', intent: 'clarify', coreId: npc.lastCore });
  options.push({ id: 'ask-hiding', label: 'Are you hiding something from me?', kind: 'social', intent: 'social_challenge', coreId: null });
  const topics = catalog.cores.filter((c) => c.suspectId === suspectId);
  const unanswered = topics.filter((c) => !npc.discussed.has(c.id));
  const answered = topics.filter((c) => npc.discussed.has(c.id));
  const rotated = answered.slice(npc.deliveries % (answered.length || 1)).concat(answered.slice(0, npc.deliveries % (answered.length || 1)));
  for (const c of [...unanswered, ...rotated]) options.push({ id: `ask-${c.topic.replaceAll('_', '-')}`, label: topicQuestions[c.topic], kind: npc.discussed.has(c.id) ? 'revisit' : 'topic', intent: npc.discussed.has(c.id) ? 'revisit' : 'topic', coreId: c.id });
  return options.slice(0, 6);
}

export function resolveDialogue(catalog, state, data, suspectId, input) {
  const npc = state.npcs.get(suspectId);
  if (!npc) return null;
  if (Object.hasOwn(input, 'choiceId')) return dialogueOptions(catalog, state, suspectId).find((o) => o.id === input.choiceId) ?? null;
  const q = normalizeQuestion(input.question);
  const named = data.evidence.filter((e) => {
    const name = normalizeQuestion(e.name);
    const noun = name.split(/\s+/).at(-1);
    return q.includes(e.id.replaceAll('-', ' ')) || (name && q.includes(name)) || (noun && q.split(/[\s?]+/).includes(noun));
  });
  if (named.length) {
    if (named.length !== 1 || !state.inspected.has(named[0].id)) return null;
    const e = catalog.evidence.find((item) => item.suspectId === suspectId && item.evidenceId === named[0].id);
    return e ? { intent: 'present_evidence', coreId: e.coreId, evidenceId: e.evidenceId } : null;
  }
  if (/\b(what do you mean|clarify|explain that|mean by that)\b/.test(q)) return npc.lastCore ? { intent: 'clarify', coreId: npc.lastCore } : null;
  const comparisons = catalog.comparisons.filter((c) => c.suspectId === suspectId && c.triggers.some((trigger) => q.includes(trigger)));
  if (comparisons.length) {
    const comparison = comparisons.find((c) => prerequisites(state, catalog, c));
    return comparison ? { intent: 'compare_testimony', coreId: comparison.coreId } : null;
  }
  const accusation = /\b(hiding|you killed|you murdered|you are guilty|you re guilty|you did it)\b/.test(q);
  // Preserve the six canonical examples but do not choose one side of an explicit multi-question.
  const classify = (part) => /\bwhat happened\b/.test(part) ? 'crime_details' : classifyQuestion(part);
  const parts = q.split(/\?|\band\b/).filter((s) => s.trim());
  const topics = new Set(parts.map(classify).filter((s) => s !== 'unsupported'));
  if (topics.size > 1) return null;
  const topic = classify(q);
  const core = coreFor(catalog, suspectId, topic);
  if (accusation && (!core || !/\b(what|where|when|why|how|did you)\b/.test(q))) return { intent: 'social_challenge', coreId: null, accusation: true };
  return core ? { intent: 'topic', coreId: core.id, accusation, respectful: !accusation && /\b(please|thank you)\b/.test(q) } : null;
}

export const guidance = () => ({ kind: 'unsupported', topic: 'unsupported', text: unsupportedQuestionText, narration: null, dialogue: unsupportedQuestionText });

export function prepareTurn(catalog, state, suspectId, plan, question) {
  const next = structuredClone(state);
  const npc = next.npcs.get(suspectId);
  const profile = catalog.profiles.find((p) => p.suspectId === suspectId);
  const core = catalog.cores.find((c) => c.id === plan.coreId);
  const key = `${plan.intent}:${plan.coreId ?? 'social'}:${plan.evidenceId ?? ''}`;
  const repeats = npc.repeats.get(key) ?? 0;
  const repeatedCore = plan.coreId && npc.discussed.has(plan.coreId);
  const tags = [];
  if (plan.intent !== 'clarify' && (repeats || (['topic', 'revisit'].includes(plan.intent) && repeatedCore))) tags.push('repeat');
  if ((plan.intent === 'social_challenge' || plan.accusation) && npc.presented.size === 0) tags.push('baseless');
  if (plan.evidenceId && !npc.presented.has(plan.evidenceId)) tags.push('evidence');
  if (plan.respectful && plan.coreId && !repeatedCore) tags.push('respect');
  for (const tag of tags) npc.emotion = npc.emotion.map((v, i) => Math.min(4, Math.max(0, v + profile.deltas[tag][i])));
  const mood = demeanor(npc.emotion);
  let prefix = '';
  if (plan.intent === 'clarify') prefix = profile.framing.clarify;
  else if (core && repeatedCore) prefix = mood === 'irritated' || mood === 'uneasy' ? profile.framing.pressure : profile.framing.repeat;
  else if (core && npc.deliveries > 0) prefix = core.variants[1 + npc.deliveries % (core.variants.length - 1)].prefix;
  else if (!core && repeats) prefix = mood === 'irritated' ? profile.framing.pressure : profile.framing.repeat;
  const dialogue = `${prefix}${core ? core.approvedContent : profile.social}`;
  let gesture = null;
  if (npc.deliveries % 3 === 1) {
    const start = Math.floor(npc.deliveries / 3) % profile.mannerisms.length;
    const rotated = profile.mannerisms.slice(start).concat(profile.mannerisms.slice(0, start));
    gesture = rotated.find((m) => !npc.gestures.includes(m.id)) ?? null;
  }
  const narration = gesture?.text ?? null;
  if (gesture) npc.gestures = [...npc.gestures, gesture.id].slice(-2);
  npc.repeats.set(key, Math.min(3, repeats + 1));
  if (core) { npc.discussed.add(core.id); npc.lastCore = core.id; }
  if (plan.evidenceId) npc.presented.add(plan.evidenceId);
  npc.deliveries += 1;
  next.turnId += 1;
  const result = { kind: 'answer', topic: core?.topic ?? 'social', text: dialogue, cached: false, turnId: next.turnId, narration, dialogue, demeanor: mood };
  const record = { turnId: result.turnId, question, inputRole: 'player', intent: plan.intent,
    coreId: core?.id ?? null, presentedEvidenceId: plan.evidenceId ?? null,
    kind: 'answer', topic: result.topic, narration, dialogue };
  npc.turns = [...npc.turns, record].slice(-8);
  const cacheKey = `${catalog.version}:${plan.coreId ?? 'social'}:${prefix}:${mood}:${gesture?.id ?? 'none'}`;
  return { next, npc, core, result, record, cacheKey };
}

export function cachePerformance(npc, key, value) {
  npc.cache.set(key, value);
  if (npc.cache.size > 64) npc.cache.delete(npc.cache.keys().next().value);
}

export function publicDialogue(catalog, state, data, status, locationId) {
  return {
    inspectedEvidenceIds: data.evidence.filter((e) => state.inspected.has(e.id)).map((e) => e.id),
    conversations: catalog.profiles.map((p) => {
      const npc = state.npcs.get(p.suspectId);
      return { suspectId: p.suspectId, demeanor: demeanor(npc.emotion),
        recentTurns: npc.turns.map((t) => ({ turnId: t.turnId, question: t.question, kind: t.kind, topic: t.topic, narration: t.narration, dialogue: t.dialogue })),
        options: status === 'active' && data.suspects.find((s) => s.id === p.suspectId)?.locationId === locationId
          ? dialogueOptions(catalog, state, p.suspectId).map((o) => ({ id: o.id, label: o.label, kind: o.kind })) : [],
      };
    }),
  };
}

// Trusted diagnostics for deterministic transition/atomicity tests, never serialized by adapters.
export function dialogueDiagnostics(state) {
  return { turnId: state.turnId, npcs: [...state.npcs].map(([id, n]) => ({ id,
    emotion: Object.fromEntries(dimensions.map((d, i) => [d, n.emotion[i]])),
    discussed: [...n.discussed], presented: [...n.presented], repeats: [...n.repeats], cacheSize: n.cache.size,
    lastCore: n.lastCore, gestures: [...n.gestures], gestureFamilies: [...n.gestureFamilies], gestureCursor: n.gestureCursor, recentDeliveries: structuredClone(n.recentDeliveries), speechOnly: n.speechOnly, comparisonReacted: n.comparisonReacted, deliveries: n.deliveries, turns: n.turns, cache: [...n.cache],
  })) };
}
