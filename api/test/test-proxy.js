#!/usr/bin/env node

/**
 * Test script to verify Vite proxy configuration
 * Run this after starting both legacy server and modern dev server
 */

async function testProxy() {
  console.log('🔍 Testing Vite Proxy Configuration...\n');

  const tests = [
    { name: 'Authentication API', url: 'http://localhost:3000/api/auth/profile' },
    { name: 'Economic Parameters', url: 'http://localhost:3000/ekosim/getAllParameters/Bennyland' },
    { name: 'World Table', url: 'http://localhost:3000/ekosim/worldtable/' },
    { name: 'High Score', url: 'http://localhost:3000/ekosim/getHighScore/' },
    { name: 'Economic Read', url: 'http://localhost:3000/ekosim/read/Bennyland' }
  ];

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const response = await fetch(test.url);
      const status = response.status;
      
      if (status === 200) {
        console.log(`✅ ${test.name}: Proxy working (${status})`);
      } else if (status === 401 || status === 403) {
        console.log(`🔐 ${test.name}: Proxy working, auth required (${status})`);
      } else {
        console.log(`⚠️  ${test.name}: Proxy working, unexpected status (${status})`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Proxy failed - ${error.message}`);
    }
  }

  console.log('\n🎯 Test complete! If you see ✅ or 🔐, the proxy is working correctly.');
  console.log('💡 To use: Start legacy server (port 8080) and modern dev server (port 3000)');
}

// Run if called directly
if (require.main === module) {
  testProxy().catch(console.error);
}

module.exports = { testProxy };
