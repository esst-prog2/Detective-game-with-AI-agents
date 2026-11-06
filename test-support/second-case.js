// Independent synthetic fixture, never imported by the production registry or browser.
import { TOPICS } from '../src/data/case.js';

export function secondCase({ id = 'test-harbor', sharedIds = false } = {}) {
  const cast = sharedIds ? ['alice-mercer', 'clara-voss'] : ['test-keeper', 'test-visitor'];
  const roomId = sharedIds ? 'study' : 'test-pier';
  const evidenceId = sharedIds ? 'silver-cufflink' : 'test-ticket';
  const statements = ['I stayed by the harbor gate.', 'I waited beside the pier.'];
  const profiles = cast.map((suspectId) => ({
    suspectId, traits: ['reserved'], speechStyle: { vocabulary: 'Plain.', rhythm: 'Short sentences.' },
    conversationalRules: ['Use authorized testimony.'], pressure: 'Reserved.', baseline: [2, 0, 0],
    deltas: { repeat: [0, 1, 0], baseless: [-1, 1, 1], evidence: [0, 0, 1], respect: [1, 0, 0] },
    framing: { calm: 'Well, ', repeat: 'As I said, ', pressure: 'Listen, ', clarify: 'To clarify, ' },
    mannerisms: [{ id: 'pause', text: 'The witness pauses.' }], social: 'Please ask a specific question.',
  }));
  const data = {
    title: 'Synthetic Harbor Test', victim: { name: 'Test Victim', description: 'A synthetic incident.' },
    rooms: [{ id: roomId, name: 'the test pier' }], locations: ['the test pier'], initialLocationId: roomId,
    murdererId: cast[0], privateCanary: 'MULTICASE_PRIVATE_CANARY',
    suspects: cast.map((suspectId, i) => ({
      id: suspectId, name: ['Test Keeper', 'Test Visitor'][i], locationId: roomId,
      personality: 'Reserved.', relationshipToVictim: 'Acquaintance.', motive: 'Private synthetic motive.',
      privateFacts: ['MULTICASE_PRIVATE_CANARY'], permittedLie: { topic: 'alibi', reason: 'Synthetic concealment.' },
      publicDossier: { role: 'Test witness', relationshipToVictim: 'Acquaintance.', background: 'Synthetic public introduction.', relationships: [] },
      responses: Object.fromEntries(TOPICS.map((topic) => [topic, { approvedContent: statements[i], fallbackText: statements[i] }])),
    })),
    evidence: [{ id: evidenceId, name: 'Test Ticket', description: 'A stamped harbor ticket.', locationId: roomId }],
  };
  return {
    id, version: 'test-v1', mode: 'full', publicMetadata: { id, title: data.title, mode: 'full' }, data,
    catalog: { version: 'test-dialogue-v1', profiles,
      cores: cast.flatMap((suspectId, i) => TOPICS.map((topic) => ({
        id: `${suspectId}-${topic.replaceAll('_', '-')}`, suspectId, topic, source: { kind: 'authored-testimony', topic },
        approvedContent: statements[i], variants: [{ id: 'plain', prefix: '' }, { id: 'framed', prefix: 'Well, ' }],
      }))), evidence: [], comparisons: [],
    },
    solution: { murdererId: cast[0] }, privateCanon: { source: 'MULTICASE_PRIVATE_CANARY' },
  };
}
