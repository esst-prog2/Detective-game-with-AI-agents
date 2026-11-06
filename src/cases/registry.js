import { ashcroft } from './ashcroft.js';
import { isCaseId, snapshotCasePackage } from './validate-package.js';
import { createInvestigation } from '../game.js';

export function createCaseRegistry({ definitions = [ashcroft], publishedIds = definitions.map((item) => item.id), defaultCaseId = 'ashcroft' } = {}) {
  const packages = new Map();
  for (const input of definitions) {
    const definition = snapshotCasePackage(input);
    if (packages.has(definition.id)) throw new Error('Duplicate case identifier.');
    packages.set(definition.id, definition);
  }
  const published = new Set(publishedIds);
  if (published.size !== publishedIds.length || !published.has(defaultCaseId)
    || [...published].some((id) => !packages.has(id))) throw new Error('Invalid case publication.');
  function resolve(caseId = defaultCaseId) {
    return isCaseId(caseId) && published.has(caseId) ? packages.get(caseId) : null;
  }
  return Object.freeze({
    defaultCaseId,
    resolve,
    list: () => [...published].map((id) => {
      const { title, mode } = packages.get(id).publicMetadata;
      return { id, title, mode };
    }),
    createInvestigation(caseId = defaultCaseId, { performer = null, phraser = null } = {}) {
      const definition = resolve(caseId);
      if (!definition) throw new Error('Unavailable case.');
      return createInvestigation({ data: definition.data, dialogueCatalog: definition.catalog, performer, phraser,
        caseContext: { id: definition.id, version: definition.version } });
    },
  });
}

export const caseRegistry = createCaseRegistry();
