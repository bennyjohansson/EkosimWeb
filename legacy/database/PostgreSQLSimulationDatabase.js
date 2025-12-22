/**
 * PostgreSQL Simulation Database Adapter
 * Handles simulation data operations (highscores, world tables, etc.)
 */

const { Pool } = require('pg');

class PostgreSQLSimulationDatabase {
  constructor(config) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      max: config.max || 10,
      idleTimeoutMillis: config.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config.connectionTimeoutMillis || 10000,
    });

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL simulation client', err);
    });
  }

  /**
   * Test database connection
   */
  async testConnection() {
    const client = await this.pool.connect();
    
    try {
      // Test high_scores table exists (note: plural name in PostgreSQL)
      const tableCheck = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'high_scores'
      `);
      
      if (tableCheck.rows.length === 0) {
        throw new Error('high_scores table not found');
      }

      // Test basic query
      const result = await client.query('SELECT COUNT(*) as count FROM high_scores');
      
      console.log('✅ PostgreSQL simulation database connection test passed');
      console.log(`📊 Current highscore records: ${result.rows[0].count}`);
      
      return { count: parseInt(result.rows[0].count) };
      
    } finally {
      client.release();
    }
  }

  /**
   * Get highscore data
   * Maps PostgreSQL high_scores table to match SQLite HIGH_SCORE format
   */
  async getHighScore() {
    const client = await this.pool.connect();
    
    try {
      // Map PostgreSQL columns to match SQLite structure expected by frontend
      // SQLite format was: 2021-1-9 10:50:5 (no leading zeros)
      const result = await client.query(`
        SELECT 
          ROW_NUMBER() OVER (ORDER BY achieved_at DESC) as key,
          id as "ID",
          country as "COUNTRY",
          growth_rate as "GROWTH",
          palma_ratio as "PALMA", 
          environmental_impact as "ENV_IMP",
          TO_CHAR(achieved_at, 'YYYY-FMMM-FMDD FMHH24:FMMI:FMSS') as "TIMENOW"
        FROM high_scores
        ORDER BY achieved_at DESC
      `);

      // Convert numeric strings to actual numbers for frontend compatibility
      const processedRows = result.rows.map(row => ({
        ...row,
        GROWTH: parseFloat(row.GROWTH),
        PALMA: parseFloat(row.PALMA), 
        ENV_IMP: parseFloat(row.ENV_IMP)
      }));

      console.log(`📈 Retrieved ${processedRows.length} highscore records from PostgreSQL`);
      return processedRows;
      
    } finally {
      client.release();
    }
  }

  /**
   * Get any simulation table data
   * Generic function for world tables, country data, etc.
   */
  async getTable(tableName) {
    const client = await this.pool.connect();
    
    try {
      // Sanitize table name to prevent SQL injection
      const validTableNames = ['high_score', 'world_table', 'time_data', 'money_data', 'country_data'];
      if (!validTableNames.includes(tableName.toLowerCase())) {
        throw new Error(`Invalid table name: ${tableName}`);
      }

      const result = await client.query(`
        SELECT 
          ROW_NUMBER() OVER (ORDER BY id) as key,
          *
        FROM ${tableName}
        ORDER BY id
      `);

      console.log(`📊 Retrieved ${result.rows.length} records from ${tableName} table`);
      return result.rows;
      
    } finally {
      client.release();
    }
  }

  /**
   * Close database connections
   */
  async close() {
    try {
      await this.pool.end();
      console.log('🔐 PostgreSQL simulation database pool closed');
    } catch (error) {
      console.error('Error closing PostgreSQL simulation database pool:', error);
    }
  }
}

module.exports = PostgreSQLSimulationDatabase;