/**
 * Database configuration for EkoSim migration
 * Controls whether to use SQLite or PostgreSQL
 */

const databaseConfig = {
  // Database type: 'sqlite' or 'postgresql'
  type: process.env.DATABASE_TYPE || 'postgresql',
  
  // SQLite configuration
  sqlite: {
    path: './myDB/',
  },
  
  // PostgreSQL configuration
  postgresql: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DATABASE || 'ekosim',
    user: process.env.POSTGRES_USER || 'ekosim',
    password: process.env.POSTGRES_PASSWORD || 'dev_password_change_in_production',
    max: 10, // max connections in pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  }
};

module.exports = databaseConfig;