// Cloudflare Pages Function — 留言板 API
// 路由：/api/messages  (文件位置 functions/api/messages.js 自动映射)
//
// 依赖一个绑定名为 FEEDBACK_KV 的 KV 命名空间（见 CLOUDFLARE-SETUP.md）。
// 整张留言列表以单个 JSON 存在 KV 的 "feedback-list" 键下——读写各 1 次，
// 适配 Pages Functions 免费额度（每请求子请求数有限），小型留言板足够。

const KEY = 'feedback-list';
const MAX_LEN = { name: 30, contact: 60, message: 500 };
const MAX_ITEMS = 500; // 仅保留最近的 N 条，防止无限增长

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

// GET /api/messages → 返回留言数组
export async function onRequestGet({ env }) {
  const kv = env.FEEDBACK_KV;
  if (!kv) return json({ error: 'KV 未绑定（FEEDBACK_KV）' }, 500);
  const raw = await kv.get(KEY);
  return json(raw ? JSON.parse(raw) : []);
}

// POST /api/messages  body: { name?, contact?, message } → 追加一条，返回该条
export async function onRequestPost({ request, env }) {
  const kv = env.FEEDBACK_KV;
  if (!kv) return json({ error: 'KV 未绑定（FEEDBACK_KV）' }, 500);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: '请求体不是合法 JSON' }, 400);
  }

  const message = String(body.message ?? '').trim().slice(0, MAX_LEN.message);
  if (!message) return json({ error: '留言内容不能为空' }, 400);

  const entry = {
    // 服务端生成 id / 时间，作为权威记录（不信任客户端时间）
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: String(body.name ?? '').trim().slice(0, MAX_LEN.name),
    contact: String(body.contact ?? '').trim().slice(0, MAX_LEN.contact),
    message,
    time: Date.now(),
  };

  const raw = await kv.get(KEY);
  const list = raw ? JSON.parse(raw) : [];
  list.push(entry);

  await kv.put(KEY, JSON.stringify(list.slice(-MAX_ITEMS)));
  return json(entry, 201);
}
