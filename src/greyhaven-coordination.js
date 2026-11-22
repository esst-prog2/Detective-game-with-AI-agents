import { strategies, witnesses } from './cases/greyhaven-reactions.js';
import { validatePerformance } from './npc-performance.js';
import { roleFailure, roleRejection } from './role-rejection.js';

const applicationDeadlines = Object.freeze({ directorMs: 1500, turnMs: 4000 });
export const demoRetestDeadlines = Object.freeze({ directorMs: 5000, turnMs: 10000 });

export function validatedStrategy(value) {
  if (!value || ![Object.prototype, null].includes(Object.getPrototypeOf(value))
    || Reflect.ownKeys(value).length !== 1) throw roleFailure('schema_mismatch', 'Invalid direction');
  const strategy = Object.getOwnPropertyDescriptor(value, 'strategy')?.value;
  if (!strategies.includes(strategy)) throw roleFailure('invalid_strategy', 'Invalid direction');
  return strategy;
}

export function rememberPilotAction(state, action) {
  state.pilot.actions = [...state.pilot.actions, action].slice(-4);
}

// Keep attempts outside the candidate transaction: even a discarded request spent its slot.
async function dispatch(role, context, parentSignal, deadline, limits, call) {
  const budget = deadline - performance.now();
  if (parentSignal.aborted) throw roleFailure('stale_turn');
  if (budget <= 0) throw roleFailure('provider_timeout');
  if (limits.has(role)) throw roleFailure('attempt_spent');
  limits.add(role);
  const controller = new AbortController();
  const canceled = Promise.withResolvers();
  function stop(category) {
    const failure = roleFailure(category);
    controller.abort(failure);
    canceled.reject(failure);
  }
  const onCancel = () => stop('stale_turn');
  parentSignal.addEventListener('abort', onCancel, { once: true });
  const timer = setTimeout(() => stop('provider_timeout'), budget);
  try {
    const value = await Promise.race([canceled.promise, call(structuredClone(context), { signal: controller.signal, timeout: Math.ceil(budget) })]);
    if (parentSignal.aborted) throw roleFailure('stale_turn');
    if (performance.now() >= deadline) throw roleFailure('provider_timeout');
    return value;
  } finally {
    parentSignal.removeEventListener('abort', onCancel);
    clearTimeout(timer);
  }
}

export async function stageCoordination({ state, turn, plan, suspectId, roles, attempts, signal }) {
  const previous = state.pilot;
  const next = turn.next.pilot;
  const origin = suspectId === 'owen-vale' && plan.ruleId === 'present-pump-payment'
    && plan.coreId === 'owen-admission' && state.policy.accounts.get('owen-explanation') === 'o0';
  const target = previous.direction && suspectId === 'mara-vale' && plan.ruleId === 'mara-source'
    && plan.coreId === 'mara-source-answer';
  const action = plan.intent === 'social_challenge' || plan.accusation ? 'challenge'
    : plan.intent === 'clarify' ? 'clarification' : origin ? 'presentation' : 'account';
  rememberPilotAction(turn.next, action);
  if (next.direction && (target || turn.next.turnId >= next.direction.expiresAfter)) next.direction = null;
  if (!origin && !target) return null;

  // Only the local retest runner supplies the trusted preset. HTTP and CLI use the application deadlines.
  const deadlines = roles.deadlines === demoRetestDeadlines ? demoRetestDeadlines : applicationDeadlines;
  const start = performance.now();
  const deadline = start + deadlines.turnMs;
  const role = origin ? 'Owen' : 'Mara';
  const event = { role, strategy: null, instruction: null, reaction: null, source: 'fallback' };
  next.events.push(event);
  try {
    const strategy = origin ? validatedStrategy(await dispatch('director', {
      speakers: ['Owen', 'Mara'], actions: previous.actions, strategies
    }, signal, start + deadlines.directorMs, attempts, roles.direct)) : previous.direction.strategy;
    event.strategy = strategy;
    const witness = witnesses[role];
    const { moves, instruction } = witness[strategy];
    event.instruction = instruction;
    const npc = state.npcs.get(suspectId);
    const memory = [];
    if (npc.discussed.size) memory.push('gave-account');
    if (npc.turns.some(t => t.intent === 'clarify')) memory.push('clarified');
    else if (npc.turns.some(t => t.coreId === plan.coreId)) memory.push('revisited');
    const performances = moves.map(([, line]) => ({ narration: null, dialogue: line + ' ' + turn.core.approvedContent }));
    const context = { speaker: role, goal: witness.goal, instruction, memory, style: witness.style,
      demeanor: turn.result.demeanor, intent: plan.intent, performances };
    const returned = await dispatch(role, context, signal, deadline, attempts, roles.act);
    let selected;
    try { selected = validatePerformance(returned, performances); }
    catch (error) {
      event.rejection = { stage: 'engine_revalidation', category: roleRejection(error).category };
      throw error;
    }
    event.reaction = moves[performances.findIndex(pair => pair.dialogue === selected.dialogue)][0];
    event.source = 'provider';
    if (origin && state.policy.receipts.has('mara-initial')) {
      next.direction = { strategy, expiresAfter: turn.next.turnId + 2 };
    }
    return { selected, performances };
  } catch (error) {
    event.rejection ??= roleRejection(error);
    return { selected: null };
  }
}
