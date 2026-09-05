#!/usr/bin/env node
// Dev-only sitemap generator. Not part of the shipped site (no build step).
//
// src/sitemap.xml previously had hand-written <lastmod> values that drifted
// out of sync with reality (a file edited weeks ago still showed an old date,
// or a freshly added page copied a neighbour's date). Stale lastmod misleads
// crawlers, so this script derives each entry's lastmod from git: the last
// commit that touched that HTML file.
//
//   node scripts/gen-sitemap.mjs          # (re)generate src/sitemap.xml
//   node scripts/gen-sitemap.mjs --check  # compare against disk; exit 1 on drift
//
// --check is wired into `npm run check` so a page added/edited without
// regenerating the sitemap fails CI. The normal fix is `npm run gen:sitemap`.
//
// Entry set: index.html (priority 1.0) + every topic + feedback.html (0.8).
// 404.html is excluded (it carries <meta name="robots" content="noindex">).

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';

const BASE = 'https://fkpass.pages.dev';
const SRC = 'src';
const OUT = 'src/sitemap.xml';

// Stable order: homepage first (it is the catalog hub, priority 1.0), then the
// rest alphabetical — keeps diffs minimal and the file readable.
const pages = readdirSync(SRC)
  .filter((f) => f.endsWith('.html') && f !== '404.html')
  .sort((a, b) => {
    if (a === 'index.html') return -1;
    if (b === 'index.html') return 1;
    return a < b ? -1 : a > b ? 1 : 0;
  });

function lastmod(file) {
  // %cI = committer date, strict ISO 8601. Take just the date for a stable, readable sitemap.
  const iso = execSync(`git log -1 --format=%cI -- ${SRC}/${file}`, { encoding: 'utf8' }).trim();
  return (iso || new Date().toISOString()).slice(0, 10);
}

function build() {
  const entries = pages.map((f) => {
    const loc = f === 'index.html' ? `${BASE}/` : `${BASE}/${f}`;
    const priority = f === 'index.html' ? '1.0' : '0.8';
    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <lastmod>${lastmod(f)}</lastmod>`,
      '    <changefreq>weekly</changefreq>',
      `    <priority>${priority}</priority>`,
      '  </url>',
    ].join('\n');
  });
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries.join('\n') +
    '\n</urlset>\n'
  );
}

const generated = build();

if (process.argv.includes('--check')) {
  let current = '';
  try {
    current = readFileSync(OUT, 'utf8');
  } catch {
    console.error(`sitemap check failed: ${OUT} does not exist.`);
    console.error('Run `npm run gen:sitemap` to generate it.');
    process.exit(1);
  }
  if (current !== generated) {
    let isShallow = false;
    try {
      isShallow =
        execSync('git rev-parse --is-shallow-repository', {
          encoding: 'utf8',
        }).trim() === 'true';
    } catch {
      isShallow = false;
    }
    if (isShallow) {
      console.error(
        'sitemap check failed: git repository is a shallow clone (fetch-depth is not full).',
      );
      console.error('Full git history is needed to derive file commit dates.');
    } else {
      console.error(`sitemap check failed: ${OUT} is out of sync with git history.`);
      console.error('A page was added/edited/removed without regenerating the sitemap.');
      console.error('Run `npm run gen:sitemap` to fix.');
    }
    process.exit(1);
  }
  console.log(`sitemap check passed (${pages.length} entries).`);
} else {
  writeFileSync(OUT, generated);
  console.log(`wrote ${OUT} (${pages.length} entries).`);
}
