import { test, expect } from '@playwright/test';
const nav = (page, name) => page.getByRole('navigation').getByRole('button', { name, exact: true });
async function start(page) { await page.goto('/'); await page.getByRole('button', { name: 'Start investigation', exact: true }).click(); await expect(page.getByRole('heading', { name: 'the study', exact: true, level: 1 })).toBeVisible(); }
async function travel(page, room) { await nav(page, 'Rooms').click(); await page.locator('.location-card').filter({ has: page.getByRole('heading', { name: room, exact: true }) }).click(); await expect(page.getByRole('heading', { name: room, exact: true, level: 1 })).toBeVisible(); }
async function talk(page, name) { await page.getByRole('button', { name: 'Speak with ' + name, exact: true }).click(); }
async function choose(page, id, count) { await page.locator(`[data-choice="${id}"]`).click(); await expect(page.getByRole('button', { name: `Conversation history (${count})`, exact: true })).toBeVisible(); }
async function ask(page, name, question, count) { await page.getByLabel('Your question for ' + name).fill(question); await page.getByRole('button', { name: 'Ask question' }).click(); await expect(page.getByRole('button', { name: `Conversation history (${count})`, exact: true })).toBeVisible(); }

test('mixed dialogue modes preserve drafts, structured performance, useful followups, evidence and reviewed comparison', async ({ page }) => {
  const commands = []; page.on('request', (request) => { if (request.url().endsWith('/questions')) commands.push(request.postDataJSON()); });
  await start(page); await talk(page, 'Alice Mercer');
  await expect(page.locator('.dialogue-choices button')).toHaveCount(6);
  await expect(page.locator('[data-choice="present-footprints"]')).toHaveCount(0);
  const input = page.getByLabel('Your question for Alice Mercer'); await input.fill('My next question');
  await choose(page, 'ask-sighting', 1); await expect(input).toHaveValue('My next question');
  await expect(page.locator('.cinematic-dialogue > .performance-narration')).toHaveCount(0);
  await expect(page.locator('blockquote')).toContainText('Clara');
  await expect(page.getByRole('heading', { name: 'Continue the conversation' })).toBeFocused();
  await choose(page, 'clarify-last', 2);
  await expect(page.locator('.cinematic-dialogue > .performance-narration')).toHaveCount(0); // Second reply is intentionally speech-only.
  await expect(page.locator('blockquote')).toContainText('Clara');
  await ask(page, 'Alice Mercer', 'Did you see anyone suspicious?', 3);
  await expect(page.locator('.demeanor')).toContainText(/neutral|receptive|irritated|uneasy/);
  await expect(page.locator('.demeanor > span').first()).toContainText('Demeanor:');
  await expect(page.getByText('Demeanor reflects conversational delivery. It does not establish truthfulness.', { exact: true })).not.toBeVisible();
  await page.getByLabel('About demeanor').focus(); await page.keyboard.press('Enter');
  await expect(page.getByText('Demeanor reflects conversational delivery. It does not establish truthfulness.', { exact: true })).toBeVisible();
  await page.getByLabel('About demeanor').click();
  await page.getByRole('button', { name: 'Conversation history (3)', exact: true }).click();
  await expect(page.locator('.received-history li')).toHaveCount(3);
  await expect(page.locator('.received-history')).toContainText('You: What do you mean by that?');
  await expect(page.locator('.received-history .performance-narration')).toHaveCount(1);
  await page.keyboard.press('Escape'); await expect(page.getByRole('button', { name: 'Conversation history (3)' })).toBeFocused();
  await travel(page, 'the library'); await talk(page, 'Clara Voss');
  await expect(page.locator('[data-choice="compare-garden-accounts"]')).toHaveCount(0);
  await choose(page, 'ask-sighting', 1);
  await expect(page.locator('[data-choice="compare-garden-accounts"]')).toBeVisible();
  await choose(page, 'compare-garden-accounts', 2); await expect(page.locator('blockquote')).toContainText(/garden/i);
  await travel(page, 'the garden'); await talk(page, 'Ben Carter');
  await expect(page.locator('[data-choice="present-footprints"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Return to room' }).click(); await page.locator('.room-object').click();
  await expect(page.getByRole('button', { name: 'Close observation' })).toBeVisible(); await page.getByRole('button', { name: 'Close observation' }).click();
  await talk(page, 'Ben Carter'); await choose(page, 'present-footprints', 1);
  await expect(page.locator('blockquote')).toContainText(/boots|mud/i);
  await ask(page, 'Ben Carter', 'Where were you?', 2);
  await expect(page.locator('blockquote')).toContainText(/greenhouse/i);
  for (const body of commands) { expect(Object.keys(body).sort()).toEqual(('choiceId' in body ? ['choiceId', 'expectedRevision', 'suspectId'] : ['expectedRevision', 'question', 'suspectId'])); }
});

test('stale choices keep drafts and received history without replay; refresh restores current options', async ({ page }) => {
  await start(page); await talk(page, 'Alice Mercer'); await choose(page, 'ask-alibi', 1);
  const input = page.getByLabel('Your question for Alice Mercer'); await input.fill('Retain my thought');
  let attempts = 0;
  await page.route('**/questions', (route) => { attempts++; return route.fulfill({ status: 409, json: { ok: false, data: null, error: { code: 'dialogue_option_unavailable', message: 'PRIVATE_REASON' } } }); }, { times: 1 });
  await page.locator('[data-choice="clarify-last"]').click();
  await expect(page.getByRole('alert')).toContainText('no longer available'); await expect(input).toHaveValue('Retain my thought');
  await expect(page.locator('.dialogue-choices button').first()).toBeDisabled();
  await page.getByRole('button', { name: 'Conversation history (1)' }).click(); await expect(page.locator('.received-history li')).toHaveCount(1); await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Refresh investigation' }).click(); await expect(page.locator('[data-choice="clarify-last"]')).toBeEnabled();
  expect(attempts).toBe(1); await expect(page.locator('body')).not.toContainText('PRIVATE_REASON'); await expect(input).toHaveValue('Retain my thought');
});

test('lost committed dialogue and inspection reconcile honestly; independent sessions remain untouched', async ({ page, context }) => {
  let capability; page.on('response', async (reply) => { if (new URL(reply.url()).pathname === '/api/investigations' && reply.status() === 201) capability = (await reply.json()).data.sessionId; });
  await start(page); await talk(page, 'Alice Mercer');
  await page.route('**/questions', async (route) => { await route.fetch(); await route.abort('failed'); }, { times: 1 });
  await page.locator('[data-choice="ask-alibi"]').click(); await expect(page.getByRole('alert')).toContainText('may already have completed');
  await expect(page.getByRole('button', { name: 'Conversation history (0)' })).toBeVisible();
  await page.getByRole('button', { name: 'Refresh investigation' }).click(); await expect(page.getByRole('button', { name: 'Conversation history (1)' })).toBeVisible();
  await expect(page.locator('blockquote')).toContainText('my room');
  const received = await page.request.post(`/api/investigations/${capability}/evidence/inspect`, { data: { evidenceId: 'silver-cufflink', expectedRevision: 1 } }); expect(received.status()).toBe(200);
  await page.route('**/questions', (route) => route.fulfill({ status: 409, json: { ok: false, data: null, error: { code: 'stale_revision' } } }), { times: 1 });
  await page.locator('[data-choice="clarify-last"]').click(); await page.getByRole('button', { name: 'Refresh investigation' }).click();
  await nav(page, 'Evidence journal').click(); await expect(page.getByText('Inspected in this investigation; description not received here')).toBeVisible();
  await expect(page.locator('.evidence-description')).toHaveCount(0);
  const other = await context.newPage(); await start(other); await talk(other, 'Alice Mercer'); await expect(other.getByRole('button', { name: 'Conversation history (0)' })).toBeVisible();
  await nav(other, 'Evidence journal').click(); await expect(other.getByText('Inspected in this investigation; description not received here')).toHaveCount(0); await other.close();
  await page.locator('.evidence-card').filter({ hasText: /silver cufflink/i }).getByRole('button', { name: 'Inspect evidence' }).click();
  await expect(page.locator('.evidence-description')).toHaveCount(1);
});

test('delayed dialogue attached to an ended snapshot cannot append narration or testimony', async ({ page }) => {
  let base; page.on('response', async (reply) => { if (new URL(reply.url()).pathname === '/api/investigations' && reply.status() === 201) base = '/api/investigations/' + (await reply.json()).data.sessionId; });
  await start(page); await talk(page, 'Alice Mercer');
  let release; const held = new Promise((done) => { release = done; }); let committed; const ready = new Promise((done) => { committed = done; });
  await page.route('**/questions', async (route) => {
    const reply = await route.fetch(); const envelope = await reply.json(); committed(); await held;
    const ended = await (await page.request.get(base)).json();
    ended.data.result = envelope.data.result;
    await route.fulfill({ response: reply, json: ended });
  });
  await page.locator('[data-choice="ask-alibi"]').click(); await ready;
  await expect(page.locator('.dialogue-choices button').first()).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Go to the library', exact: true })).toBeDisabled();
  const ending = await page.request.post(base + '/accusations', { data: { suspectId: 'clara-voss', confirmed: true, expectedRevision: 1 } }); expect(ending.status()).toBe(200);
  release(); await expect(page.getByRole('heading', { name: 'The truth comes to light.' })).toBeVisible();
  await nav(page, 'Investigation overview').click(); await page.locator('.suspect-card').filter({ hasText: 'Alice Mercer' }).getByRole('button', { name: 'Read conversation' }).click();
  await expect(page.locator('.received-history li')).toHaveCount(0); await expect(page.getByRole('dialog')).toContainText('No received replies yet.');
});

test('twelve-contact long-label and no-option/null-narration fixtures reflow and preserve neutral art', async ({ page }) => {
  await page.route('**/api/investigations', async (route) => { const reply = await route.fetch(); const envelope = await reply.json();
    envelope.data.state.suspects.push(...Array.from({ length: 9 }, (_, i) => ({ id: 'fixture-guest-' + i, name: 'Fixture Guest ' + i, locationId: 'study', dossier: { role: 'Guest', relationshipToVictim: 'Public fixture.', background: 'Synthetic layout fixture.', relationships: [] } })));
    envelope.data.state.dialogue.conversations.find((item) => item.suspectId === 'alice-mercer').options[0].label = 'A deliberately long public option label '.repeat(10);
    await route.fulfill({ response: reply, json: envelope }); });
  await start(page); await expect(page.locator('.room-person')).toHaveCount(10);
  await nav(page, 'Investigation overview').click(); await expect(page.locator('.suspect-card')).toHaveCount(12);
  await expect(page.locator('.suspect-card').filter({ hasText: 'Fixture Guest 0' }).locator('img')).toHaveAttribute('src', '/art/portraits/generic-neutral.svg');
  await nav(page, 'Current room').click(); await talk(page, 'Alice Mercer');
  for (const width of [360, 390, 1440]) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }
  await page.setViewportSize({ width: 1440, height: 900 }); await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true); await page.evaluate(() => { document.documentElement.style.zoom = ''; });
  await page.route('**/questions', async (route) => { const reply = await route.fetch(); const envelope = await reply.json(); envelope.data.state.dialogue.conversations.forEach((item) => { item.options = []; }); await route.fulfill({ response: reply, json: envelope }); });
  await ask(page, 'Alice Mercer', 'Where were you?', 1);
  await expect(page.locator('.cinematic-dialogue > .performance-narration')).toHaveCount(0); await expect(page.locator('.dialogue-choices button')).toHaveCount(0);
  await expect(page.getByLabel('Your question for Alice Mercer')).toBeEnabled(); await expect(page.locator('.character-figure')).toHaveAttribute('src', '/art/figures/alice-mercer-neutral.svg');
});

test('topic revisits remain useful and suggested questions are keyboard operable with accessible targets', async ({ page }) => {
  await start(page); await talk(page, 'Alice Mercer');
  for (const [i, question] of ['Where were you?', 'What was your relationship with Victor?', 'Did you have a reason to hurt Victor?', 'Did you see anyone suspicious?', 'What do you know about the evidence?', 'What happened when Victor died?'].entries()) await ask(page, 'Alice Mercer', question, i + 1);
  const revisit = page.locator('.dialogue-choices button').filter({ has: page.getByText('Revisit', { exact: true }) }).first();
  await expect(revisit).toBeVisible(); await revisit.focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Conversation history (7)' })).toBeVisible(); await expect(page.locator('blockquote')).not.toBeEmpty();
  await expect(page.getByRole('heading', { name: 'Continue the conversation' })).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const targets = await page.locator('.dialogue-choices button').evaluateAll((buttons) => buttons.map((button) => ({ height: button.getBoundingClientRect().height, transition: getComputedStyle(button).transitionDuration })));
  expect(targets.every((target) => target.height >= 44 && target.transition === '0s')).toBe(true);
});
