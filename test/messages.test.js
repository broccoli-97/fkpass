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
