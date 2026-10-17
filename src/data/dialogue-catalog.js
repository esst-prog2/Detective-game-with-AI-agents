import { caseData, TOPICS } from './case.js';
import { speechAlternatives, socialAlternatives, reviewedDeliveries } from './authored-deliveries.js';

const styles = [
  {
    suspectId: 'alice-mercer', traits: ['nervous', 'dutiful', 'guarded'],
    speechStyle: { vocabulary: 'Careful, precise and polite.', rhythm: 'Measured complete sentences; pauses under pressure.' },
    conversationalRules: ['Answer authorized questions fully.', 'Controlled wording does not erase nervousness.'],
    pressure: 'Careful qualification, rather than abrupt hostility.',
    baseline: [2, 0, 1], deltas: { repeat: [0, 1, 1], baseless: [0, 1, 1], evidence: [0, 0, 1], respect: [1, 0, 0] },
    framing: { calm: 'Let me answer carefully. ', repeat: 'As I said, Detective, ', pressure: 'Please let me be precise. ', clarify: 'To be clear, ' },
    mannerisms: [{ id: 'sleeve', text: 'Alice carefully straightens her sleeve.' }, { id: 'pause', text: 'Alice pauses before choosing her words.' }, { id: 'gaze', text: 'Alice briefly lowers her gaze.' }],
    social: 'That is a rather broad question, Detective. Please ask me about something specific; I will choose my words carefully.',
  },
  {
    suspectId: 'ben-carter', traits: ['blunt', 'proud', 'easily provoked'],
    speechStyle: { vocabulary: 'Plain, practical words.', rhythm: 'Direct at first; corrections and over-explanation under pressure.' },
    conversationalRules: ['Pride and nervousness can coexist.', 'Keep explanations relevant to authorized testimony.'],
    pressure: 'Restless explanation without abandoning bluntness.',
    baseline: [2, 0, 0], deltas: { repeat: [0, 1, 0], baseless: [-1, 2, 1], evidence: [0, 0, 1], respect: [0, 0, 0] },
    framing: { calm: 'Plainly put: ', repeat: 'I already told you. ', pressure: 'Look, let me finish—let me explain it plainly. ', clarify: 'What I mean is this: ' },
    mannerisms: [{ id: 'stance', text: 'Ben shifts his stance.' }, { id: 'palms', text: 'Ben opens his palms, then lets them fall.' }, { id: 'breath', text: 'Ben takes a breath before continuing.' }],
    social: 'Hiding what? Ask me straight. No, wait—let me finish. A proper question deserves a proper answer.',
  },
  {
    suspectId: 'clara-voss', traits: ['polished', 'composed', 'calculating'],
    speechStyle: { vocabulary: 'Articulate, restrained businesslike language.', rhythm: 'Measured statements and direct rebuttals.' },
    conversationalRules: ['Composure permits firm objections.', 'A challenge does not authorize a confession.'],
    pressure: 'Controlled defensiveness and directness.',
    baseline: [2, 0, 0], deltas: { repeat: [0, 1, 0], baseless: [-1, 2, 0], evidence: [0, 1, 1], respect: [1, 0, 0] },
    framing: { calm: 'Allow me to be clear. ', repeat: 'My answer remains the same. ', pressure: 'I object to the assumption, Detective. ', clarify: 'My meaning is quite specific. ' },
    mannerisms: [{ id: 'arms', text: 'Clara folds her arms.' }, { id: 'gaze', text: 'Clara holds a level gaze.' }, { id: 'pause', text: 'Clara lets a brief silence pass.' }],
    social: 'That is an assumption, Detective, not a question. Ask directly, and kindly spare me the insinuation.',
  },
];

export function freezeCatalog(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freezeCatalog);
    Object.freeze(value);
  }
  return value;
}

// Existing response cores are testimony, including intentional lies. They are not global facts.
// Alice's motive core is deliberately unchanged: its debt/concealment annotation conflict is unresolved.
export const caseDialogueCatalog = freezeCatalog({
  version: 'ashcroft-dialogue-v2', profiles: styles.map((p) => ({ ...p, socialDeliveries: socialAlternatives[p.suspectId].map((dialogue, i) => ({ id: `social-${i}`, dialogue, mode: i < 2 ? 'ordinary' : 'pressure', structure: ['question', 'request', 'rebuttal', 'clarification'][i], opening: dialogue.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).slice(0, 4).join(' ') })), mannerisms: [
    ...p.mannerisms.map((m, i) => ({ ...m, family: ({ 'alice-mercer': ['hands', 'pause', 'face'], 'ben-carter': ['posture', 'hands', 'pause'], 'clara-voss': ['posture', 'face', 'pause'] })[p.suspectId][i] })),
    { id: 'expression', family: p.suspectId === 'clara-voss' ? 'hands' : 'face', text: p.suspectId === 'alice-mercer' ? 'Alice briefly presses her lips together.' : p.suspectId === 'ben-carter' ? 'Ben draws his brows together briefly.' : 'Clara briefly brings her fingertips together.' },
    { id: 'posture', family: 'posture', text: p.suspectId === 'alice-mercer' ? 'Alice draws her shoulders slightly closer.' : p.suspectId === 'ben-carter' ? 'Ben settles back on his heels.' : 'Clara straightens slightly.' },
  ] })),
  cores: caseData.suspects.flatMap((npc) => TOPICS.map((topic) => ({
    id: `${npc.id}-${topic.replaceAll('_', '-')}`, suspectId: npc.id, topic,
    source: { kind: 'authored-testimony', topic },
    approvedContent: npc.responses[topic].approvedContent,
    deliveries: reviewedDeliveries(npc.responses[topic].approvedContent, speechAlternatives[`${npc.id}-${topic.replaceAll('_', '-')}`] ?? []),
    variants: [{ id: 'plain', prefix: '' }, { id: 'considered', prefix: styles.find((p) => p.suspectId === npc.id).framing.calm }],
  }))),
  evidence: [
    { id: 'present-footprints', suspectId: 'alice-mercer', evidenceId: 'muddy-footprints', coreId: 'alice-mercer-evidence', label: 'Ask about the inspected muddy footprints.' },
    { id: 'present-footprints', suspectId: 'ben-carter', evidenceId: 'muddy-footprints', coreId: 'ben-carter-evidence', label: 'Present the inspected muddy footprints.' },
    { id: 'present-cufflink', suspectId: 'clara-voss', evidenceId: 'silver-cufflink', coreId: 'clara-voss-evidence', label: 'Present the inspected silver cufflink.' },
    { id: 'present-contract', suspectId: 'clara-voss', evidenceId: 'torn-contract', coreId: 'clara-voss-motive', label: 'Ask about the inspected contract ending the partnership.' },
  ],
  comparisons: [{
    id: 'compare-garden-accounts', suspectId: 'clara-voss', coreId: 'clara-voss-sighting',
    label: 'Alice described seeing you near the garden; how does that fit your account?',
    triggers: ['contradict', 'contradiction', 'accounts', 'alice said', 'alice saw'],
    requires: ['alice-mercer-sighting', 'clara-voss-sighting'],
  }],
});

const slug = (s) => typeof s === 'string' && s.length <= 64 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
const text = (s, max = 1200) => typeof s === 'string' && s.trim().length > 0 && [...s].length <= max;
const vector = (v, baseline = false) => Array.isArray(v) && v.length === 3
  && v.every((n) => Number.isInteger(n) && n >= (baseline ? 0 : -4) && n <= 4);

export function validateDialogueCatalog(catalog, data) {
  const errors = [];
  if (!catalog || !slug(catalog.version) || !['profiles', 'cores', 'evidence', 'comparisons'].every((key) => Array.isArray(catalog[key]))) return ['Invalid dialogue catalog.'];
  if (['profiles', 'cores', 'evidence', 'comparisons'].some((key) => catalog[key].some((v) => !v || typeof v !== 'object' || Array.isArray(v)))) return ['Invalid dialogue catalog record.'];
  const deliveriesValid = (rows, original = null) => Array.isArray(rows) && rows.length >= 1 && rows.length <= 8
    && new Set(rows.map((r) => r?.id)).size === rows.length && new Set(rows.map((r) => r?.dialogue)).size === rows.length
    && rows.every((r) => slug(r?.id) && text(r.dialogue) && text(r.structure, 100) && text(r.opening, 100)
      && ['original', 'ordinary', 'clarify', 'pressure'].includes(r.mode))
    && (original === null
      ? rows.some((r) => ['ordinary', 'original'].includes(r.mode)) && rows.some((r) => ['pressure', 'original'].includes(r.mode))
      : rows[0].mode === 'original' && rows[0].dialogue === original);
  const profiles = new Map();
  const cores = new Map();
  for (const p of catalog.profiles) {
    if (!p || !slug(p.suspectId) || profiles.has(p.suspectId) || !data.suspects.some(({ id }) => id === p.suspectId)
      || !Array.isArray(p.traits) || !p.traits.length || !p.traits.every((s) => text(s, 100))
      || !text(p.speechStyle?.vocabulary, 500) || !text(p.speechStyle?.rhythm, 500) || !text(p.pressure, 500)
      || !Array.isArray(p.conversationalRules) || !p.conversationalRules.every((s) => text(s, 500))
      || !vector(p.baseline, true) || !['repeat', 'baseless', 'evidence', 'respect'].every((k) => vector(p.deltas?.[k]))
      || !['calm', 'repeat', 'pressure', 'clarify'].every((k) => text(p.framing?.[k], 100)) || !text(p.social)
      || !Array.isArray(p.mannerisms) || !p.mannerisms.length || p.mannerisms.length > 12
      || new Set(p.mannerisms.map((m) => m?.id)).size !== p.mannerisms.length
      || p.mannerisms.some((m) => !slug(m?.id) || !text(m.text, 240))) errors.push('Invalid dialogue profile.');
    if (p?.socialDeliveries !== undefined && !deliveriesValid(p.socialDeliveries)) errors.push('Invalid social deliveries.');
    if (p?.mannerisms?.some((m) => m.family !== undefined && !['hands', 'pause', 'face', 'posture'].includes(m.family))) errors.push('Invalid gesture family.');
    if (p) profiles.set(p.suspectId, p);
  }
  for (const c of catalog.cores) {
    if (!c || !slug(c.id) || cores.has(c.id) || !profiles.has(c.suspectId) || !TOPICS.includes(c.topic)
      || c.source?.kind !== 'authored-testimony' || c.source.topic !== c.topic || !text(c.approvedContent)
      || !Array.isArray(c.variants) || c.variants.length < 2 || c.variants.length > 8
      || c.variants[0]?.prefix !== '' || new Set(c.variants.map((v) => v?.id)).size !== c.variants.length
      || c.variants.some((v) => !slug(v?.id) || typeof v.prefix !== 'string' || [...v.prefix].length > 100
        || [...`${v.prefix}${c.approvedContent}`].length > 1200)) errors.push('Invalid testimony core.');
    if (c?.deliveries !== undefined && !deliveriesValid(c.deliveries, c.approvedContent)) errors.push('Invalid testimony deliveries.');
    if (c) cores.set(c.id, c);
  }
  const optionIds = new Set();
  for (const item of [...catalog.evidence, ...catalog.comparisons]) {
    const key = `${item?.suspectId}:${item?.id}`;
    if (!item || !slug(item.id) || optionIds.has(key) || !profiles.has(item.suspectId) || !text(item.label, 1000)
      || cores.get(item.coreId)?.suspectId !== item.suspectId) errors.push('Invalid dialogue option.');
    optionIds.add(key);
  }
  for (const e of catalog.evidence) if (!data.evidence.some(({ id }) => id === e.evidenceId)) errors.push('Invalid dialogue evidence reference.');
  for (const c of catalog.comparisons) if (!Array.isArray(c.requires) || c.requires.length < 2
    || c.requires.some((id) => !cores.has(id)) || !Array.isArray(c.triggers) || !c.triggers.length
    || c.triggers.some((trigger) => !text(trigger, 100))) errors.push('Invalid comparison prerequisites.');
  for (const p of profiles.values()) if (TOPICS.some((topic) => catalog.cores.filter((c) => c.suspectId === p.suspectId && c.topic === topic).length !== 1)) errors.push('Incomplete dialogue topics.');
  return errors;
}

export function defaultDialogueCatalog(data) {
  // A different case must opt into its own authored catalog, never inherit Ashcroft testimony.
  if (data.title === caseData.title && data.suspects.length === 3
    && caseData.suspects.every((npc) => data.suspects.some(({ id }) => id === npc.id))
    && caseData.evidence.every((e) => data.evidence.some(({ id }) => id === e.id))) return caseDialogueCatalog;
  return { version: 'empty-v1', profiles: [], cores: [], evidence: [], comparisons: [] };
}
