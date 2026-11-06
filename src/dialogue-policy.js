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
    requireValid(exact(policy, ['caseId', 'accounts', 'rules', 'epistemics']) && slug(policy.caseId)
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
        && ['base', 'account', 'disclosure'].includes(core.role) && ['truth', 'belief', 'lie', 'omission'].includes(core.stance)
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
      requireValid(exact(rule, ['id', 'suspectId', 'coreId', 'kind', 'label', 'aliases', 'gate'], ['transition', 'evidenceId'])
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
    } while (previous !== available.size);
    requireValid(catalog.cores.every((core) => available.has(core.id)));
    return [];
  } catch { return ['Invalid disclosure policy.']; }
}

export function initialPolicyState(catalog) {
  return { caseId: catalog.policy.caseId, revision: 0,
    accounts: new Map(catalog.policy.accounts.map((account) => [account.id, account.initialVersion])), receipts: new Map() };
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
