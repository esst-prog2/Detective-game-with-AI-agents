// Real gameplay captures only; keep this development helper out of the public site.
import { chromium } from '../web/node_modules/@playwright/test/index.mjs';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'docs/homework-9/captures');
const children = []; let browser;
await mkdir(output, { recursive: true });
const offline = { ...process.env, API_PORT: '3002', OPENAI_API_KEY: '', OPENAI_MODEL: '' };
async function ready(url) {
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(url)).ok) return; } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  throw Error('Capture server not ready: ' + url);
}
try {
  children.push(spawn(process.execPath, ['src/server.js'], { cwd: root, env: offline, windowsHide: true, stdio: 'ignore' }));
  children.push(spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '::1'], { cwd: resolve(root, 'web'), env: offline, windowsHide: true, stdio: 'ignore' }));
  await Promise.all([ready('http://127.0.0.1:3002/api/cases'), ready('http://[::1]:5173')]);
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173');
  await page.getByRole('button', { name: 'Start investigation', exact: true }).click();
  await page.getByRole('heading', { name: 'the study', exact: true, level: 1 }).waitFor();
  await page.screenshot({ path: resolve(output, 'study.png'), fullPage: true });
  await page.locator('.room-object').filter({ hasText: 'Silver cufflink' }).click();
  await page.getByRole('button', { name: 'Close observation' }).waitFor();
  await page.screenshot({ path: resolve(output, 'evidence.png'), fullPage: true });
  await page.getByRole('button', { name: 'Close observation' }).click();
  await page.getByRole('button', { name: 'Speak with Alice Mercer', exact: true }).click();
  await page.getByLabel('Your question for Alice Mercer').waitFor();
  await page.screenshot({ path: resolve(output, 'dialogue.png'), fullPage: true });
  await page.goto('http://localhost:5173');
  await page.getByRole('combobox', { name: 'Case', exact: true }).selectOption('greyhaven-preview');
  await page.getByRole('button', { name: 'Start investigation', exact: true }).click();
  await page.getByRole('heading', { name: 'reception', exact: true }).waitFor();
  await page.screenshot({ path: resolve(output, 'preview.png'), fullPage: true });
  await writeFile(resolve(output, 'provenance.json'), JSON.stringify({ date: '2026-11-13', source: 'Actual current offline Node API and Vite browser game; no mocked responses or edited content', viewport: '1440x900', captures: ['study.png','evidence.png','dialogue.png','preview.png'], spoilers: 'No accusation, result or solution screen captured' }, null, 2));
  console.log('Captured current room exploration, evidence inspection, initial dialogue and separate preview through actual offline gameplay.');
} finally {
  await browser?.close();
  for (const child of children) child.kill();
}
