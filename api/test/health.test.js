const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHealthHandlers } = require('../services/HealthService');

async function invoke(handler) {
  const response = { status(code) { this.code = code; return this; }, json(body) { this.body = body; } };
  await handler({}, response);
  return response;
}

test('readiness reflects database availability', async () => {
  const healthy = createHealthHandlers({ query: async () => ({ rows: [] }) });
  assert.equal((await invoke(healthy.ready)).code, 200);
  const failed = createHealthHandlers({ query: async () => { throw new Error('offline'); } });
  assert.equal((await invoke(failed.ready)).code, 503);
});

test('freshness handles startup, resets, and a stale city', async () => {
  let rows = [];
  const handlers = createHealthHandlers({ query: async () => ({ rows }) }, 120);
  assert.equal((await invoke(handlers.simulation)).body.status, 'starting');
  rows = [{ city_name: 'Bennyland', cycle: 99, age_seconds: 2 }];
  assert.equal((await invoke(handlers.simulation)).code, 200);
  rows = [{ city_name: 'Bennyland', cycle: 0, age_seconds: 1 }];
  assert.equal((await invoke(handlers.simulation)).code, 200);
  rows.push({ city_name: 'Saraland', cycle: 10, age_seconds: 121 });
  assert.equal((await invoke(handlers.simulation)).code, 503);
  rows[1].age_seconds = null;
  assert.equal((await invoke(handlers.simulation)).code, 503);
});
