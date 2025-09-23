/**
 * Authentication and authorization middleware
 * Protects country-specific endpoints with user-based access control
 */

const jwt = require('jsonwebtoken');
const UserService = require('../services/UserService');

class AuthMiddleware {
  constructor(authConfig) {
    this.authConfig = authConfig;
    this.userService = new UserService(authConfig);
  }

  /**
   * Verify JWT token and attach user to request
   */
  verifyToken() {
    return async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
          return res.status(401).json({
            success: false,
            error: 'No authorization token provided'
          });
        }

        const token = authHeader.startsWith('Bearer ') 
          ? authHeader.slice(7) 
          : authHeader;

        const decoded = jwt.verify(token, this.authConfig.jwt.secret);
        
        // Get full user details
        const user = await this.userService.getUserById(decoded.userId);
        if (!user) {
          return res.status(401).json({
            success: false,
            error: 'Invalid token: user not found'
          });
        }

        // Attach user to request
        req.user = user;
        next();
      } catch (error) {
        console.error('Token verification failed:', error.message);
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired token'
        });
      }
    };
  }

  /**
   * Check if user has access to specific country
   */
  requireCountryAccess() {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            error: 'Authentication required'
          });
        }

        const countryCode = req.params.myCountry || req.query.country;
        
        if (!countryCode) {
          return res.status(400).json({
            success: false,
            error: 'Country parameter is required'
          });
        }

        // Check user access to this country
        const access = await this.userService.checkUserCountryAccess(
          req.user.id, 
          countryCode
        );

        if (!access.hasAccess) {
          console.log(`🚫 User ${req.user.email} denied access to ${countryCode}: ${access.reason}`);
          return res.status(403).json({
            success: false,
            error: `Access denied to country: ${countryCode}`,
            reason: access.reason
          });
        }

        // Attach access info to request
        req.countryAccess = access;
        req.country = countryCode;
        
        console.log(`✅ User ${req.user.email} granted ${access.accessLevel} access to ${countryCode}`);
        next();
      } catch (error) {
        console.error('Country access check failed:', error.message);
        return res.status(500).json({
          success: false,
          error: 'Failed to verify country access'
        });
      }
    };
  }

  /**
   * Require admin role
   */
  requireAdmin() {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Admin access required'
        });
      }

      next();
    };
  }

  /**
   * Check if user has write access (not readonly)
   */
  requireWriteAccess() {
    return (req, res, next) => {
      if (!req.countryAccess) {
        return res.status(500).json({
          success: false,
          error: 'Country access not verified'
        });
      }

      if (req.countryAccess.accessLevel === 'readonly') {
        return res.status(403).json({
          success: false,
          error: 'Write access required. You have read-only access to this country.'
        });
      }

      next();
    };
  }

  /**
   * Optional authentication (for endpoints that work with/without auth)
   */
  optionalAuth() {
    return async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (authHeader) {
          const token = authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7) 
            : authHeader;

          try {
            const decoded = jwt.verify(token, this.authConfig.jwt.secret);
            const user = await this.userService.getUserById(decoded.userId);
            
            if (user) {
              req.user = user;
            }
          } catch (error) {
            // Token invalid, but continue without user
            console.log('Optional auth: invalid token, continuing without user');
          }
        }

        next();
      } catch (error) {
        console.error('Optional auth error:', error.message);
        next(); // Continue even if there's an error
      }
    };
  }
}

module.exports = AuthMiddleware;
