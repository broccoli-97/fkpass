// Cloudflare Pages Function — 首页站点脉搏 API（访问量 + 点赞/点踩）
// 路由：/api/stats  (functions/api/stats.js 自动映射)
//
// 复用留言板的同一个 KV：绑定名 FEEDBACK_KV，计数存在 "site-stats" 键下，
// 单个 JSON {visits,likes,dislikes} 读写各 1 次——无需新增任何绑定。
// 说明：KV 最终一致，高并发下自增可能少计；对学习站点足够（与留言板同等取舍）。

const KEY = 'site-stats';
const FIELDS = ['visits', 'likes', 'dislikes'];

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

  const stats = readStats(await kv.get(KEY));
  for (const f of FIELDS) {
    if (delta[f]) {
      stats[f] = Math.max(0, stats[f] + delta[f]);
    }
  }
  await kv.put(KEY, JSON.stringify(stats));
  return json(stats);
}
