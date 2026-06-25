import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// These tests encode the hard rules in CLAUDE.md / SKILL.md as executable checks,
// so the shared-stylesheet refactor (and the design system in general) can't
// silently regress. They are static-analysis only: read the files, no DOM/browser.

// The site (HTML pages + tokens.css) lives in src/; functions/ stays at the repo root.
const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const read = (f) => readFileSync(join(root, f), 'utf8');

const htmlPages = readdirSync(root).filter((f) => f.endsWith('.html'));
// Knowledge pages are the topic cards; everything else is a site page.
const sitePages = new Set(['index.html', '404.html', 'feedback.html']);
const knowledgePages = htmlPages.filter((f) => !sitePages.has(f));
const tokens = read('tokens.css');

const styleBlock = (html) => {
  const m = html.match(/<style>([\s\S]*?)<\/style>/);
  return m ? m[1] : '';
};
const classesIn = (css) => new Set([...css.matchAll(/\.([A-Za-z][\w-]*)/g)].map((m) => m[1]));

test('site shape: the three site pages exist, plus at least one knowledge card', () => {
  for (const p of sitePages) {
    assert.ok(htmlPages.includes(p), `missing site page ${p}`);
  }
  assert.ok(
    knowledgePages.length >= 1,
    `expected at least one knowledge page, got ${knowledgePages.join(', ')}`,
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
  const src = read('feedback.html');
  // Any innerHTML assignment must be a static string literal (loading placeholder / clearing).
  for (const m of src.matchAll(/innerHTML\s*=\s*([^;]+);/g)) {
    const rhs = m[1].trim();
    assert.ok(/^(['"]).*\1$/.test(rhs), `innerHTML assigned a non-static value: ${rhs}`);
  }
  assert.ok(!/innerHTML\s*\+=/.test(src), 'must never append user data to innerHTML');
  assert.match(src, /\.textContent\s*=/, 'should build message nodes via textContent');
});

test('cross-page wiring: per-subject dots (count = subject size, exactly one active)', () => {
  // Each knowledge page declares its subject; dots are a per-subject progress bar.
  const bySubject = {};
  for (const f of knowledgePages) {
    const html = read(f);
    const sm = html.match(/<body[^>]*\sdata-subject="([^"]+)"/);
    assert.ok(sm, `${f} must declare <body data-subject="...">`);
    (bySubject[sm[1]] ||= []).push(f);
  }
  for (const [subject, files] of Object.entries(bySubject)) {
    for (const f of files) {
      const m = read(f).match(/<div class="dots">([\s\S]*?)<\/div>/);
      assert.ok(m, `${f} is missing its .dots progress indicator`);
      const spans = m[1].match(/<span/g) ?? [];
      const active = m[1].match(/class="active"/g) ?? [];
      assert.equal(
        spans.length,
        files.length,
        `${f}: dot count must equal the ${subject} series size (${files.length})`,
      );
      assert.equal(active.length, 1, `${f}: exactly one dot must be active`);
    }
  }
});

test('term links: any page using .term / .term-detail loads the shared terms.js', () => {
  for (const f of htmlPages) {
    const html = read(f);
    const usesTerms = /class="term"/.test(html) || /class="term-detail"/.test(html);
    if (usesTerms) {
      assert.match(
        html,
        /<script[^>]+src="terms\.js"/,
        `${f} uses term links but does not load terms.js`,
      );
    }
  }
});

test('term links: every .term button has a matching .term-detail template (and vice versa)', () => {
  for (const f of htmlPages) {
    const html = read(f);
    const used = [...html.matchAll(/<button[^>]*class="term"[^>]*data-term="([^"]+)"/g)].map(
      (m) => m[1],
    );
    const defined = [
      ...html.matchAll(/<template[^>]*class="term-detail"[^>]*data-term="([^"]+)"/g),
    ].map((m) => m[1]);
    for (const k of used) {
      assert.ok(defined.includes(k), `${f}: .term "${k}" has no matching .term-detail template`);
    }
    for (const k of defined) {
      assert.ok(
        used.includes(k),
        `${f}: .term-detail template "${k}" is never referenced by a .term`,
      );
    }
  }
});

test('homepage wires a topic search box + catalog filter script', () => {
  const html = read('index.html');
  assert.match(html, /id="topicSearch"/, 'index.html is missing the #topicSearch input');
  assert.match(
    html,
    /<script>[\s\S]*topicSearch[\s\S]*\.catalog \.tcard[\s\S]*<\/script>/,
    'index.html is missing the search script that filters .catalog .tcard',
  );
});

test('homepage shows visitor count + like/dislike reactions wired to /api/stats', () => {
  const html = read('index.html');
  assert.match(html, /id="visitCount"/, 'index.html is missing the visitor counter');
  assert.match(html, /id="likeBtn"/, 'index.html is missing the like button');
  assert.match(html, /id="dislikeBtn"/, 'index.html is missing the dislike button');
  assert.match(html, /\/api\/stats/, 'index.html should talk to /api/stats');
});
