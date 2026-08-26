import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestGet, onRequestPost } from '../functions/api/stats.js';

const KEY = 'site-stats';

// Minimal in-memory stand-in for a Cloudflare KV namespace.
function makeKV(initial) {
  const store = new Map(initial ? [[KEY, JSON.stringify(initial)]] : []);
  return {
    store,
    async get(k) {
      return store.has(k) ? store.get(k) : null;
    },
    async put(k, v) {
      store.set(k, v);
    },
  };
}

function postReq(body) {
  return new Request('https://example.com/api/stats', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

// 带客户端 IP 头的请求，用于测 visit 服务端去重
function postReqFrom(ip, body) {
  return new Request('https://example.com/api/stats', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'CF-Connecting-IP': ip },
    body: JSON.stringify(body),
  });
}

test('GET returns zeroed counts when empty', async () => {
  const res = await onRequestGet({ env: { FEEDBACK_KV: makeKV() } });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { visits: 0, likes: 0, dislikes: 0 });
});

test('GET returns the stored counts', async () => {
  const res = await onRequestGet({
    env: { FEEDBACK_KV: makeKV({ visits: 5, likes: 2, dislikes: 1 }) },
  });
  assert.deepEqual(await res.json(), { visits: 5, likes: 2, dislikes: 1 });
});

test('GET 500 when KV is unbound', async () => {
  const res = await onRequestGet({ env: {} });
  assert.equal(res.status, 500);
  assert.match((await res.json()).error, /FEEDBACK_KV/);
});

test('GET sends no-store', async () => {
  const res = await onRequestGet({ env: { FEEDBACK_KV: makeKV() } });
  assert.match(res.headers.get('cache-control') ?? '', /no-store/);
});

test('GET tolerates corrupt KV JSON (resets to zero)', async () => {
  const kv = {
    async get() {
      return 'not json {';
    },
    async put() {},
  };
  const res = await onRequestGet({ env: { FEEDBACK_KV: kv } });
  assert.deepEqual(await res.json(), { visits: 0, likes: 0, dislikes: 0 });
});

test('POST visit / like increment the right field', async () => {
  const kv = makeKV();
  await onRequestPost({ request: postReq({ action: 'visit' }), env: { FEEDBACK_KV: kv } });
  await onRequestPost({ request: postReq({ action: 'like' }), env: { FEEDBACK_KV: kv } });
  const res = await onRequestPost({
    request: postReq({ action: 'like' }),
    env: { FEEDBACK_KV: kv },
  });
  assert.deepEqual(await res.json(), { visits: 1, likes: 2, dislikes: 0 });
});

test('POST unlike / undislike clamp at 0 (never negative)', async () => {
  const kv = makeKV({ visits: 0, likes: 0, dislikes: 0 });
  const res = await onRequestPost({
    request: postReq({ action: 'unlike' }),
    env: { FEEDBACK_KV: kv },
  });
  assert.deepEqual(await res.json(), { visits: 0, likes: 0, dislikes: 0 });
});

test('POST switching vote: undislike then like', async () => {
  const kv = makeKV({ visits: 3, likes: 0, dislikes: 1 });
  await onRequestPost({ request: postReq({ action: 'undislike' }), env: { FEEDBACK_KV: kv } });
  const res = await onRequestPost({
    request: postReq({ action: 'like' }),
    env: { FEEDBACK_KV: kv },
  });
  assert.deepEqual(await res.json(), { visits: 3, likes: 1, dislikes: 0 });
});

test('POST 400 on an unknown action, and writes nothing', async () => {
  const kv = makeKV();
  const res = await onRequestPost({
    request: postReq({ action: 'nuke' }),
    env: { FEEDBACK_KV: kv },
  });
  assert.equal(res.status, 400);
  assert.equal(await kv.get(KEY), null);
});

test('POST 400 on a non-JSON body', async () => {
  const res = await onRequestPost({ request: postReq('{bad'), env: { FEEDBACK_KV: makeKV() } });
  assert.equal(res.status, 400);
});

test('POST 500 when KV is unbound', async () => {
  const res = await onRequestPost({ request: postReq({ action: 'like' }), env: {} });
  assert.equal(res.status, 500);
});

test('visit dedup: the same IP only counts once within the window', async () => {
  const kv = makeKV();
  const env = { FEEDBACK_KV: kv };
  // 同一 IP 连发 5 次 visit，访问数只 +1
  for (let i = 0; i < 5; i++) {
    await onRequestPost({ request: postReqFrom('203.0.113.7', { action: 'visit' }), env });
  }
  const res = await onRequestGet({ env });
  assert.equal((await res.json()).visits, 1);
});

test('visit dedup: different IPs each count once', async () => {
  const kv = makeKV();
  const env = { FEEDBACK_KV: kv };
  await onRequestPost({ request: postReqFrom('203.0.113.1', { action: 'visit' }), env });
  await onRequestPost({ request: postReqFrom('198.51.100.2', { action: 'visit' }), env });
  const res = await onRequestGet({ env });
  assert.equal((await res.json()).visits, 2);
});

test('visit dedup: like/dislike still work and are not affected by dedup', async () => {
  const kv = makeKV();
  const env = { FEEDBACK_KV: kv };
  await onRequestPost({ request: postReqFrom('203.0.113.7', { action: 'visit' }), env });
  await onRequestPost({ request: postReqFrom('203.0.113.7', { action: 'visit' }), env }); // dedup'd
  await onRequestPost({ request: postReqFrom('203.0.113.7', { action: 'like' }), env });
  await onRequestPost({ request: postReqFrom('203.0.113.7', { action: 'like' }), env }); // like 不限
  const res = await onRequestGet({ env });
  assert.deepEqual(await res.json(), { visits: 1, likes: 2, dislikes: 0 });
});
