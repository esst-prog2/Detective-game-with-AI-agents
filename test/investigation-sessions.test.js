import assert from 'node:assert/strict';
import test from 'node:test';
import { createSessionStore } from '../src/investigation-sessions.js';

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

test('invalid resource limits fail at construction rather than disabling capacity or expiry', () => {
  for (const name of ['maxSessions', 'maxQuestions', 'idleMs']) {
    for (const value of [NaN, Infinity, 0, -1, 1.5, '4', null, Number.MAX_SAFE_INTEGER + 1]) {
      assert.throws(() => createSessionStore({ [name]: value }), /Invalid session limits/);
    }
  }
});

test('session store defaults cap creation at 100 and expire idle sessions after 30 minutes', () => {
  let now = 0;
  const store = createSessionStore({ clock: () => now });
  const entries = Array.from({ length: 100 }, () => store.create());
  assert.equal(new Set(entries.map(({ id }) => id)).size, 100);
  assert.match(entries[0].id, /^[a-f0-9]{64}$/);
  assert.throws(() => store.create(), { code: 'session_capacity' });
  now = 30 * 60 * 1000 - 1;
  store.touch(store.get(entries[0].id));
  now += 1;
  assert.throws(() => store.get(entries[1].id), { code: 'session_not_found' });
  assert.equal(store.get(entries[0].id), entries[0]);
  assert.ok(store.create());
});

test('session store retries ID collisions and bounds a broken generator without overwriting a session', () => {
  const ids = ['a'.repeat(64), 'a'.repeat(64), 'b'.repeat(64)];
  const store = createSessionStore({ generateId: () => ids.shift() ?? 'a'.repeat(64) });
  const first = store.create();
  assert.equal(store.create().id, 'b'.repeat(64));
  assert.throws(() => store.create(), { code: 'session_capacity' });
  assert.equal(store.get(first.id), first);
  assert.throws(() => createSessionStore({ generateId: () => 'invalid' }).create());
});

test('pending session is pinned, overlaps rejected, then idle lifetime restarts after settlement', async () => {
  let now = 0;
  const store = createSessionStore({ clock: () => now, maxSessions: 1 });
  const entry = store.create();
  const gate = deferred();
  const pending = store.run(entry, 0, true, () => gate.promise);
  now = 60 * 60 * 1000;
  assert.equal(store.get(entry.id), entry);
  assert.throws(() => store.create(), { code: 'session_capacity' });
  await assert.rejects(store.run(entry, 0, false, () => {}), { code: 'session_busy' });
  gate.resolve({ kind: 'unsupported', text: 'Guidance' });
  assert.equal((await pending).revision, 1);
  now += 30 * 60 * 1000 - 1;
  assert.equal(store.get(entry.id), entry);
  now += 1;
  assert.throws(() => store.get(entry.id), { code: 'session_not_found' });
});

test('failed and stale operations release reservations without revision commits', async () => {
  const store = createSessionStore({ maxQuestions: 1 });
  const entry = store.create();
  await assert.rejects(store.run(entry, 0, true, () => { throw new Error('failure'); }));
  assert.equal(entry.revision, 0);
  assert.equal(entry.reservation, null);
  await assert.rejects(store.run(entry, 0, true, async () => {
    entry.reservation = Symbol('superseded');
    return {};
  }), { code: 'stale_response' });
  assert.equal(entry.revision, 0);
  entry.reservation = null;
  const result = await store.run(entry, 0, true, async () => ({ kind: 'unsupported', text: 'Guidance' }));
  assert.equal(result.revision, 1);
  await assert.rejects(store.run(entry, 0, false, () => {}), { code: 'stale_revision' });
});
