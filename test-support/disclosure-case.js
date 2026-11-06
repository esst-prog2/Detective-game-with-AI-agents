// Unrelated synthetic authoring fixture. Never production-registered or browser-imported.
import { secondCase } from './second-case.js';

export function disclosureCase(id = 'test-disclosure') {
  const fixture = secondCase({ id });
  fixture.catalog.version = 'test-disclosure-v2';
  fixture.catalog.schemaVersion = 2;
  const guardian = 'test-keeper', witness = 'test-visitor';
  const baseId = (speaker, topic) => `${speaker}-${topic.replaceAll('_', '-')}`;
  const lines = {
    [`${guardian}-alibi`]: 'The visitor stayed with me on the pier. There was no visit to the store.',
    [`${guardian}-motive`]: 'I feared the visitor had broken the seal.',
    [`${witness}-alibi`]: 'I was watching the store from the pier.',
    [`${witness}-sighting`]: 'I saw the storekeeper alive after that visit.',
    [`${witness}-crime-details`]: 'I heard the storekeeper speaking after that visit.',
    [`${witness}-evidence`]: 'I watched the visitor complete the repair.',
  };
  for (const core of fixture.catalog.cores) {
    core.role = 'base'; core.stance = core.id === `${guardian}-alibi` ? 'lie' : core.id === `${guardian}-motive` ? 'belief' : 'truth';
    core.basis = core.stance === 'belief' ? [{ kind: 'belief', id: 'seal-fear' }] : [{ kind: 'known', id: 'observation' }];
    core.approvedContent = lines[core.id] ?? core.approvedContent;
    fixture.data.suspects.find((npc) => npc.id === core.suspectId).responses[core.topic] = { approvedContent: core.approvedContent, fallbackText: core.approvedContent };
  }
  function addCore(coreId, topic, role, statement, stance = 'truth') {
    fixture.catalog.cores.push({ id: coreId, suspectId: guardian, topic, role, stance, basis: [{ kind: 'known', id: 'observation' }],
      source: { kind: 'authored-testimony', topic }, approvedContent: statement, variants: [{ id: 'plain', prefix: '' }, { id: 'framed', prefix: 'Well, ' }] });
  }
  addCore('keeper-revised-visit', 'alibi', 'account', 'I saw the visitor enter the store. I did not see what happened inside.');
  addCore('keeper-protection-reason', 'motive', 'account', 'I was afraid the visitor had broken the seal, so I hid the visit.');
  addCore('keeper-ledger-disclosure', 'evidence', 'disclosure', 'I put the duplicate ledger under the stair.');
  fixture.data.evidence.push({ id: 'test-ledger', name: 'Duplicate ledger', locationId: 'test-pier', description: 'A duplicate record with an incomplete entry.' });
  fixture.data.rooms.push({ id: 'test-office', name: 'the test office' }); fixture.data.locations.push('the test office');
  const inspected = (evidenceId) => ({ kind: 'inspected', evidenceId });
  const received = (speakerId, coreId) => ({ kind: 'received', speakerId, coreId });
  const common = [inspected('test-ticket'), received(guardian, baseId(guardian, 'alibi')), received(witness, baseId(witness, 'alibi'))];
  fixture.catalog.policy = {
    caseId: id,
    epistemics: [guardian, witness].map((suspectId) => ({ suspectId,
      knownFacts: [{ id: 'observation', description: suspectId === guardian ? 'The visitor entered the store; a ledger was concealed. DISCLOSURE_PRIVATE_CANARY' : 'The storekeeper was alive after the visit.' }],
      beliefs: [{ id: 'seal-fear', description: 'The keeper wrongly fears the visitor broke the seal.' }],
      concealedFactIds: suspectId === guardian ? ['observation'] : [], motivation: 'Avoid blame for a person one wishes to protect.' })),
    accounts: [
      { id: 'keeper-whereabouts', suspectId: guardian, initialVersion: 'v0', versions: [{ id: 'v0', coreId: `${guardian}-alibi` }, { id: 'v1', coreId: 'keeper-revised-visit' }] },
      { id: 'keeper-reason', suspectId: guardian, initialVersion: 'r0', versions: [{ id: 'r0', coreId: `${guardian}-motive` }, { id: 'r1', coreId: 'keeper-protection-reason' }] },
    ],
    rules: [
      { id: 'reconsider-visit', suspectId: guardian, coreId: 'keeper-revised-visit', kind: 'contradiction', label: 'Compare the visit with the later living account.',
        aliases: ['Compare the visit accounts.', 'Reconsider the visit.'], gate: { alternatives: [
          [...common, received(witness, `${witness}-sighting`)], [...common, received(witness, `${witness}-crime-details`)],
        ] }, transition: { accountId: 'keeper-whereabouts', fromVersion: 'v0', toVersion: 'v1' } },
      { id: 'explain-protection', suspectId: guardian, coreId: 'keeper-protection-reason', kind: 'contradiction', label: 'Ask why the visit was concealed, given the witnessed repair.',
        aliases: ['Why did you hide the visit?'], gate: { alternatives: [[received(guardian, 'keeper-revised-visit'), inspected('test-ticket'), received(witness, `${witness}-evidence`)]] },
        transition: { accountId: 'keeper-reason', fromVersion: 'r0', toVersion: 'r1' } },
      { id: 'present-ledger', suspectId: guardian, coreId: 'keeper-ledger-disclosure', kind: 'evidence', evidenceId: 'test-ledger', label: 'Ask about the inspected duplicate ledger.',
        aliases: ['Explain the ledger.'], gate: { alternatives: [[inspected('test-ledger'), received(guardian, 'keeper-revised-visit')]] } },
    ],
  };
  return fixture;
}
