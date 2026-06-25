# 法考速记卷宗 · Legal-Exam Cheat-Sheet Casefile

A static study site for the Chinese bar exam. Each page renders one law-exam
topic as a "casefile card" on a dark-desk background. No build step — the pages
are plain HTML sharing one stylesheet; the only dynamic piece is a feedback board
backed by a Cloudflare Pages Function.

## Layout

```
src/         the published site — HTML pages + tokens.css (shared stylesheet)
functions/   Cloudflare Pages Function: api/messages.js  (feedback board API)
docs/        design spec (SKILL.md, components.md), Cloudflare setup, .skill bundle
test/        node --test suites (design system + messages API)
```

## Preview

```bash
cd src && python -m http.server 8000   # http://localhost:8000
```

The feedback board calls `/api/messages`; without the Cloudflare Function +
`FEEDBACK_KV` binding it degrades to in-memory storage and shows a banner (expected
when previewing locally).

## Dev tooling (Node 20+)

```bash
npm install     # one-time
npm run check   # lint (ESLint + Stylelint + html-validate + Prettier) + tests
npm test        # tests only
```

## Deploy

CI runs `npm run check` on every push/PR. A push of a `v*` tag deploys to
Cloudflare Pages (after the checks pass):

```bash
git tag v1.0.0 && git push origin v1.0.0
```

Binding/secret setup is in [`docs/CLOUDFLARE-SETUP.md`](docs/CLOUDFLARE-SETUP.md);
design rules are in [`docs/SKILL.md`](docs/SKILL.md). When editing pages, read
[`CLAUDE.md`](CLAUDE.md) first.
