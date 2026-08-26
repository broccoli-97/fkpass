// Cloudflare Pages Function — 首页站点脉搏 API（访问量 + 点赞/点踩）
// 路由：/api/stats  (functions/api/stats.js 自动映射)
//
// 复用留言板的同一个 KV：绑定名 FEEDBACK_KV，计数存在 "site-stats" 键下，
// 单个 JSON {visits,likes,dislikes} 读写各 1 次——无需新增任何绑定。
// 说明：KV 最终一致，高并发下自增可能少计；对学习站点足够（与留言板同等取舍）。
//
// 防刷：visit 计数前端已用 sessionStorage 每会话去重，服务端再按 IP 去重——每 IP
// 在 VISIT_DEDUP_MS 内只计一次 visit（键带 expirationTtl 自动过期）。直接 curl
// 重复 POST visit 不会把访问数刷到天文数字。like/dislike 是用户主动操作，不限流。

const KEY = 'site-stats';
const FIELDS = ['visits', 'likes', 'dislikes'];
const VISIT_DEDUP_MS = 30 * 60 * 1000; // 同一 IP 30 分钟内只计一次访问

// 每个 action 对应字段增量；unlike/undislike 用于撤销或切换投票
const DELTAS = {
  visit: { visits: 1 },
  like: { likes: 1 },
  unlike: { likes: -1 },
  dislike: { dislikes: 1 },
  undislike: { dislikes: -1 },
};

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
// 返回 null，调用方据此决定是否去重（不去重但不拒绝）。
function clientIP(request) {
  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For');
  if (!ip) return null;
  return ip.split(',')[0].trim();
}

// 返回 true 表示这次 visit 应计数（该 IP 在窗口内首次），false 表示已计过。
async function visitShouldCount(kv, ip, now) {
  const vk = `visit-${ip}`;
  const last = Number(await kv.get(vk));
  if (Number.isFinite(last) && now - last < VISIT_DEDUP_MS) return false;
  try {
    await kv.put(vk, String(now), { expirationTtl: Math.ceil(VISIT_DEDUP_MS / 1000) + 60 });
  } catch {
    await kv.put(vk, String(now));
  }
  return true;
}

// 把 KV 里的原始值规整成 {visits,likes,dislikes} 三个非负整数（坏数据归零）
function readStats(raw) {
  let obj = {};
  try {
    obj = raw ? JSON.parse(raw) : {};
  } catch {
    obj = {};
  }
  const out = {};
  for (const f of FIELDS) {
    const n = Math.floor(Number(obj[f]));
    out[f] = Number.isFinite(n) && n > 0 ? n : 0;
  }
  return out;
}

// GET /api/stats → { visits, likes, dislikes }（只读，不自增）
export async function onRequestGet({ env }) {
  const kv = env.FEEDBACK_KV;
  if (!kv) {
    return json({ error: 'KV 未绑定（请在 Pages 项目 Settings → Bindings 绑定 FEEDBACK_KV）' }, 500);
  }
  return json(readStats(await kv.get(KEY)));
}

// POST /api/stats  body:{ action } → 自增对应字段（夹在 0 以上），返回最新计数
export async function onRequestPost({ request, env }) {
  const kv = env.FEEDBACK_KV;
  if (!kv) {
    return json({ error: 'KV 未绑定（请在 Pages 项目 Settings → Bindings 绑定 FEEDBACK_KV）' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: '请求体不是合法 JSON' }, 400);
  }

  const delta = DELTAS[body && body.action];
  if (!delta) {
    return json({ error: 'action 必须是 visit / like / unlike / dislike / undislike' }, 400);
  }

  // visit 按 IP 去重：同一 IP 在窗口内重复 visit 不再 +1（防 curl 刷量）。无 IP 头
  // 时（本地预览/单测桩）照常计数，避免把正常的去重逻辑在无头环境下误关。
  if (body.action === 'visit') {
    const ip = clientIP(request);
    if (ip && !(await visitShouldCount(kv, ip, Date.now()))) {
      return json(readStats(await kv.get(KEY))); // 维持计数不变
    }
  }

  const stats = readStats(await kv.get(KEY));
  for (const f of FIELDS) {
    if (delta[f]) {
      stats[f] = Math.max(0, stats[f] + delta[f]);
    }
  }
  await kv.put(KEY, JSON.stringify(stats));
  return json(stats);
}
