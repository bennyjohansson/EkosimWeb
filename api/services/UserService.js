/**
 * User management service with authentication logic
 * Cloud-ready with JWT and multi-provider support
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const UserDatabase = require('../database/UserDatabase');
const PostgreSQLUserDatabase = require('../database/PostgreSQLUserDatabase');
const databaseConfig = require('../config/database');

class UserService {
  constructor(authConfig) {
    this.authConfig = authConfig;
    
    // Initialize database adapter based on configuration
    if (databaseConfig.type === 'postgresql') {
      console.log('🐘 Using PostgreSQL database');
      this.userDb = new PostgreSQLUserDatabase(databaseConfig.postgresql);
    } else {
      console.log('🗃️ Using SQLite database');
      this.userDb = new UserDatabase(authConfig.database.path);
    }
    
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
    const { 
      username, 
      email, 
      password, 
      level = 'beginner', 
      role = 'user',
      assignedCountry = null,
      tenantId = 'default' 
    } = userData;

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

    // Validate role
    const validRoles = ['user', 'admin', 'test'];
    if (!validRoles.includes(role)) {
      throw new Error('Invalid role. Must be one of: ' + validRoles.join(', '));
    }

    // Hash password
    const passwordHash = bcrypt.hashSync(password, this.authConfig.providers.local.bcryptRounds);
    const userId = uuidv4();

    // Auto-assign default country if none specified
    const defaultCountry = assignedCountry || 'Bennyland';

    // Use PostgreSQL adapter if available, otherwise fall back to SQLite
    if (databaseConfig.type === 'postgresql') {
      return await this.userDb.createUser({
        id: userId,
        username,
        email,
        passwordHash,
        level,
        role,
        assignedCountry: defaultCountry,
        tenantId
      });
    } else {
      // Keep existing SQLite implementation for backward compatibility
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

              // Create user with role and assigned country
              db.run(
                `INSERT INTO users (id, username, email, password_hash, level, role, assigned_country, tenant_id, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
                [userId, username, email, passwordHash, level, role, defaultCountry, tenantId],
                function(err) {
                  if (err) {
                    db.close();
                    reject(new Error('Failed to create user: ' + err.message));
                    return;
                  }

                  // Get the created user with new fields
                  db.get(
                    `SELECT id, username, email, level, role, assigned_country, created_at FROM users WHERE id = ?`,
                    [userId],
                    (err, user) => {
                      if (err || !user) {
                        db.close();
                        reject(new Error('Failed to retrieve created user'));
                        return;
                      }

                      // If country was assigned, also create user_countries entry
                      if (defaultCountry) {
                        const countryEntryId = uuidv4();
                        db.run(
                          `INSERT INTO user_countries (id, user_id, country_code, assigned_at) VALUES (?, ?, ?, datetime('now'))`,
                          [countryEntryId, userId, defaultCountry],
                          (err) => {
                            db.close();
                            
                            if (err) {
                              console.warn('Failed to create country assignment:', err.message);
                            }

                            console.log(`✅ User registered: ${email} ${assignedCountry ? `(assigned to ${assignedCountry})` : ''}`);
                            resolve({
                              id: user.id,
                              username: user.username,
                              email: user.email,
                              level: user.level,
                              role: user.role,
                              assignedCountry: user.assigned_country,
                              createdAt: user.created_at
                            });
                          }
                        );
                      } else {
                        db.close();
                        
                        console.log(`✅ User registered: ${email} (no country assigned)`);
                        resolve({
                          id: user.id,
                          username: user.username,
                          email: user.email,
                          level: user.level,
                          role: user.role,
                          assignedCountry: user.assigned_country,
                          createdAt: user.created_at
                        });
                      }
                    }
                  );
                }
              );
            }
          );
        });
      });
    }
  }

  /**
   * Authenticate user with email and password
   */
  async authenticateUser(email, password, tenantId = 'default') {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (databaseConfig.type === 'postgresql') {
      // PostgreSQL implementation
      const user = await this.userDb.getUserByEmail(email, tenantId);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      if (!bcrypt.compareSync(password, user.password_hash)) {
        throw new Error('Invalid email or password');
      }

      // Update last login time
      try {
        await this.userDb.updateLastLogin(user.id);
      } catch (err) {
        console.warn('Failed to update last login time:', err.message);
      }

      console.log(`✅ User authenticated: ${email}`);
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        role: user.role,
        assignedCountry: user.assigned_country,
        createdAt: user.created_at,
        lastLoginAt: new Date().toISOString()
      };
      
    } else {
      // SQLite implementation (backward compatibility)
      return new Promise((resolve, reject) => {
        const db = this.userDb.getConnection();

        db.get(
          `SELECT id, username, email, password_hash, level, role, assigned_country, created_at, last_login_at 
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
                  role: user.role,
                  assignedCountry: user.assigned_country,
                  createdAt: user.created_at,
                  lastLoginAt: new Date().toISOString()
                });
              }
            );
          }
        );
      });
    }
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
    if (databaseConfig.type === 'postgresql') {
      // PostgreSQL implementation
      return await this.userDb.getUserById(userId, tenantId);
    } else {
      // SQLite implementation (backward compatibility)
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
   * Get countries accessible by a user
   */
  async getUserCountries(userId) {
    if (databaseConfig.type === 'postgresql') {
      // PostgreSQL implementation
      return await this.userDb.getUserCountries(userId);
    } else {
      // SQLite implementation (backward compatibility)
      return new Promise((resolve, reject) => {
        const db = this.userDb.getConnection();

        // First check if user is admin/test (can access all countries)
        db.get(
          `SELECT role, assigned_country FROM users WHERE id = ? AND is_active = 1`,
          [userId],
          (err, user) => {
            if (err) {
              db.close();
              reject(new Error('Database error getting user role'));
              return;
            }

            if (!user) {
              db.close();
              reject(new Error('User not found'));
              return;
            }

            // Admin and test users can access all countries
            if (user.role === 'admin' || user.role === 'test') {
              db.close();
              resolve({
                canAccessAllCountries: true,
                countries: [],
                role: user.role
              });
              return;
            }

            // Regular users: get their assigned countries
            db.all(
              `SELECT country_code, access_level FROM user_countries 
               WHERE user_id = ? AND is_active = 1`,
              [userId],
              (err, countries) => {
                db.close();

                if (err) {
                  reject(new Error('Database error getting user countries'));
                  return;
                }

                // If no countries in user_countries table, fall back to assigned_country
                if (countries.length === 0 && user.assigned_country) {
                  resolve({
                    canAccessAllCountries: false,
                    countries: [{ country_code: user.assigned_country, access_level: 'full' }],
                    role: user.role
                  });
                } else {
                  resolve({
                    canAccessAllCountries: false,
                    countries: countries.map(c => ({
                      country_code: c.country_code,
                      access_level: c.access_level
                    })),
                    role: user.role
                  });
                }
              }
            );
          }
        );
      });
    }
  }

  /**
   * Check if user has access to a specific country
   */
  async checkUserCountryAccess(userId, countryCode) {
    try {
      const userCountries = await this.getUserCountries(userId);
      
      // Admin/test users can access any country
      if (userCountries.canAccessAllCountries) {
        return { hasAccess: true, accessLevel: 'full', reason: 'admin_access' };
      }

      // Check if country is in user's allowed list
      const countryAccess = userCountries.countries.find(
        c => c.country_code === countryCode
      );

      if (countryAccess) {
        return { 
          hasAccess: true, 
          accessLevel: countryAccess.access_level, 
          reason: 'assigned_access' 
        };
      }

      return { hasAccess: false, accessLevel: null, reason: 'not_assigned' };
    } catch (error) {
      throw new Error('Failed to check country access: ' + error.message);
    }
  }

  /**
   * Assign country to user (admin only)
   */
  async assignCountryToUser(userId, countryCode, assignedBy, accessLevel = 'full') {
    if (databaseConfig.type === 'postgresql') {
      // PostgreSQL implementation
      return await this.userDb.assignCountryToUser(userId, countryCode, assignedBy, accessLevel);
    } else {
      // SQLite implementation (backward compatibility)
      return new Promise((resolve, reject) => {
        const db = this.userDb.getConnection();
        const assignmentId = uuidv4();

        db.run(
          `INSERT OR REPLACE INTO user_countries (id, user_id, country_code, access_level, assigned_by, assigned_at)
           VALUES (?, ?, ?, ?, ?, datetime('now'))`,
          [assignmentId, userId, countryCode, accessLevel, assignedBy],
          function(err) {
            db.close();
            
            if (err) {
              reject(new Error('Failed to assign country: ' + err.message));
              return;
            }

            console.log(`✅ Country ${countryCode} assigned to user ${userId}`);
            resolve({
              id: assignmentId,
              userId,
              countryCode,
              accessLevel,
              assignedBy
            });
          }
        );
      });
    }
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
