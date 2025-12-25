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
   * Get time series data for a country
   * @param {string} cityName - The city/country name
   * @param {number} lastTime - The last timestamp received (optional)
   */
  async getTimeData(cityName, lastTime = 0) {
    const client = await this.pool.connect();

    try {
      let query;
      let params;

      if (lastTime > 0) {
        // Get only new data since lastTime
        // Map to uppercase column names to match SQLite format expected by frontend
        query = `
          SELECT 
            city_name as "CITY",
            time as "TIME",
            gdp_items as "GDP_ITEMS",
            demand as "DEMAND",
            price as "PRICE",
            unemployment as "UNEMPLOYMENT",
            wages as "WAGES",
            interest_rate as "INTEREST_RATE",
            investments as "INVESTMENTS",
            gdp_nominal as "GDP_NOMINAL",
            liquidity_reserve_ratio as "LIQUIDITY_RESERVE_RATIO",
            capital_reserve_ratio as "CAPITAL_RESERVE_RATIO",
            bank_dividend_ratio as "BANK_DIVIDEND_RATIO"
          FROM time_data
          WHERE city_name = $1 AND time > $2
          ORDER BY time ASC
        `;
        params = [cityName, lastTime];
      } else {
        // Get all data for the country
        // Map to uppercase column names to match SQLite format expected by frontend
        query = `
          SELECT 
            city_name as "CITY",
            time as "TIME",
            gdp_items as "GDP_ITEMS",
            demand as "DEMAND",
            price as "PRICE",
            unemployment as "UNEMPLOYMENT",
            wages as "WAGES",
            interest_rate as "INTEREST_RATE",
            investments as "INVESTMENTS",
            gdp_nominal as "GDP_NOMINAL",
            liquidity_reserve_ratio as "LIQUIDITY_RESERVE_RATIO",
            capital_reserve_ratio as "CAPITAL_RESERVE_RATIO",
            bank_dividend_ratio as "BANK_DIVIDEND_RATIO"
          FROM time_data
          WHERE city_name = $1
          ORDER BY time ASC
        `;
        params = [cityName];
      }

      const result = await client.query(query, params);

      console.log(`📊 Retrieved ${result.rows.length} time_data records for ${cityName} since time ${lastTime}`);
      return result.rows;

    } finally {
      client.release();
    }
  }

  /**
   * Get money data for a country
   * @param {string} cityName - The city/country name
   * @param {number} lastTime - The last timestamp received (optional)
   */
  async getMoneyData(cityName, lastTime = 0) {
    const client = await this.pool.connect();

    try {
      let query;
      let params;

      if (lastTime > 0) {
        query = `
          SELECT *
          FROM money_data
          WHERE city_name = $1 AND time > $2
          ORDER BY time ASC
        `;
        params = [cityName, lastTime];
      } else {
        query = `
          SELECT *
          FROM money_data
          WHERE city_name = $1
          ORDER BY time ASC
        `;
        params = [cityName];
      }

      const result = await client.query(query, params);

      console.log(`💰 Retrieved ${ result.rows.length } money_data records for ${ cityName } since time ${ lastTime } `);
      return result.rows;

    } finally {
      client.release();
    }
  }

  /**
   * Get company data for a specific company
   * @param {string} cityName - The city/country name
   * @param {string} companyName - The company name
   * @param {number} lastTime - The last timestamp received (optional)
   */
  async getCompanyData(cityName, companyName, lastTime = 0) {
    const client = await this.pool.connect();

    try {
      let query;
      let params;

      if (lastTime > 0) {
        query = `
        SELECT *
          FROM company_data
          WHERE city_name = $1 AND company_name = $2 AND time > $3
          ORDER BY time ASC
          `;
        params = [cityName, companyName, lastTime];
      } else {
        query = `
        SELECT *
          FROM company_data
          WHERE city_name = $1 AND company_name = $2
          ORDER BY time ASC
        `;
        params = [cityName, companyName];
      }

      const result = await client.query(query, params);

      console.log(`🏢 Retrieved ${ result.rows.length } company_data records for ${ companyName } in ${ cityName } since time ${ lastTime } `);
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