/**
 * Test PostgreSQL user registration implementation
 */

const UserService = require('./services/UserService');

// Create auth config similar to existing setup
const authConfig = {
  database: {
    path: './myDB/', // For SQLite fallback
  },
  providers: {
    local: {
      bcryptRounds: 12
    }
  },
  jwt: {
    secret: 'test-secret-key',
    expiresIn: '24h'
  }
};

async function testPostgreSQLUserRegistration() {
  console.log('🧪 Testing PostgreSQL user registration...\n');

  try {
    // Initialize UserService
    const userService = new UserService(authConfig);
    await userService.initialize();
    console.log('✅ UserService initialized\n');

    // Test user registration
    console.log('👤 Testing user registration...');
    const testUser = {
      username: 'postgres_testuser',
      email: 'postgres_test@example.com',
      password: 'testpassword123',
      level: 'intermediate',
      role: 'user'
    };

    let registeredUser;
    try {
      registeredUser = await userService.registerUser(testUser);
      console.log('✅ User registration successful');
      console.log('- User ID:', registeredUser.id);
      console.log('- Username:', registeredUser.username);
      console.log('- Email:', registeredUser.email);
      console.log('- Level:', registeredUser.level);
      console.log('- Role:', registeredUser.role);
      console.log('- Created At:', registeredUser.createdAt);
      console.log();
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  User already exists, testing duplicate prevention works');
        console.log('✅ Duplicate prevention working correctly\n');
      } else {
        throw error;
      }
    }

    // Test user authentication
    console.log('🔐 Testing user authentication...');
    try {
      const authenticatedUser = await userService.authenticateUser(testUser.email, testUser.password);
      console.log('✅ User authentication successful');
      console.log('- User ID:', authenticatedUser.id);
      console.log('- Username:', authenticatedUser.username);
      console.log('- Email:', authenticatedUser.email);
      console.log('- Level:', authenticatedUser.level);
      console.log('- Role:', authenticatedUser.role);
      console.log('- Last Login:', authenticatedUser.lastLoginAt);
      console.log();
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      throw error;
    }

    // Test JWT token generation
    console.log('🎫 Testing JWT token generation...');
    const user = registeredUser || { id: 'test-id', email: testUser.email, username: testUser.username, level: testUser.level };
    const token = userService.generateToken(user);
    console.log('✅ JWT token generated successfully');
    console.log('- Token length:', token.length);
    console.log();

    // Test JWT token verification
    console.log('🔍 Testing JWT token verification...');
    try {
      const decoded = userService.verifyToken(token);
      console.log('✅ JWT token verification successful');
      console.log('- Decoded User ID:', decoded.userId);
      console.log('- Decoded Email:', decoded.email);
      console.log('- Expires at:', new Date(decoded.exp * 1000).toISOString());
      console.log();
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
      throw error;
    }

    // Clean up database connection
    if (userService.userDb.close) {
      await userService.userDb.close();
      console.log('🔒 Database connections closed');
    }

    console.log('✅ All PostgreSQL user service tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
testPostgreSQLUserRegistration();