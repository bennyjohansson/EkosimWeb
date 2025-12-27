/**
 * SQLite Simulation Database Adapter (Backward compatibility)
 * Wraps existing DBConnection.js functionality
 */

const sqlite3 = require('sqlite3').verbose();

class SQLiteSimulationDatabase {
  constructor(config) {
    this.config = config;
  }

  /**
   * Test database connection
   */
  async testConnection() {
    return new Promise((resolve, reject) => {
      let db = new sqlite3.Database('../../ekosim/myDB/Bennyworld.db', sqlite3.OPEN_READONLY, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        db.get('SELECT COUNT(*) as count FROM HIGH_SCORE', (err, row) => {
          db.close();
          
          if (err) {
            reject(err);
          } else {
            console.log('✅ SQLite simulation database connection test passed');
            console.log(`📊 Current highscore records: ${row.count}`);
            resolve({ count: row.count });
          }
        });
      });
    });
  }

  /**
   * Get highscore data - uses existing SQLite logic
   */
  async getHighScore() {
    return this.getTable('HIGH_SCORE');
  }

  /**
   * Get table data - existing SQLite implementation
   */
  async getTable(tableName) {
    return new Promise((resolve, reject) => {
      let db = new sqlite3.Database('../../ekosim/myDB/Bennyworld.db', sqlite3.OPEN_READONLY, (err) => {
        if (err) {
          console.error(err.message);
          reject(err);
          return;
        }
        console.log('Connected to the Bennyworld database.');
      });

      const queries = [];
      console.log(`SELECT rowid as key, * FROM ${tableName}`);
      
      db.each(`SELECT rowid as key, * FROM ${tableName}`, (err, row) => {
        if (err) {
          reject(err);
        } else {
          queries.push(row);
        }
      }, (err, n) => {
        if (err) {
          reject(err);
        } else {
          resolve(queries);
        }
      });

      db.close((err) => {
        if (err) {
          console.error(err.message);
        }
        console.log('Close the database connection.');
      });
    });
  }

  /**
   * Get a single parameter value for a city (SQLite version)
   */
  async getParameter(cityName, parameterName) {
    return new Promise((resolve, reject) => {
      const myDatabase = `../../ekosim/myDB/${cityName}.db`;
      let db = new sqlite3.Database(myDatabase, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
          console.error(err.message);
          reject(err);
          return;
        }
      });

      db.get('SELECT * FROM PARAMETERS WHERE PARAMETER = ?', [parameterName], (err, row) => {
        db.close();
        
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Get all parameters for a city (SQLite version)
   */
  async getAllParameters(cityName) {
    return new Promise((resolve, reject) => {
      const myDatabase = `../../ekosim/myDB/${cityName}.db`;
      let db = new sqlite3.Database(myDatabase, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
          console.error(err.message);
          reject(err);
          return;
        }
      });

      const queries = [];
      
      db.each('SELECT rowid as key, * FROM PARAMETERS', (err, row) => {
        if (err) {
          reject(err);
        } else {
          queries.push(row);
        }
      }, (err, n) => {
        db.close();
        
        if (err) {
          reject(err);
        } else {
          resolve(queries);
        }
      });
    });
  }

  /**
   * Close database connections (no-op for SQLite)
   */
  async close() {
    console.log('🔐 SQLite simulation database closed');
  }
}

module.exports = SQLiteSimulationDatabase;