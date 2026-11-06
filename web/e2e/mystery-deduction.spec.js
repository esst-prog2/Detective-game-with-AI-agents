import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const output = new URL('../../docs/mystery-deduction/', import.meta.url);
const nav = (page, name) => page.getByRole('navigation').getByRole('button', { name, exact: true });
async function start(page) { await page.goto('/'); await page.getByRole('button', { name: 'Start investigation', exact: true }).click(); await expect(page.getByRole('heading', { name: 'the study', exact: true, level: 1 })).toBeVisible(); }
async function travel(page, room) {
  await nav(page, 'Rooms').click(); await page.locator('.location-card').filter({ has: page.getByRole('heading', { name: room, exact: true }) }).click();
  await expect(page.getByRole('heading', { name: room, exact: true, level: 1 })).toBeVisible();
}
async function talk(page, name) { await page.getByRole('button', { name: 'Speak with ' + name, exact: true }).click(); }
async function inspect(page, name) {
  await page.locator('.room-object').filter({ hasText: name }).click(); await expect(page.getByRole('button', { name: 'Close observation' })).toBeVisible();
  await page.getByRole('button', { name: 'Close observation' }).click();
}
async function choose(page, id, count) {
  await page.locator(`[data-choice="${id}"]`).click();
  await expect(page.getByRole('button', { name: `Conversation history (${count})`, exact: true })).toBeVisible();
}
async function accuse(page, name) {
  await nav(page, 'Investigation overview').click(); await page.locator('.suspect-card').filter({ has: page.getByRole('heading', { name, exact: true }) }).getByRole('button', { name: 'Accuse', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Confirming ends this investigation');
  await page.getByRole('button', { name: 'Confirm accusation', exact: true }).click();
  await expect(nav(page, 'Case result')).toHaveAttribute('aria-current', 'page');
}

test('public offline clue chain supports a circumstantial accusation and readable conclusion', async ({ page }, info) => {
  const observations = []; const errors = []; page.on('pageerror', (error) => errors.push(error.message));
  const pending = [];
  page.on('response', (response) => {
    const path = new URL(response.url()).pathname;
    if (response.request().method() === 'POST' && /\/(questions|evidence\/inspect|accusations)$/.test(path)) pending.push((async () => {
      const body = await response.json(); observations.push({ action: path.split('/').at(-1), status: response.status(), result: body.data?.result });
    })());
  });
  await start(page); await talk(page, 'Alice Mercer');
  await expect(page.locator('[data-choice="identify-cufflink"]')).toHaveCount(0);
  await page.getByRole('button', { name: /Return to room/ }).click();
  await inspect(page, 'Torn contract'); await inspect(page, 'Silver cufflink'); await talk(page, 'Alice Mercer');
  await expect(page.locator('.dialogue-choices button')).toHaveCount(6);
  await choose(page, 'identify-cufflink', 1);
  await expect(page.locator('blockquote')).toContainText('I cannot be certain this one belongs to her');
  await expect(page.locator('blockquote')).toContainText('how or when');
  await choose(page, 'ask-sighting', 2);
  await expect(page.locator('blockquote')).toContainText(/(?:did not see|not) where she went next/);
  await travel(page, 'the garden'); await inspect(page, 'Muddy footprints'); await talk(page, 'Ben Carter');
  await choose(page, 'present-footprints', 1); await expect(page.locator('blockquote')).toContainText(/anyone/i);
  await travel(page, 'the library'); await talk(page, 'Clara Voss');
  // All evidence inspected: evidence + social + six topics overflows the six slots.
  await expect(page.locator('.dialogue-choices button')).toHaveCount(6);
  await choose(page, 'ask-sighting', 1); await expect(page.locator('blockquote')).toContainText('nowhere near the garden');
  await choose(page, 'compare-garden-accounts', 2);
  await accuse(page, 'Clara Voss');
  const verdict = page.locator('.verdict'); await expect(verdict).toContainText('substantial circumstantial support');
  await expect(verdict).toContainText('could not be certain'); await expect(verdict).toContainText('without identifying their maker');
  await expect(verdict).not.toContainText('debt letter'); await expect(verdict).not.toContainText('evidence is incomplete');
  await mkdir(output, { recursive: true });
  await page.screenshot({ path: fileURLToPath(new URL(`${info.project.name}-supported.png`, output)), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.setViewportSize({ width: 360, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: fileURLToPath(new URL(`${info.project.name}-360px.png`, output)), fullPage: true });
  // Independently exercise 200% at a desktop viewport, as in the existing suite.
  // 360px plus 200% would request 180 CSS pixels, below the app's 320px minimum.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: fileURLToPath(new URL(`${info.project.name}-200-percent.png`, output)), fullPage: true });
  await Promise.all(pending); expect(errors).toEqual([]);
  await writeFile(new URL(`${info.project.name}-public-actions.json`, output), JSON.stringify({ observations, conclusion: await verdict.innerText(), pageErrors: errors }, null, 2) + '\n');
});

test('correct guess and partial evidence remain incomplete; wrong verdict stays private', async ({ page }) => {
  await start(page); await accuse(page, 'Clara Voss');
  await expect(page.locator('.verdict')).toContainText('evidence is incomplete');
  await expect(page.locator('.verdict')).not.toContainText('cufflink');
  await page.getByRole('button', { name: 'Start new investigation' }).click();
  await inspect(page, 'Silver cufflink'); await accuse(page, 'Clara Voss');
  await expect(page.locator('.verdict')).toContainText('its owner and arrival time were not established');
  await expect(page.locator('.verdict')).not.toContainText('Alice');
  await page.getByRole('button', { name: 'Start new investigation' }).click();
  await accuse(page, 'Alice Mercer'); await expect(page.locator('.verdict')).toContainText('Incorrect. Alice Mercer is innocent');
  await expect(page.locator('.verdict')).not.toContainText(/Clara|library|debt|cufflink/);
});

test('core evidence suffices without collecting every clue or asking every topic', async ({ page }) => {
  await start(page); await inspect(page, 'Torn contract'); await inspect(page, 'Silver cufflink'); await talk(page, 'Alice Mercer');
  await choose(page, 'identify-cufflink', 1); await choose(page, 'ask-sighting', 2);
  await travel(page, 'the library'); await talk(page, 'Clara Voss'); await choose(page, 'ask-sighting', 1);
  await accuse(page, 'Clara Voss'); await expect(page.locator('.verdict')).toContainText('substantial circumstantial support');
  await expect(page.locator('.verdict')).not.toContainText(/footprints|Ben explained|evidence is incomplete/);
});
