// Offline browser walkthrough and reviewable screenshots; no provider credentials.
import { chromium, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root = fileURLToPath(new URL('..', import.meta.url));
const output = resolve(root, '../docs/dialogue-quality/screenshots');
const apiPort = '3002'; const children = []; let browser; const observations = [];
await mkdir(output, { recursive: true });
async function ready(url) { for (let i = 0; i < 100; i++) { try { await fetch(url); return; } catch { await new Promise((done) => setTimeout(done, 100)); } } throw Error('Walkthrough server unavailable'); }
const nav = (page, name) => page.getByRole('navigation').getByRole('button', { name, exact: true });
async function start(page) { await page.goto('http://localhost:5173'); await page.getByRole('button', { name: 'Start investigation', exact: true }).click(); await expect(page.getByRole('heading', { name: 'the study', level: 1, exact: true })).toBeVisible(); }
async function travel(page, room) { await nav(page, 'Rooms').click(); await page.locator('.location-card').filter({ has: page.getByRole('heading', { name: room, exact: true }) }).click(); await expect(page.getByRole('heading', { name: room, exact: true, level: 1 })).toBeVisible(); }
async function accusation(page, name, action) { await nav(page, 'Investigation overview').click(); await page.locator('.suspect-card').filter({ has: page.getByRole('heading', { name, exact: true }) }).getByRole('button', { name: 'Accuse', exact: true }).click(); if (action === 'Escape') await page.keyboard.press('Escape'); else await page.getByRole('button', { name: action + ' accusation', exact: true }).click(); await expect(page.getByRole('dialog')).toHaveCount(0); }
try {
  // Never reuse somebody else's development servers.
  for (const url of ['http://127.0.0.1:3002', 'http://[::1]:5173']) { let occupied = false; try { await fetch(url); occupied = true; } catch {} if (occupied) throw Error('Walkthrough port is already in use'); }
  children.push(spawn(process.execPath, ['e2e/offline-api.mjs'], { cwd: root, windowsHide: true, stdio: 'ignore', env: { ...process.env, API_PORT: apiPort } }));
  children.push(spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '::1'], { cwd: root, windowsHide: true, stdio: 'ignore', env: { ...process.env, API_PORT: apiPort } }));
  await Promise.all([ready('http://127.0.0.1:3002'), ready('http://[::1]:5173')]); browser = await chromium.launch();
  for (const [mode, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport }); const errors = []; page.on('pageerror', (error) => errors.push(error.message));
    const capture = async (name) => page.screenshot({ path: resolve(output, mode + '-' + name + '.png'), fullPage: true });
    await start(page); await page.getByRole('button', { name: 'Speak with Alice Mercer', exact: true }).click();
    await capture('initial');
    await page.getByLabel('Your question for Alice Mercer').fill('My question in progress');
    await page.locator('[data-choice="ask-alibi"]').click(); await expect(page.getByRole('button', { name: 'Conversation history (1)' })).toBeVisible();
    await expect(page.getByLabel('Your question for Alice Mercer')).toHaveValue('My question in progress'); await expect(page.locator('.cinematic-dialogue > .performance-narration')).toHaveCount(0);
    await page.locator('[data-choice="clarify-last"]').click(); await expect(page.getByRole('button', { name: 'Conversation history (2)' })).toBeVisible(); await expect(page.locator('.cinematic-dialogue > .performance-narration')).toHaveCount(0);
    await page.locator('[data-choice="clarify-last"]').click(); await expect(page.getByRole('button', { name: 'Conversation history (3)' })).toBeVisible(); await expect(page.locator('.cinematic-dialogue > .performance-narration')).toBeVisible();
    await capture('performance'); await page.getByRole('button', { name: 'Conversation history (3)' }).click(); await capture('history'); await page.keyboard.press('Escape'); await expect(page.getByRole('button', { name: 'Conversation history (3)' })).toBeFocused();
    await page.setViewportSize({ width: 360, height: 844 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await capture('360px');
    await page.setViewportSize({ width: 1440, height: 900 }); await page.evaluate(() => { document.documentElement.style.zoom = '2'; }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true); await capture('200-percent'); await page.evaluate(() => { document.documentElement.style.zoom = ''; }); await page.setViewportSize(viewport);
    for (const [room, name] of [['the library', 'Clara Voss'], ['the garden', 'Ben Carter']]) {
      await travel(page, room); await page.getByRole('button', { name: 'Speak with ' + name, exact: true }).click();
      await page.getByLabel('Your question for ' + name).fill('Where were you?'); await page.getByRole('button', { name: 'Ask question' }).click(); await expect(page.getByRole('button', { name: 'Conversation history (1)' })).toBeVisible();
    }
    for (const room of ['the study', 'the garden']) { await travel(page, room); while (await page.locator('.room-object').filter({ hasText: 'Inspect evidence' }).count()) { await page.locator('.room-object').filter({ hasText: 'Inspect evidence' }).first().click(); await page.getByRole('button', { name: 'Close observation' }).click(); } }
    await accusation(page, 'Clara Voss', 'Escape'); await expect(page.getByRole('button', { name: 'Accuse', exact: true }).last()).toBeFocused();
    await accusation(page, 'Clara Voss', 'Cancel'); await accusation(page, 'Clara Voss', 'Confirm'); await expect(page.getByRole('heading', { name: 'The truth comes to light.' })).toBeVisible(); await capture('conclusion');
    await nav(page, 'Investigation overview').click(); await page.locator('.suspect-card').filter({ hasText: 'Alice Mercer' }).getByRole('button', { name: 'Read conversation' }).click(); await expect(page.locator('.received-history li')).toHaveCount(3); await page.keyboard.press('Escape');
    await nav(page, 'Case result').click(); await page.getByRole('button', { name: 'Start new investigation' }).click(); await accusation(page, 'Alice Mercer', 'Confirm'); await expect(page.getByRole('heading', { name: 'The case closes in shadow.' })).toBeVisible();
    expect(errors).toEqual([]); observations.push(mode + ': real offline mixed text/choices, optional narration, draft retention, history/focus, all evidence, cancel/Escape and both verdicts; 360px and CSS 200% reflow; no page errors.'); await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.route('**/api/investigations', async (route) => { const reply = await route.fetch(); const envelope = await reply.json(); envelope.data.state.suspects.push(...Array.from({ length: 9 }, (_, i) => ({ id: 'layout-guest-' + i, name: 'Layout Guest ' + i, locationId: 'study', dossier: { role: 'Guest', relationshipToVictim: 'Public fixture.', background: 'Layout fixture only.', relationships: [] } }))); envelope.data.state.dialogue.conversations[0].options[0].label = 'A long public question for responsive layout review. '.repeat(8); await route.fulfill({ response: reply, json: envelope }); });
  await start(page); await nav(page, 'Investigation overview').click(); await expect(page.locator('.suspect-card')).toHaveCount(12); await page.screenshot({ path: resolve(output, 'twelve-contacts.png'), fullPage: true }); await nav(page, 'Current room').click(); await page.getByRole('button', { name: 'Speak with Alice Mercer', exact: true }).click(); await page.setViewportSize({ width: 360, height: 844 }); await page.screenshot({ path: resolve(output, 'long-option-360px.png'), fullPage: true });
  await page.route('**/questions', async (route) => { const reply = await route.fetch(); const envelope = await reply.json(); envelope.data.state.dialogue.conversations.forEach((item) => { item.options = []; }); envelope.data.result.text = envelope.data.result.dialogue = 'Received long-form layout fixture. '.repeat(30); envelope.data.state.dialogue.conversations[0].recentTurns.at(-1).dialogue = envelope.data.result.dialogue; await route.fulfill({ response: reply, json: envelope }); });
  await page.getByLabel('Your question for Alice Mercer').fill('Where were you?'); await page.getByRole('button', { name: 'Ask question' }).click(); await expect(page.getByRole('button', { name: 'Conversation history (1)' })).toBeVisible(); await page.screenshot({ path: resolve(output, 'long-reply-no-options-360px.png'), fullPage: true }); await page.close();
  observations.push('Synthetic twelve-contact/fallback portraits, long option, null narration/no options and long escaped reply screenshots captured separately from real case walkthrough.');
  await writeFile(resolve(output, 'observations.txt'), observations.join('\n') + '\n'); console.log(observations.join('\n'));
} finally { await browser?.close(); for (const child of children) if (child.exitCode === null) child.kill(); }
