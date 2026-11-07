import { test, expect } from '@playwright/test';

async function start(page, preview = false) {
  await page.goto('/');
  if (preview) await page.getByRole('combobox', { name: 'Case', exact: true }).selectOption('greyhaven-preview');
  await page.getByRole('button', { name: 'Start investigation', exact: true }).click();
  await expect(page.getByRole('heading', { name: preview ? 'reception' : 'the study', exact: true })).toBeVisible();
}
async function checkMara(dossier) {
  await expect(dossier.getByText('Relationships', { exact: true })).toBeVisible();
  await expect(dossier.locator('li')).toHaveText(['Adrian Vale — Brother', 'Owen Vale — Son']);
  await expect(dossier.getByText('Her son', { exact: true })).toHaveCount(0);
}

test('public relationships identify Mara and Owen targets consistently in room, reader and overview', async ({ page }) => {
  const disclosures = [];
  page.on('request', (request) => { if (request.url().endsWith('/questions')) disclosures.push(request); });
  await start(page, true);
  await checkMara(page.locator('.room-person .public-dossier'));
  await page.getByRole('button', { name: 'Speak with Mara Vale', exact: true }).click();
  await page.getByRole('button', { name: 'Public dossier', exact: true }).click();
  await checkMara(page.getByRole('dialog').locator('.public-dossier'));
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Go to the boathouse' }).click();
  await expect(page.locator('.room-person .public-dossier li')).toHaveText(['Adrian Vale — Uncle', 'Mara Vale — Mother']);
  await page.getByRole('navigation').getByRole('button', { name: 'Investigation overview', exact: true }).click();
  const mara = page.locator('.suspect-card').filter({ has: page.getByRole('heading', { name: 'Mara Vale', exact: true }) });
  await checkMara(mara.locator('.public-dossier'));
  await expect(page.locator('.suspects-page')).not.toContainText(/Ruth|red sleeve|protective lie|maintenance fund/);
  expect(disclosures).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('Ashcroft retains public descriptions without repeating the same victim relationship', async ({ page }) => {
  await start(page);
  await page.getByRole('navigation').getByRole('button', { name: 'Investigation overview', exact: true }).click();
  const ben = page.locator('.suspect-card').filter({ has: page.getByRole('heading', { name: 'Ben Carter', exact: true }) });
  const clara = page.locator('.suspect-card').filter({ has: page.getByRole('heading', { name: 'Clara Voss', exact: true }) });
  await expect(ben).toContainText("Ben Carter works as Victor Hale's gardener.");
  await expect(ben.getByText('Employed by Victor Hale.', { exact: true })).toHaveCount(0);
  await expect(clara).toContainText("Clara Voss is Victor Hale's business partner and a frequent guest at Ashcroft Manor.");
  await expect(clara.getByText('Business partner of Victor Hale.', { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
