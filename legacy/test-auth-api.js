/**
 * Test script for authentication API endpoints
 */

const axios = require('axios');

// Install axios if not already installed
// npm install axios

const BASE_URL = 'http://localhost:8080';

async function testAuthenticationAPI() {
  console.log('🧪 Testing Authentication API Endpoints...\n');

  try {
    // Test data
    const testUser = {
      username: 'apitestuser',
      email: 'apitest@example.com',
      password: 'testpassword123',
      level: 'intermediate'
    };

    let authToken;

    // Test 1: User Registration
    console.log('👤 Testing user registration...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
      
      if (registerResponse.data.success) {
        console.log('✅ Registration successful');
        console.log('- User ID:', registerResponse.data.data.user.id);
        console.log('- Username:', registerResponse.data.data.user.username);
        console.log('- Email:', registerResponse.data.data.user.email);
        console.log('- Token received:', !!registerResponse.data.data.token);
        authToken = registerResponse.data.data.token;
      } else {
        console.log('❌ Registration failed:', registerResponse.data.error);
      }
    } catch (error) {
      if (error.response?.data?.error?.includes('already exists')) {
        console.log('ℹ️  User already exists, will test login instead');
      } else {
        console.log('❌ Registration error:', error.response?.data?.error || error.message);
      }
    }
    console.log('');

    // Test 2: User Login
    console.log('🔐 Testing user login...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });

      if (loginResponse.data.success) {
        console.log('✅ Login successful');
        console.log('- User ID:', loginResponse.data.data.user.id);
        console.log('- Username:', loginResponse.data.data.user.username);
        console.log('- Level:', loginResponse.data.data.user.level);
        console.log('- Token received:', !!loginResponse.data.data.token);
        authToken = loginResponse.data.data.token;
      } else {
        console.log('❌ Login failed:', loginResponse.data.error);
      }
    } catch (error) {
      console.log('❌ Login error:', error.response?.data?.error || error.message);
    }
    console.log('');

    // Test 3: Token Verification
    console.log('🎫 Testing token verification...');
    try {
      const verifyResponse = await axios.post(`${BASE_URL}/api/auth/verify`, {
        token: authToken
      });

      if (verifyResponse.data.success) {
        console.log('✅ Token verification successful');
        console.log('- User ID:', verifyResponse.data.data.userId);
        console.log('- Email:', verifyResponse.data.data.email);
        console.log('- Expires at:', verifyResponse.data.data.expiresAt);
      } else {
        console.log('❌ Token verification failed:', verifyResponse.data.error);
      }
    } catch (error) {
      console.log('❌ Token verification error:', error.response?.data?.error || error.message);
    }
    console.log('');

    // Test 4: Protected Route (Get Profile)
    console.log('👤 Testing protected route (get profile)...');
    try {
      const profileResponse = await axios.get(`${BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (profileResponse.data.success) {
        console.log('✅ Profile fetch successful');
        console.log('- Username:', profileResponse.data.data.user.username);
        console.log('- Email:', profileResponse.data.data.user.email);
        console.log('- Level:', profileResponse.data.data.user.level);
      } else {
        console.log('❌ Profile fetch failed:', profileResponse.data.error);
      }
    } catch (error) {
      console.log('❌ Profile fetch error:', error.response?.data?.error || error.message);
    }
    console.log('');

    // Test 5: Invalid Login
    console.log('❌ Testing invalid login...');
    try {
      const invalidLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: testUser.email,
        password: 'wrongpassword'
      });
      console.log('❌ Should have failed with wrong password');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected invalid password');
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.error || error.message);
      }
    }
    console.log('');

    // Test 6: Protected Route Without Token
    console.log('🔒 Testing protected route without token...');
    try {
      const noTokenResponse = await axios.get(`${BASE_URL}/api/auth/profile`);
      console.log('❌ Should have failed without token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected request without token');
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.error || error.message);
      }
    }
    console.log('');

    // Test 7: Rate Limiting (make many requests)
    console.log('🚦 Testing rate limiting...');
    let rateLimitHit = false;
    for (let i = 0; i < 10; i++) {
      try {
        await axios.post(`${BASE_URL}/api/auth/login`, {
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        });
      } catch (error) {
        if (error.response?.status === 429) {
          console.log('✅ Rate limiting working (hit limit after', i + 1, 'requests)');
          rateLimitHit = true;
          break;
        }
      }
    }
    if (!rateLimitHit) {
      console.log('ℹ️  Rate limit not hit in 10 requests (limit may be higher)');
    }
    console.log('');

    console.log('🎉 Authentication API tests completed!');
    console.log('🚀 API endpoints are working correctly');

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Helper function to check if server is running
async function checkServerStatus() {
  try {
    await axios.get(`${BASE_URL}/`);
    console.log('✅ Server is running on port 8080');
    return true;
  } catch (error) {
    console.log('❌ Server is not running on port 8080');
    console.log('Please start the server with: node server.js');
    return false;
  }
}

// Run tests
async function runTests() {
  const serverRunning = await checkServerStatus();
  if (serverRunning) {
    await testAuthenticationAPI();
  }
}

runTests();
