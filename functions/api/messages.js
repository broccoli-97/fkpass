// Cloudflare Pages Function — 留言板 API
// 路由：/api/messages  (文件位置 functions/api/messages.js 自动映射)
//
// 依赖一个绑定名为 FEEDBACK_KV 的 KV 命名空间（见 CLOUDFLARE-SETUP.md）。
// 整张留言列表以单个 JSON 存在 KV 的 "feedback-list" 键下——读写各 1 次，
// 适配 Pages Functions 免费额度（每请求子请求数有限），小型留言板足够。
//
// 防滥用：
// - Honeypot：表单藏一个诱饵字段 website，真人不会填；机器人若填了，服务端
//   假装成功（201）但丢弃，不给反馈。
// - 按 IP 限流：每 IP 在 RATE_WINDOW_MS 内最多 RATE_MAX 条，超限返回 429。
//   窗口键带 expirationTtl 自动过期，避免在 KV 里堆积。本地/测试环境无
//   CF-Connecting-IP 头时不限流（退化但不拒绝）。

const KEY = 'feedback-list';
const MAX_LEN = { name: 30, contact: 60, message: 500 };
const MAX_ITEMS = 500; // 仅保留最近的 N 条，防止无限增长

// 每个时间窗口内单 IP 最多留言条数；窗口键带 TTL 自动过期
const RATE_MAX = 3;
const RATE_WINDOW_MS = 5 * 60 * 1000; // 5 分钟

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

// 取客户端 IP。Cloudflare Pages 下走 CF-Connecting-IP；缺失（本地预览/测试）时
// 返回 null —— 调用方据此决定是否限流（不限但不拒绝）。
function clientIP(request) {
  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For');
  if (!ip) return null;
  // X-Forwarded-For 可能是 "ip, proxy, ..."，只取第一个
  return ip.split(',')[0].trim();
}

// 返回 true 表示放行，false 表示超限。窗口记录带 expirationTtl 自动过期；
// 若 KV.put 不支持 options（测试桩）则回退到不带 TTL 的写入。
async function rateAllow(kv, ip, now) {
  const rk = `rate-msg-${ip}`;
  let entries = [];
  try {
    const raw = await kv.get(rk);
    entries = raw ? JSON.parse(raw) : [];
  } catch {
    entries = [];
  }
  entries = entries.filter((t) => typeof t === 'number' && now - t < RATE_WINDOW_MS);
  if (entries.length >= RATE_MAX) return false;
  entries.push(now);
  try {
    await kv.put(rk, JSON.stringify(entries), { expirationTtl: Math.ceil(RATE_WINDOW_MS / 1000) + 60 });
  } catch {
    // 桩 KV 不支持第三参时降级：仍记录，但无 TTL（生产环境用的是真 KV，走上面那支）
    await kv.put(rk, JSON.stringify(entries));
  }
  return true;
}

// GET /api/messages → 返回留言数组
export async function onRequestGet({ env }) {
  const kv = env.FEEDBACK_KV;
  if (!kv) return json({ error: 'KV 未绑定（请在 Pages 项目 Settings → Bindings 绑定 FEEDBACK_KV）' }, 500);
  const raw = await kv.get(KEY);
  return json(raw ? JSON.parse(raw) : []);
}

// POST /api/messages  body: { name?, contact?, message, website? } → 追加一条，返回该条
export async function onRequestPost({ request, env }) {
  const kv = env.FEEDBACK_KV;
  if (!kv) return json({ error: 'KV 未绑定（请在 Pages 项目 Settings → Bindings 绑定 FEEDBACK_KV）' }, 500);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: '请求体不是合法 JSON' }, 400);
  }

  // Honeypot：诱饵字段被填 ⇒ 是机器人。假装成功但不落库，避免暴露判定逻辑。
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return json(
      { id: `${Date.now()}-spam`, name: '匿名考生', contact: '', message: '', time: Date.now() },
      201,
    );
  }

  const message = String(body.message ?? '').trim().slice(0, MAX_LEN.message);
  if (!message) return json({ error: '留言内容不能为空' }, 400);

  // 按 IP 限流（无 IP 头时放行，如本地预览/单测桩）
  const ip = clientIP(request);
  if (ip) {
    const allowed = await rateAllow(kv, ip, Date.now());
    if (!allowed) return json({ error: '留言太频繁，请稍候再试' }, 429);
  }

  const entry = {
    // 服务端生成 id / 时间，作为权威记录（不信任客户端时间）
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: String(body.name ?? '').trim().slice(0, MAX_LEN.name) || '匿名考生',
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
