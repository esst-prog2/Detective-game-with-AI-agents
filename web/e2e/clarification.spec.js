import { test, expect } from '@playwright/test';
import { once } from 'node:events';
import { infrastructureCase } from '../../test-support/infrastructure-case.js';
import { createCaseRegistry } from '../../src/cases/registry.js';
import { createSessionStore } from '../../src/investigation-sessions.js';
import { createInvestigationServer } from '../../src/http-api.js';

// Real HTTP/session/engine in the test process, never a production-published fixture.
let server, url;
test.beforeAll(async () => {
  const fixture = infrastructureCase();
  const registry = createCaseRegistry({ definitions: [fixture], defaultCaseId: fixture.id });
  server = createInvestigationServer({ store: createSessionStore({ registry }) });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  url = `http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async () => { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); });

async function connect(page, bodies = [], replies = []) {
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    if (!new URL(request.url()).pathname.startsWith('/api/')) return route.continue();
    if (request.url().endsWith('/questions')) bodies.push(request.postDataJSON());
    const response = await fetch(url + new URL(request.url()).pathname, { method: request.method(),
      headers: request.method() === 'POST' ? { 'Content-Type': 'application/json' } : {}, body: request.postData() ?? undefined });
    const json = await response.json(); replies.push(json);
    await route.fulfill({ status: response.status, json });
  });
}

test('supporting witness, connected exits and read-only interview navigation', async ({ page }) => {
  const bodies = [];
  await connect(page, bodies);
  await page.goto('/');
  await page.getByRole('button', { name: 'Start investigation' }).click();
  await expect(page.getByRole('button', { name: 'Speak with Test Keeper' })).toBeVisible();
  await page.getByRole('button', { name: 'Speak with Test Visitor' }).click();
  await page.getByRole('button', { name: 'Next questions' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Page 2 of 2')).toBeVisible();
  expect(bodies).toHaveLength(0);
  await page.locator('[data-choice]').first().click();
  await expect(page.getByLabel('Review received statement')).toBeVisible();
  const delivered = await page.locator('blockquote').innerText();
  await page.getByLabel('Review received statement').selectOption({ index: 1 });
  await expect(page.getByLabel('Reviewed statement')).toHaveText(delivered);
  expect(bodies).toHaveLength(1);
  await page.getByRole('button', { name: 'Return to room' }).click();
  await page.getByRole('button', { name: 'Make an accusation' }).click();
  await expect(page.getByLabel('Selected suspect').locator('option')).toHaveText(['Test Keeper']);
  await page.getByRole('button', { name: 'Cancel accusation' }).click();
  await expect(page.getByRole('button', { name: /Go to the test lobby/ })).toHaveCount(0);
  await page.getByRole('button', { name: /Go to the test office/ }).click();
  await page.getByRole('button', { name: /Go to the test lobby/ }).click();
  await expect(page.getByRole('heading', { name: 'the test lobby' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('contextual menu and text clarify revised testimony without exposing private targets', async ({ page }) => {
  const bodies = [], replies = [];
  await connect(page, bodies, replies);
  await page.goto('/'); await page.getByRole('button', { name: 'Start investigation', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'the test pier', exact: true })).toBeVisible();
  await page.locator('.room-object').filter({ hasText: 'Test Ticket' }).click();
  await page.getByRole('button', { name: 'Close observation' }).click();
  const talk = async (name) => page.getByRole('button', { name: 'Speak with ' + name, exact: true }).click();
  const back = async () => page.getByRole('button', { name: 'Return to room' }).click();
  const ask = async (name, question, expected) => {
    await page.getByLabel('Your question for ' + name).fill(question);
    await page.getByRole('button', { name: 'Ask question' }).click();
    await expect(page.locator('blockquote')).toContainText(expected);
  };
  await talk('Test Keeper'); await ask('Test Keeper', 'Where were you?', 'There was no visit to the store.');
  await back(); await talk('Test Visitor'); await ask('Test Visitor', 'Where were you?', 'I was watching the store from the pier.');
  await ask('Test Visitor', 'Did you see anyone suspicious?', 'I saw the storekeeper alive after that visit.');
  await back(); await talk('Test Keeper');
  await page.locator('[data-choice="reconsider-visit"]').click();
  await expect(page.locator('blockquote')).toContainText('I did not see what happened inside.');
  await expect(page.locator('.dialogue-choices button')).toHaveCount(6);
  await page.locator('[data-choice="keeper-current-source"]').click();
  await expect(page.locator('blockquote')).toContainText('I saw the visitor cross the store threshold from the pier. I could not see inside.');
  await expect(page.getByRole('heading', { name: 'Continue the conversation' })).toBeFocused();
  await ask('Test Keeper', 'Who crossed the threshold?', 'I recognized the visitor by the yellow raincoat.');
  await ask('Test Keeper', 'When did that happen?', 'I cannot add that detail');
  await ask('Test Keeper', 'Explain your original pier account.', 'I gave you that pier account earlier. I have corrected it:');
  await ask('Test Keeper', 'What do you mean by that?', 'I gave you that pier account earlier. I have corrected it:');
  await ask('Test Keeper', 'Where were you?', 'I saw the visitor enter the store. I did not see what happened inside.');
  await ask('Test Keeper', 'How do you know?', 'I saw the visitor cross the store threshold from the pier.');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  expect(JSON.stringify(replies)).not.toMatch(/primaryTargets|primaryStatement|historicalCoreId|epistemics|CLARIFICATION_PRIVATE_CANARY/);
  for (const body of bodies) expect(Object.keys(body).sort()).toEqual(('choiceId' in body ? ['choiceId', 'expectedRevision', 'suspectId'] : ['expectedRevision', 'question', 'suspectId']));
});
