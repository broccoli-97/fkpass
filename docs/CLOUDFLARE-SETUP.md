# 部署到 Cloudflare Pages（含留言板存储）

留言板用 **Cloudflare Pages Functions + KV** 实现真正的公共存储——所有访客共享同一份留言，全部在 Cloudflare 内，无需另开服务器。首页的**访问量 + 点赞/点踩**（`/api/stats`）复用同一个 KV，无需额外配置。

## 一、项目结构（已就绪）

```
src/                   ← 静态站点（部署时拍平到根，HTML 直接对外服务）
  index.html           ← 前端：fetch('/api/stats') 显示访问量、点赞/点踩
  feedback.html        ← 前端：fetch('/api/messages') 读写留言
functions/             ← 与站点同级（部署时一并带上）
  api/
    messages.js        ← Pages Function → /api/messages（留言板）
    stats.js           ← Pages Function → /api/stats（访问量 + 点赞，复用 FEEDBACK_KV）
```

`functions/` 是 Cloudflare Pages 的约定目录，**不会**被当作静态文件暴露，会被编译成 Functions。

## 二、创建 KV 命名空间

Cloudflare 控制台 → **Storage & Databases → KV → Create namespace**，命名随意（如 `fkpass-feedback`）。

## 三、连接 Pages 项目并绑定 KV

1. **Workers & Pages → Create → Pages**，连接这个仓库（或用 `wrangler pages deploy` 直传）。
2. 构建设置：**Framework preset 选 None**，**Build command 留空**，**Build output directory 填 `src`**（站点文件都在 `src/`；`functions/` 仍在仓库根，会被自动识别成 Functions，不受输出目录影响）。
   > ⚠️ 历史坑：本仓库早期把 `index.html`/`tokens.css` 直接放在仓库根，所以这里曾填 `/`。`facbad1` 之后所有站点文件搬进了 `src/`，**输出目录必须跟着改成 `src`**——否则发布的是没有首页、没有样式表的空根目录，线上会表现为「样式丢失 + 还是旧的 `01-xxx.html` 链接 + 推送不更新」。**不要**改用 `wrangler.toml` 来设这个目录：Pages 项目一旦带 `wrangler.toml` 就会忽略面板里配置的绑定，`FEEDBACK_KV` 会失效、留言板/计数全挂。
3. 部署后进入该 Pages 项目 → **Settings → Functions → KV namespace bindings → Add binding**：
   - **Variable name** 必须填 `FEEDBACK_KV`（代码里就读这个名字）
   - **KV namespace** 选上一步创建的命名空间
4. 给 **Production** 和 **Preview** 两个环境都加同样的绑定，然后重新部署一次让绑定生效。

绑定名写错（不是 `FEEDBACK_KV`）→ 函数返回 500，页面会显示降级横幅。

## 四、本地预览

纯静态部分直接开文件或 `python -m http.server 8000` 即可，但 `/api/messages` 不会工作（会走本地兜底、显示降级横幅，属正常）。要本地连真的 Functions + KV，用 Wrangler：

```bash
npm i -g wrangler
wrangler pages dev . --kv FEEDBACK_KV
```

`--kv FEEDBACK_KV` 会起一个本地模拟 KV，访问它给出的地址即可联调读写。

## 五、验证

部署后打开留言板：横幅不出现、能提交、刷新后留言还在、换个浏览器/设备也能看到，即表示 KV 生效。

## 备注

- 留言以单个 JSON 存在 KV 的 `feedback-list` 键下，读写各 1 次，契合免费额度；自动只保留最近 500 条。
- 首页计数（`/api/stats`）用同一个 `FEEDBACK_KV`，存在 `site-stats` 键下（`{visits,likes,dislikes}`）；**不需要再建/再绑定一个 KV**。访问量按浏览器会话计一次；点赞/点踩在前端用 `localStorage` 限制每浏览器一票（可改主意），属尽力而为的防刷，与留言板同等信任模型。KV 最终一致，高并发下计数可能少计。
- 留言在前端用 `textContent` 渲染（非 `innerHTML`），已防 XSS；KV 里存的是原始文本。
- 没有后台审核/删除接口。需要删某条留言时，目前要去 KV 控制台编辑 `feedback-list` 的值。如需「管理员删除」功能可再加一个受保护的 DELETE 端点。

## 六、自动部署（Cloudflare Git 集成）

本仓库**通过 Cloudflare Pages 的 Git 集成自动部署**：在第三步把 Pages 项目连上这个 GitHub 仓库后，**每次推送到生产分支（`master`）Cloudflare 都会自动重新构建并上线**，非生产分支会生成预览部署。无需 GitHub Actions、无需打 tag、无需在 GitHub 配 `CLOUDFLARE_*` secret。

```bash
git push            # 推到 master，Cloudflare 自动构建并发布
```

仓库里**只保留** `.github/workflows/ci.yml`：它在每次 push / PR 跑 lint + 测试，是**质量闸门，不负责部署**。原先那条「打 `v*` tag 用 Wrangler 部署」的 `deploy.yml` 已删除——它会和 Cloudflare 的 Git 集成各部署一次，属重复。

> 如果哪天想反过来用 GitHub Actions 控制部署（例如「只有打 tag 才上线」），就在 Pages 项目设置里**关掉自动构建 / 断开 Git 集成**，再加回一个 Wrangler 部署工作流——两条部署线只能留一条，否则重复部署。
