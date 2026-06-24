# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **static website with one serverless endpoint**: a design-system template collection for 法考速记卷宗 ("Legal-Exam Cheat-Sheet Casefile"), a Chinese bar-exam study site. Each page renders one law-exam topic as a "casefile card" laid on a dark-desk background. There is **no build step, no package manager, no test framework, no git**. Pages are plain HTML files opened directly in a browser; the only dynamic piece is the feedback board's Cloudflare Pages Function.

## Commands

There is nothing to build or compile. To preview, open the HTML file directly, or serve the folder:

```bash
python -m http.server 8000   # then visit http://localhost:8000
```

The feedback page (`06-feedback.html`) is a real shared message board backed by a Cloudflare Pages Function at `functions/api/messages.js` (route `/api/messages`) plus a KV namespace bound as `FEEDBACK_KV`. The frontend `fetch`es that endpoint (GET to list, POST to add). When the API is unreachable — opening the file as a bare `file://`, local `python -m http.server`, or a missing KV binding — the page degrades to in-memory storage and shows a banner; that is expected, not a bug. Deployment/binding steps are in `CLOUDFLARE-SETUP.md`.

## Authoritative design spec — read before editing any page

`SKILL.md` is the design system's source of truth; `components.md` holds the full copy-paste CSS/HTML for every component; `tokens.css` is a linkable version of the color/variable layer. **Read `SKILL.md` first** when creating or restyling any page — it defines hard rules that, if broken, mean the work no longer matches the system. The `.skill` file is just a zip bundle of those three docs for distribution; edit the loose files, not the archive.

## Architecture you can't see from the file list

- **Every page is fully self-contained.** Each HTML file inlines its own complete `<style>` block and redeclares the same `:root` token set (`--desk`, `--folder`, `--ink`, `--brass`, `--seal`, `--indigo`, `--jade`, `--warn`, …). There is intentionally no shared external stylesheet — pages must remain portable as a single file. When changing a token, it must be updated in **each** file that uses it, not in one place.

- **One topic = one page = one layout.** Files are named `NN-layoutname.html`. Five layout archetypes exist, each with a reference template; pick by content shape rather than inventing a new one:
  - `01-grid-overview.html` — many loosely-related points → card grid
  - `02-mindmap.html` — hierarchical concepts → pure-CSS stacked tree (no JS coordinate math)
  - `03-flowchart.html` — if/then decision chains → animated "subway line" track
  - `04-comparison.html` — 2–3 confusable parallel concepts → multi-column compare grid
  - `05-mnemonic.html` — exact memorization → mnemonic stamp + keyword cards
  - Plus site pages: `index.html` (catalog), `404.html`, `06-feedback.html` (message board).

- **Color carries meaning, not decoration.** Subject themes: red `--seal` = criminal law, blue `--indigo` = civil law; new subjects get their **own** accent (never reuse those two). Outcome colors are fixed regardless of subject: `--jade` = valid/pass/good, `--seal` = invalid/warning conclusion, `--warn` = disputed/middle state. `--brass` is reserved for **site-function pages** (feedback, 404, homepage CTA) so users can tell "knowledge content" from "site chrome" at a glance. Don't apply an accent color that doesn't map to one of these meanings.

- **Per-page `--accent`** drives the topic's theme color; most components read `var(--accent)` so a page reskins by changing that one variable.

## Non-negotiable conventions

- Dark `--desk` background + light `--folder` (kraft-paper) cards — never inverted.
- Every page must include `@media (prefers-reduced-motion: reduce)` to disable animations, plus mobile breakpoints (usually 760px / 480px) that collapse grids to one column or allow horizontal scroll with a swipe hint.
- Stamp elements (`.seal`, `.stamp-sq`, `.stamp-reject`) require `mix-blend-mode: multiply` or they read as stickers, not ink stamps.
- No JS frameworks or build tooling — plain HTML/CSS, with minimal vanilla JS only where needed (e.g. the feedback board).
- Any user-supplied content shown to other visitors must be rendered via `textContent`/DOM APIs, never string-concatenated into `innerHTML` (XSS).

## When adding a new topic page

Update the cross-page wiring that isn't auto-generated: add a `<span>` to the `.dots` progress indicator in **every** topic page (dot count = number of knowledge pages), fix the prev/next `.footnav` links on the neighboring pages, add a catalog card in `index.html`, and — if you introduced a genuinely new layout — add a row to the layout table in `SKILL.md`.
