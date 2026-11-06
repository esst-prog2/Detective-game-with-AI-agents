import { caseData } from '../data/case.js';
import { caseDialogueCatalog } from '../data/dialogue-catalog.js';

// Adapter only: the original authored records and import paths stay unchanged.
export const ashcroft = {
  id: 'ashcroft', version: 'ashcroft-v1', mode: 'full',
  publicMetadata: { id: 'ashcroft', title: caseData.title, mode: 'full' },
  data: caseData, catalog: caseDialogueCatalog,
  solution: { murdererId: caseData.murdererId },
};
