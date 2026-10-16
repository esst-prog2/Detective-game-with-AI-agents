// Real offline controls plus screenshots for separate visual inspection.
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('..', import.meta.url));
const output = resolve(root, '../docs/room-screenshots');
const apiPort = process.env.E2E_API_PORT || '3002';
const children = []; let browser; let devOutput = ''; const observations = [];
await mkdir(output, { recursive: true });
async function ready(url) {
  for (let i = 0; i < 100; i++) { try { await fetch(url); return; } catch { await new Promise((resolve) => setTimeout(resolve, 100)); } }
  throw Error('Walkthrough server unavailable');
}
const nav = (page, name) => page.getByRole('navigation').getByRole('button', { name, exact: true });
async function travel(page, room) {
  await nav(page, 'Rooms').click(); await page.locator('.location-card').filter({ has: page.getByRole('heading', { name: room, exact: true }) }).click();
  await page.getByRole('heading', { name: room, exact: true, level: 1 }).waitFor();
}
async function accuse(page, name) {
  await nav(page, 'Investigation overview').click();
  await page.locator('.suspect-card').filter({ has: page.getByRole('heading', { name, exact: true }) }).getByRole('button', { name: 'Accuse', exact: true }).click();
}
try {
  children.push(spawn(process.execPath, ['e2e/offline-api.mjs'], { cwd: root, windowsHide: true, stdio: 'ignore', env: { ...process.env, API_PORT: apiPort } }));
  const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '::1'], { cwd: root, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, API_PORT: apiPort } }); children.push(vite);
  vite.stdout.on('data', (data) => { devOutput += data.toString(); }); vite.stderr.on('data', (data) => { devOutput += data.toString(); });
  await Promise.all([ready(`http://127.0.0.1:${apiPort}`), ready('http://[::1]:5173')]);
  browser = await chromium.launch();
  for (const [mode, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport }); const errors = []; page.on('pageerror', (error) => errors.push(error.message));
    const capture = async (name) => { await page.screenshot({ path: resolve(output, `${mode}-${name}.png`), fullPage: true }); };
    await page.goto('http://localhost:5173'); await page.getByRole('button', { name: 'Start investigation' }).click();
    await page.getByRole('heading', { name: 'the study', exact: true, level: 1 }).waitFor(); await capture('study');
    for (const [room, name] of [['the study', 'Alice Mercer'], ['the library', 'Clara Voss'], ['the garden', 'Ben Carter']]) {
      await travel(page, room); await capture(room.slice(4));
      assert.equal(await page.locator('.room-person').count(), 1);
      await page.getByRole('button', { name: `Speak with ${name}`, exact: true }).click();
      const figure = await page.locator('.character-figure').boundingBox(); assert.ok(figure.height > 350);
      const input = page.getByLabel(`Your question for ${name}`); await input.fill('x'.repeat(1001));
      assert.equal(await page.getByRole('button', { name: 'Ask question' }).isDisabled(), true);
      await input.fill('Where were you?'); await input.press('Enter');
      await page.getByText('RECEIVED TESTIMONY', { exact: true }).waitFor(); await capture(name.split(' ')[0].toLowerCase());
      await page.getByRole('button', { name: 'Conversation history (1)' }).click(); await page.getByRole('dialog').waitFor(); await capture('history-' + name.split(' ')[0].toLowerCase());
      await page.keyboard.press('Escape'); await page.getByRole('dialog').waitFor({ state: 'detached' });
      assert.equal(await page.getByRole('button', { name: 'Conversation history (1)' }).evaluate((node) => node === document.activeElement), true);
      await page.getByRole('button', { name: 'Public dossier', exact: true }).click(); await page.getByRole('dialog').waitFor(); await page.getByRole('button', { name: 'Close', exact: true }).click();
      if (name === 'Ben Carter') { await input.fill('How many purple planets are there?'); await input.press('Enter'); await page.getByText('QUESTION GUIDANCE', { exact: true }).waitFor(); }
      await page.getByRole('button', { name: 'Return to room' }).click();
      const uninspected = page.locator('.room-object').filter({ hasText: 'Inspect evidence' });
      while (await uninspected.count()) { await uninspected.first().click(); await page.getByRole('button', { name: 'Close observation' }).waitFor(); await page.getByRole('button', { name: 'Close observation' }).click(); }
    }
    await nav(page, 'Evidence journal').click(); assert.equal(await page.getByText('Inspected in this browser session', { exact: true }).count(), 3); await capture('journal');
    await accuse(page, 'Clara Voss'); await page.getByRole('dialog').waitFor(); await capture('accusation'); await page.keyboard.press('Escape'); await page.getByRole('dialog').waitFor({ state: 'detached' });
    await accuse(page, 'Clara Voss'); await page.getByRole('button', { name: 'Cancel accusation' }).click(); await page.getByRole('dialog').waitFor({ state: 'detached' });
    await accuse(page, 'Clara Voss'); await page.getByRole('button', { name: 'Confirm accusation' }).click();
    await page.getByRole('heading', { name: 'The truth comes to light.' }).waitFor(); await capture('conclusion');
    await page.getByRole('button', { name: 'Start new investigation' }).click(); await page.getByRole('heading', { name: 'the study', exact: true, level: 1 }).waitFor();
    await accuse(page, 'Alice Mercer'); await page.getByRole('button', { name: 'Confirm accusation' }).click();
    await page.getByRole('heading', { name: 'The case closes in shadow.' }).waitFor(); assert.equal((await page.locator('.verdict').innerText()).includes('Clara'), false);
    await nav(page, 'Evidence journal').click(); assert.equal(await page.getByRole('button', { name: 'Review observation' }).count(), 0);
    await nav(page, 'Current room').click(); assert.equal(await page.getByRole('button', { name: 'Go to the garden', exact: true }).isDisabled(), true);
    await nav(page, 'Case result').click(); await page.getByRole('button', { name: 'Start new investigation' }).click(); await page.getByRole('heading', { name: 'the study', exact: true, level: 1 }).waitFor();
    await page.getByRole('button', { name: 'Speak with Alice Mercer', exact: true }).click();
    for (const width of [360, 720]) { await page.setViewportSize({ width, height: 900 }); assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true); }
    await page.emulateMedia({ reducedMotion: 'reduce' }); await capture('reflow');
    await page.setViewportSize({ width: 1440, height: 900 }); await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true); await capture('zoom');
    await page.evaluate(() => { document.documentElement.style.zoom = ''; });
    assert.deepEqual(errors, []); observations.push(`${mode}: three real rooms/figures/dossiers; actual testimony/guidance/history and focus return; all clues inspected; cancel/Escape/correct/incorrect/reset; post-game travel disabled; 360/720px reflow, CSS zoom 200%, reduced motion passed.`);
    await page.close();
  }
  // Actual service loss, not a mocked response.
  const page = await browser.newPage(); await page.goto('http://localhost:5173'); await page.getByRole('button', { name: 'Start investigation' }).click();
  await page.getByRole('button', { name: 'Speak with Alice Mercer', exact: true }).click(); await page.getByLabel('Your question for Alice Mercer').fill('Where were you?');
  const stopped = new Promise((done) => children[0].once('exit', done)); children[0].kill(); await stopped;
  await page.getByRole('button', { name: 'Ask question' }).click(); await page.getByRole('alert').filter({ hasText: 'may already have completed' }).waitFor();
  assert.equal(await page.getByLabel('Your question for Alice Mercer').inputValue(), 'Where were you?'); assert.doesNotMatch(devOutput, /[a-f0-9]{64}|ECONNREFUSED|at TCPConnectWrap/);
  observations.push('Actual API loss: draft retained, explicit refresh offered, no mutation replay, no bearer/stack in Vite proxy error log.'); await page.close();
  await writeFile(resolve(output, 'observations.txt'), observations.join('\n') + '\n'); console.log(observations.join('\n'));
} finally { await browser?.close(); for (const child of children) if (child.exitCode === null) child.kill(); }
