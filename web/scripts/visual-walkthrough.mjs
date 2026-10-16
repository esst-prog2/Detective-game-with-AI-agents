// Separate real-browser walkthrough: screenshots are then visually inspected.
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('..', import.meta.url));
const destination = resolve(root, '../docs/browser-screenshots');
await mkdir(destination, { recursive: true });
const children = [];
let browser;
const notes = [];
let devOutput = '';
async function wait(url) {
  for (let i = 0; i < 100; i++) { try { await fetch(url); return; } catch { await new Promise((resolve) => setTimeout(resolve, 100)); } }
  throw Error('Local walkthrough server unavailable');
}
const nav = (page, name) => page.getByRole('navigation').getByRole('button', { name, exact: true });
try {
  children.push(spawn(process.execPath, ['e2e/offline-api.mjs'], { cwd: root, windowsHide: true, stdio: 'ignore' }));
  const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js'], { cwd: root, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  children.push(vite);
  vite.stdout.on('data', (data) => { devOutput += data.toString(); });
  vite.stderr.on('data', (data) => { devOutput += data.toString(); });
  await Promise.all([wait('http://127.0.0.1:3001'), wait('http://127.0.0.1:5173')]);
  browser = await chromium.launch();
  for (const [mode, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport });
    await page.goto('http://127.0.0.1:5173');
    await page.getByRole('button', { name: 'Start investigation' }).waitFor();
    await page.screenshot({ path: resolve(destination, `${mode}-title.png`), fullPage: true });
    await page.getByRole('button', { name: 'Start investigation' }).click();
    await page.getByRole('heading', { name: 'Choose a scene' }).waitFor();
    await page.screenshot({ path: resolve(destination, `${mode}-locations.png`), fullPage: true });
    for (const scene of ['the study', 'the library', 'the garden']) {
      await page.getByRole('button', { name: new RegExp(`${scene}.*View scene`, 'i') }).click();
      await page.getByRole('heading', { name: scene, exact: true }).waitFor();
      if (mode === 'desktop') await page.screenshot({ path: resolve(destination, `${mode}-${scene.slice(4)}.png`), fullPage: true });
      await nav(page, 'Locations').click();
    }
    await page.getByRole('button', { name: /the study.*View scene/i }).click();
    await page.getByRole('button', { name: 'Speak with Ben Carter', exact: true }).click();
    const question = page.getByLabel('Your question for Ben Carter');
    await question.fill('x'.repeat(1001));
    assert.equal(await page.getByRole('button', { name: 'Ask question' }).isDisabled(), true);
    await page.getByText('Keep your question within 1,000 characters.').waitFor();
    await question.fill('Where were you?'); await question.press('Enter');
    await page.locator('blockquote').filter({ hasText: 'greenhouse' }).waitFor();
    await page.locator('.dialogue-panel').scrollIntoViewIfNeeded();
    await page.screenshot({ path: resolve(destination, `${mode}-dialogue.png`), fullPage: true });
    await question.fill('How many purple planets are there?'); await question.press('Enter');
    await page.getByText('QUESTION GUIDANCE', { exact: true }).waitFor();
    await nav(page, 'Evidence journal').click();
    for (let i = 0; i < 3; i++) { await page.getByRole('button', { name: 'Inspect evidence' }).first().click(); await page.getByRole('button', { name: 'Review observation' }).nth(i).waitFor(); }
    await page.screenshot({ path: resolve(destination, `${mode}-journal.png`), fullPage: true });
    await nav(page, 'Suspects').click();
    await page.screenshot({ path: resolve(destination, `${mode}-suspects.png`), fullPage: true });
    const accuse = page.locator('.suspect-card').filter({ has: page.getByRole('heading', { name: 'Clara Voss', exact: true }) }).getByRole('button', { name: 'Accuse', exact: true });
    await accuse.click(); await page.getByRole('dialog').waitFor();
    await page.screenshot({ path: resolve(destination, `${mode}-accusation.png`), fullPage: true });
    await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
    assert.equal(await page.getByRole('button', { name: 'Confirm accusation' }).evaluate((el) => el === document.activeElement), true);
    await page.keyboard.press('Escape'); await page.getByRole('dialog').waitFor({ state: 'detached' });
    await accuse.click(); await page.getByRole('button', { name: 'Cancel accusation' }).click(); await page.getByRole('dialog').waitFor({ state: 'detached' });
    await accuse.click(); await page.getByRole('button', { name: 'Confirm accusation' }).click();
    await page.getByRole('heading', { name: 'The truth comes to light.' }).waitFor();
    await page.screenshot({ path: resolve(destination, `${mode}-conclusion.png`), fullPage: true });
    notes.push(`${mode}: real offline controls completed all scenes, received testimony/guidance, three inspections, Escape/button cancel and correct conclusion.`);
    await page.getByRole('button', { name: 'Start new investigation' }).click();
    await page.getByRole('heading', { name: 'Choose a scene' }).waitFor();
    await nav(page, 'Suspects').click();
    await page.locator('.suspect-card').filter({ has: page.getByRole('heading', { name: 'Alice Mercer', exact: true }) }).getByRole('button', { name: 'Accuse', exact: true }).click();
    await page.getByRole('button', { name: 'Confirm accusation' }).click();
    await page.getByRole('heading', { name: 'The case closes in shadow.' }).waitFor();
    assert.equal((await page.locator('.verdict').innerText()).includes('Clara'), false);
    await nav(page, 'Evidence journal').click(); assert.equal(await page.getByRole('button', { name: 'Inspect evidence' }).count(), 3);
    await page.setViewportSize({ width: 360, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    // 200% page zoom equivalent reflow from 1440 CSS pixels to 720.
    await page.setViewportSize({ width: 720, height: 450 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: resolve(destination, `${mode}-reflow.png`), fullPage: true });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
    // scrollWidth already includes overflow caused by CSS zoom.
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && document.body.getBoundingClientRect().right <= innerWidth + 1), true);
    await page.screenshot({ path: resolve(destination, `${mode}-zoom.png`), fullPage: true });
    await page.evaluate(() => { document.documentElement.style.zoom = ''; });
    notes.push(`${mode}: new-session wrong result, cleared notes, 360px and 720px/450px reflow passed; reduced motion enabled.`);
    await page.close();
  }
  const recovery = await browser.newPage();
  await recovery.goto('http://127.0.0.1:5173');
  await recovery.getByRole('button', { name: 'Start investigation' }).click();
  await recovery.getByRole('heading', { name: 'Choose a scene' }).waitFor();
  await nav(recovery, 'Suspects').click();
  await recovery.getByRole('button', { name: 'Speak with suspect' }).first().click();
  await recovery.getByLabel('Your question for Alice Mercer').fill('Where were you?');
  const stopped = new Promise((resolve) => children[0].once('exit', resolve)); children[0].kill(); await stopped;
  await recovery.getByRole('button', { name: 'Ask question' }).click();
  await recovery.getByRole('alert').filter({ hasText: 'may already have completed' }).waitFor();
  assert.equal(await recovery.getByLabel('Your question for Alice Mercer').inputValue(), 'Where were you?');
  assert.doesNotMatch(devOutput, /[a-f0-9]{64}|ECONNREFUSED|at TCPConnectWrap/);
  notes.push('Actual API process loss: friendly recovery, retained draft, no automatic retry; Vite log excludes bearer IDs and proxy stack.');
  await recovery.close();
  await writeFile(resolve(destination, 'walkthrough.txt'), notes.join('\n') + '\n');
  console.log(notes.join('\n'));
} finally { await browser?.close(); for (const child of children) child.kill(); }
