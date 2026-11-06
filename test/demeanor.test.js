import test from 'node:test';
import assert from 'node:assert/strict';
import { demeanor } from '../src/dialogue-state.js';

// Independent design-based examples supplied by the Advanced Programming professor.
// Input order: cooperation, irritation, tension. Expected labels are explicit oracles.
const examples = [
  { input: [2, 3, 0], expected: 'irritated', reason: 'irritation reaches its threshold' },
  { input: [4, 3, 3], expected: 'irritated', reason: 'irritation takes precedence over tension and cooperation' },
  { input: [3, 0, 2], expected: 'uneasy', reason: 'tension takes precedence over cooperation' },
  { input: [3, 2, 1], expected: 'receptive', reason: 'cooperation applies below irritation and tension thresholds' },
  { input: [2, 2, 1], expected: 'neutral', reason: 'all values are below their demeanor thresholds' },
];

for (const { input, expected, reason } of examples) {
  test(`demeanor([${input.join(', ')}]) is ${expected}: ${reason}`, () => {
    assert.equal(demeanor(input), expected);
  });
}
