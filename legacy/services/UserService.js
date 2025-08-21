/**
 * User management service with authentication logic
 * Cloud-ready with JWT and multi-provider support
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const UserDatabase = require('../database/UserDatabase');

class UserService {
  constructor(authConfig) {
    this.authConfig = authConfig;
    this.userDb = new UserDatabase(authConfig.database.path);
    this.initialized = false;
  }

  /**
   * Initialize the service (ensure database is ready)
   */
  async initialize() {
    if (!this.initialized) {
      await this.userDb.initializeDatabase();
      this.initialized = true;
    }
  }

  /**
   * Register a new user
   */
  async registerUser(userData) {
    const { username, email, password, level = 'beginner', tenantId = 'default' } = userData;

    // Validate input
    if (!username || !email || !password) {
      throw new Error('Username, email, and password are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    return new Promise((resolve, reject) => {
      const db = this.userDb.getConnection();

      db.serialize(() => {
        // Check if user already exists
        db.get(
          `SELECT id FROM users WHERE email = ? AND tenant_id = ?`,
          [email, tenantId],
          (err, existingUser) => {
            if (err) {
              db.close();
              reject(new Error('Database error during user check'));
              return;
            }

            if (existingUser) {
              db.close();
              reject(new Error('User with this email already exists'));
              return;
            }

            // Hash password
            const passwordHash = bcrypt.hashSync(password, this.authConfig.providers.local.bcryptRounds);
            const userId = uuidv4();

            // Create user
            db.run(
              `INSERT INTO users (id, username, email, password_hash, level, tenant_id, created_at)
               VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
              [userId, username, email, passwordHash, level, tenantId],
              function(err) {
                if (err) {
                  db.close();
                  reject(new Error('Failed to create user: ' + err.message));
                  return;
                }

                // Get the created user
                db.get(
                  `SELECT id, username, email, level, created_at FROM users WHERE id = ?`,
                  [userId],
                  (err, user) => {
                    db.close();
                    
                    if (err || !user) {
                      reject(new Error('Failed to retrieve created user'));
                      return;
                    }

                    console.log(`✅ User registered: ${email}`);
                    resolve({
                      id: user.id,
                      username: user.username,
                      email: user.email,
                      level: user.level,
                      createdAt: user.created_at
                    });
                  }
                );
              }
            );
          }
        );
      });
    });
  }

  /**
   * Authenticate user with email and password
   */
  async authenticateUser(email, password, tenantId = 'default') {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    return new Promise((resolve, reject) => {
      const db = this.userDb.getConnection();

      db.get(
        `SELECT id, username, email, password_hash, level, created_at, last_login_at 
         FROM users 
         WHERE email = ? AND tenant_id = ? AND is_active = 1`,
        [email, tenantId],
        (err, user) => {
          if (err) {
            db.close();
            reject(new Error('Database error during authentication'));
            return;
          }

          if (!user) {
            db.close();
            reject(new Error('Invalid email or password'));
            return;
          }

          // Verify password
          if (!bcrypt.compareSync(password, user.password_hash)) {
            db.close();
            reject(new Error('Invalid email or password'));
            return;
          }

          // Update last login time
          db.run(
            `UPDATE users SET last_login_at = datetime('now') WHERE id = ?`,
            [user.id],
            (err) => {
              db.close();
              
              if (err) {
                console.warn('Failed to update last login time:', err.message);
              }

              console.log(`✅ User authenticated: ${email}`);
              resolve({
                id: user.id,
                username: user.username,
                email: user.email,
                level: user.level,
                createdAt: user.created_at,
                lastLoginAt: new Date().toISOString()
              });
            }
          );
        }
      );
    });
  }

  /**
   * Generate JWT token for user
   */
  generateToken(user, tenantId = 'default') {
    const payload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      level: user.level,
      tenantId: tenantId
    };

    return jwt.sign(payload, this.authConfig.jwt.secret, {
      expiresIn: this.authConfig.jwt.expiresIn
    });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.authConfig.jwt.secret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId, tenantId = 'default') {
    return new Promise((resolve, reject) => {
      const db = this.userDb.getConnection();

      db.get(
        `SELECT id, username, email, level, created_at, last_login_at 
         FROM users 
         WHERE id = ? AND tenant_id = ? AND is_active = 1`,
        [userId, tenantId],
        (err, user) => {
          db.close();
          
          if (err) {
            reject(new Error('Database error'));
            return;
          }

          if (!user) {
            reject(new Error('User not found'));
            return;
          }

          resolve({
            id: user.id,
            username: user.username,
            email: user.email,
            level: user.level,
            createdAt: user.created_at,
            lastLoginAt: user.last_login_at
          });
        }
      );
    });
  }

  /**
   * Update user profile
   */
  async updateUser(userId, updates, tenantId = 'default') {
    const allowedUpdates = ['username', 'level'];
    const updateFields = [];
    const updateValues = [];

    // Filter allowed updates
    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key)) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No valid updates provided');
    }

    updateValues.push(userId);
    updateValues.push(tenantId);

    return new Promise((resolve, reject) => {
      const db = this.userDb.getConnection();

      db.run(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ? AND tenant_id = ?`,
        updateValues,
        function(err) {
          if (err) {
            db.close();
            reject(new Error('Failed to update user'));
            return;
          }

          if (this.changes === 0) {
            db.close();
            reject(new Error('User not found'));
            return;
          }

          // Get updated user
          db.get(
            `SELECT id, username, email, level, created_at, last_login_at 
             FROM users WHERE id = ? AND tenant_id = ?`,
            [userId, tenantId],
            (err, user) => {
              db.close();
              
              if (err || !user) {
                reject(new Error('Failed to retrieve updated user'));
                return;
              }

              resolve(user);
            }
          );
        }
      );
    });
  }

  /**
   * Test service functionality
   */
  async testService() {
    try {
      console.log('🧪 Testing UserService...');
      
      // Ensure initialization
      await this.initialize();
      
      // Test database connection
      await this.userDb.testConnection();
      
      console.log('✅ UserService test passed');
      return true;
    } catch (error) {
      console.error('❌ UserService test failed:', error.message);
      throw error;
    }
  }
}

module.exports = UserService;
