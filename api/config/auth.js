/**
 * Cloud-ready authentication configuration (JavaScript version)
 * Supports multiple deployment environments and OAuth providers
 */

const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  providers: {
    local: {
      enabled: true,
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10')
    },
    google: {
      enabled: process.env.AUTH_PROVIDERS?.includes('google') || false,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback'
    }
  },
  security: {
    sessionSecret: process.env.SESSION_SECRET || 'fallback-session-secret',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
    }
  },
  database: {
    path: process.env.DATABASE_PATH || './myDB/',
    multiTenant: process.env.TENANT_ISOLATION !== 'single',
    defaultTenantId: process.env.DEFAULT_TENANT_ID || 'default'
  }
};

// Redis configuration for cloud sessions (optional)
if (process.env.REDIS_URL) {
  authConfig.redis = {
    url: process.env.REDIS_URL
  };
}

// Validate required configuration
function validateAuthConfig() {
  if (!authConfig.jwt.secret || authConfig.jwt.secret === 'fallback-secret-change-me') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    console.warn('⚠️  Using fallback JWT secret - not secure for production!');
  }

  if (authConfig.providers.google.enabled) {
    if (!authConfig.providers.google.clientId || !authConfig.providers.google.clientSecret) {
      throw new Error('Google OAuth requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
    }
  }

  console.log('✅ Auth configuration validated');
  console.log(`🔐 Enabled providers: ${Object.entries(authConfig.providers)
    .filter(([_, config]) => config.enabled)
    .map(([name]) => name)
    .join(', ')}`);
}

module.exports = {
  authConfig,
  validateAuthConfig
};
