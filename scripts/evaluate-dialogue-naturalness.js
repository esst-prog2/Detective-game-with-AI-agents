import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createInvestigation } from '../src/game.js';
import { caseDialogueCatalog } from '../src/data/dialogue-catalog.js';

const baselineUrl = new URL('../openspec/changes/archive/2026-10-17-refine-npc-dialogue-naturalness/audit-baseline.json', import.meta.url);
const baseline = JSON.parse(await readFile(baselineUrl, 'utf8'));
const review = JSON.parse(await readFile(new URL('../test/fixtures/reviewed-testimony.json', import.meta.url), 'utf8'));
const words = (text) => text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/);
const counts = (values) => values.reduce((out, key) => { out[key] = (out[key] ?? 0) + 1; return out; }, {});
export function metrics(turns) {
  const openings = counts(turns.map((t) => words(t.dialogue).slice(0, 4).join(' ')));
  const gestures = counts(turns.filter((t) => t.narration).map((t) => t.narration));
  const fullResponses = counts(turns.map((t) => t.dialogue));
  const narrationIndices = turns.flatMap((t, i) => t.narration ? [i + 1] : []);
  return { openings, fullResponses, gestures, signatureCount: turns.filter((t) => /let me answer carefully|plainly put|allow me to be clear/.test(words(t.dialogue).join(' '))).length,
    maxOpening: Math.max(...Object.values(openings)), repeatedFullResponses: Object.values(fullResponses).reduce((sum, n) => sum + Math.max(0, n - 1), 0),
    consecutiveSameSpeech: turns.slice(1).filter((t, i) => t.dialogue === turns[i].dialogue).length,
    narrated: narrationIndices.length, narrationIndices, cacheHits: turns.filter((t) => t.cached).length };
}
export async function evaluate(mode) {
  const rows = [];
  for (const source of baseline.reports.filter((r) => r.mode === 'offline')) {
    const performer = mode === 'offline' ? null : { perform: async (context) => {
      if (mode === 'invalid') return { narration: null, dialogue: 'I invented a different account.' };
      if (mode === 'error') throw Error('Evaluation provider unavailable');
      if (mode === 'fake-last-pair') return context.performances.at(-1);
      if (mode === 'prefer-null') return context.performances.find((p) => p.narration === null);
      return context.performances.find((p) => mode === 'prefer-narration' && p.narration !== null) ?? context.performances[0];
    } };
    const game = createInvestigation({ performer });
    if (source.suspectId === 'clara-voss') await game.askSuspect('alice-mercer', 'Did you see anyone suspicious?');
    game.travelTo(source.suspectId === 'clara-voss' ? 'study' : 'garden');
    game.inspectPublicEvidence(source.suspectId === 'clara-voss' ? 'silver-cufflink' : 'muddy-footprints');
    game.travelTo({ 'alice-mercer': 'study', 'ben-carter': 'garden', 'clara-voss': 'library' }[source.suspectId]);
    const turns = [];
    for (const [index, input] of source.turns.entries()) {
      const result = await game.askSuspect(source.suspectId, input.question);
      if (result.kind !== 'answer') throw Error('Evaluation scenario lost authorization');
      const key = `${source.suspectId}-${result.topic.replaceAll('_', '-')}`;
      if (result.topic !== 'social' && !review[key]?.speeches.includes(result.dialogue)) throw Error('Unreviewed evaluation testimony');
      const npc = game.getDialogueDiagnostics().npcs.find((n) => n.id === source.suspectId);
      const selection = npc.recentDeliveries.at(-1);
      turns.push({ question: input.question, topic: result.topic, narration: result.narration, dialogue: result.dialogue, demeanor: result.demeanor, cached: result.cached,
        structure: selection.structure, comparisonException: selection.comparisonException, turn: index + 1 });
    }
    const m = metrics(turns);
    const gestureIds = turns.filter((t) => t.narration).map((t) => caseDialogueCatalog.profiles.find((p) => p.suspectId === source.suspectId).mannerisms.find((g) => g.text === t.narration));
    const familyCounts = counts(gestureIds.map((g) => g.family));
    const spacingViolations = m.narrationIndices.slice(1).filter((n, i) => n - m.narrationIndices[i] < 3 && !turns[n - 1].comparisonException);
    const structures = counts(turns.map((t) => t.structure));
    // Mechanical classification only. Actual structures and meaning are reviewed separately.
    const substantiveOpenings = turns.filter((t) => !/^(by that|what i mean|i mean|that is an|ask |please ask|what specifically|what do you want|a direct question|a straight question)/i.test(t.dialogue)).length;
    const gates = { signatures: m.signatureCount === 0, openings: m.maxOpening <= 4, structures: Object.keys(structures).length >= 3,
      substantiveOpenings: substantiveOpenings >= 10, immediateRepeat: m.consecutiveSameSpeech === 0, sparse: m.narrated <= 6 && !spacingViolations.length && (mode !== 'offline' || m.narrated >= 2),
      gestures: gestureIds.every((g, i) => !gestureIds.slice(Math.max(0, i - 2), i).some((old) => old.id === g.id)) && (m.narrated < 4 || Math.max(...Object.values(familyCounts)) <= m.narrated / 2) };
    rows.push({ mode, suspectId: source.suspectId, metrics: { ...m, structures, substantiveOpenings, familyCounts, spacingViolations }, gates, turns });
  }
  return rows;
}

export async function report(output = 'docs/dialogue-quality') {
  const modes = ['offline', 'fake-last-pair', 'first-pair', 'prefer-null', 'prefer-narration', 'invalid', 'error'];
  const runs = [];
  for (const mode of modes) runs.push(...await evaluate(mode));
  const contrasts = [];
  for (const suspectId of ['alice-mercer', 'ben-carter', 'clara-voss']) {
    const location = { 'alice-mercer': 'study', 'ben-carter': 'garden', 'clara-voss': 'library' }[suspectId];
    const calm = createInvestigation(); calm.travelTo(location);
    const neutral = await calm.askSuspect(suspectId, 'Where were you?');
    const clarification = await calm.askSuspect(suspectId, 'What do you mean by that?');
    const pressured = createInvestigation(); pressured.travelTo(location);
    await pressured.askSuspect(suspectId, 'You killed Victor.'); await pressured.askSuspect(suspectId, 'You killed Victor.');
    const pressure = await pressured.askSuspect(suspectId, 'Where were you?');
    const projected = (r) => ({ narration: r.narration, dialogue: r.dialogue, demeanor: r.demeanor });
    contrasts.push({ suspectId, setup: 'Independent neutral investigation versus two supported social challenges before the same alibi question.', neutral: projected(neutral), clarification: projected(clarification), pressure: projected(pressure) });
  }
  // Additional choice-path checks do not change the scored, baseline-matched text sequences.
  const choices = createInvestigation(); const choiceChecks = [];
  for (const choiceId of ['ask-alibi', 'clarify-last']) {
    const option = choices.getPublicView().dialogue.conversations[0].options.find((o) => o.id === choiceId);
    const reply = await choices.interact('alice-mercer', { choiceId });
    if (!option || reply.kind !== 'answer') throw Error('Expected authorized evaluation option');
    choiceChecks.push({ suspectId: 'alice-mercer', choiceId, label: option.label, topic: reply.topic, dialogue: reply.dialogue });
  }
  const sourceHashes = {};
  for (const name of ['src/game.js', 'src/dialogue-state.js', 'src/authored-performances.js', 'src/data/dialogue-catalog.js', 'src/data/authored-deliveries.js', 'src/data/case.js', 'src/npc-performance.js', 'test/fixtures/reviewed-testimony.json', 'scripts/evaluate-dialogue-naturalness.js']) sourceHashes[name] = createHash('sha256').update(await readFile(new URL(`../${name}`, import.meta.url))).digest('hex');
  await mkdir(output, { recursive: true });
  const payload = { baseline: `openspec${fileURLToPath(baselineUrl).split('openspec')[1].replaceAll('\\', '/')}`, sourceHashes, modes, matchedResponses: 108, additionalResponses: 270, contrasts, choiceChecks, runs };
  await writeFile(`${output}/after.json`, JSON.stringify(payload, null, 2) + '\n');
  const lines = ['# Executed dialogue naturalness evaluation', '', 'Mechanical metrics are separate from the editorial review and subjective assessment in editorial-review.md. No live provider was called.', '', '108 matched after-responses use the exact saved questions and setups in both baseline modes; 270 additional responses exercise five fake/failure modes. Separate contrast and choice probes are outside those counts. Structure counts are authoring labels, verified by the prose review rather than treated as semantic proof.', '', '| Mode | NPC | Signature before/after | Max opening before/after | Full repeats before/after | Narrated before/after | Max same gesture before/after | Structure labels | Gates |', '| --- | --- | --- | --- | --- | --- | --- | --- | --- |'];
  for (const row of runs) {
    const old = baseline.reports.find((r) => r.mode === row.mode && r.suspectId === row.suspectId);
    const b = old ? metrics(old.turns) : null;
    lines.push(`| ${row.mode} | ${row.suspectId} | ${b?.signatureCount ?? '-'} / ${row.metrics.signatureCount} | ${b?.maxOpening ?? '-'} / ${row.metrics.maxOpening} | ${b?.repeatedFullResponses ?? '-'} / ${row.metrics.repeatedFullResponses} | ${b?.narrated ?? '-'} / ${row.metrics.narrated} | ${b ? Math.max(0, ...Object.values(b.gestures)) : '-'} / ${Math.max(0, ...Object.values(row.metrics.gestures))} | ${Object.keys(row.metrics.structures).length} | ${Object.values(row.gates).every(Boolean) ? 'PASS' : Object.entries(row.gates).filter(([, v]) => !v).map(([k]) => k).join(', ')} |`);
  }
  lines.push('', '## Actual neutral / clarification / pressure contrasts', '', 'Independent setups use the same authorized alibi. These are executed utterances, not proposed examples.');
  for (const row of contrasts) lines.push('', `### ${row.suspectId}`, '', `Neutral: ${row.neutral.dialogue}`, '', `Clarification: ${row.clarification.dialogue}`, '', `Pressure (${row.pressure.demeanor}): ${row.pressure.dialogue}`);
  lines.push('', '## Actual matched before/after transcripts', '', 'Exact outputs follow, including silence; these are executed results, not planning examples. Setup and questions match audit-baseline.json.');
  for (const row of runs.filter((r) => ['offline', 'fake-last-pair'].includes(r.mode))) {
    const before = baseline.reports.find((r) => r.mode === row.mode && r.suspectId === row.suspectId);
    lines.push('', `### ${row.mode}: ${row.suspectId}`);
    for (const [i, turn] of row.turns.entries()) lines.push('', `**${i + 1}. ${turn.question}**`, '', `Before (${before.turns[i].demeanor}): ${before.turns[i].narration ?? '[no narration]'} | ${before.turns[i].dialogue}`, '', `After (${turn.demeanor}): ${turn.narration ?? '[no narration]'} | ${turn.dialogue}`);
  }
  await writeFile(`${output}/report.md`, lines.join('\n') + '\n');
  for (const row of runs) console.log(`${row.mode} ${row.suspectId}: ${JSON.stringify(row.metrics)} gates=${JSON.stringify(row.gates)}`);
  return runs;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const rows = await report();
  if (rows.some((r) => Object.values(r.gates).some((pass) => !pass))) process.exitCode = 1;
}
