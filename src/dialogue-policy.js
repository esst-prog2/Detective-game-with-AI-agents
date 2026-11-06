import { TOPICS } from './data/case.js';
import { normalizeQuestion } from './question-classifier.js';

const slug = (value) => typeof value === 'string' && value.length <= 64 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const text = (value, max = 1200) => typeof value === 'string' && value.trim().length > 0 && [...value].length <= max;
const exact = (value, required, optional = []) => value && typeof value === 'object' && !Array.isArray(value)
  && required.every((key) => Object.hasOwn(value, key)) && Object.keys(value).every((key) => [...required, ...optional].includes(key));
const bounded = (rows, max, min = 0) => Array.isArray(rows) && rows.length >= min && rows.length <= max
  && Array.from({ length: rows.length }, (_, i) => i).every((i) => Object.hasOwn(rows, i));
const unique = (rows, key = 'id') => new Set(rows.map((row) => row[key])).size === rows.length;
const requireValid = (value) => { if (!value) throw new Error('Invalid disclosure policy.'); };
const accountForCore = (catalog, coreId) => catalog.policy.accounts.find((account) => account.versions.some((version) => version.coreId === coreId));
const currentCore = (account, state) => account.versions.find((version) => version.id === state.policy.accounts.get(account.id))?.coreId;
const gateMet = (gate, inspected, received) => gate.alternatives.some((branch) => branch.every((ref) => ref.kind === 'inspected' ? inspected.has(ref.evidenceId) : received.has(ref.coreId)));
export const normalizePolicyAlias = (value) => normalizeQuestion(value).replace(/\?/g, ' ').trim().replace(/\s+/g, ' ');

// Closed authoring schema. No rule evaluates text, mood, private truth or executable code.
export function validateDisclosurePolicy(catalog, data) {
  try {
    const policy = catalog.policy;
    requireValid(exact(policy, ['caseId', 'accounts', 'rules', 'epistemics'], ['facets']) && slug(policy.caseId)
      && bounded(policy.accounts, 16) && bounded(policy.rules, 64) && bounded(policy.epistemics, 64, 1)
      && bounded(catalog.cores, 256, 1) && bounded(catalog.profiles, 64, 1)
      && Array.isArray(catalog.evidence) && catalog.evidence.length === 0 && Array.isArray(catalog.comparisons) && catalog.comparisons.length === 0);
    requireValid(unique(policy.accounts) && unique(policy.rules) && unique(policy.epistemics, 'suspectId') && unique(catalog.cores));
    const speakers = new Set(data.suspects.map((npc) => npc.id));
    const evidence = new Set(data.evidence.map((item) => item.id));
    const cores = new Map(catalog.cores.map((core) => [core.id, core]));
    const epistemics = new Map();
    for (const row of policy.epistemics) {
      requireValid(exact(row, ['suspectId', 'knownFacts', 'beliefs', 'concealedFactIds', 'motivation']) && speakers.has(row.suspectId)
        && bounded(row.knownFacts, 64) && bounded(row.beliefs, 64) && bounded(row.concealedFactIds, 64) && text(row.motivation));
      for (const facts of [row.knownFacts, row.beliefs]) requireValid(unique(facts)
        && facts.every((fact) => exact(fact, ['id', 'description']) && slug(fact.id) && text(fact.description)));
      requireValid(new Set(row.concealedFactIds).size === row.concealedFactIds.length && row.concealedFactIds.every((id) => row.knownFacts.some((fact) => fact.id === id)));
      epistemics.set(row.suspectId, row);
    }
    requireValid(epistemics.size === speakers.size && catalog.profiles.length === speakers.size);
    for (const core of cores.values()) {
      requireValid(exact(core, ['id', 'suspectId', 'topic', 'source', 'approvedContent', 'variants', 'role', 'stance', 'basis'], ['deliveries', 'suggestionPriority'])
        && ['base', 'account', 'disclosure', ...(policy.facets ? ['facet'] : [])].includes(core.role) && ['truth', 'belief', 'lie', 'omission'].includes(core.stance)
        && epistemics.has(core.suspectId) && bounded(core.basis, 16));
      requireValid(core.basis.every((ref) => exact(ref, ['kind', 'id']) && ['known', 'belief'].includes(ref.kind)
        && epistemics.get(core.suspectId)[ref.kind === 'known' ? 'knownFacts' : 'beliefs'].some((fact) => fact.id === ref.id)));
    }
    const boundCores = new Set();
    for (const account of policy.accounts) {
      requireValid(exact(account, ['id', 'suspectId', 'initialVersion', 'versions']) && slug(account.id) && speakers.has(account.suspectId)
        && slug(account.initialVersion) && bounded(account.versions, 16, 2) && unique(account.versions));
      const initial = account.versions.find((version) => version.id === account.initialVersion);
      requireValid(initial && cores.get(initial.coreId)?.role === 'base');
      for (const version of account.versions) {
        const core = cores.get(version.coreId);
        requireValid(exact(version, ['id', 'coreId']) && slug(version.id) && core?.suspectId === account.suspectId
          && core.topic === cores.get(initial.coreId).topic && !boundCores.has(core.id)
          && core.role === (version.id === account.initialVersion ? 'base' : 'account'));
        boundCores.add(core.id);
      }
    }
    const aliases = new Set();
    const reserved = new Set(['ask-hiding', 'clarify-last', ...TOPICS.map((topic) => `ask-${topic.replaceAll('_', '-')}`)]);
    const referenced = new Set();
    for (const rule of policy.rules) {
      requireValid(exact(rule, ['id', 'suspectId', 'coreId', 'kind', 'label', 'aliases', 'gate'], policy.facets ? ['transition', 'evidenceId', 'essential'] : ['transition', 'evidenceId'])
        && slug(rule.id) && !reserved.has(rule.id) && cores.get(rule.coreId)?.suspectId === rule.suspectId
        && ['evidence', 'contradiction', 'topic'].includes(rule.kind) && text(rule.label, 1000) && bounded(rule.aliases, 8, 1));
      requireValid((rule.kind === 'evidence' && evidence.has(rule.evidenceId)) || (rule.kind !== 'evidence' && !Object.hasOwn(rule, 'evidenceId')));
      for (const alias of rule.aliases) {
        const key = `${rule.suspectId}:${normalizePolicyAlias(alias)}`;
        requireValid(text(alias, 100) && normalizePolicyAlias(alias).length > 0 && !aliases.has(key)); aliases.add(key);
      }
      requireValid(exact(rule.gate, ['alternatives']) && bounded(rule.gate.alternatives, 2, 1));
      for (const branch of rule.gate.alternatives) {
        requireValid(bounded(branch, 16, 1));
        for (const ref of branch) requireValid(ref.kind === 'inspected'
          ? exact(ref, ['kind', 'evidenceId']) && evidence.has(ref.evidenceId)
          : exact(ref, ['kind', 'speakerId', 'coreId']) && ref.kind === 'received' && cores.get(ref.coreId)?.suspectId === ref.speakerId && ref.coreId !== rule.coreId);
      }
      if (Object.hasOwn(rule, 'transition')) {
        const transition = rule.transition;
        requireValid(exact(transition, ['accountId', 'fromVersion', 'toVersion']));
        const account = policy.accounts.find((item) => item.id === transition.accountId);
        requireValid(account?.suspectId === rule.suspectId
          && transition.fromVersion !== transition.toVersion && account.versions.some((version) => version.id === transition.fromVersion)
          && account.versions.some((version) => version.id === transition.toVersion && version.coreId === rule.coreId) && cores.get(rule.coreId).role === 'account');
      } else requireValid(cores.get(rule.coreId).role === 'disclosure');
      referenced.add(rule.coreId);
    }
    if (Object.hasOwn(policy, 'facets')) {
      requireValid(bounded(policy.facets, 128) && unique(policy.facets));
      const mappings = new Set(), defaults = new Set(), responseOwners = new Map();
      for (const facet of policy.facets) {
        requireValid(exact(facet, ['id', 'suspectId', 'primaryStatement', 'accountVersion', 'type', 'coreId', 'label', 'aliases', 'default', 'gate'], ['historicalCoreId'])
          && slug(facet.id) && !reserved.has(facet.id) && !policy.rules.some((rule) => rule.id === facet.id)
          && ['meaning', 'identity', 'source', 'time', 'certainty'].includes(facet.type) && typeof facet.default === 'boolean'
          && text(facet.label, 1000) && bounded(facet.aliases, 8, 1));
        const primary = cores.get(facet.primaryStatement), response = cores.get(facet.coreId);
        requireValid(primary && ['base', 'account', 'disclosure'].includes(primary.role) && primary.suspectId === facet.suspectId
          && response?.role === 'facet' && response.suspectId === facet.suspectId && response.topic === primary.topic);
        const account = accountForCore(catalog, primary.id);
        requireValid(facet.accountVersion === (account?.versions.find((version) => version.coreId === primary.id)?.id ?? null));
        const mapping = `${facet.primaryStatement}:${facet.type}`;
        requireValid(!mappings.has(mapping)); mappings.add(mapping);
        if (facet.default) { requireValid(!defaults.has(primary.id)); defaults.add(primary.id); }
        for (const coreId of [facet.coreId, ...(Object.hasOwn(facet, 'historicalCoreId') ? [facet.historicalCoreId] : [])]) {
          const core = cores.get(coreId);
          requireValid(core?.role === 'facet' && core.suspectId === primary.suspectId && core.topic === primary.topic
            && (!responseOwners.has(coreId) || responseOwners.get(coreId) === primary.id));
          responseOwners.set(coreId, primary.id); referenced.add(coreId);
        }
        if (Object.hasOwn(facet, 'historicalCoreId')) requireValid(account && facet.historicalCoreId !== facet.coreId);
        for (const alias of facet.aliases) {
          const key = `${facet.suspectId}:${normalizePolicyAlias(alias)}`;
          requireValid(text(alias, 100) && normalizePolicyAlias(alias) && !aliases.has(key)); aliases.add(key);
        }
        requireValid(exact(facet.gate, ['alternatives']) && bounded(facet.gate.alternatives, 2, 1));
        for (const branch of facet.gate.alternatives) {
          requireValid(bounded(branch, 16, 1));
          for (const ref of branch) requireValid(ref?.kind === 'inspected'
            ? exact(ref, ['kind', 'evidenceId']) && evidence.has(ref.evidenceId)
            : exact(ref, ['kind', 'speakerId', 'coreId']) && ref.kind === 'received'
              && cores.get(ref.coreId)?.suspectId === ref.speakerId && ![facet.coreId, facet.historicalCoreId].includes(ref.coreId));
        }
      }
      for (const speaker of speakers) {
        requireValid(policy.rules.filter((rule) => rule.suspectId === speaker).every((rule) => !Object.hasOwn(rule, 'essential') || typeof rule.essential === 'boolean'));
        // Conservative upper bound: no reachable state can exceed four first-time essentials.
        requireValid(policy.rules.filter((rule) => rule.suspectId === speaker && rule.essential).length
          + catalog.cores.filter((core) => core.suspectId === speaker && core.role === 'base' && core.suggestionPriority === 1).length <= 4);
      }
    }
    requireValid(catalog.cores.every((core) => core.role === 'base' || (referenced.has(core.id) && (core.role !== 'account' || boundCores.has(core.id)))));
    // Graph edges must be forward-only. Every version must also be reachable from initial.
    for (const account of policy.accounts) {
      const edges = policy.rules.filter((rule) => rule.transition?.accountId === account.id).map((rule) => rule.transition);
      const completed = new Set();
      const visit = (version, path = new Set()) => {
        requireValid(!path.has(version));
        if (completed.has(version)) return;
        for (const edge of edges.filter((edge) => edge.fromVersion === version)) visit(edge.toVersion, new Set([...path, version]));
        completed.add(version);
      };
      for (const version of account.versions) visit(version.id);
    }
    // Static over-approximation assumes all local inspections and base testimony available.
    // It rejects closed gate cycles/unreachable revisions without simulating player dialogue.
    const available = new Set(catalog.cores.filter((core) => core.role === 'base').map((core) => core.id));
    let previous;
    do {
      previous = available.size;
      for (const rule of policy.rules) {
        const account = policy.accounts.find((item) => item.id === rule.transition?.accountId);
        const source = account?.versions.find((version) => version.id === rule.transition.fromVersion);
        if ((!source || available.has(source.coreId)) && gateMet(rule.gate, evidence, available)) available.add(rule.coreId);
      }
      for (const facet of policy.facets ?? []) if (available.has(facet.primaryStatement) && gateMet(facet.gate, evidence, available)) {
        available.add(facet.coreId);
        if (facet.historicalCoreId) available.add(facet.historicalCoreId);
      }
    } while (previous !== available.size);
    requireValid(catalog.cores.every((core) => available.has(core.id)));
    return [];
  } catch { return ['Invalid disclosure policy.']; }
}

export function initialPolicyState(catalog) {
  return { caseId: catalog.policy.caseId, revision: 0,
    accounts: new Map(catalog.policy.accounts.map((account) => [account.id, account.initialVersion])), receipts: new Map(),
    ...(catalog.policy.facets ? { primaryTargets: new Map() } : {}) };
}

export function currentPolicyCore(catalog, state, base) {
  const account = accountForCore(catalog, base.id);
  return account ? catalog.cores.find((core) => core.id === currentCore(account, state)) : base;
}

function ruleEligible(catalog, state, rule) {
  if (state.policy?.caseId !== catalog.policy.caseId || (rule.evidenceId && !state.inspected.has(rule.evidenceId))
    || !gateMet(rule.gate, state.inspected, state.policy.receipts)) return false;
  if (!rule.transition) return true;
  return state.policy.accounts.get(rule.transition.accountId) === rule.transition.fromVersion || state.policy.receipts.has(rule.coreId);
}

export function policyPlan(catalog, state, rule) {
  if (!ruleEligible(catalog, state, rule)) return null;
  let coreId = rule.coreId;
  if (rule.transition && state.policy.accounts.get(rule.transition.accountId) !== rule.transition.fromVersion) {
    coreId = currentCore(catalog.policy.accounts.find((account) => account.id === rule.transition.accountId), state);
  }
  return { id: rule.id, label: rule.label, kind: rule.kind, ruleId: rule.id, coreId,
    intent: rule.kind === 'evidence' ? 'present_evidence' : rule.kind === 'contradiction' ? 'compare_testimony' : 'topic',
    ...(rule.evidenceId ? { evidenceId: rule.evidenceId } : {}) };
}

export function policyCoreAllowed(catalog, state, suspectId, coreId, ruleId) {
  if (state.policy?.caseId !== catalog.policy.caseId) return false;
  const core = catalog.cores.find((item) => item.id === coreId && item.suspectId === suspectId);
  if (!core) return false;
  if (ruleId) {
    const facet = catalog.policy.facets?.find((item) => item.id === ruleId && item.suspectId === suspectId);
    if (facet) return facetPlan(catalog, state, facet)?.coreId === coreId;
    const rule = catalog.policy.rules.find((item) => item.id === ruleId && item.suspectId === suspectId);
    return !!rule && policyPlan(catalog, state, rule)?.coreId === coreId;
  }
  const account = accountForCore(catalog, coreId);
  if (account) return currentCore(account, state) === coreId;
  if (core.role === 'base') return true;
  return core.role === 'disclosure' && state.policy.receipts.has(coreId)
    && catalog.policy.rules.some((rule) => rule.coreId === coreId && ruleEligible(catalog, state, rule));
}

export function stagePolicy(catalog, next, plan, suspectId) {
  if (!plan.coreId) return;
  const rule = catalog.policy.rules.find((item) => item.id === plan.ruleId);
  let changed = false;
  if (next.policy.primaryTargets) {
    const facet = catalog.policy.facets.find((item) => item.id === plan.ruleId);
    const primaryStatement = facet?.primaryStatement ?? plan.coreId;
    const previous = next.policy.primaryTargets.get(suspectId);
    if (!facet || previous?.primaryStatement !== primaryStatement) {
      const account = accountForCore(catalog, primaryStatement);
      next.policy.primaryTargets.set(suspectId, { speaker: suspectId, primaryStatement,
        accountVersion: account?.versions.find((version) => version.coreId === primaryStatement)?.id ?? null,
        originTurn: facet ? next.policy.receipts.get(primaryStatement).firstCommittedTurn : next.turnId });
      changed = true;
    }
  }
  if (rule?.transition && next.policy.accounts.get(rule.transition.accountId) === rule.transition.fromVersion) {
    next.policy.accounts.set(rule.transition.accountId, rule.transition.toVersion); changed = true;
  }
  if (!next.policy.receipts.has(plan.coreId)) {
    const account = accountForCore(catalog, plan.coreId);
    next.policy.receipts.set(plan.coreId, { speakerId: suspectId, statementId: plan.coreId,
      accountKey: account?.id ?? null, accountVersion: account ? next.policy.accounts.get(account.id) : null, firstCommittedTurn: next.turnId });
    changed = true;
  }
  if (changed) next.policy.revision += 1;
}

export function policyCacheKey(state, caseContext, key) {
  return state.policy ? `${caseContext.id}:${caseContext.version}:${state.policy.revision}:${JSON.stringify([...state.policy.accounts])}:${key}` : key;
}

// A facet never makes its primary newly known and never changes an account.
export function facetPlan(catalog, state, facet) {
  if (state.policy?.caseId !== catalog.policy.caseId) return null;
  const receipt = state.policy.receipts.get(facet.primaryStatement);
  if (receipt?.speakerId !== facet.suspectId || receipt.accountVersion !== facet.accountVersion
    || !gateMet(facet.gate, state.inspected, state.policy.receipts)) return null;
  const primary = catalog.cores.find((core) => core.id === facet.primaryStatement);
  const account = accountForCore(catalog, primary.id);
  const historical = account && currentCore(account, state) !== primary.id;
  if (historical && (!facet.historicalCoreId || !state.policy.receipts.has(currentCore(account, state)))) return null;
  if (!historical && !policyCoreAllowed(catalog, state, facet.suspectId, primary.id)) return null;
  return { id: facet.id, label: facet.label, kind: 'clarify', intent: 'clarify', ruleId: facet.id,
    coreId: historical ? facet.historicalCoreId : facet.coreId };
}

const facetTypes = new Map([
  ['what do you mean', 'default'], ['what do you mean by that', 'default'], ['clarify', 'default'], ['explain that', 'default'],
  ['who do you mean', 'identity'], ['how do you know', 'source'],
  ['what exactly did you hear', 'source'], ['did you see it or hear it', 'source'],
  ['when did that happen', 'time'], ['when was that', 'time'], ['are you certain', 'certainty'], ['how certain are you', 'certainty'],
]);
const detailGuidance = (text) => ({ coreId: null, guidance: text });
function unavailableFacet(catalog, state, facet) {
  if (!state.policy.receipts.has(facet.primaryStatement)) return detailGuidance('Ask me about the account first. Naming or quoting a statement does not mean I have given it to you.');
  const account = accountForCore(catalog, facet.primaryStatement);
  if (account && currentCore(account, state) !== facet.primaryStatement) return detailGuidance('That earlier account has been superseded. Ask about my current account or choose an available correction.');
  return detailGuidance('I cannot add that detail from what we have discussed. Ask about my current account or inspect an available item first.');
}
export function resolveFacet(catalog, state, suspectId, question) {
  if (!catalog.policy?.facets) return undefined;
  const normalized = normalizePolicyAlias(question);
  const matches = catalog.policy.facets.filter((facet) => facet.suspectId === suspectId
    && facet.aliases.some((alias) => normalizePolicyAlias(alias) === normalized));
  const type = facetTypes.get(normalized);
  if (!type && matches.length === 1) return facetPlan(catalog, state, matches[0]) ?? unavailableFacet(catalog, state, matches[0]);
  if (type) {
    const target = state.policy.primaryTargets.get(suspectId);
    if (!target) return detailGuidance('Which part would you like me to explain? Ask me about an account first.');
    const facets = catalog.policy.facets.filter((facet) => facet.suspectId === suspectId && facet.primaryStatement === target.primaryStatement
      && (type === 'default' ? facet.default : facet.type === type));
    if (!facets.length) return detailGuidance('I have no further detail of that kind for this account. Please identify another account or ask a different question.');
    return facetPlan(catalog, state, facets[0]) ?? unavailableFacet(catalog, state, facets[0]);
  }
  if (catalog.policy.facets.some((facet) => facet.suspectId !== suspectId && facet.aliases.some((alias) => normalizePolicyAlias(alias) === normalized))) {
    return detailGuidance('Ask each witness about their own account. Please identify something I have told you.');
  }
  // Unsupported references do not fall through to a broad topic or a model interpretation.
  if (/\b(explain|clarify|earlier|previous|statement|you said|you mean|how do you know|which bell|what exactly|when did that|certain|source|detail)\b/.test(normalized)
    || /["“”]/.test(question) || /(?:^|\s)['‘].+['’](?=\s|[?.!,]|$)/.test(question)
    || /\b[a-z0-9]+(?:-[a-z0-9]+)+\b|\b[a-z0-9-]+:[a-z0-9-]+\b/i.test(question)
    || /\b(and|or)\b/.test(normalized) && /\b(who|when|how|which)\b/.test(normalized)) {
    return detailGuidance('Please ask one question about an account I have given you, or choose an available follow-up. I cannot identify that reference.');
  }
  return undefined;
}

export function prioritizeFacetOptions(catalog, state, suspectId, options) {
  const npc = state.npcs.get(suspectId), target = state.policy.primaryTargets.get(suspectId);
  const facets = (catalog.policy.facets ?? []).filter((facet) => facet.suspectId === suspectId && facet.primaryStatement === target?.primaryStatement)
    .sort((a, b) => Number(b.default) - Number(a.default) || a.id.localeCompare(b.id))
    .map((facet) => facetPlan(catalog, state, facet)).filter(Boolean);
  const essential = options.filter((option) => !state.policy.receipts.has(option.coreId)
    && (catalog.policy.rules.some((rule) => rule.id === option.ruleId && rule.essential)
      || catalog.cores.some((core) => core.id === option.coreId && core.role === 'base' && core.suggestionPriority === 1)))
    .sort((a, b) => Number(!a.ruleId) - Number(!b.ruleId) || a.id.localeCompare(b.id));
  const contextual = facets.find((facet) => !state.policy.receipts.has(facet.coreId)) ?? facets[npc.deliveries % (facets.length || 1)];
  const reserved = [...essential, ...(contextual ? [contextual] : [])];
  const optional = options.filter((option) => !reserved.some((item) => item.id === option.id))
    .sort((a, b) => a.id.localeCompare(b.id));
  const offset = npc.deliveries % (optional.length || 1);
  return [...reserved, ...optional.slice(offset), ...optional.slice(0, offset)].slice(0, 6);
}
