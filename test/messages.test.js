import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestGet, onRequestPost } from '../functions/api/messages.js';

const KEY = 'feedback-list';

// Minimal in-memory stand-in for a Cloudflare KV namespace (the function only
// uses .get(key) and .put(key, value) on a single key).
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
  return new Request('https://example.com/api/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

// 带客户端 IP 头的请求，用于测限流（Cloudflare 下走 CF-Connecting-IP）
function postReqFrom(ip, body) {
  return new Request('https://example.com/api/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'CF-Connecting-IP': ip },
    body: JSON.stringify(body),
  });
}

// 能记录所有 put 写入的键，用于断言限流窗口键 / visit 去重键是否落地
function makeTrackingKV(initial) {
  const store = new Map(initial ? [[KEY, JSON.stringify(initial)]] : []);
  const puts = [];
  return {
    store,
    puts,
    async get(k) {
      return store.has(k) ? store.get(k) : null;
    },
    async put(k, v) {
      puts.push(k);
      store.set(k, v);
    },
  };
}

test('GET returns [] when the store is empty', async () => {
  const res = await onRequestGet({ env: { FEEDBACK_KV: makeKV() } });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), []);
});

test('GET returns the stored list', async () => {
  const seed = [{ id: '1', name: 'a', contact: '', message: 'hi', time: 1 }];
  const res = await onRequestGet({ env: { FEEDBACK_KV: makeKV(seed) } });
  assert.deepEqual(await res.json(), seed);
});

test('GET 500 when KV is unbound', async () => {
  const res = await onRequestGet({ env: {} });
  assert.equal(res.status, 500);
  assert.match((await res.json()).error, /FEEDBACK_KV/);
});

test('GET sends no-store so the list is never cached stale', async () => {
  const res = await onRequestGet({ env: { FEEDBACK_KV: makeKV() } });
  assert.match(res.headers.get('cache-control') ?? '', /no-store/);
});

test('POST 500 when KV is unbound', async () => {
  const res = await onRequestPost({ request: postReq({ message: 'hi' }), env: {} });
  assert.equal(res.status, 500);
});

test('POST 400 on a non-JSON body', async () => {
  const res = await onRequestPost({
    request: postReq('not json {'),
    env: { FEEDBACK_KV: makeKV() },
  });
  assert.equal(res.status, 400);
});

test('POST 400 on an empty / whitespace-only message, and writes nothing', async () => {
  const kv = makeKV();
  for (const message of ['', '   ', '\n\t']) {
    const res = await onRequestPost({ request: postReq({ message }), env: { FEEDBACK_KV: kv } });
    assert.equal(res.status, 400);
  }
  assert.equal(await kv.get(KEY), null);
});

test('POST 201 stores the entry and returns it with a server id/time', async () => {
  const kv = makeKV();
  const before = Date.now();
  const res = await onRequestPost({
    request: postReq({ name: 'L', contact: 'wx', message: 'hello' }),
    env: { FEEDBACK_KV: kv },
  });
  assert.equal(res.status, 201);
  const entry = await res.json();
  assert.equal(entry.message, 'hello');
  assert.equal(entry.name, 'L');
  assert.equal(entry.contact, 'wx');
  assert.ok(typeof entry.id === 'string' && entry.id.length > 0);
  assert.ok(entry.time >= before);
  const stored = JSON.parse(await kv.get(KEY));
  assert.equal(stored.length, 1);
  assert.equal(stored[0].id, entry.id);
});

test('POST defaults a blank name to 匿名考生', async () => {
  const res = await onRequestPost({
    request: postReq({ message: 'x', name: '   ' }),
    env: { FEEDBACK_KV: makeKV() },
  });
  assert.equal((await res.json()).name, '匿名考生');
});

test('POST trims and caps field lengths', async () => {
  const res = await onRequestPost({
    request: postReq({
      name: 'n'.repeat(100),
      contact: 'c'.repeat(100),
      message: '  ' + 'm'.repeat(1000) + '  ',
    }),
    env: { FEEDBACK_KV: makeKV() },
  });
  const e = await res.json();
  assert.equal(e.name.length, 30);
  assert.equal(e.contact.length, 60);
  assert.equal(e.message.length, 500);
});

test('POST is authoritative: a client-supplied id/time is ignored', async () => {
  const res = await onRequestPost({
    request: postReq({ message: 'x', id: 'HACKED', time: 5 }),
    env: { FEEDBACK_KV: makeKV() },
  });
  const e = await res.json();
  assert.notEqual(e.id, 'HACKED');
  assert.notEqual(e.time, 5);
});

test('the stored list is capped at 500 (MAX_ITEMS), keeping the newest', async () => {
  const seed = Array.from({ length: 500 }, (_, i) => ({ id: String(i), message: 'm', time: i }));
  const kv = makeKV(seed);
  await onRequestPost({ request: postReq({ message: 'newest' }), env: { FEEDBACK_KV: kv } });
  const stored = JSON.parse(await kv.get(KEY));
  assert.equal(stored.length, 500);
  assert.equal(stored[stored.length - 1].message, 'newest');
  assert.equal(stored[0].id, '1'); // the oldest (id '0') was dropped
});

test('honeypot: a filled website field is silently dropped (201 but not stored)', async () => {
  const kv = makeKV();
  const res = await onRequestPost({
    request: postReq({ message: 'spam content', website: 'http://buy-now.example' }),
    env: { FEEDBACK_KV: kv },
  });
  assert.equal(res.status, 201); // 假装成功，不给机器人反馈
  assert.equal(await kv.get(KEY), null); // 但不落库
});

test('honeypot: an empty website field stores normally', async () => {
  const kv = makeKV();
  const res = await onRequestPost({
    request: postReq({ message: 'real msg', website: '   ' }),
    env: { FEEDBACK_KV: kv },
  });
  assert.equal(res.status, 201);
  assert.equal(JSON.parse(await kv.get(KEY)).length, 1);
});

test('rate limit: a single IP is throttled after RATE_MAX messages in the window', async () => {
  const kv = makeTrackingKV();
  const env = { FEEDBACK_KV: kv };
  // 同一 IP 连发三条：前 3 条 201
  for (let i = 0; i < 3; i++) {
    const res = await onRequestPost({
      request: postReqFrom('203.0.113.7', { message: `msg ${i}` }),
      env,
    });
    assert.equal(res.status, 201);
  }
  const stored = JSON.parse(await kv.get(KEY));
  assert.equal(stored.length, 3);
  // 第 4 条被限流：429，且不再写入留言列表
  const blocked = await onRequestPost({
    request: postReqFrom('203.0.113.7', { message: 'msg 3' }),
    env,
  });
  assert.equal(blocked.status, 429);
  assert.equal(JSON.parse(await kv.get(KEY)).length, 3);
});

test('rate limit: different IPs do not share a window', async () => {
  const kv = makeTrackingKV();
  const env = { FEEDBACK_KV: kv };
  const r1 = await onRequestPost({ request: postReqFrom('203.0.113.1', { message: 'a' }), env });
  const r2 = await onRequestPost({ request: postReqFrom('198.51.100.2', { message: 'b' }), env });
  assert.equal(r1.status, 201);
  assert.equal(r2.status, 201);
  assert.equal(JSON.parse(await kv.get(KEY)).length, 2);
});
