import { test, expect } from '@playwright/test';

test('public manifest offers Ashcroft and preview and explicit selection keeps the offline experience', async ({ page }) => {
  const creations = [];
  page.on('request', (request) => { if (request.method() === 'POST' && request.url().endsWith('/api/investigations')) creations.push(request.postDataJSON()); });
  await page.goto('/');
  const selector = page.getByRole('combobox', { name: 'Case', exact: true });
  await expect(selector).toBeVisible();
  await expect(selector.locator('option')).toHaveCount(2);
  await expect(selector).toHaveValue('ashcroft');
  await expect(selector.locator('option')).toHaveText(['The Ashcroft Manor Murder', 'The Last Bell at Greyhaven — Repair Dispute Preview']);
  const manifest = await page.request.get('/api/cases');
  expect(await manifest.json()).toEqual({ ok: true, data: { cases: [{ id: 'ashcroft', title: 'The Ashcroft Manor Murder', mode: 'full' }, { id: 'greyhaven-preview', title: 'The Last Bell at Greyhaven — Repair Dispute Preview', mode: 'preview' }] }, error: null });
  await page.getByRole('button', { name: 'Start investigation' }).click();
  await expect(page.getByRole('heading', { name: 'the study', exact: true })).toBeVisible();
  expect(creations).toEqual([{ caseId: 'ashcroft' }]);
  await page.getByRole('button', { name: 'Speak with Alice Mercer', exact: true }).click();
  await page.getByLabel('Your question for Alice Mercer').fill('Where were you?');
  await page.getByLabel('Your question for Alice Mercer').press('Enter');
  await expect(page.locator('blockquote')).toContainText('I was at home in my room all evening.');
});

test('manifest failure is recoverable and unavailable selection never installs a session', async ({ page }) => {
  let unavailable = true;
  await page.route('**/api/cases', (route) => {
    if (unavailable) return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, data: null, error: { code: 'internal_error' } }) });
    return route.continue();
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Retry case list' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start investigation' })).toBeDisabled();
  unavailable = false;
  await page.getByRole('button', { name: 'Retry case list' }).click();
  await expect(page.getByRole('combobox', { name: 'Case', exact: true })).toHaveValue('ashcroft');
  await page.route('**/api/investigations', (route) => route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ ok: false, data: null, error: { code: 'invalid_request' } }) }));
  await page.getByRole('button', { name: 'Start investigation' }).click();
  await expect(page.getByText('Check your question or selection and try again.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start investigation' })).toBeEnabled();
  await expect(page.getByRole('combobox', { name: 'Case', exact: true })).toHaveValue('ashcroft');
});

test('mismatched session metadata is rejected before gameplay is installed', async ({ page }) => {
  await page.route('**/api/investigations', async (route) => {
    const response = await route.fetch();
    const envelope = await response.json();
    envelope.data.case = { id: 'another-case', mode: 'full' };
    await route.fulfill({ response, json: envelope });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Start investigation' }).click();
  await expect(page.getByText(/The reply could not be received/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start investigation' })).toBeEnabled();
  await expect(page.getByRole('heading', { name: 'the study', exact: true })).toHaveCount(0);
});
