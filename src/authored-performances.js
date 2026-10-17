import { createHash } from 'node:crypto';
import { freezeCatalog } from './data/dialogue-catalog.js';
import { performancePair } from './npc-performance.js';

const speechWith = (prefix, core, profile) => `${prefix}${core ? core.approvedContent : profile.social}`;

// Validate every construction used below, including its longest possible authored narration.
export function validateAuthoredPerformances(catalog) {
  try {
    for (const p of catalog.profiles) {
      for (const delivery of [...(p.socialDeliveries ?? []), ...catalog.cores.filter((c) => c.suspectId === p.suspectId).flatMap((c) => c.deliveries ?? [])]) for (const narration of [null, ...p.mannerisms.map((m) => m.text)]) performancePair({ narration, dialogue: delivery.dialogue });
      const prefixes = ['', ...Object.values(p.framing), p.framing.pressure + p.framing.repeat];
      const bodies = [null, ...catalog.cores.filter((c) => c.suspectId === p.suspectId)];
      for (const c of bodies) {
        const allowedPrefixes = [...prefixes, ...(c?.variants.map((v) => v.prefix) ?? []),
          p.framing.clarify + (c?.variants[1].prefix ?? p.framing.calm),
          p.framing.repeat + (c?.variants[1].prefix ?? p.framing.calm)];
        for (const prefix of allowedPrefixes) for (const narration of [null, ...p.mannerisms.map((m) => m.text)]) {
          performancePair({ narration, dialogue: speechWith(prefix, c, p) });
        }
      }
    }
    return [];
  } catch { return ['Invalid authored performance bounds.']; }
}

function offerLegacyPerformances(catalog, state, suspectId, plan, turn) {
  const p = catalog.profiles.find((profile) => profile.suspectId === suspectId);
  const previous = state.npcs.get(suspectId);
  const { core, result } = turn;
  const repeated = core ? previous.discussed.has(core.id) : !!previous.repeats.get(`${plan.intent}:social:`);
  let prefix = core?.variants[1].prefix ?? p.framing.calm;
  if (plan.intent === 'clarify') prefix = p.framing.clarify + prefix;
  else if (repeated) prefix = ['uneasy', 'irritated'].includes(result.demeanor)
    ? p.framing.pressure + p.framing.repeat : p.framing.repeat;
  let alternative = speechWith(prefix, core, p);
  if (alternative === result.dialogue) alternative = speechWith(repeated ? p.framing.repeat + (core?.variants[1].prefix ?? p.framing.calm) : '', core, p);
  const gestures = p.mannerisms.filter((m) => !previous.gestures.includes(m.id));
  const entries = [];
  function add(dialogue, narration, gestureId = null) {
    if (!entries.some((e) => e.dialogue === dialogue && e.narration === narration)) entries.push({ dialogue, narration, gestureId });
  }
  const fallbackGesture = gestures.find((m) => m.text === result.narration);
  add(result.dialogue, result.narration, fallbackGesture?.id ?? null);
  add(result.dialogue, null);
  add(alternative, null);
  // Explicit pairs, not an arbitrary cross product. Mixing allowed fields can still be invalid.
  for (const [i, gesture] of gestures.entries()) {
    if (entries.length >= 4) break;
    add(i % 2 ? alternative : result.dialogue, gesture.text, gesture.id);
  }
  const performances = entries.map(({ narration, dialogue }) => performancePair({ narration, dialogue }));
  const style = [...`${p.speechStyle.vocabulary} ${p.speechStyle.rhythm} ${p.pressure}`].slice(0, 500).join('');
  const context = freezeCatalog({ style, demeanor: result.demeanor, intent: plan.intent, performances });
  const permissionKey = createHash('sha256').update(JSON.stringify(performances)).digest('hex');
  return { context, entries, cacheKey: `perform:${catalog.version}:${suspectId}:${plan.coreId ?? 'social'}:${plan.intent}:${result.demeanor}:${permissionKey}` };
}

export function applyPerformance(turn, previous, offer, pair) {
  const entry = offer.entries.find((e) => e.narration === pair.narration && e.dialogue === pair.dialogue);
  if (offer.refined) {
    turn.npc.recentDeliveries = [...previous.recentDeliveries, { speechId: entry.speechId, dialogue: entry.dialogue, opening: entry.opening, structure: entry.structure, demeanor: entry.demeanor, comparisonException: entry.comparisonException }].slice(-3);
    turn.npc.gestureCursor = entry.nextGestureCursor;
    turn.npc.speechOnly = entry.gestureId ? 0 : Math.min(2, previous.speechOnly + 1);
    turn.npc.gestureFamilies = entry.gestureId ? [...previous.gestureFamilies, entry.gestureFamily].slice(-2) : [...previous.gestureFamilies];
    turn.npc.comparisonReacted = previous.comparisonReacted || offer.comparison;
  }
  turn.npc.gestures = entry.gestureId ? [...previous.gestures, entry.gestureId].slice(-2) : [...previous.gestures];
  turn.result.text = pair.dialogue; turn.result.dialogue = pair.dialogue; turn.result.narration = pair.narration;
  turn.record.dialogue = pair.dialogue; turn.record.narration = pair.narration;
}

// The pool, not a model instruction, enforces current content and delivery eligibility.
export function offerPerformances(catalog, state, suspectId, plan, turn) {
  const profile = catalog.profiles.find((p) => p.suspectId === suspectId);
  const rows = turn.core?.deliveries ?? (!turn.core ? profile.socialDeliveries : null);
  if (!rows) return offerLegacyPerformances(catalog, state, suspectId, plan, turn);
  const previous = state.npcs.get(suspectId);
  const pressure = ['irritated', 'uneasy'].includes(turn.result.demeanor);
  let eligible = rows.filter((r) => r.mode === (pressure ? 'pressure' : 'ordinary'));
  if (plan.intent === 'clarify') eligible = [...rows.filter((r) => r.mode === 'clarify'), ...eligible];
  if (turn.core && previous.deliveries === 0 && plan.intent === 'topic' && !pressure) eligible = rows.filter((r) => r.mode === 'original');
  if (!eligible.length) eligible = rows.filter((r) => r.mode === 'original');
  // Exclude recent utterances oldest-first only when the finite eligible set is exhausted.
  const recent = previous.recentDeliveries;
  for (let start = 0; start <= recent.length; start++) {
    const fresh = eligible.filter((r) => !recent.slice(start).some((old) => old.dialogue === r.dialogue));
    if (fresh.length) { eligible = fresh; break; }
  }
  for (const key of ['opening', 'structure']) {
    for (let start = 0; start <= recent.length; start++) {
      const fresh = eligible.filter((r) => !recent.slice(start).some((old) => old[key] === r[key]));
      if (fresh.length) { eligible = fresh; break; }
    }
  }
  const changedMood = state.npcs.get(suspectId).turns.length && turn.result.demeanor !== (previous.recentDeliveries.at(-1)?.demeanor ?? 'neutral');
  const repeated = turn.core && previous.discussed.has(turn.core.id);
  const contextual = changedMood || repeated || ['clarify', 'present_evidence', 'compare_testimony'].includes(plan.intent);
  const comparisonException = plan.intent === 'compare_testimony' && !previous.comparisonReacted;
  const narrate = contextual && previous.deliveries > 0 && (previous.speechOnly >= 2 || comparisonException);
  const rotatedGestures = profile.mannerisms.slice(previous.gestureCursor).concat(profile.mannerisms.slice(0, previous.gestureCursor));
  let gestures = rotatedGestures.filter((m) => !previous.gestures.includes(m.id));
  const freshFamilies = gestures.filter((m) => !previous.gestureFamilies.includes(m.family ?? m.id));
  if (freshFamilies.length) gestures = freshFamilies;
  if (comparisonException && previous.speechOnly < 2) gestures = gestures.filter((m) => m.family === 'pause');
  const gesture = narrate ? gestures[0] : null;
  const entries = [];
  function add(row, m = null) { entries.push({ dialogue: row.dialogue, narration: m?.text ?? null, gestureId: m?.id ?? null, gestureFamily: m ? m.family ?? m.id : null, nextGestureCursor: m ? (profile.mannerisms.indexOf(m) + 1) % profile.mannerisms.length : previous.gestureCursor, speechId: row.id, opening: row.opening, structure: row.structure, demeanor: turn.result.demeanor, comparisonException: !!m && previous.speechOnly < 2 && comparisonException }); }
  // A warranted offline gesture and its speech-only counterpart are explicit pairs.
  if (gesture) add(eligible[0], gesture);
  add(eligible[0]);
  for (const row of eligible.slice(1)) { if (entries.length >= 4) break; add(row); }
  const performances = entries.map(({ narration, dialogue }) => performancePair({ narration, dialogue }));
  const style = [...`${profile.speechStyle.vocabulary} ${profile.speechStyle.rhythm} ${profile.pressure}`].slice(0, 500).join('');
  const context = freezeCatalog({ style, demeanor: turn.result.demeanor, intent: plan.intent, performances });
  const hash = createHash('sha256').update(JSON.stringify(performances)).digest('hex');
  return { context, entries, fallback: performances[0], refined: true, comparison: plan.intent === 'compare_testimony', cacheKey: `perform:${catalog.version}:${suspectId}:${plan.coreId ?? 'social'}:${plan.intent}:${turn.result.demeanor}:${hash}` };
}
