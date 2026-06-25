import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// These tests encode the hard rules in CLAUDE.md / SKILL.md as executable checks,
// so the shared-stylesheet refactor (and the design system in general) can't
// silently regress. They are static-analysis only: read the files, no DOM/browser.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(join(root, f), 'utf8');

const htmlPages = readdirSync(root).filter((f) => f.endsWith('.html'));
// Knowledge pages are the numbered study cards (01–05); 06-feedback is a site page.
const knowledgePages = htmlPages.filter((f) => /^\d\d-/.test(f) && !/feedback/.test(f));
const tokens = read('tokens.css');

const styleBlock = (html) => {
  const m = html.match(/<style>([\s\S]*?)<\/style>/);
  return m ? m[1] : '';
};
const classesIn = (css) => new Set([...css.matchAll(/\.([A-Za-z][\w-]*)/g)].map((m) => m[1]));

test('site shape: 8 pages, 5 knowledge pages', () => {
  assert.equal(htmlPages.length, 8, `expected 8 html pages, got ${htmlPages.join(', ')}`);
  assert.equal(
    knowledgePages.length,
    5,
    `expected 5 knowledge pages, got ${knowledgePages.join(', ')}`,
  );
});

test('every page links the shared tokens.css', () => {
  for (const f of htmlPages) {
    assert.match(
      read(f),
      /<link\s+rel="stylesheet"\s+href="tokens\.css">/,
      `${f} must link tokens.css`,
    );
  }
});

test('no page re-inlines the shared base layer (it lives only in tokens.css)', () => {
  for (const f of htmlPages) {
    const css = styleBlock(read(f));
    assert.ok(!/--desk\s*:/.test(css), `${f} redeclares --desk; tokens belong in tokens.css`);
    assert.ok(!/box-sizing\s*:\s*border-box/.test(css), `${f} redeclares the box-sizing reset`);
    assert.ok(
      !/font-family:'Noto Sans SC',-apple-system/.test(css),
      `${f} redeclares the body font chain`,
    );
  }
});

test('tokens.css centralizes reduced-motion + the base breakpoints', () => {
  assert.match(tokens, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(tokens, /@media\s*\(max-width:\s*760px\)/);
});

test('stamps use mix-blend-mode (ink, not stickers)', () => {
  assert.match(tokens, /\.seal\s*\{[^}]*mix-blend-mode:\s*multiply/);
  assert.match(tokens, /\.stamp-sq\s*\{[^}]*mix-blend-mode:\s*multiply/);
  assert.match(read('404.html'), /\.stamp-reject\s*\{[^}]*mix-blend-mode:\s*multiply/);
});

test('no orphan classes: every class used in a page is defined in tokens.css or that page', () => {
  const tokenClasses = classesIn(tokens);
  for (const f of htmlPages) {
    const html = read(f);
    const defined = new Set([...tokenClasses, ...classesIn(styleBlock(html))]);
    const used = new Set();
    for (const m of html.matchAll(/class="([^"]*)"/g)) {
      for (const c of m[1].split(/\s+/)) if (c) used.add(c);
    }
    const orphans = [...used].filter((c) => !defined.has(c));
    assert.deepEqual(orphans, [], `${f} uses undefined classes: ${orphans.join(', ')}`);
  }
});

test('feedback board renders user content via textContent, never innerHTML (XSS guard)', () => {
  const src = read('06-feedback.html');
  // Any innerHTML assignment must be a static string literal (loading placeholder / clearing).
  for (const m of src.matchAll(/innerHTML\s*=\s*([^;]+);/g)) {
    const rhs = m[1].trim();
    assert.ok(/^(['"]).*\1$/.test(rhs), `innerHTML assigned a non-static value: ${rhs}`);
  }
  assert.ok(!/innerHTML\s*\+=/.test(src), 'must never append user data to innerHTML');
  assert.match(src, /\.textContent\s*=/, 'should build message nodes via textContent');
});

test('cross-page wiring: each knowledge page has #knowledge-page dots, exactly one active', () => {
  for (const f of knowledgePages) {
    const m = read(f).match(/<div class="dots">([\s\S]*?)<\/div>/);
    assert.ok(m, `${f} is missing its .dots progress indicator`);
    const spans = m[1].match(/<span/g) ?? [];
    const active = m[1].match(/class="active"/g) ?? [];
    assert.equal(
      spans.length,
      knowledgePages.length,
      `${f}: dot count must equal #knowledge pages`,
    );
    assert.equal(active.length, 1, `${f}: exactly one dot must be active`);
  }
});
