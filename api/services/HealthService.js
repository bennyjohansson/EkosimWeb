const { Pool } = require('pg');

function positiveInteger(value, fallback) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : fallback;
}

function createHealthHandlers(pool, maxAgeSeconds = 120) {
  return {
    async ready(req, res) {
      try {
        await pool.query('SELECT 1');
        res.status(200).json({ status: 'ready', database: 'available' });
      } catch (error) {
        res.status(503).json({ status: 'unavailable', database: 'unavailable' });
      }
    },
    async simulation(req, res) {
      try {
        const result = await pool.query(`
          SELECT city_name, MAX(time) AS cycle,
            EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - MAX(created_at)))::float8 AS age_seconds
          FROM time_data GROUP BY city_name ORDER BY city_name
        `);
        const fresh = result.rows.length > 0 && result.rows.every(row =>
          row.age_seconds !== null && Number.isFinite(Number(row.age_seconds)) &&
          Number(row.age_seconds) >= -5 && Number(row.age_seconds) <= maxAgeSeconds);
        res.status(fresh ? 200 : 503).json({
          status: fresh ? 'advancing' : (result.rows.length ? 'stale' : 'starting'),
          maxAgeSeconds,
          cities: result.rows
        });
      } catch (error) {
        res.status(503).json({ status: 'unavailable' });
      }
    }
  };
}

function registerHealthRoutes(app, databaseConfig) {
  const config = databaseConfig.postgresql;
  const pool = new Pool({
    ...config,
    max: 1,
    connectionTimeoutMillis: 1500,
    idleTimeoutMillis: 10000,
    statement_timeout: 1500,
    query_timeout: 2000,
    allowExitOnIdle: true
  });
  pool.on('error', error => console.error('Health database connection failed:', error.message));
  const handlers = createHealthHandlers(pool,
    positiveInteger(process.env.SIMULATION_MAX_AGE_SECONDS, 120));
  app.get('/ready', handlers.ready);
  app.get('/health/simulation', handlers.simulation);
  return pool;
}

module.exports = { createHealthHandlers, registerHealthRoutes };
