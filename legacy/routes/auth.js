/**
 * Authentication routes for user registration and login
 * Cloud-ready with rate limiting and security middleware
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const UserService = require('../services/UserService');

class AuthRoutes {
  constructor(authConfig) {
    this.router = express.Router();
    this.userService = new UserService(authConfig);
    this.authConfig = authConfig;
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Setup security middleware
   */
  setupMiddleware() {
    // Rate limiting for auth endpoints
    const authLimiter = rateLimit({
      windowMs: this.authConfig.security.rateLimit.windowMs, // 15 minutes
      max: this.authConfig.security.rateLimit.maxRequests, // limit each IP to X requests per windowMs
      message: {
        success: false,
        error: 'Too many authentication attempts, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Apply rate limiting to all auth routes
    this.router.use(authLimiter);

    // JSON parsing middleware
    this.router.use(express.json({ limit: '10mb' }));

    // Initialize user service
    this.router.use(async (req, res, next) => {
      try {
        await this.userService.initialize();
        next();
      } catch (error) {
        console.error('Failed to initialize user service:', error.message);
        res.status(500).json({
          success: false,
          error: 'Authentication service unavailable'
        });
      }
    });
  }

  /**
   * Setup authentication routes
   */
  setupRoutes() {
    // POST /api/auth/register - Register new user
    this.router.post('/register', async (req, res) => {
      try {
        const { username, email, password, level } = req.body;

        // Validate required fields
        if (!username || !email || !password) {
          return res.status(400).json({
            success: false,
            error: 'Username, email, and password are required'
          });
        }

        // Get tenant ID (for multi-tenancy support)
        const tenantId = req.headers['x-tenant-id'] || this.authConfig.database.defaultTenantId;

        // Register user
        const user = await this.userService.registerUser({
          username,
          email,
          password,
          level: level || 'beginner',
          tenantId
        });

        // Generate JWT token
        const token = this.userService.generateToken(user, tenantId);

        res.status(201).json({
          success: true,
          message: 'User registered successfully',
          data: {
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              level: user.level,
              createdAt: user.createdAt
            },
            token
          }
        });

        console.log(`✅ User registered via API: ${email}`);

      } catch (error) {
        console.error('Registration error:', error.message);
        
        // Handle specific error types
        if (error.message.includes('already exists')) {
          return res.status(409).json({
            success: false,
            error: 'User with this email already exists'
          });
        }

        if (error.message.includes('Invalid email') || error.message.includes('Password must be')) {
          return res.status(400).json({
            success: false,
            error: error.message
          });
        }

        res.status(500).json({
          success: false,
          error: 'Registration failed. Please try again.'
        });
      }
    });

    // POST /api/auth/login - Authenticate user
    this.router.post('/login', async (req, res) => {
      try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
          return res.status(400).json({
            success: false,
            error: 'Email and password are required'
          });
        }

        // Get tenant ID (for multi-tenancy support)
        const tenantId = req.headers['x-tenant-id'] || this.authConfig.database.defaultTenantId;

        // Authenticate user
        const user = await this.userService.authenticateUser(email, password, tenantId);

        // Generate JWT token
        const token = this.userService.generateToken(user, tenantId);

        res.json({
          success: true,
          message: 'Login successful',
          data: {
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              level: user.level,
              createdAt: user.createdAt,
              lastLoginAt: user.lastLoginAt
            },
            token
          }
        });

        console.log(`✅ User logged in via API: ${email}`);

      } catch (error) {
        console.error('Login error:', error.message);
        
        // Don't reveal specific error details for security
        res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }
    });

    // GET /api/auth/profile - Get current user profile (protected route)
    this.router.get('/profile', this.authenticateToken.bind(this), async (req, res) => {
      try {
        const userId = req.user.userId;
        const tenantId = req.user.tenantId || this.authConfig.database.defaultTenantId;

        const user = await this.userService.getUserById(userId, tenantId);

        res.json({
          success: true,
          data: {
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              level: user.level,
              createdAt: user.createdAt,
              lastLoginAt: user.lastLoginAt
            }
          }
        });

      } catch (error) {
        console.error('Profile fetch error:', error.message);
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
    });

    // PUT /api/auth/profile - Update user profile (protected route)
    this.router.put('/profile', this.authenticateToken.bind(this), async (req, res) => {
      try {
        const userId = req.user.userId;
        const tenantId = req.user.tenantId || this.authConfig.database.defaultTenantId;
        const { username, level } = req.body;

        const updates = {};
        if (username) updates.username = username;
        if (level) updates.level = level;

        if (Object.keys(updates).length === 0) {
          return res.status(400).json({
            success: false,
            error: 'No valid updates provided'
          });
        }

        const updatedUser = await this.userService.updateUser(userId, updates, tenantId);

        res.json({
          success: true,
          message: 'Profile updated successfully',
          data: {
            user: updatedUser
          }
        });

        console.log(`✅ User profile updated: ${updatedUser.email}`);

      } catch (error) {
        console.error('Profile update error:', error.message);
        res.status(500).json({
          success: false,
          error: 'Failed to update profile'
        });
      }
    });

    // POST /api/auth/verify - Verify JWT token
    this.router.post('/verify', async (req, res) => {
      try {
        const { token } = req.body;

        if (!token) {
          return res.status(400).json({
            success: false,
            error: 'Token is required'
          });
        }

        const decoded = this.userService.verifyToken(token);

        res.json({
          success: true,
          message: 'Token is valid',
          data: {
            userId: decoded.userId,
            email: decoded.email,
            username: decoded.username,
            level: decoded.level,
            expiresAt: new Date(decoded.exp * 1000).toISOString()
          }
        });

      } catch (error) {
        res.status(401).json({
          success: false,
          error: 'Invalid or expired token'
        });
      }
    });
  }

  /**
   * JWT authentication middleware
   */
  authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    try {
      const decoded = this.userService.verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
  }

  /**
   * Get the configured router
   */
  getRouter() {
    return this.router;
  }
}

module.exports = AuthRoutes;
