/**
 * Simulation Service - handles simulation data operations
 * Uses database adapter pattern like UserService
 */

const databaseConfig = require('../config/database');
const PostgreSQLSimulationDatabase = require('../database/PostgreSQLSimulationDatabase');
const SQLiteSimulationDatabase = require('../database/SQLiteSimulationDatabase');

class SimulationService {
  constructor() {
    this.simulationDb = null;
    this.initialized = false;
  }

  /**
   * Initialize the appropriate database adapter
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      if (databaseConfig.type === 'postgresql') {
        console.log('🎮 Initializing PostgreSQL simulation database...');
        this.simulationDb = new PostgreSQLSimulationDatabase(databaseConfig.postgresql);
        await this.simulationDb.testConnection();
        console.log('✅ PostgreSQL simulation database initialized');
      } else {
        console.log('🎮 Initializing SQLite simulation database...');
        this.simulationDb = new SQLiteSimulationDatabase(databaseConfig.sqlite);
        await this.simulationDb.testConnection();
        console.log('✅ SQLite simulation database initialized');
      }

      this.initialized = true;

    } catch (error) {
      console.error('❌ Failed to initialize simulation database:', error.message);
      throw error;
    }
  }

  /**
   * Get highscore data
   */
  async getHighScore() {
    await this.initialize();

    try {
      const data = await this.simulationDb.getHighScore();
      console.log(`📈 Retrieved highscore data: ${data.length} records`);
      return data;

    } catch (error) {
      console.error('Failed to get highscore data:', error.message);
      throw new Error('Could not retrieve highscore data');
    }
  }

  /**
   * Get world table data
   */
  async getWorldTable(tableName) {
    await this.initialize();

    try {
      const data = await this.simulationDb.getTable(tableName);
      console.log(`🌍 Retrieved ${tableName} data: ${data.length} records`);
      return data;

    } catch (error) {
      console.error(`Failed to get ${tableName} data:`, error.message);
      throw new Error(`Could not retrieve ${tableName} data`);
    }
  }

  /**
   * Get time series data for a country
   */
  async getTimeData(cityName, lastTime = 0) {
    await this.initialize();

    try {
      const data = await this.simulationDb.getTimeData(cityName, lastTime);
      console.log(`📊 Retrieved time data for ${cityName}: ${data.length} records since time ${lastTime}`);
      return data;

    } catch (error) {
      console.error(`Failed to get time data for ${cityName}:`, error.message);
      throw new Error(`Could not retrieve time data for ${cityName}`);
    }
  }

  /**
   * Get money data for a country
   */
  async getMoneyData(cityName, lastTime = 0) {
    await this.initialize();

    try {
      const data = await this.simulationDb.getMoneyData(cityName, lastTime);
      console.log(`💰 Retrieved money data for ${cityName}: ${data.length} records since time ${lastTime}`);
      return data;

    } catch (error) {
      console.error(`Failed to get money data for ${cityName}:`, error.message);
      throw new Error(`Could not retrieve money data for ${cityName}`);
    }
  }

  /**
   * Get company data for a specific company
   */
  async getCompanyData(cityName, companyName, lastTime = 0) {
    await this.initialize();

    try {
      const data = await this.simulationDb.getCompanyData(cityName, companyName, lastTime);
      console.log(`🏢 Retrieved company data for ${companyName} in ${cityName}: ${data.length} records since time ${lastTime}`);
      return data;

    } catch (error) {
      console.error(`Failed to get company data for ${companyName} in ${cityName}:`, error.message);
      throw new Error(`Could not retrieve company data for ${companyName}`);
    }
  }

  /**
   * Test database connection
   */
  async testConnection() {
    await this.initialize();
    return await this.simulationDb.testConnection();
  }

  /**
   * Close database connections
   */
  async close() {
    if (this.simulationDb) {
      await this.simulationDb.close();
      this.simulationDb = null;
      this.initialized = false;
    }
  }
}

module.exports = SimulationService;