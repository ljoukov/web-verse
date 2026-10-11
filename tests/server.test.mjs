import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import server from '../server.mjs';

test('exported hosting entrypoint serves pages and API through the same HTTP server', async t => {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
  const origin = `http://127.0.0.1:${server.address().port}`;
  for (const path of ['/', '/workspace/', '/stillwater/', '/goodhands/', '/formfield/']) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get('content-type'), /text\/html/);
    assert.match(await response.text(), /<!doctype html>/i);
  }
  const health = await fetch(origin + '/api/health', { headers: { origin } });
  assert.equal(health.status, 200);
  assert.equal((await health.json()).ok, true);
  const catalog = await fetch(origin + '/api/providers');
  assert.equal(catalog.status, 200);
  assert.equal((await catalog.json()).providers.length, 3);
  const denied = await fetch(origin + '/api/health', { headers: { origin: 'https://other.example' } });
  assert.equal(denied.status, 403);
});
