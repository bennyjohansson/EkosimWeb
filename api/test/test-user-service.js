/**
 * Test script for UserService functionality
 */

const UserService = require('./services/UserService');

// Load auth config
const dotenv = require('dotenv');
dotenv.config();

const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'test-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  providers: {
    local: {
      enabled: true,
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10')
    }
  },
  database: {
    path: process.env.DATABASE_PATH || './myDB/',
    multiTenant: false,
    defaultTenantId: 'default'
  }
};

async function testUserService() {
  console.log('🧪 Testing UserService functionality...\n');

  try {
    // Initialize service
    const userService = new UserService(authConfig);
    
    // Test service initialization (this will initialize the database)
    await userService.testService();
    console.log('');

    // Test user registration
    console.log('👤 Testing user registration...');
    const testUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpassword123',
      level: 'beginner'
    };

    let registeredUser;
    try {
      registeredUser = await userService.registerUser(testUser);
      console.log('✅ User registration successful');
      console.log('- User ID:', registeredUser.id);
      console.log('- Username:', registeredUser.username);
      console.log('- Email:', registeredUser.email);
      console.log('- Level:', registeredUser.level);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  User already exists, continuing with authentication test');
      } else {
        throw error;
      }
    }
    console.log('');

    // Test user authentication
    console.log('🔐 Testing user authentication...');
    const authenticatedUser = await userService.authenticateUser(testUser.email, testUser.password);
    console.log('✅ User authentication successful');
    console.log('- User ID:', authenticatedUser.id);
    console.log('- Username:', authenticatedUser.username);
    console.log('- Level:', authenticatedUser.level);
    console.log('');

    // Test JWT token generation
    console.log('🎫 Testing JWT token generation...');
    const token = userService.generateToken(authenticatedUser);
    console.log('✅ JWT token generated');
    console.log('- Token length:', token.length);
    console.log('- Token preview:', token.substring(0, 50) + '...');
    console.log('');

    // Test JWT token verification
    console.log('🔍 Testing JWT token verification...');
    const decodedToken = userService.verifyToken(token);
    console.log('✅ JWT token verified');
    console.log('- User ID from token:', decodedToken.userId);
    console.log('- Email from token:', decodedToken.email);
    console.log('- Token expires:', new Date(decodedToken.exp * 1000).toISOString());
    console.log('');

    // Test get user by ID
    console.log('👤 Testing get user by ID...');
    const retrievedUser = await userService.getUserById(authenticatedUser.id);
    console.log('✅ User retrieved by ID');
    console.log('- Username:', retrievedUser.username);
    console.log('- Email:', retrievedUser.email);
    console.log('');

    // Test invalid authentication
    console.log('❌ Testing invalid authentication...');
    try {
      await userService.authenticateUser(testUser.email, 'wrongpassword');
      console.log('❌ Should have failed with wrong password');
    } catch (error) {
      console.log('✅ Correctly rejected invalid password');
    }
    console.log('');

    // Test invalid token
    console.log('❌ Testing invalid token...');
    try {
      userService.verifyToken('invalid.token.here');
      console.log('❌ Should have failed with invalid token');
    } catch (error) {
      console.log('✅ Correctly rejected invalid token');
    }
    console.log('');

    console.log('🎉 All UserService tests passed!');
    console.log('🚀 User management system ready for authentication endpoints');

  } catch (error) {
    console.error('❌ UserService test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
testUserService();
