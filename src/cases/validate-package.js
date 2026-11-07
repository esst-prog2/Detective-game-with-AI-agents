import { TOPICS } from '../data/case.js';
import { validateSpatialData } from '../game.js';
import { validateDialogueCatalog, freezeCatalog, previewSubjects } from '../data/dialogue-catalog.js';
import { validateAuthoredPerformances } from '../authored-performances.js';

export const isCaseId = (id) => typeof id === 'string' && id.length <= 64 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
const text = (value) => typeof value === 'string' && value.trim().length > 0;
const keysAre = (value, keys) => value && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
function plainData(value, ancestors = new Set()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (!value || typeof value !== 'object' || ancestors.has(value)
    || (!Array.isArray(value) && ![Object.prototype, null].includes(Object.getPrototypeOf(value)))) return false;
  if (Array.isArray(value) && (Object.keys(value).length !== value.length || Array.from({ length: value.length }, (_, i) => i).some((i) => !Object.hasOwn(value, i)))) return false;
  ancestors.add(value);
  const valid = Object.values(value).every((item) => plainData(item, ancestors));
  ancestors.delete(value);
  return valid;
}

// Preview incompleteness is declared explicitly; no executable loader or validation bypass.
// Errors are intentionally fixed; authoring diagnostics never cross HTTP.
export function validateCasePackage(definition) {
  try {
    if (!plainData(definition) || !definition || Object.keys(definition).some((key) => !['id', 'version', 'mode', 'publicMetadata', 'data', 'catalog', 'solution', 'privateCanon', 'previewProfile'].includes(key))
      || !isCaseId(definition.id) || !isCaseId(definition.version) || !['full', 'preview'].includes(definition.mode)
      || !keysAre(definition.publicMetadata, ['id', 'title', 'mode'])
      || definition.publicMetadata.id !== definition.id || definition.publicMetadata.mode !== definition.mode
      || !text(definition.publicMetadata.title) || [...definition.publicMetadata.title].length > 200) return ['Invalid case package.'];
    const { data, catalog, solution } = definition;
    const preview = definition.mode === 'preview';
    const subjects = preview ? previewSubjects(definition.previewProfile, data) : null;
    if (preview ? !subjects || Object.hasOwn(definition, 'solution') || Object.hasOwn(definition, 'privateCanon')
      || Object.keys(data).some((key) => !['title', 'victim', 'rooms', 'locations', 'initialLocationId', 'suspects', 'evidence'].includes(key))
      || data.suspects.some((npc) => Object.keys(npc.responses ?? {}).some((topic) => !subjects.get(npc.id)?.includes(topic)))
      : Object.hasOwn(definition, 'previewProfile') || !keysAre(solution, ['murdererId'])
        || !data.suspects.some(({ id }) => id === solution.murdererId) || data.murdererId !== solution.murdererId) return ['Invalid case profile.'];
    if (validateSpatialData(data).length || !text(data.title) || data.title !== definition.publicMetadata.title
      || !text(data.victim?.name) || !text(data.victim?.description) || !data.suspects.length
      || data.evidence.some((item) => !text(item.name) || !text(item.description))
      || data.suspects.some((npc) => !['name', 'personality', 'relationshipToVictim', 'motive'].every((field) => text(npc[field]))
        || !Array.isArray(npc.privateFacts) || !npc.privateFacts.every(text) || !npc.permittedLie
        || (subjects?.get(npc.id) ?? TOPICS).some((topic) => !text(npc.responses?.[topic]?.approvedContent) || !text(npc.responses?.[topic]?.fallbackText)))) return ['Invalid case data.'];
    if (catalog.schemaVersion === 2 && catalog.policy?.caseId !== definition.id) return ['Invalid disclosure case identity.'];
    if (validateDialogueCatalog(catalog, data, preview ? definition.previewProfile : null).length || validateAuthoredPerformances(catalog).length
      || catalog.profiles.length !== data.suspects.length
      || data.suspects.some((npc) => !catalog.profiles.some((p) => p.suspectId === npc.id))) return ['Invalid case dialogue.'];
    // The raw engine's historical Ashcroft ending guard must not attach to another package.
    if (definition.id !== 'ashcroft' && catalog.version === 'ashcroft-dialogue-v3') return ['Reserved dialogue identity.'];
    return [];
  } catch { return ['Invalid case package.']; }
}

export function snapshotCasePackage(definition) {
  if (validateCasePackage(definition).length) throw new Error('Invalid case package.');
  // Cloning also rejects executable functions, rather than sharing mutable authoring input.
  const snapshot = structuredClone(definition);
  return freezeCatalog(snapshot);
}
