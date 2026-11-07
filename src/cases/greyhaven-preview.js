// Server-only approved D subset. No full-case solution, future cores or dummy murderer.
const mara = 'mara-vale', owen = 'owen-vale';
const m0 = 'Owen waited with me in reception between the two bells. He did not go in to Adrian after supper.';
const o0 = 'I was working at the boathouse between the bells. Jonah was at the office hatch during the test. I saw him answer the telephone while I held the pressure lever, but I could not hear the caller. Adrian and I had words about work earlier; I left him standing at his desk.';
const o1 = 'I went in at about twenty twenty-six and left before the first bell. He wanted the four hundred and eighty pounds restored before the archive handover. I used the maintenance fund for the rescue pump without permission. I meant to replace it from invoices. Jonah watched the later test; that does not make taking the money right.';
const subject = (id, text) => ({ alibi: { approvedContent: text, fallbackText: text } });
const profile = (suspectId, mother) => ({ suspectId, traits: mother ? ['practical', 'protective', 'guarded'] : ['practical', 'independent', 'guarded'],
  speechStyle: { vocabulary: mother ? 'Complete practical sentences; domestic words.' : 'Short sentences, concrete repair details.', rhythm: mother ? 'Carefully measured.' : 'Terse under accusation.' },
  conversationalRules: ['Answer only authorized testimony; feelings do not establish guilt.'], pressure: mother ? 'Guarded practical assurances.' : 'Terse concrete explanation.',
  baseline: mother ? [2, 0, 1] : [2, 0, 0], deltas: { repeat: [0, 1, 0], baseless: [-1, 1, 1], evidence: [0, 0, 1], respect: [1, 0, 0] },
  framing: { calm: 'Let me be clear. ', repeat: 'As I said, ', pressure: 'Please listen. ', clarify: 'To be precise, ' },
  mannerisms: [{ id: 'pause', text: mother ? 'Mara pauses before answering.' : 'Owen pauses before answering.' }],
  social: 'Please ask about a specific account or an item you have inspected.' });
const core = (id, suspectId, role, body, stance = 'truth') => ({ id, suspectId, role, topic: 'alibi', stance,
  ...(id === 'owen-initial' ? { suggestionPriority: 1 } : {}),
  basis: [{ kind: 'known', id: 'own-observations' }], source: { kind: 'authored-testimony', topic: 'alibi' }, approvedContent: body,
  variants: [{ id: 'plain', prefix: '' }, { id: 'considered', prefix: '' }] });
const received = (speakerId, coreId) => ({ kind: 'received', speakerId, coreId });
const facet = (id, suspectId, primaryStatement, accountVersion, type, label, aliases, historicalCoreId) => ({
  id, suspectId, primaryStatement, accountVersion, type, coreId: `${id}-answer`, label, aliases, default: true,
  gate: { alternatives: [[received(suspectId, primaryStatement)]] }, ...(historicalCoreId ? { historicalCoreId } : {}) });

export const greyhavenPreview = {
  id: 'greyhaven-preview', version: 'greyhaven-preview-v1', mode: 'preview',
  publicMetadata: { id: 'greyhaven-preview', title: 'The Last Bell at Greyhaven — Repair Dispute Preview', mode: 'preview' },
  previewProfile: { subjects: [mara, owen].map((suspectId) => ({ suspectId, topics: ['alibi'] })) },
  data: {
    title: 'The Last Bell at Greyhaven — Repair Dispute Preview',
    victim: { name: 'Adrian Vale', description: 'Adrian Vale has been found dead in the chart room. This preview covers the repair dispute in reception and the boathouse. Inspect the pump records, question Mara and Owen, and compare their accounts. The full murder investigation and final accusation are not included.' },
    initialLocationId: 'reception', locations: ['reception', 'the boathouse'],
    rooms: [{ id: 'reception', name: 'reception' }, { id: 'boathouse', name: 'the boathouse' }],
    suspects: [
      { id: mara, name: 'Mara Vale', locationId: 'reception', personality: 'Practical, protective and guarded.', relationshipToVictim: "Adrian's sister.",
        motive: 'Keep Owen safe and the household intact.', privateFacts: ['She saw Owen leave Adrian angry and fears he hurt him; she does not know the repair spending.'],
        permittedLie: { topic: 'alibi', reason: 'Protect Owen while she tries to understand what happened.' }, responses: subject(mara, m0),
        publicDossier: { role: 'Guesthouse proprietor', relationshipToVictim: 'Adrian Vale — Brother', background: "Mara kept the converted station open after her husband's sudden death six years ago.", relationships: [{ targetSuspectId: owen, kind: 'family', label: 'Son' }] } },
      { id: owen, name: 'Owen Vale', locationId: 'boathouse', personality: 'Practical, independent and guarded.', relationshipToVictim: "Adrian's nephew.",
        motive: 'Avoid being dismissed as a dependent child.', privateFacts: ['He used £480 from the maintenance fund for the rescue pump without permission and intended to replace it from invoices.'],
        permittedLie: { topic: 'alibi', reason: 'Withholds the spending and precise visit, not the actual pump work.' }, responses: subject(owen, o0),
        publicDossier: { role: 'Repairer and rescue-launch volunteer', relationshipToVictim: 'Adrian Vale — Uncle', background: 'Owen is good at repairs and poor at asking permission.', relationships: [{ targetSuspectId: mara, kind: 'family', label: 'Mother' }] } },
    ],
    evidence: [
      { id: 'pump-worksheet', name: 'Pump pressure-test worksheet', locationId: 'boathouse',
        description: 'On the bench, a sheet initialed by Owen and Jonah records a pressure test from 20:32 to 20:41, pressure readings and red-primer work. A parts receipt dated 16 October references a £480 maintenance-fund payment. A before-supper note agrees a witnessed test during the evening departure period. The pump bench faces the ferry-office hatch. These records describe work and payment; they are not a tamper-proof alibi or identification of a stain.' },
      { id: 'repayment-demand', name: 'Repayment demand', locationId: 'boathouse',
        description: 'In the tool tin is Adrian\'s folded note: “£480 from the maintenance fund is to be restored before tomorrow\'s handover. We discuss it 20:25.” It records a demand and deadline, not violent intent.' },
    ],
  },
  catalog: {
    schemaVersion: 2, version: 'greyhaven-preview-dialogue-v1', profiles: [profile(mara, true), profile(owen, false)], evidence: [], comparisons: [],
    cores: [core('mara-initial', mara, 'base', m0, 'lie'), core('owen-initial', owen, 'base', o0, 'omission'), core('owen-admission', owen, 'account', o1),
      core('mara-source-answer', mara, 'facet', 'That is the account I am giving you. If you want to challenge it, tell me which observation you want me to answer.', 'omission'),
      core('owen-work-answer', owen, 'facet', "The rescue launch's cooling pump. I held the test pressure at the bench while Jonah watched from the office hatch. Ask him what he saw; I am not asking you to take my word for all of it."),
      core('owen-work-correction', owen, 'facet', o1),
      core('owen-reason-answer', owen, 'facet', 'Because doing useful work did not give me permission to take entrusted money. I expected another lecture, and I kept digging the hole.')],
    policy: {
      caseId: 'greyhaven-preview', accounts: [{ id: 'owen-explanation', suspectId: owen, initialVersion: 'o0', versions: [{ id: 'o0', coreId: 'owen-initial' }, { id: 'o1', coreId: 'owen-admission' }] }],
      epistemics: [
        { suspectId: mara, knownFacts: [{ id: 'own-observations', description: 'Saw Owen leave Adrian angry; does not know his repair spending.' }], beliefs: [{ id: 'fear', description: 'Fears Owen hurt Adrian; a belief, not witnessed violence.' }], concealedFactIds: ['own-observations'], motivation: 'Protect her son from another feared sudden loss.' },
        { suspectId: owen, knownFacts: [{ id: 'own-observations', description: 'Knows his own work, earlier visit and unauthorized maintenance-fund payment.' }], beliefs: [{ id: 'judgment', description: 'Expects another lecture about the money.' }], concealedFactIds: ['own-observations'], motivation: 'Keep independence and avoid admitting unauthorized spending.' },
      ],
      rules: [{ id: 'present-pump-payment', suspectId: owen, coreId: 'owen-admission', kind: 'evidence', evidenceId: 'repayment-demand', essential: true,
        label: 'Ask Owen to explain the maintenance-fund payment and the argument.',
        aliases: ['Ask Owen to explain the maintenance-fund payment and the argument.', 'Explain the maintenance fund payment and the argument.'],
        gate: { alternatives: [[received(owen, 'owen-initial'), { kind: 'inspected', evidenceId: 'pump-worksheet' }, { kind: 'inspected', evidenceId: 'repayment-demand' }]] },
        transition: { accountId: 'owen-explanation', fromVersion: 'o0', toVersion: 'o1' } }],
      facets: [
        facet('mara-source', mara, 'mara-initial', null, 'source', 'Are you saying you watched him the whole time?', ['Are you saying you watched him the whole time?']),
        facet('owen-work', owen, 'owen-initial', 'o0', 'meaning', 'What do you mean by work?', ['What do you mean by work?', 'What work?', 'Explain your earlier work account.'], 'owen-work-correction'),
        facet('owen-reason', owen, 'owen-admission', 'o1', 'meaning', 'Why hide a repair that helped someone?', ['Why hide a repair that helped someone?', 'Why did you hide the repair?']),
      ],
    },
  },
};
