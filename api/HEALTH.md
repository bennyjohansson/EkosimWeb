# Health endpoints

GET /health retains Express liveness behavior. GET /ready probes PostgreSQL and returns HTTP 200 when available and HTTP 503 on failure. GET /health/simulation returns HTTP 200 for recent per-city time-data rows and HTTP 503 for empty data, stale data, or a database error. SIMULATION_MAX_AGE_SECONDS defaults to 120 seconds and should be configured above the longest expected simulation cycle. Progress uses database timestamps and supports simulation cycle resets.

A dedicated one-connection health pool bounds connection waits to 1.5 seconds, server statements to 1.5 seconds, and client query waits to 2 seconds. Health routes are registered before the production SPA fallback. The endpoints expose operational state without credentials or raw database error text.

Run handler regressions with node --test test/health.test.js. Live integration verification on 2026-11-23 covered readiness, empty startup, a 99-to-0 cycle reset, stale data, locked-table timeout, and an unavailable PostgreSQL endpoint. Container deployment verification remains pending.
