import { test, expect } from '@playwright/test';

const nav = (page, name) => page.getByRole('navigation').getByRole('button', { name, exact: true });
async function start(page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start investigation' }).click();
  await expect(page.getByRole('heading', { name: 'the study', exact: true })).toBeVisible();
}
async function travel(page, room) {
  await nav(page, 'Rooms').click();
  await page.locator('.location-card').filter({ has: page.getByRole('heading', { name: room, exact: true }) }).click();
  await expect(page.getByRole('heading', { name: room, exact: true, level: 1 })).toBeVisible();
}
async function talk(page, name = 'Ben Carter') {
  await travel(page, name === 'Ben Carter' ? 'the garden' : name === 'Clara Voss' ? 'the library' : 'the study');
  await page.getByRole('button', { name: 'Speak with ' + name, exact: true }).click();
}
async function dialog(page, name = 'Clara Voss') {
  await nav(page, 'Investigation overview').click();
  await page.locator('.suspect-card').filter({ has: page.getByRole('heading', { name, exact: true }) }).getByRole('button', { name: 'Accuse', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}
async function inspectAll(page) {
  for (const room of ['the study', 'the garden']) {
    await travel(page, room);
    while (await page.locator('.room-object').filter({ hasText: 'Inspect evidence' }).count()) {
      await page.locator('.room-object').filter({ hasText: 'Inspect evidence' }).first().click();
      await expect(page.getByRole('button', { name: 'Close observation' })).toBeVisible();
      await page.getByRole('button', { name: 'Close observation' }).click();
    }
  }
  await nav(page, 'Evidence journal').click();
}
test('complete real offline room investigation, cancellation, both verdicts and local reset', async ({ page }) => {
  const errors = []; const mutations = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => { if (request.method() === 'POST') mutations.push(request.url().split('/').at(-1)); });
  await start(page); expect(mutations).toEqual(['investigations']);
  for (const [room, name, count] of [['the study', 'Alice Mercer', 2], ['the library', 'Clara Voss', 0], ['the garden', 'Ben Carter', 1]]) {
    await travel(page, room);
    await expect(page.locator('.room-person')).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Speak with ' + name, exact: true })).toBeVisible();
    await expect(page.locator('.room-object')).toHaveCount(count);
  }
  expect(mutations.filter((name) => name === 'travel')).toHaveLength(3);
  await talk(page);
  await page.getByLabel('Your question for Ben Carter').fill('Where were you?');
  await page.getByLabel('Your question for Ben Carter').press('Enter');
  await expect(page.locator('blockquote')).toContainText(/greenhouse/i);
  await expect(page.locator('.character-figure')).toHaveAttribute('src', '/art/figures/ben-carter-neutral.svg');
  const figure = await page.locator('.character-figure').boundingBox(); expect(figure.height).toBeGreaterThan(350);
  await page.getByRole('button', { name: 'Conversation history (1)', exact: true }).click();
  await expect(page.locator('.received-history li')).toHaveCount(1);
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByLabel('Your question for Ben Carter').fill('How many purple planets are there?');
  await page.getByRole('button', { name: 'Ask question' }).click();
  await expect(page.getByText('QUESTION GUIDANCE', { exact: true })).toBeVisible();
  await inspectAll(page);
  await expect(page.getByText('Inspected in this browser session', { exact: true })).toHaveCount(3);
  const beforeReview = mutations.length;
  await page.getByRole('button', { name: 'Review observation' }).first().click();
  expect(mutations).toHaveLength(beforeReview);
  await dialog(page); await expect(page.getByRole('button', { name: 'Cancel accusation' })).toBeFocused();
  await page.getByRole('button', { name: 'Cancel accusation' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0); await expect(page.getByText('Investigation open', { exact: true })).toBeVisible();
  await dialog(page); await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0);
  await dialog(page); await page.getByRole('button', { name: 'Confirm accusation' }).click();
  await expect(page.getByRole('heading', { name: 'The truth comes to light.' })).toBeVisible();
  await expect(page.getByText('Accusation canceled. Your investigation continues.', { exact: true })).toHaveCount(0);
  await expect(nav(page, 'Case result')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.verdict')).toContainText('Clara Voss');
  await page.getByRole('button', { name: 'Review evidence journal' }).click();
  await expect(page.getByRole('button', { name: 'Review observation' })).toHaveCount(3);
  await nav(page, 'Investigation overview').click(); await expect(page.getByRole('button', { name: 'Accuse', exact: true }).first()).toBeDisabled();
  await nav(page, 'Current room').click(); await expect(page.getByRole('button', { name: 'Go to the study', exact: true })).toBeDisabled();
  await nav(page, 'Case result').click(); await page.getByRole('button', { name: 'Start new investigation' }).click();
  await expect(page.getByRole('heading', { name: 'the study', exact: true })).toBeVisible();
  await nav(page, 'Evidence journal').click(); await expect(page.getByRole('button', { name: 'Inspect evidence' })).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Review observation' })).toHaveCount(0);
  await dialog(page, 'Alice Mercer'); await page.getByRole('button', { name: 'Confirm accusation' }).click();
  await expect(page.getByRole('heading', { name: 'The case closes in shadow.' })).toBeVisible();
  await expect(page.locator('.verdict')).not.toContainText('Clara'); expect(errors).toEqual([]);
});

for (const dismiss of ['Escape', 'Close dialog']) test(`lost accusation reply permits ${dismiss} without replay and reconciles the real ending`, async ({ page }) => {
  await start(page);
  await dialog(page);
  let attempts = 0;
  await page.route('**/accusations', async (route) => {
    attempts++;
    await route.fetch(); // The real server commits the ending; only its receipt is lost.
    await route.abort('failed');
  });
  await page.getByRole('button', { name: 'Confirm accusation' }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('may already have completed');
  if (dismiss === 'Escape') await page.keyboard.press('Escape');
  else await page.getByRole('button', { name: 'Close dialog', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Accuse', exact: true }).first()).toBeDisabled();
  await nav(page, 'Evidence journal').click();
  await expect(page.getByRole('heading', { name: 'The evidence journal' })).toBeVisible();
  await page.getByRole('button', { name: 'Refresh investigation' }).click();
  await expect(page.getByRole('heading', { name: 'The truth comes to light.' })).toBeVisible();
  expect(attempts).toBe(1);
});

test('pending actions gate travel and retain original attribution while reading another dossier', async ({ page }) => {
  await start(page); await talk(page);
  let count = 0; let release; const pending = new Promise((resolve) => { release = resolve; });
  await page.route('**/questions', async (route) => { count++; const reply = await route.fetch(); await pending; await route.fulfill({ response: reply }); });
  await page.getByLabel('Your question for Ben Carter').fill('Where were you?');
  await page.getByRole('button', { name: 'Ask question' }).dblclick();
  await expect(page.getByRole('button', { name: 'Ask question' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Go to the study', exact: true })).toBeDisabled();
  await nav(page, 'Investigation overview').click();
  await expect(page.locator('.suspect-card').filter({ hasText: 'Alice Mercer' }).getByRole('button', { name: 'Travel to the study', exact: true })).toBeDisabled();
  await page.locator('.suspect-card').filter({ hasText: 'Alice Mercer' }).getByRole('button', { name: 'Read conversation' }).click();
  await expect(page.getByRole('dialog')).toContainText('No received replies yet.');
  release(); await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.locator('.suspect-card').filter({ hasText: 'Ben Carter' }).getByRole('button', { name: 'Accuse', exact: true })).toBeEnabled(); expect(count).toBe(1);
  await page.locator('.suspect-card').filter({ hasText: 'Ben Carter' }).getByRole('button', { name: 'Speak with Ben Carter' }).click();
  await expect(page.locator('blockquote')).toContainText(/greenhouse/i);
});

test('stale revision and network loss retain drafts and require explicit refresh', async ({ page }) => {
  await start(page); await talk(page);
  await page.route('**/questions', (route) => route.fulfill({ status: 409, json: { ok: false, data: null, error: { code: 'stale_revision', message: 'SECRET_SERVER_DETAIL' } } }), { times: 1 });
  const input = page.getByLabel('Your question for Ben Carter'); await input.fill('Where were you?');
  await page.getByRole('button', { name: 'Ask question' }).click();
  await expect(page.getByRole('alert')).toContainText('Refresh before trying again');
  await expect(input).toHaveValue('Where were you?'); await expect(page.getByRole('button', { name: 'Ask question' })).toBeDisabled();
  await page.getByRole('button', { name: 'Refresh investigation' }).click();
  await expect(page.getByRole('button', { name: 'Ask question' })).toBeEnabled();
  await page.route('**/questions', (route) => route.abort('failed'), { times: 1 });
  await page.getByRole('button', { name: 'Ask question' }).click();
  await expect(page.getByRole('alert')).toContainText('may already have completed');
  await expect(input).toHaveValue('Where were you?');
  await page.getByRole('button', { name: 'Refresh investigation' }).click();
  await page.getByRole('button', { name: 'Ask question' }).click();
  await expect(page.locator('blockquote')).toContainText(/greenhouse/i);
  await expect(page.locator('body')).not.toContainText('SECRET_SERVER_DETAIL');
});

test('expiry keeps known notes, disables commands and permits explicit replacement', async ({ page }) => {
  await start(page); await nav(page, 'Evidence journal').click();
  await page.getByRole('button', { name: 'Inspect evidence' }).first().click();
  await expect(page.getByText('Inspected in this browser session', { exact: true })).toHaveCount(1);
  await page.route('**/evidence/inspect', (route) => route.fulfill({ status: 404, json: { ok: false, data: null, error: { code: 'session_not_found' } } }), { times: 1 });
  await page.getByRole('button', { name: 'Inspect evidence' }).first().click();
  await expect(page.getByRole('alert')).toContainText('no longer available');
  await expect(page.getByRole('button', { name: 'Inspect evidence' }).first()).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Review observation' })).toBeEnabled();
  await page.getByRole('button', { name: 'Start new investigation' }).click();
  await expect(page.getByRole('heading', { name: 'the study', exact: true })).toBeVisible();
});

test('public-only extended collection, artwork fallbacks, escaped text and runtime privacy', async ({ page }) => {
  const logs = []; const sessions = []; const responses = [];
  page.on('console', (message) => logs.push(message.text()));
  page.on('response', async (response) => { if (new URL(response.url()).pathname.startsWith('/api/')) { const text = await response.text().catch(() => ''); responses.push(text); const id = JSON.parse(text || '{}').data?.sessionId; if (id) sessions.push(id); } });
  await page.route('**/api/investigations', async (route) => {
    const response = await route.fetch(); const envelope = await response.json();
    envelope.data.state.suspects.push(...Array.from({ length: 5 }, (_, i) => ({ id: 'public-guest-' + i, name: 'Visiting Guest ' + (i + 1), locationId: 'study', dossier: { role: 'Guest', relationshipToVictim: 'Public fixture guest.', background: 'Public test fixture.', relationships: [] } })));
    await route.fulfill({ response, json: envelope });
  });
  await page.route('**/art/portraits/ben-carter-neutral.svg', (route) => route.abort());
  await page.route('**/art/figures/ben-carter-neutral.svg', (route) => route.abort());
  await start(page); await expect(page.locator('.room-person')).toHaveCount(6);
  await nav(page, 'Investigation overview').click(); await expect(page.locator('.suspect-card')).toHaveCount(8);
  await expect(page.locator('.suspect-card').filter({ hasText: 'Ben Carter' }).locator('img')).toHaveAttribute('src', '/art/portraits/generic-neutral.svg');
  await expect(page.locator('.suspect-card').filter({ hasText: 'Visiting Guest 1' }).locator('img')).toHaveAttribute('src', '/art/portraits/generic-neutral.svg');
  await talk(page);
  await expect(page.locator('.character-figure')).toHaveAttribute('src', '/art/figures/generic-neutral.svg');
  const attack = '<img src=x onerror="window.unwanted=true">';
  await page.route('**/questions', async (route) => { const response = await route.fetch(); const envelope = await response.json(); envelope.data.result.text = attack; envelope.data.result.dialogue = attack; envelope.data.state.dialogue.conversations.find((item) => item.suspectId === 'ben-carter').recentTurns.at(-1).dialogue = attack; await route.fulfill({ response, json: envelope }); });
  await page.getByLabel('Your question for Ben Carter').fill('Where were you?'); await page.getByRole('button', { name: 'Ask question' }).click();
  await expect(page.locator('blockquote')).toHaveText(attack); expect(await page.evaluate(() => window.unwanted)).toBeUndefined();
  const runtime = await page.evaluate(() => ({ dom: document.documentElement.outerHTML, local: { ...localStorage }, session: { ...sessionStorage }, cookies: document.cookie, url: location.href }));
  expect(runtime.local).toEqual({}); expect(runtime.session).toEqual({}); expect(runtime.cookies).toBe('');
  for (const id of sessions) { expect(runtime.dom).not.toContain(id); expect(logs.join(' ')).not.toContain(id); expect(runtime.url).not.toContain(id); }
  expect(responses.join(' ')).not.toMatch(/SERVER_ONLY_CANARY_6fd298|privateFacts|murdererId|intendedSolution|internalPrompt|OPENAI_API_KEY/);
  const denied = await page.request.get('/@fs/' + process.cwd().replaceAll('\\', '/') + '/../src/data/case.js'); expect(denied.status()).toBe(403);
  expect((await page.request.get('/e2e/offline-api.mjs')).status()).toBe(403);
});

test('keyboard modal focus, responsive layouts, target size and reduced motion', async ({ page }) => {
  await start(page); await dialog(page);
  await expect(page.getByRole('button', { name: 'Cancel accusation' })).toBeFocused();
  await page.keyboard.press('Shift+Tab'); await expect(page.getByLabel('Selected suspect')).toBeFocused();
  await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await expect(page.getByRole('button', { name: 'Confirm accusation' })).toBeFocused();
  await page.keyboard.press('Tab'); await expect(page.getByLabel('Selected suspect')).toBeFocused();
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Accuse', exact: true }).last()).toBeFocused();
  await expect(page.locator('.skip-link')).toHaveCSS('clip-path', 'inset(50%)');
  for (const width of [360, 720, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const buttons = await page.locator('button:visible').evaluateAll((buttons) => buttons.map((button) => ({ height: button.getBoundingClientRect().height, transition: getComputedStyle(button).transitionDuration })));
  expect(buttons.every((button) => button.height >= 44 && button.transition === '0s')).toBe(true);
  await talk(page, 'Alice Mercer'); await page.getByRole('button', { name: 'Conversation history (0)' }).click();
  await expect(page.getByRole('button', { name: 'Close', exact: true })).toBeFocused(); await page.keyboard.press('Tab'); await expect(page.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
  await page.keyboard.press('Escape'); await expect(page.getByRole('button', { name: 'Conversation history (0)' })).toBeFocused();
});

test('failed travel retains current room and empty-room fixtures offer navigation without invented people', async ({ page }) => {
  await start(page);
  await page.route('**/travel', (route) => route.fulfill({ status: 409, json: { ok: false, data: null, error: { code: 'stale_revision' } } }), { times: 1 });
  await page.getByRole('button', { name: 'Go to the garden', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Refresh before trying again');
  await expect(page.getByRole('heading', { name: 'the study', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Refresh investigation' }).click();
  await page.route('**/travel', async (route) => { const response = await route.fetch(); const envelope = await response.json(); envelope.data.state.suspects = envelope.data.state.suspects.map((suspect) => ({ ...suspect, locationId: 'study' })); envelope.data.state.dialogue.conversations.forEach((item) => { item.options = []; }); await route.fulfill({ response, json: envelope }); }, { times: 1 });
  await page.getByRole('button', { name: 'Go to the library', exact: true }).click();
  await expect(page.getByText('Nobody is here to question.', { exact: true })).toBeVisible();
  await expect(page.getByText('No case evidence is recorded in this room.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Go to the study', exact: true })).toBeEnabled();
});

test('long received testimony remains readable and direct browser requests cannot bypass room rules', async ({ page }) => {
  const creation = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/investigations' && response.status() === 201);
  await start(page); const envelope = await (await creation).json(); const base = '/api/investigations/' + envelope.data.sessionId;
  const remoteQuestion = await page.request.post(base + '/questions', { data: { suspectId: 'ben-carter', question: 'Where were you?', expectedRevision: 0 } });
  expect(remoteQuestion.status()).toBe(409); expect((await remoteQuestion.json()).error.code).toBe('suspect_not_present');
  const remoteClue = await page.request.post(base + '/evidence/inspect', { data: { evidenceId: 'muddy-footprints', expectedRevision: 0 } });
  expect(remoteClue.status()).toBe(409); expect((await remoteClue.json()).error.code).toBe('evidence_not_here');
  await page.getByRole('button', { name: 'Speak with Alice Mercer', exact: true }).click();
  await page.route('**/questions', async (route) => { const response = await route.fetch(); const data = await response.json(); data.data.result.text = Array(70).fill(data.data.result.text).join(' ').slice(0, 1200); data.data.result.dialogue = data.data.result.text; data.data.state.dialogue.conversations.find((item) => item.suspectId === 'alice-mercer').recentTurns.at(-1).dialogue = data.data.result.text; await route.fulfill({ response, json: data }); });
  await page.getByLabel('Your question for Alice Mercer').fill('Where were you?'); await page.getByRole('button', { name: 'Ask question' }).click();
  const reply = page.getByRole('blockquote', { name: 'Latest reply' }); await expect(reply).toContainText('I was at home in my room all evening.');
  expect(await reply.evaluate((node) => node.scrollHeight > node.clientHeight)).toBe(true);
  await reply.focus(); await expect(reply).toBeFocused(); await reply.evaluate((node) => { node.scrollTop = node.scrollHeight; });
  expect(await reply.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
  await expect(page.getByRole('button', { name: 'Ask question' })).toBeVisible();
  await page.screenshot({ path: test.info().outputPath('long-reply.png'), fullPage: true });
});

test('an investigation ended outside the page reconciles to its authoritative conclusion', async ({ page }) => {
  const creation = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/investigations' && response.status() === 201);
  await start(page); const envelope = await (await creation).json();
  await page.getByRole('button', { name: 'Speak with Alice Mercer', exact: true }).click();
  const ending = await page.request.post('/api/investigations/' + envelope.data.sessionId + '/accusations', { data: { suspectId: 'alice-mercer', confirmed: true, expectedRevision: 0 } }); expect(ending.status()).toBe(200);
  await page.getByLabel('Your question for Alice Mercer').fill('Where were you?'); await page.getByRole('button', { name: 'Ask question' }).click();
  await expect(page.getByRole('alert')).toContainText('This investigation has ended'); await expect(page.getByRole('button', { name: 'Ask question' })).toBeDisabled();
  await page.getByRole('button', { name: 'Refresh investigation' }).click();
  await expect(page.getByRole('heading', { name: 'The case closes in shadow.' })).toBeVisible(); await expect(page.locator('.verdict')).not.toContainText('Clara');
});
