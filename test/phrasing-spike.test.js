import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAttempts, summarize } from '../scripts/measure-real-model-phrasing.js';
import { caseData, TOPICS } from '../src/data/case.js';

test('spike schedule covers 18 pairs then 12 predetermined balanced repeats', () => {
  const attempts = buildAttempts();
  const keys = attempts.map(({ suspect, topic }) => `${suspect.id}:${topic}`);
  assert.equal(attempts.length, 30);
  assert.equal(new Set(keys.slice(0, 18)).size, 18);
  assert.deepEqual(keys.slice(18), [0, 1, 2, 3, 8, 9, 10, 11, 16, 17, 12, 13].map((i) => keys[i]));
  for (const suspect of caseData.suspects) assert.equal(attempts.filter((a) => a.suspect.id === suspect.id).length, 10);
  for (const topic of TOPICS) assert.equal(attempts.filter((a) => a.topic === topic).length, 5);
});

test('summary includes failures and timeouts in denominator and nearest-rank latencies', () => {
  const records = Array.from({ length: 30 }, (_, i) => ({
    latencyMs: (30 - i) * 100,
    outcome: i < 21 ? 'passed' : ['validation_failure', 'api_error', 'timeout'][i % 3],
  }));
  assert.deepEqual(summarize(records), {
    passed: 21, total: 30, passRatePercent: 70, p50LatencyMs: 1500, p95LatencyMs: 2900,
  });
  assert.equal(records[0].latencyMs, 3000);
  assert.equal(summarize(records.map((r) => ({ ...r, outcome: 'passed' }))).passRatePercent, 100);
  assert.equal(summarize(records.map((r) => ({ ...r, outcome: 'api_error' }))).passRatePercent, 0);
  assert.throws(() => summarize(records.slice(1)), /exactly 30/);
  assert.throws(() => summarize(records.map((r) => ({ ...r, latencyMs: NaN }))), /Invalid latency/);
});
