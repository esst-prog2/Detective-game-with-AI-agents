import { test, expect } from '@playwright/test';

const nav = (page, label) => page.getByRole('navigation').getByRole('button', { name: label, exact: true });
async function start(page, preview = false) {
  await page.goto('/');
  if (preview) await page.getByRole('combobox', { name: 'Case', exact: true }).selectOption('greyhaven-preview');
  await page.getByRole('button', { name: 'Start investigation', exact: true }).click();
  await expect(page.getByRole('heading', { name: preview ? 'reception' : 'the study', exact: true })).toBeVisible();
}
async function another(page, caseId) {
  const button = nav(page, 'Start another case'); await expect(button).toBeVisible({ timeout: 1500 }); await button.click();
  const dialog = page.getByRole('dialog', { name: 'Start a new investigation' });
  await expect(dialog).toBeVisible(); await dialog.getByRole('combobox', { name: 'New case', exact: true }).selectOption(caseId);
  await dialog.getByRole('button', { name: 'Start selected case', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('heading', { name: caseId === 'ashcroft' ? 'the study' : 'reception', exact: true })).toBeVisible();
}
async function accuse(page) {
  await page.getByRole('button', { name: 'Make an accusation', exact: true }).click();
  await page.getByLabel('Selected suspect').selectOption('clara-voss');
  await page.getByRole('button', { name: 'Confirm accusation', exact: true }).click();
  await expect(page.locator('.verdict')).toContainText('Correct.');
}

test('new-case selection remains available across active, preview and ended investigations', async ({ page }) => {
  const creations = []; const responses = [];
  page.on('response', (response) => { if (response.request().method() === 'POST' && new URL(response.url()).pathname === '/api/investigations') responses.push(response.json().then((body) => creations.push(body.data))); });
  await start(page);
  await page.locator('.room-object').filter({ hasText: 'Silver cufflink' }).click();
  await page.getByRole('button', { name: 'Close observation' }).click();
  // Reading/canceling the chooser must retain this session and its notes.
  const chooser = nav(page, 'Start another case'); await expect(chooser).toBeVisible({ timeout: 1500 }); await chooser.focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Start a new investigation' })).toBeVisible();
  await page.keyboard.press('Escape'); await expect(chooser).toBeFocused();
  await expect(page.locator('.room-object').filter({ hasText: 'Silver cufflink' })).toContainText('Review observation');
  await another(page, 'greyhaven-preview');
  await nav(page, 'Evidence journal').click(); await expect(page.locator('.evidence-description')).toHaveCount(0);
  await nav(page, 'Current room').click(); await page.getByRole('button', { name: 'Speak with Mara Vale', exact: true }).click();
  await page.getByLabel('Your question for Mara Vale').fill('Where were you?'); await page.getByRole('button', { name: 'Ask question' }).click();
  await expect(page.getByRole('button', { name: 'Conversation history (1)', exact: true })).toBeVisible();
  await another(page, 'ashcroft');
  await page.getByRole('button', { name: 'Speak with Alice Mercer', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Conversation history (0)', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Return to room' }).click(); await accuse(page);
  await another(page, 'greyhaven-preview');
  await Promise.all(responses);
  expect(creations.map((data) => data.case)).toEqual([{ id: 'ashcroft', mode: 'full' }, { id: 'greyhaven-preview', mode: 'preview' }, { id: 'ashcroft', mode: 'full' }, { id: 'greyhaven-preview', mode: 'preview' }]);
  expect(new Set(creations.map((data) => data.sessionId)).size).toBe(4);
  for (const data of creations) {
    expect(data.revision).toBe(0); expect(data.state.dialogue.inspectedEvidenceIds).toEqual([]);
    expect(data.state.dialogue.conversations.every((row) => row.recentTurns.length === 0)).toBe(true);
  }
  // Original ended session is still the original ended Ashcroft session.
  const old = await page.request.get(`/api/investigations/${creations[2].sessionId}`); const ended = (await old.json()).data;
  expect(ended.case).toEqual({ id: 'ashcroft', mode: 'full' }); expect(ended.state.lifecycle.status).toBe('ended');
});

test('journal and room observation reviews visibly reopen received details without commands', async ({ page }) => {
  for (const preview of [false, true]) {
    await start(page, preview);
    if (preview) await page.getByRole('button', { name: 'Go to the boathouse' }).click();
    const clue = preview ? 'Pump pressure-test worksheet' : 'Silver cufflink';
    const object = page.locator('.room-object').filter({ hasText: clue });
    await object.click(); await expect(page.getByRole('button', { name: 'Close observation' })).toBeVisible();
    const text = await page.locator('.room-observation p').innerText();
    await page.getByRole('button', { name: 'Close observation' }).click();
    await nav(page, 'Evidence journal').click();
    const commands = []; const listener = (request) => { if (request.method() === 'POST') commands.push(request.url()); };
    page.on('request', listener);
    const review = page.locator('.evidence-card').filter({ has: page.getByRole('heading', { name: clue, exact: true }) }).getByRole('button', { name: 'Review observation' });
    await review.focus(); await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Observation — ' + clue }); await expect(dialog).toBeVisible({ timeout: 1500 });
    await expect(dialog).toContainText(text); await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
    await page.keyboard.press('Escape'); await expect(review).toBeFocused();
    await nav(page, 'Current room').click(); await object.click();
    await expect(page.getByRole('dialog', { name: 'Observation — ' + clue })).toBeVisible();
    await page.keyboard.press('Escape'); expect(commands).toEqual([]); page.off('request', listener);
  }
});

test('preview explains unavailable accusations at the action location and server stays unchanged', async ({ page }) => {
  const creation = page.waitForResponse((response) => response.request().method() === 'POST' && new URL(response.url()).pathname === '/api/investigations');
  await start(page, true);
  const explanation = page.locator('.room-exits').getByRole('note', { name: 'Final accusation unavailable' });
  await expect(explanation).toBeVisible({ timeout: 1500 }); await expect(explanation).toContainText('cannot be solved');
  await expect(page.getByRole('button', { name: 'Make an accusation', exact: true })).toHaveCount(0);
  const before = (await (await creation).json()).data;
  const rejected = await page.request.post(`/api/investigations/${before.sessionId}/accusations`, { data: { suspectId: 'owen-vale', confirmed: true, expectedRevision: before.revision } });
  expect(rejected.status()).toBe(409); expect((await rejected.json()).error.code).toBe('accusation_unavailable');
  const refreshed = await page.request.get(`/api/investigations/${before.sessionId}`); const after = (await refreshed.json()).data;
  expect(after.revision).toBe(before.revision); expect(after.state).toEqual(before.state);
  await page.getByRole('button', { name: 'Start a new Ashcroft investigation' }).click();
  await expect(page.getByRole('button', { name: 'Make an accusation', exact: true })).toBeVisible(); await accuse(page);
});
