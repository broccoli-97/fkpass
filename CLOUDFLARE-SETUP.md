# 部署到 Cloudflare Pages（含留言板存储）

留言板用 **Cloudflare Pages Functions + KV** 实现真正的公共存储——所有访客共享同一份留言，全部在 Cloudflare 内，无需另开服务器。

## 一、项目结构（已就绪）

```
/                      ← 静态站点根目录，HTML 直接对外服务
  06-feedback.html     ← 前端：fetch('/api/messages') 读写留言
  functions/
    api/
      messages.js      ← Pages Function，自动映射到 /api/messages
```

`functions/` 是 Cloudflare Pages 的约定目录，**不会**被当作静态文件暴露，会被编译成 Functions。

## 二、创建 KV 命名空间

Cloudflare 控制台 → **Storage & Databases → KV → Create namespace**，命名随意（如 `fkpass-feedback`）。

## 三、连接 Pages 项目并绑定 KV

1. **Workers & Pages → Create → Pages**，连接这个仓库（或用 `wrangler pages deploy` 直传）。
2. 构建设置：**Framework preset 选 None**，**Build command 留空**，**Build output directory 填 `/`**（站点就是纯静态根目录，无需构建）。
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
- 留言在前端用 `textContent` 渲染（非 `innerHTML`），已防 XSS；KV 里存的是原始文本。
- 没有后台审核/删除接口。需要删某条留言时，目前要去 KV 控制台编辑 `feedback-list` 的值。如需「管理员删除」功能可再加一个受保护的 DELETE 端点。
