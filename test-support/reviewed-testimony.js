import assert from 'node:assert/strict';
import fixtures from '../test/fixtures/reviewed-testimony.json' with { type: 'json' };

// Frozen, editorially reviewed literal expectations, separate from the runtime catalog.
export function assertEquivalent(dialogue, original) {
  const review = Object.values(fixtures).find((group) => group.original === original);
  assert.ok(review, 'testimony group must have an independent review');
  assert.ok(review.speeches.includes(dialogue), `unreviewed or incomplete testimony: ${dialogue}`);
}
export { fixtures as reviewedTestimony };
