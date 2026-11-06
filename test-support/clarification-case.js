// Synthetic content only. No Greyhaven facts or production registration.
import { disclosureCase } from './disclosure-case.js';

export function clarificationCase(id = 'test-clarification') {
  const fixture = disclosureCase(id);
  fixture.catalog.version = 'test-clarification-v1';
  fixture.catalog.policy.facets = [];
  fixture.catalog.policy.rules[0].essential = true;
  fixture.catalog.cores.find((core) => core.id === 'test-keeper-alibi').suggestionPriority = 1;
  const received = (coreId, speakerId = 'test-keeper') => ({ kind: 'received', speakerId, coreId });
  const add = (id, primaryStatement, type, body, aliases, { defaultFacet = false, extra = [], historical = null } = {}) => {
    const primary = fixture.catalog.cores.find((core) => core.id === primaryStatement);
    const account = fixture.catalog.policy.accounts.find((row) => row.versions.some((version) => version.coreId === primaryStatement));
    const core = (coreId, text) => fixture.catalog.cores.push({ ...structuredClone(primary), id: coreId, role: 'facet',
      approvedContent: text, variants: [{ id: 'plain', prefix: '' }, { id: 'framed', prefix: 'Well, ' }] });
    core(`${id}-answer`, body);
    if (historical) core(`${id}-history`, historical);
    fixture.catalog.policy.facets.push({ id, suspectId: primary.suspectId, primaryStatement,
      accountVersion: account?.versions.find((version) => version.coreId === primaryStatement)?.id ?? null,
      type, coreId: `${id}-answer`, label: aliases[0], aliases, default: defaultFacet,
      gate: { alternatives: [[received(primaryStatement, primary.suspectId), ...extra]] },
      ...(historical ? { historicalCoreId: `${id}-history` } : {}) });
  };
  add('keeper-original-source', 'test-keeper-alibi', 'source',
    'That is my account of the pier. I am not adding another observation.', ['Explain your original pier account.'],
    { defaultFacet: true, historical: 'I gave you that pier account earlier. I have corrected it: I saw the visit, not what happened inside.' });
  add('keeper-original-time', 'test-keeper-alibi', 'time',
    'I cannot give an exact minute for that account.', ['Time of your original account?']);
  add('keeper-current-source', 'keeper-revised-visit', 'source',
    'I saw the visitor cross the store threshold from the pier. I could not see inside.', ['How did you observe the visit?'], { defaultFacet: true });
  add('keeper-current-identity', 'keeper-revised-visit', 'identity',
    'I recognized the visitor by the yellow raincoat. I did not identify anyone inside.', ['Who crossed the threshold?']);
  add('keeper-current-meaning', 'keeper-revised-visit', 'meaning',
    'By entered, I mean crossing the threshold. I am not describing anything inside.', ['What do you mean by entered?']);
  add('keeper-current-certainty', 'keeper-revised-visit', 'certainty',
    'I recognized the coat at a distance. I cannot make that a perfect identification.', ['How sure are you about the coat?']);
  add('keeper-current-time', 'keeper-revised-visit', 'time',
    'The ticket clock read ten fifteen. That times the crossing, not anything inside.', ['When did you see the crossing?'],
    { extra: [{ kind: 'inspected', evidenceId: 'test-ledger' }] });
  add('visitor-sighting-source', 'test-visitor-sighting', 'source',
    'I saw the storekeeper wave through the open window. I did not enter the store.', ['Explain your window observation.'], { defaultFacet: true });
  return fixture;
}
