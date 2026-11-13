// Verify the actual production artifact, including the GitHub project-site prefix.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { chromium } from '../web/node_modules/@playwright/test/index.mjs';
const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'docs/homework-9/verification');
const prefix = '/Detective-game-with-AI-agents/';
const publicUrl = process.argv[2];
let server, browser;
await mkdir(output, { recursive: true });
if (!publicUrl) {
  const dist = resolve(root, 'promo/dist');
  server = createServer(async (req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (!pathname.startsWith(prefix)) { res.writeHead(404).end(); return; }
    const file = resolve(dist, decodeURIComponent(pathname.slice(prefix.length)) || 'index.html');
    if (!file.startsWith(dist + '/') && !file.startsWith(dist + '\\')) { res.writeHead(404).end(); return; }
    try {
      const mime = { '.html': 'text/html', '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml' }[extname(file)] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime }).end(await readFile(file));
    } catch { res.writeHead(404).end(); }
  });
  await new Promise((yes, no) => server.once('error', no).listen(5176, '127.0.0.1', yes));
}
const url = publicUrl || 'http://127.0.0.1:5176' + prefix;
const rows = [];
try {
  browser = await chromium.launch();
  for (const width of [360,390,768,1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const problems = [];
    page.on('pageerror', e => problems.push(e.message));
    page.on('response', r => { if (r.status() >= 400) problems.push('HTTP ' + r.status() + ' ' + new URL(r.url()).pathname); });
    page.on('request', r => { if (new URL(r.url()).pathname.includes('/api/')) problems.push('Unexpected API request'); });
    const response = await page.goto(url, { waitUntil: 'load' });
    assert.equal(response.status(),200);
    await page.locator('h1').waitFor();
    const state = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      headings: document.querySelectorAll('h1').length,
      images: [...document.images].map(i => ({ alt: i.alt, loaded: i.complete && i.naturalWidth > 0 })),
      anchors: [...document.querySelectorAll('a[href^="#"]')].every(a => document.getElementById(a.hash.slice(1))),
      duplicateIds: (() => { const ids=[...document.querySelectorAll('[id]')].map(n=>n.id); return ids.length !== new Set(ids).size; })(),
      helper: /impeccable-live|data-impeccable|SERVER_ONLY_CANARY/.test(document.documentElement.outerHTML),
      repo: document.querySelector('.text-link')?.href,
    }));
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.evaluate(async () => { await Promise.all([...document.images].map(i => i.decode().catch(()=>{}))); });
    state.images = await page.locator('img').evaluateAll(nodes => nodes.map(i => ({ alt:i.alt, loaded:i.complete && i.naturalWidth>0 })));
    assert.equal(state.overflow,false,`overflow at ${width}`);
    assert.equal(state.headings,1); assert.equal(state.anchors,true); assert.equal(state.duplicateIds,false); assert.equal(state.helper,false);
    assert.ok(state.images.every(i=>i.alt && i.loaded));
    assert.equal(state.repo,'https://github.com/esst-prog2/Detective-game-with-AI-agents');
    await page.goto(url, { waitUntil:'load' });
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('.skip').evaluate(el=>el===document.activeElement),true);
    await page.keyboard.press('Enter');
    assert.equal(new URL(page.url()).hash,'#main');
    await page.locator('.actions .button').click();
    assert.equal(new URL(page.url()).hash,'#try');
    if (width===1440) {
      await page.evaluate(()=>{document.documentElement.style.zoom='2'});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'200% reflow');
      await page.evaluate(()=>{document.documentElement.style.zoom=''});
    }
    await page.goto(url, {waitUntil:'load'});
    await page.screenshot({ path:resolve(output,`${publicUrl?'public':'production'}-${width}.png`), fullPage:true });
    assert.deepEqual(problems,[]);
    rows.push({width,passed:true,images:state.images.length,anchors:true,keyboard:true,noAPI:true,consoleErrors:0});
    await page.close();
  }
  await writeFile(resolve(output,publicUrl?'public-smoke.json':'production-smoke.json'),JSON.stringify({url,rows},null,2));
  console.log(JSON.stringify({url,rows}));
} finally { await browser?.close(); if(server) await new Promise(r=>server.close(r)); }
