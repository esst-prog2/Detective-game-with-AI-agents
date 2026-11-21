// Run after the promo production build, never against Vite's development server.
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';

const dist = resolve(import.meta.dirname, '../promo/dist');
const html = await readFile(resolve(dist, 'index.html'), 'utf8');
const base = new URL('https://example.test/Detective-game-with-AI-agents/');
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`))?.[1];
const tags = (text, name) => [...text.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g'))].map(m => m[0]);
async function builtFile(value) {
  assert.ok(value, 'Missing asset path');
  const url = new URL(value, base);
  assert.equal(url.origin, base.origin, `Nonlocal asset: ${value}`);
  assert.ok(url.pathname.startsWith(base.pathname), `Asset escapes project base: ${value}`);
  const file = resolve(dist, decodeURIComponent(url.pathname.slice(base.pathname.length)));
  const local = relative(dist, file);
  assert.ok(local && !local.startsWith('..') && !isAbsolute(local), `Unsafe asset path: ${value}`);
  assert.ok((await stat(file)).isFile(), `Missing built asset: ${value}`);
  return file;
}
assert.doesNotMatch(html, /(?:localhost|127\.0\.0\.1):(?:5174|5175|5176|8400)\b|impeccable-live/,
  'Preview/helper URL leaked into production (the documented local-game port 5173 is intentional)');
const figures = [...html.matchAll(/<figure\b[^>]*>[\s\S]*?<\/figure>/g)].map(m => m[0]);
assert.equal(figures.length, 3, 'Expected study, evidence and dialogue figures');
const links = [];
for (const [index, figure] of figures.entries()) {
  const image = tags(figure, 'img')[0];
  const destination = await builtFile(attr(image, 'src'));
  assert.equal(new URL(attr(image, 'src'), base).pathname,
    base.pathname + 'screenshots/' + ['study.webp', 'evidence.webp', 'dialogue.webp'][index]);
  const anchors = tags(figure, 'a').filter(t => /(?:screenshot-link|full-size)/.test(attr(t, 'class') || ''));
  assert.equal(anchors.length, 2, 'Each screenshot needs image and caption links');
  for (const anchor of anchors) {
    const href = attr(anchor, 'href');
    assert.equal(await builtFile(href), destination, `Full-size link differs from its screenshot: ${href}`);
    links.push(href);
  }
}
for (const image of tags(html, 'img')) {
  const src = attr(image, 'src');
  if (!src?.startsWith('data:image/')) await builtFile(src);
}
for (const link of tags(html, 'link').filter(t => attr(t, 'rel') === 'stylesheet')) await builtFile(attr(link, 'href'));
assert.equal(links.length, 6);
console.log(JSON.stringify({ passed: true, basePath: base.pathname, fullSizeLinks: links, figures: figures.length }));
