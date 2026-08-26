#!/usr/bin/env node
// Dev-only head consistency check. Not part of the shipped site (no build step).
//
// The published site has ~80 hand-written HTML pages, each carrying its own
// <head>. Some head fragments are intentionally identical across every page
// (the font block, the shared OG/Twitter image, favicon link, og:site_name…).
// When those shared fragments change — most commonly when the canonical
// domain changes — a naive find/replace can silently miss a page. This script
// diffs every page's <head> against a single source of truth and exits non-zero
// with a precise list on any drift, so CI fails before deploy.
//
// Per-page-unique tags (title, description, og:title/description/url, canonical,
// og:type) are NOT checked here — the design-system test already enforces their
// presence; only their *value* differs by design.
//
// Run:  node scripts/check-head.mjs     (check; used by `npm run check`)

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = 'src';
const htmlPages = readdirSync(root).filter((f) => f.endsWith('.html'));

// 404.html is the documented exception: noindex, no OG card. It still carries
// the shared font block + favicon, so it is checked for those only.
const SHARED_FRAGMENTS = [
  // favicon — must be present on every page (including 404)
  '<link rel="icon" type="image/svg+xml" href="favicon.svg">',
  // font block — identical across every page (kept in sync via this check)
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@700;900&family=Noto+Sans+SC:wght@400;700&family=Ma+Shan+Zheng&display=swap" rel="stylesheet">',
];

// OG / Twitter fragments shared by every *shareable* page (404 excluded).
const SHAREABLE_FRAGMENTS = [
  '<meta property="og:image" content="https://fkpass.pages.dev/og-cover.png">',
  '<meta property="og:image:width" content="1200">',
  '<meta property="og:image:height" content="630">',
  '<meta property="og:locale" content="zh_CN">',
  '<meta property="og:site_name" content="法考速记卷宗">',
  '<meta name="twitter:card" content="summary_large_image">',
  '<meta name="twitter:image" content="https://fkpass.pages.dev/og-cover.png">',
];

let failures = 0;
const report = (page, msg) => {
  failures++;
  console.error(`  ✗ ${page}: ${msg}`);
};

for (const f of htmlPages) {
  const html = readFileSync(join(root, f), 'utf8');
  const shareable = f !== '404.html';

  for (const frag of SHARED_FRAGMENTS) {
    if (!html.includes(frag)) report(f, `missing shared fragment: ${frag}`);
  }
  if (shareable) {
    for (const frag of SHAREABLE_FRAGMENTS) {
      if (!html.includes(frag)) report(f, `missing shared fragment: ${frag}`);
    }
  }
}

if (failures) {
  console.error(`\nhead consistency check failed: ${failures} drift(s) found.`);
  console.error('Shared <head> fragments drifted out of sync across pages.');
  console.error('Fix by aligning the listed pages with the source values above');
  console.error('(or run a single global find/replace, then re-run this check).');
  process.exit(1);
}
console.log(`head consistency check passed (${htmlPages.length} pages).`);
