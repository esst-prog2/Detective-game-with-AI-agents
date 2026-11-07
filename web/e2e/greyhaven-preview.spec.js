import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { M0, O0, O1, work, guarded, reason } from '../../test-support/greyhaven-preview-oracle.js';

async function start(page) {
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Case', exact: true }).selectOption('greyhaven-preview');
  await expect(page.getByText(/no final murder verdict is available/)).toBeVisible();
  await page.getByRole('button', { name: 'Start investigation', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'reception', exact: true })).toBeVisible();
}
const talk = (page, name) => page.getByRole('button', { name: 'Speak with ' + name, exact: true }).click();
const back = (page) => page.getByRole('button', { name: 'Return to room' }).click();
async function ask(page, name, question, expected) {
  await page.getByLabel('Your question for ' + name).fill(question);
  await page.getByRole('button', { name: 'Ask question' }).click(); await expect(page.locator('blockquote')).toContainText(expected);
}
async function inspect(page, name) {
  await page.locator('.room-object').filter({ hasText: name }).click();
  await expect(page.getByRole('button', { name: 'Close observation' })).toBeVisible();
  await page.getByRole('button', { name: 'Close observation' }).click();
}

test('offline preview earns the admission through visible investigation and returns cleanly to Ashcroft', async ({ page }, info) => {
  const replies = [], errors = []; page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', async (response) => { if (new URL(response.url()).pathname.startsWith('/api/') && response.ok()) replies.push(await response.json()); });
  await start(page); await expect(page.getByLabel('Preview objective')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Make an accusation', exact: true })).toHaveCount(0);
  await talk(page, 'Mara Vale'); await ask(page, 'Mara Vale', 'Where were you?', M0);
  await page.locator('[data-choice="mara-source"]').click(); await expect(page.locator('blockquote')).toContainText(guarded);
  await back(page); await page.getByRole('button', { name: 'Go to the boathouse' }).click(); await talk(page, 'Owen Vale');
  await ask(page, 'Owen Vale', 'Explain the maintenance fund payment and the argument.', 'Try asking');
  await expect(page.locator('[data-choice="present-pump-payment"]')).toHaveCount(0);
  await ask(page, 'Owen Vale', 'Where were you?', O0);
  await page.locator('[data-choice="owen-work"]').click(); await expect(page.locator('blockquote')).toContainText(work);
  await back(page); await inspect(page, 'Pump pressure-test worksheet'); await inspect(page, 'Repayment demand'); await talk(page, 'Owen Vale');
  await page.locator('[data-choice="present-pump-payment"]').click(); await expect(page.locator('blockquote')).toContainText(O1);
  await expect(page.getByRole('heading', { name: 'Continue the conversation' })).toBeFocused();
  await ask(page, 'Owen Vale', 'Why hide a repair that helped someone?', reason);
  await ask(page, 'Owen Vale', 'Explain your earlier work account.', O1);
  await ask(page, 'Owen Vale', 'What do you mean by that?', O1);
  await ask(page, 'Owen Vale', 'Where were you?', O1);
  await page.getByRole('button', { name: 'Go to reception' }).click(); await talk(page, 'Mara Vale');
  await ask(page, 'Mara Vale', 'Where were you?', M0);
  const session = replies.find((r) => r.data?.sessionId)?.data.sessionId;
  const read = await page.request.get(`/api/investigations/${session}`); const current = (await read.json()).data;
  const accusation = await page.request.post(`/api/investigations/${session}/accusations`, { data: { expectedRevision: current.revision, suspectId: 'owen-vale', confirmed: true } });
  expect(accusation.status()).toBe(409); expect((await accusation.json()).error.code).toBe('accusation_unavailable');
  await expect(page.getByText('Repair spending does not establish murder guilt.', { exact: false })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  const output = new URL('../../docs/greyhaven-preview/', import.meta.url); await mkdir(output, { recursive: true });
  await page.screenshot({ path: fileURLToPath(new URL(`${info.project.name}-preview.png`, output)), fullPage: true });
  await writeFile(new URL(`${info.project.name}-public-actions.json`, output), JSON.stringify(replies.map((r) => ({ case: r.data?.case, revision: r.data?.revision, result: r.data?.result })), null, 2) + '\n');
  expect(JSON.stringify(replies)).not.toMatch(/Ruth|20:38|epistemics|primaryTargets|murdererId/); expect(errors).toEqual([]);
  await page.getByRole('button', { name: 'Start a new Ashcroft investigation' }).click();
  await expect(page.getByRole('heading', { name: 'the study', exact: true })).toBeVisible();
  await expect(page.getByLabel('Preview objective')).toHaveCount(0);
  await page.getByRole('button', { name: 'Speak with Alice Mercer', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Conversation history (0)', exact: true })).toBeVisible();
  await ask(page, 'Alice Mercer', 'Where were you?', 'I was at home in my room all evening.');
});

test('evidence-first reverse order still requires received O0 and supports text presentation', async ({ page }) => {
  await start(page); await page.getByRole('button', { name: 'Go to the boathouse' }).click();
  await inspect(page, 'Repayment demand'); await inspect(page, 'Pump pressure-test worksheet'); await talk(page, 'Owen Vale');
  await expect(page.locator('[data-choice="present-pump-payment"]')).toHaveCount(0);
  await ask(page, 'Owen Vale', 'Explain the maintenance fund payment and the argument.', 'Try asking');
  await ask(page, 'Owen Vale', 'Where were you?', O0);
  await ask(page, 'Owen Vale', 'Explain the maintenance fund payment and the argument.', O1);
  await expect(page.getByRole('button', { name: 'Make an accusation', exact: true })).toHaveCount(0);
  await page.getByRole('navigation').getByRole('button', { name: 'Investigation overview', exact: true }).click();
  await expect(page.locator('.suspect-card')).toHaveCount(2); await expect(page.getByRole('button', { name: 'Accuse', exact: true })).toHaveCount(0);
});
