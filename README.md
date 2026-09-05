# ⚖️ 法考速记卷宗 · Legal-Exam Cheat-Sheet Casefile

> **法考速记卷宗** —— 专为国家统一法律职业资格考试（法考）打造的沉浸式复古案卷风静态高频考点速记卡片与检索系统。
> 
> **Legal-Exam Cheat-Sheet Casefile** — An immersive, vintage casefile-styled static study site & cheat-sheet card deck for the Chinese Bar Exam (法考). Zero build step, full subject coverage.

[![Website](https://img.shields.io/badge/Online_Site-fkpass.pages.dev-2b4960?style=flat-square&logo=cloudflare)](https://fkpass.pages.dev/)
[![Casefile Cards](https://img.shields.io/badge/Casefile_Cards-80+-a52422?style=flat-square)](https://fkpass.pages.dev/)
[![Architecture](https://img.shields.io/badge/Architecture-Zero--Build_Vanilla-3f6b4f?style=flat-square)](src/)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg?style=flat-square)](package.json)
[![License](https://img.shields.io/badge/license-MIT-informational?style=flat-square)](#-开源协议--license)

---

## 🌐 在线访问 / Live Demo

- **项目官网**：[https://fkpass.pages.dev/](https://fkpass.pages.dev/)
- **备用直达**：`https://fkpass.pages.dev/index.html`

---

## 📌 项目简介 / About

### 中文简介
**法考速记卷宗** 是一款专为中国国家统一法律职业资格考试（法考 / 司考）考生设计的纯静态、零构建、沉浸式高频考点速记与知识检索系统。

针对法考大部头教材讲义浩繁、法条错综繁琐、背诵负担沉重的痛点，本项目打破传统线性阅读模式，贯彻**“一页一考点”**的设计哲学。全站采用**深色案卷书桌底色 + 复古牛皮纸卡片**的拟物视觉风格，运用真实朱红印章与荧光高亮笔标注，并将考点重构为**思维导图、决策流程图、对比矩阵、考点网格与记忆口诀**五种科学记忆模型，帮助考生在碎片时间与考前冲刺阶段快速建立体系框架、识破命题陷阱。

### English About
**Legal-Exam Cheat-Sheet Casefile** is an immersive, vintage casefile-styled static cheat-sheet knowledge card and retrieval system tailored for candidates taking the Chinese National Unified Legal Professional Qualification Examination (Chinese Bar Exam / 法考).

Breaking away from thousands of pages of dense legal treatises, this project encapsulates key examinable doctrines into standalone "casefile cards" laid on a dark-wood desk. Featuring zero build steps, vanilla web standards, and five intuitive learning archetypes (Mindmap trees, Flowchart tracks, Compare matrices, Card grids, and Mnemonic stamps), it enables fast active recall, intuitive structure mapping, and instant search on any device.

---

## 🏷️ 关键词与标签 / Keywords & Topics

### 中文关键词
> 法考、国家统一法律职业资格考试、司法考试、法考速记、法考备考、高频考点、案卷卡片、思维导图、记忆口诀、复习笔记、民法典、刑法、行政法、刑事诉讼法、民事诉讼法、商法、2024新公司法、经济法、知识产权法、国际法、三国法、纯静态网站、零构建、Cloudflare Pages

### English Keywords
> chinese-bar-exam, legal-exam, bar-exam, law-school, cheat-sheet, flashcards, casefile, study-notes, legal-study, static-site, zero-build, cloudflare-pages, html5, css3, vanilla-js, mindmap, flowchart

### GitHub Topics 推荐标签
可直接复制粘贴到 GitHub 仓库右上角的 **About -> Topics** 设置中：
```text
chinese-bar-exam legal-exam cheat-sheet flashcards study-notes casefile static-site zero-build cloudflare-pages vanilla-js design-system law
```

---

## ✨ 核心特性 / Key Features

### 1. 📂 沉浸式案卷视觉系统 (Immersive Casefile Aesthetic)
- **深色书桌氛围**：以 `#1d1712`（深木书桌）为背景，配以 `#efe4c8` 牛皮纸质感案卷卡片，正文文字如同炭黑墨印（`--ink`）。
- **真实司法印章**：印章元素采用 `mix-blend-mode: multiply`（正片叠底），呈现真实朱泥印压在纸张纤维上的质感，杜绝贴纸廉价感。
- **高亮笔划重点**：使用 `<mark>` 模拟司法考生手中的荧光记号笔，扫过考题高频“题眼”与避坑要点。

### 2. 🧩 五大知识呈现原型 (5 Layout Archetypes)
每个 HTML 页面仅承载一个核心考点，严格根据法学知识的内在结构匹配最适合的排版范式：

| 版式原型 | 核心特征与适用场景 | 经典参考页面 |
|---|---|---|
| **🗂️ 考点网格 (Card Grid)** | 零散、并列、多条并存的知识点总览，平铺直叙、快速通览 | [`src/susong-shixiao.html`](src/susong-shixiao.html)（诉讼时效） |
| **🌳 纯 CSS 体系思维导图 (Mindmap Tree)** | 纵深层级、阶梯从属关系，纯 CSS 实现连接线，无需复杂 JS 计算 | [`src/gongtong-fanzui.html`](src/gongtong-fanzui.html)（共同犯罪）<br>[`src/fanzui-gocheng.html`](src/fanzui-gocheng.html)（犯罪构成） |
| **🚇 决策流程图 (Flowchart Track)** | “如果……那么……”的多步骤条件链条与岔路判定，带动态地铁线动画 | [`src/zhengdang-fangwei.html`](src/zhengdang-fangwei.html)（正当防卫） |
| **📊 平行概念对比矩阵 (Compare Grid)** | 2~3 个极易混淆概念的多维度横向对照（构成要件、法律后果、典型案例） | [`src/xiaoli-santai.html`](src/xiaoli-santai.html)（效力三态）<br>[`src/danbao-wuquan.html`](src/danbao-wuquan.html)（担保物权） |
| **🪪 口诀印章与关键词卡 (Mnemonic Stamp)** | 严谨法律构成要件提炼 + 独创毛笔手写体口诀印章，强化考前肌肉记忆 | [`src/shanyi-qude.html`](src/shanyi-qude.html)（善意取得） |

### 3. 📚 十大学科全体系覆盖 (10 Subject Families)
全站收录 **80+ 张精编核心考点卷宗**，系统涵盖法考考纲全部核心学科，并建立严密的学科主题色体系（颜色具备法律逻辑语义）：

| 学科族系 | 族系主题色 | 色彩语义 / 范围 | 典型收录考点 |
|---|---|---|---|
| **刑法** | 朱红 `--seal` (`#a52422`) | 警示、规制、严厉处罚 | 犯罪构成、正当防卫、共同犯罪、未完成形态、罪数形态、刑罚体系 |
| **民法** | 墨蓝 `--indigo` (`#2b4960`) | 权利、契约、民事秩序 | 诉讼时效、善意取得、民事法律行为、代理、物权变动、担保物权、合同效力 |
| **刑事诉讼法** | 绛紫 (`#7a3b55`) | 程序正义、公权力制衡 | 辩护制度、强制措施、非法证据排除规则、审查起诉、审判程序 |
| **行政法** | 橄榄绿 (`#5d6b2f`) | 依法行政、公益平衡 | 行政许可、行政处罚、行政强制、行政复议与行政诉讼衔接 |
| **理论法** | 黛青灰 (`#46506b`) | 治国理政、基石理论 | 法治理论、法理学效力位阶、宪法基本权利与国家机构、法律职业道德 |
| **民事诉讼法** | 黛青 (`#2f6168`) | 定分止争、民商救济 | 管辖权异议、民事证据与证明责任、普通程序、执行监督与再审 |
| **商法** | 紫色 (`#684a7a`) | 商业自治、交易安全 | 2024新公司法资本制度、股东出资责任、公司治理结构、破产财产清偿 |
| **经济法** | 赭石 (`#9a5a38`) | 市场规制、社会公平 | 反垄断规制、反不正当竞争行为、消费者权益保护法、劳动合同解除 |
| **知识产权法** | 青色 (`#2c6e84`) | 创新激励、智力成果 | 著作权合理使用与法定许可、专利侵权抗辩、商标侵权及显著性判断 |
| **国际法 (三国法)** | 绛红紫 (`#8f5066`) | 涉外法治、跨国规则 | 国际公法管辖权与豁免、涉外民事关系法律适用法、国际贸易术语 |
| **站点功能** | 黄铜金 `--brass` (`#b8893b`) | 交互操作、全局导引 | 目录导航、全站实时检索、考生留言板、404导流 |

### 4. 🔍 极速检索与全局抽屉式目录 (Search & Drawer Navigation)
- **首页毫秒级搜索**：支持输入汉字、法条编号（如 `§188`）、拼音全拼或简拼、别名与考点核心词，实时模糊匹配并自动高亮展开对应学科。
- **全局抽屉侧边栏 (`sidebar.js`)**：在任意一张考点卡片中，点击左侧黄铜卷宗把手即可滑出全站案卷目录。当前考点自动高亮定位，并可一键折叠或展开各学科。

### 5. 💡 可交互的词条释义浮层 (Interactive Term Glossary)
- 正文中任何带有下划线的法律术语（`.term`）均可点击。
- 触发平滑的 FLIP 交互动画与毛玻璃遮罩，术语自动位移至左侧，右侧优雅滑出法条原文、立法原意与考点延展解读，免除跨页面跳读的打扰。

### 6. ⚡ 零构建、微体积、极致性能 (Zero-Build Architecture)
- 生产环境发布**没有任何编译或打包步骤**（No Webpack, No Vite, No Rollup）。
- 所有页面均为原生 HTML5，共享单份缓存样式表 [`src/tokens.css`](src/tokens.css) 与原生 JavaScript 脚本。
- 每张考点卡片净体积仅数 KB，加载速度毫秒级，天然契合 CDN 边缘缓存分发。

### 7. 💬 轻量 Serverless 互动留言与点赞 (Cloudflare Edge API)
- 集成 Cloudflare Pages Functions + Workers KV，提供开箱即用的考生留言板（`/api/messages`）与访问/点赞统计（`/api/stats`）。
- 原生内置严格的 DOM `textContent` 渲染防护（杜绝 XSS）、IP 频率限流、蜜罐字段防垃圾发帖；在本地开发或未绑定 KV 时自动优雅降级，保障系统高可用。

---

## 🚀 快速开始 / Quick Start

### 1. 在线浏览
直接使用现代浏览器打开：
👉 **[https://fkpass.pages.dev/](https://fkpass.pages.dev/)**

### 2. 本地离线预览
由于全站为纯静态页面，无需安装庞大的构建依赖即可快速启动：

```bash
# 克隆代码仓库
git clone https://github.com/broccoli-97/fkpass.git
cd fkpass

# 方式 A：使用 Python 一键预览（推荐）
cd src && python3 -m http.server 8000
# 访问 http://localhost:8000

# 方式 B：使用 Node.js 工具预览
npx serve src -p 8000
```

> **提示**：本地通过静态服务器预览时，留言板与点赞 API 会因缺少 Cloudflare KV 绑定而自动降级为“本地内存存储/localStorage”，并在页面显示提示横幅，这属于正常现象。

---

## 🛠️ 开发者工具链 / Development & Tooling

虽然发布站点无需构建，但本项目配备了严谨的工程化自动化质检链，确保 80+ 页面在样式、结构、规范与 SEO 层面完全一致。

**运行环境要求**：Node.js >= 20

```bash
# 1. 安装开发辅助依赖（代码风格与自动化测试工具）
npm install

# 2. 运行完整质检套件（ESLint + Stylelint + html-validate + Prettier + Head一致性 + Sitemap检查 + 单元测试）
npm run check

# 3. 仅运行单元测试（覆盖 API 接口与设计系统规则守卫）
npm test

# 4. 代码格式自动整理
npm run format

# 5. 新增或修改考点卡片后，基于 Git 提交日志重新生成 sitemap.xml
npm run gen:sitemap
```

---

## 📁 项目目录结构 / Project Structure

```text
fkpass/
├── src/                    # 生产发布的纯静态站点（Cloudflare Pages 根目录）
│   ├── index.html          # 首页：全站卷宗总览、学科分类折叠、实时搜索
│   ├── feedback.html       # 互动：法考考生留言板
│   ├── 404.html            # 友好的 404 案卷未找到页面
│   ├── tokens.css          # 核心：设计系统 Token、书桌背景、共享组件与版式样式
│   ├── sidebar.js          # 组件：全局滑动抽屉式卷宗目录
│   ├── terms.js            # 组件：FLIP 动效词条释义浮层
│   ├── sitemap.xml         # SEO：由 scripts/gen-sitemap.mjs 自动生成的站点地图
│   ├── robots.txt          # SEO：搜索引擎爬虫规则
│   ├── favicon.svg         # 站点图标（书卷印章风格）
│   ├── og-cover.png        # 社交媒体 Open Graph 预览大图 (1200x630)
│   ├── _headers            # 安全：CSP、HSTS、防点击劫持等 HTTP 响应头
│   └── *.html              # 80+ 张具体考点卷宗页面（如 zhengdang-fangwei.html）
├── functions/              # Cloudflare Pages Functions 无服务边缘函数
│   └── api/
│       ├── messages.js     # 留言板端点（GET 获取留言，POST 提交留言）
│       └── stats.js        # 站点统计端点（浏览量、点赞/点踩、IP防重）
├── docs/                   # 完整设计规范与配置说明
│   ├── SKILL.md            # 🎨 设计系统圣经（色彩、版式选用决策树、不可违背的铁律）
│   ├── components.md       # 🧩 组件库代码规范与 HTML/CSS 拷贝指南
│   └── CLOUDFLARE-SETUP.md # ☁️ Cloudflare Pages 部署与 KV 绑定配置指南
├── scripts/                # 开发辅助与质检脚本
│   ├── check-head.mjs      # 自动化核对 80+ 页面 <head> 共享标签的一致性
│   └── gen-sitemap.mjs     # 自动化从 git log 读取提交时间生成精准 sitemap
├── test/                   # 自动化测试套件（使用 Node.js 原生测试运行器）
│   ├── design-system.test.js # 设计规范守护测试（保证无野类名、无样式内联篡改、侧栏一致）
│   ├── messages.test.js      # 留言板 API 边界条件、限流与 XSS 测试
│   └── stats.test.js         # 统计 API 行为测试
├── .github/                # GitHub Actions 持续集成工作流
│   └── workflows/ci.yml    # PR/Push 时自动运行 npm run check 质量守卫
├── CLAUDE.md               # Claude Code 规范指引
├── package.json            # 依赖声明与 npm scripts
└── README.md               # 项目主说明文档
```

---

## 📝 如何新增一张考点卡片 / How to Add a New Card

如果你想为项目扩充新的法考考点，请遵循以下标准化流程：

1. **确定考点与版式原型**：
   - 参照 [`docs/SKILL.md`](docs/SKILL.md) 中的选型表格，根据知识点特性从**五大版式**中选取最适合的一种；
2. **新建卡片文件**：
   - 复制对应版式的经典参考页，在 `src/` 下创建新的拼音命名的 HTML 文件（如 `src/minfa-daiti.html`）；
   - 在 `<body>` 上声明学科属性（如 `<body data-subject="民法">`），并在 `<style>` 中配置对应学科的 `--accent`；
3. **完善 `<head>` 元数据**：
   - 更新 `<title>`、`<meta name="description">`、`<link rel="canonical">`、Open Graph 和 Twitter Card 标签；
4. **接入全站索引体系**：
   - 在 `src/sidebar.js` 的 `SITE_MAP` 常量中将新页面追加到对应学科族系；
   - 在 `src/index.html` 的相应学科分组下添加对应的 `.tcard` 索引卡片，并补全 `data-keywords` 检索属性；
   - 同步更新该学科族系内部各页面的底部 `.dots` 进度圆点与 `.footnav` 上下页链接；
5. **通过自动化质检**：
   - 运行 `npm run gen:sitemap` 刷新站点地图；
   - 运行 `npm run check`，确保 ESLint、Stylelint、HTML-Validate、Prettier 和全部测试用例绿灯通过。

---

## ☁️ 持续部署 / Deployment

本项目托管于 Cloudflare Pages：
- **构建输出目录 (Build Output Directory)**：`src`
- **构建命令 (Build Command)**：无（留空，纯静态发布）
- **Functions 目录**：Cloudflare 自动识别根目录下的 `functions/`
- **KV 绑定**：在 Cloudflare 控制台将 Workers KV 命名空间绑定为 `FEEDBACK_KV`（详见 [`docs/CLOUDFLARE-SETUP.md`](docs/CLOUDFLARE-SETUP.md)）。
- 每当代码合并推送到生产分支时，Cloudflare Pages 将在数秒内完成全球边缘 CDN 的自动化分发。

---

## 🗺️ 后续迭代规划 / Roadmap

- [ ] **翻卡遮挡与默写模式 (Active Recall)**：一键隐去关键法条结论与口诀要件，支持自主回忆与翻转对照；
- [ ] **本地刷题进度跟踪 (Retention Hooks)**：利用本地存储记录考点“已读/已掌握/加入收藏”，生成学科复习进度环；
- [ ] **PWA 离线应用化**：引入轻量 Service Worker 缓存静态资源，支持手机与平板“添加到主屏幕”离线背诵；
- [ ] **相关卷宗交叉引用**：在卡片底部增加关联法条与相关考点推荐，打通跨学科法理脉络；
- [ ] **键盘快捷键支持**：支持 `/` 快捷唤起全站搜索，`←` / `→` 键一键切换上下一卷。

---

## 🤝 贡献与交流 / Contributing & Community

欢迎法考战友、法学院师生以及开源爱好者共同完善本卷宗库！
- 如果发现了法条变更、内容笔误或错别字，欢迎直接提交 [Pull Request](https://github.com/broccoli-97/fkpass/pulls) 或开 [Issue](https://github.com/broccoli-97/fkpass/issues)。
- 也可以直接访问线上站点的 [考生留言板](https://fkpass.pages.dev/feedback.html) 留下你的备考心愿与建议。
- 如果这个项目对你的法考复习有所助益，请为本项目点一个 ⭐️ **Star**，祝各位考生旗开得胜、顺利上岸！

---

## 📄 开源协议 / License

本项目遵循 [MIT License](LICENSE) 开源协议。
任何人均可自由学习、传播与复用，让高质量的法学知识更轻松地触达每一位备考者。
