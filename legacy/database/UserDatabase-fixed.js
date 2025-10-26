/**
 * Database schema and operations for user management
 * Cloud-ready with multi-tenancy support
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class UserDatabase {
  constructor(dbPath = './myDB/') {
    this.dbPath = dbPath;
    this.usersDbPath = path.join(dbPath, 'users.db');
    // Don't initialize automatically, let the service control this
  }

  /**
   * Initialize users database with cloud-ready schema
   */
  async initializeDatabase() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.usersDbPath, (err) => {
        if (err) {
          console.error('Error opening users database:', err.message);
          reject(err);
          return;
        }
        console.log('✅ Connected to users database');
      });

      db.serialize(() => {
        // First, ensure the basic users table exists
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            level TEXT DEFAULT 'beginner' CHECK(level IN ('beginner', 'intermediate', 'expert')),
            role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin', 'test')),
            assigned_country TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login_at DATETIME,
            is_active BOOLEAN DEFAULT 1,
            tenant_id TEXT DEFAULT 'default',
            metadata TEXT DEFAULT '{}',
            UNIQUE(email, tenant_id)
          )
        `, (err) => {
          if (err) {
            console.error('Error creating users table:', err.message);
            reject(err);
            return;
          } else {
            console.log('✅ Users table ready');
          }
        });

        // Create user_sessions table for token management
        db.run(`
          CREATE TABLE IF NOT EXISTS user_sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            token_hash TEXT NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT 1,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) {
            console.error('Error creating user_sessions table:', err.message);
            reject(err);
            return;
          } else {
            console.log('✅ User sessions table ready');
          }
        });

        // Create user_countries table for country access control
        db.run(`
          CREATE TABLE IF NOT EXISTS user_countries (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            country_code TEXT NOT NULL,
            access_level TEXT DEFAULT 'full' CHECK(access_level IN ('full', 'readonly')),
            assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            assigned_by TEXT,
            is_active BOOLEAN DEFAULT 1,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, country_code)
          )
        `, (err) => {
          if (err) {
            console.error('Error creating user_countries table:', err.message);
            reject(err);
            return;
          } else {
            console.log('✅ User countries table ready');
          }
        });

        // Create game_sessions table for multiplayer support
        db.run(`
          CREATE TABLE IF NOT EXISTS game_sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            country_code TEXT NOT NULL,
            is_multiplayer BOOLEAN DEFAULT 0,
            participants TEXT DEFAULT '[]',
            game_settings TEXT DEFAULT '{}',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT 1,
            tenant_id TEXT DEFAULT 'default',
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) {
            console.error('Error creating game_sessions table:', err.message);
            reject(err);
            return;
          } else {
            console.log('✅ Game sessions table ready');
          }
        });

        // Create indexes for performance
        db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_users_country ON users(assigned_country)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_active ON user_sessions(is_active, expires_at)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_user_countries_user ON user_countries(user_id)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_user_countries_country ON user_countries(country_code)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_user_countries_active ON user_countries(is_active)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_game_sessions_user ON game_sessions(user_id)`, (err) => {
          if (err) {
            console.error('Error creating indexes:', err.message);
            reject(err);
            return;
          }
          
          console.log('✅ Database indexes created');
          
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err.message);
              reject(err);
              return;
            } else {
              console.log('✅ Users database initialized successfully');
              resolve();
            }
          });
        });
      });
    });
  }

  /**
   * Get database connection
   */
  getConnection() {
    return new sqlite3.Database(this.usersDbPath, (err) => {
      if (err) {
        console.error('Error connecting to users database:', err.message);
      }
    });
  }

  /**
   * Test database connection and schema
   */
  async testConnection() {
    return new Promise((resolve, reject) => {
      // Use a fresh connection for testing
      const db = new sqlite3.Database(this.usersDbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
          reject(new Error('Cannot connect to users database: ' + err.message));
          return;
        }
      });
      
      db.serialize(() => {
        // Test users table
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
          if (err) {
            db.close();
            reject(err);
            return;
          }
          
          if (!row) {
            db.close();
            reject(new Error('Users table not found'));
            return;
          }

          // Test basic query
          db.get("SELECT COUNT(*) as count FROM users", (err, result) => {
            db.close();
            
            if (err) {
              reject(err);
              return;
            }

            console.log('✅ Database connection test passed');
            console.log(`📊 Current user count: ${result.count}`);
            resolve(result);
          });
        });
      });
    });
  }
}

module.exports = UserDatabase;
