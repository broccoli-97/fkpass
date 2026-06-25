# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **static website with one serverless endpoint**: a design-system template collection for 法考速记卷宗 ("Legal-Exam Cheat-Sheet Casefile"), a Chinese bar-exam study site. Each page renders one law-exam topic as a "casefile card" laid on a dark-desk background. The published site has **no build step** — pages are plain HTML files that each link one shared stylesheet (`tokens.css`); the only dynamic piece is the feedback board's Cloudflare Pages Function.

## Project layout

```
src/         the published site — 8 HTML pages + tokens.css (kept flat: every
             page links tokens.css from the same folder, so URLs/links stay simple)
functions/   Cloudflare Pages Function — api/messages.js (must stay at repo root)
docs/        design spec (SKILL.md, components.md), CLOUDFLARE-SETUP.md, the .skill bundle
test/        node --test suites (design-system + messages API)
.github/     CI (every push/PR) + deploy (on v* tags)
```

Linter configs (`.stylelintrc.json`, `.htmlvalidate.json`, `.prettierrc.json`,
`eslint.config.js`) stay at the root so the tools auto-discover them. The deploy
workflow flattens `src/*` + `functions/` into `dist/`, so the **deployed URL of
every page is unchanged by this layout** (e.g. `/01-grid-overview.html`).

## Commands

There is nothing to build or compile. The site lives in `src/`. To preview, serve that folder (recommended, so the shared `tokens.css` resolves cleanly), or open an HTML file that sits alongside `tokens.css`:

```bash
cd src && python -m http.server 8000   # then visit http://localhost:8000
```

The feedback page (`src/06-feedback.html`) is a real shared message board backed by a Cloudflare Pages Function at `functions/api/messages.js` (route `/api/messages`) plus a KV namespace bound as `FEEDBACK_KV`. The frontend `fetch`es that endpoint (GET to list, POST to add). When the API is unreachable — opening the file as a bare `file://`, local `python -m http.server`, or a missing KV binding — the page degrades to in-memory storage and shows a banner; that is expected, not a bug. Deployment/binding steps are in `docs/CLOUDFLARE-SETUP.md`.

## Tests, linting & CI

Dev tooling only — the published site still has **no build step**. Needs Node 20+.

```bash
npm install      # one-time: install dev dependencies
npm run check    # lint (ESLint + Stylelint + html-validate + Prettier) + tests
npm test         # just the tests (node --test)
```

- `test/messages.test.js` unit-tests the `/api/messages` function against a fake KV
  (validation, 400/500 paths, trimming, the `匿名考生` default, the 500-item cap).
- `test/design-system.test.js` enforces the rules in this file as executable checks — every
  page links `tokens.css`, no page re-inlines the base layer, no orphan classes, the feedback
  XSS `textContent` guard, stamp `mix-blend-mode`, and `.dots` wiring. **If you change the
  system, these keep it honest.** When a linter complains about the deliberately compact
  style, tune the config (`.stylelintrc.json` / `.htmlvalidate.json` / `eslint.config.js`)
  rather than reformatting the pages.
- **CI** — `.github/workflows/ci.yml` runs `npm run check` on every push / PR.
- **Deploy** — `.github/workflows/deploy.yml` runs the checks, then deploys to Cloudflare
  Pages, but **only when you push a `v*` tag** (a "formal version"):
  `git tag v1.0.0 && git push origin v1.0.0`. Needs the `CLOUDFLARE_API_TOKEN` +
  `CLOUDFLARE_ACCOUNT_ID` repo secrets (see `docs/CLOUDFLARE-SETUP.md`).

## Authoritative design spec — read before editing any page

`docs/SKILL.md` is the design system's source of truth; `docs/components.md` holds the full copy-paste CSS/HTML for every component; `src/tokens.css` is the **shared stylesheet every page links** — the canonical runtime source for the tokens, base/desk layer, chrome, and all five layout archetypes. **Read `docs/SKILL.md` first** when creating or restyling any page — it defines hard rules that, if broken, mean the work no longer matches the system. The `.skill` file is just a zip bundle of those three docs for distribution; edit the loose files, not the archive.

## Architecture you can't see from the file list

- **Pages share one linked stylesheet.** Every page links `tokens.css` (`<link rel="stylesheet" href="tokens.css">`) — the single source of truth for the `:root` token set (`--desk`, `--folder`, `--ink`, `--brass`, `--seal`, `--indigo`, `--jade`, `--warn`, `--glow`, …), the base/desk layer, the shared chrome (topbar, hero, pagefoot/dots/footnav), and all five layout archetypes. A page's own inline `<style>` holds **only** its per-page `--accent` (plus rare overrides like `--glow`/`--shadow`), an optional `.page` width modifier (`.reading` 980 / `.narrow` 760 / `.doc` 620), and components unique to that one page. **Change a token or shared component once in `tokens.css` and it propagates to every page.** Trade-off (a deliberate decision): a page only renders with `tokens.css` beside it — fine when served or opened in-folder, but a lone `.html` emailed by itself will be unstyled.

- **One topic = one page; name the file by its topic.** Each knowledge point is its own small HTML file named by a **pinyin topic slug** (e.g. `zhengdang-fangwei.html`), not by its layout — so the collection scales and URLs stay meaningful. **Do not group several topics into one file**: every page shares the cached `tokens.css`, so one-file-per-topic keeps each page tiny and fast (the reader downloads only the card they open). Five **layout archetypes** exist; pick the one matching the content shape and copy its current reference page rather than inventing a new layout:
  - card grid (many loosely-related points) — ref `susong-shixiao.html`
  - mindmap, pure-CSS stacked tree, no JS coordinate math (hierarchical concepts) — ref `gongtong-fanzui.html`
  - flowchart, animated "subway line" track (if/then decision chains) — ref `zhengdang-fangwei.html`
  - multi-column compare grid (2–3 confusable parallel concepts) — ref `xiaoli-santai.html`
  - mnemonic stamp + keyword cards (exact memorization) — ref `shanyi-qude.html`
  - Plus site pages: `index.html` (catalog), `404.html`, `feedback.html` (message board).

- **Color carries meaning, not decoration.** Subject themes: red `--seal` = criminal law, blue `--indigo` = civil law; new subjects get their **own** accent (never reuse those two). Outcome colors are fixed regardless of subject: `--jade` = valid/pass/good, `--seal` = invalid/warning conclusion, `--warn` = disputed/middle state. `--brass` is reserved for **site-function pages** (feedback, 404, homepage CTA) so users can tell "knowledge content" from "site chrome" at a glance. Don't apply an accent color that doesn't map to one of these meanings.

- **Per-page `--accent`** drives the topic's theme color; most components read `var(--accent)` so a page reskins by changing that one variable.

## Non-negotiable conventions

- Dark `--desk` background + light `--folder` (kraft-paper) cards — never inverted.
- `tokens.css` already provides `@media (prefers-reduced-motion: reduce)` and the base mobile breakpoints (760px / 480px) for the shared components; a page only adds breakpoints for its **own** unique components (collapse grids to one column, or allow horizontal scroll with a swipe hint).
- Stamp elements (`.seal`, `.stamp-sq`, `.stamp-reject`) require `mix-blend-mode: multiply` or they read as stickers, not ink stamps.
- No JS frameworks or build tooling in the shipped site — plain HTML/CSS + minimal vanilla JS where needed (e.g. the feedback board). (Dev-only test/lint tooling lives in `package.json` and never ships — see "Tests, linting & CI".)
- Any user-supplied content shown to other visitors must be rendered via `textContent`/DOM APIs, never string-concatenated into `innerHTML` (XSS).

## When adding a new topic page

Update the cross-page wiring that isn't auto-generated: link `tokens.css` and keep the new page's inline `<style>` to just its `--accent` (plus any page-unique components) — never re-inline the shared base/chrome. Then add a `<span>` to the `.dots` progress indicator in **every** topic page (dot count = number of knowledge pages), fix the prev/next `.footnav` links on the neighboring pages, add a catalog card in `src/index.html`, and — if you introduced a genuinely new layout — add a row to the layout table in `docs/SKILL.md`.
