# TODO — 法考速记卷宗 improvement backlog

Prioritized roadmap from the site review. Ordered by ROI. Each item lists **why**,
**what to touch**, and **done-when** so it can be picked up cold. This is a study
*content* product first — content balance (#1) outweighs any single feature.

> Conventions reminder: no build step, plain HTML/CSS + minimal vanilla JS, every page
> links `tokens.css`, shared behaviour goes in a `src/*.js` linked like `terms.js`.
> Read `docs/SKILL.md` before building any new page/layout. New pages must also carry the
> SEO/OG block + a `sitemap.xml` entry (see CLAUDE.md "When adding a new topic page").

---

## P0 — Content coverage (the #1 lever)

Coverage is inverted vs. 法考 exam weight: 刑诉 & 行政法 have 10 cards each, but 民法 (highest-
scoring subject) had only 3 and 刑法 only 2; 民诉/商法/经济法/知产 have 1 each. Build the heavy
subjects out. Each card = one topic page in an existing archetype (copy the reference page).

- [x] **民法 buildout → 10 cards.** Added: 民事法律行为(思维导图)、代理、物权变动、担保物权(三栏对比)、
      合同的订立与效力、违约责任、侵权责任 (+ 既有 诉讼时效/效力三态/善意取得)。Accent `--indigo`.
- [x] **刑法 buildout → 8 cards.** Added: 犯罪构成(思维导图)、犯罪主观方面、犯罪未完成形态、罪数形态、
      刑罚体系、量刑情节 (+ 既有 共同犯罪/正当防卫)。Accent `--seal`.
- [ ] **Round out the 1-card subjects** (民诉 / 商法 / 经济法 / 知产) with 2–4 more cards each
      — split the current overview pages into focused topics. *(still pending)*
- [ ] **Remaining 民法/刑法 candidates** for later: 不当得利与无因管理、婚姻家庭、继承、紧急避险、
      因果关系与责任年龄专题、常考罪名 (财产/人身/职务)、缓刑假释减刑专题。
- [x] For every new card: catalog `.tcard` + `data-keywords`, `.dots`/footnav rewired across the
      family, SEO/OG block injected, `sitemap.xml` `<url>` added. (Tests pass.)
- [x] **Homepage collapse** (new request): subject groups are `<details>` folds with `N 卷`
      count badges, default collapsed; search auto-expands matches; 展开/收起全部 toggle.

## P1 — Active-recall study mode (highest-value feature)

Cards are passive reading; 速记 prep rewards active recall. Add a "翻卡/遮挡" mode: hide the
conclusion/keyword, let the student recall, then reveal.

- [ ] Design the interaction in `docs/SKILL.md` first (it's effectively a 6th pattern / a
      cross-cutting toggle, not a new layout archetype).
- [ ] Styling in `tokens.css` (e.g. `.recall-hidden` blur/mask + a page-level "默写模式" toggle).
- [ ] Behaviour in a new shared `src/recall.js` (linked like `terms.js`, `defer`); toggles a
      `body.recall` class, respects `prefers-reduced-motion`.
- [ ] Reference implementation on one card first (suggest `shanyi-qude.html`, a 口诀 card),
      then roll out. Author marks recall-able spans (e.g. `<mark>`/keyword) opt-in.
- [ ] Add a design-system test: pages opting in load `recall.js`.

## P2 — Retention hooks (cheap, compounding)

Reuse the existing localStorage plumbing (votes/visits).

- [ ] **Per-card progress marks** (已读 / 已掌握) stored in localStorage, with a per-subject
      progress ring/count on the homepage catalog. Gives a completion loop + return reason.
- [ ] **收藏/书签** toggle on each card + a "我的收藏" filter on the homepage.
- [ ] **"随机抽一张复习"** button (homepage + footnav) for spaced review.

## P3 — Trust & currency (法考 law changes yearly)

Currency is a selling point currently hidden (cards already cite 2024 新公司法 / 2021 处罚法 /
2024 复议法).

- [ ] **Per-card currency badge**: `适用 2026 法考 · 最后更新 X月` (a small chrome element in
      `tokens.css`, value set per page).
- [ ] **更新日志 / changelog page** (return reason + SEO; add to nav + sitemap).
- [ ] **Per-card 纠错 button** — lighter-weight than the global feedback board; could prefill
      the feedback form with the card name, or POST to `/api/messages` with a source tag.

## P4 — Technical polish (quick wins)

- [ ] **PWA**: add `manifest.webmanifest` + a service worker caching `tokens.css`/`*.js`/pages
      so the site installs to home screen and works offline (ideal for subway study).
      No build step needed; SW is a static file. Add `theme-color` meta + maskable icon.
- [ ] **Global search on every page** (not just homepage) — a `/`-shortcut overlay that links
      into the catalog, or a shared search component.
- [ ] **`@media print` stylesheet** in `tokens.css` — students print cheat sheets; hide chrome,
      flatten to ink-on-paper.
- [ ] **"相关卷宗" cross-links** — a related-cards footer block (诉讼时效 ↔ 民法总则,
      正当防卫 ↔ 共同犯罪, etc.) to improve in-site discovery + internal linking for SEO.
- [ ] **Accessibility pass**: keyboard nav for the term overlay (Esc/focus trap), color-contrast
      audit of accents on `--folder`, `aria-current` on active dots.

## P5 — Growth / distribution (mostly off-repo)

- [ ] **"分享这张卡" button** on topic pages (Web Share API on mobile; copy-link fallback) so a
      student can one-tap send a card to a study group.
- [ ] Set up a **custom domain** (more trusted than `*.pages.dev`); then find-replace the
      canonical base URL across `src/*.html` + `sitemap.xml` + `robots.txt`.
- [ ] Submit `sitemap.xml` to **百度站长平台** + Google Search Console.
- [ ] Seed content on **小红书** (screenshot cards), 知乎 answers, 法考 微信/QQ 群, 贴吧.

---

### Suggested order to actually execute

1. P0 content: 刑法 (犯罪构成 + 量刑) and 民法 (合同 + 物权) first.
2. P1 active-recall mode (reference impl on one card).
3. P2 progress marks + P4 PWA together as a "retention" bundle.
4. P3 currency badges + changelog.
5. P4 remaining polish, P5 growth ongoing.
