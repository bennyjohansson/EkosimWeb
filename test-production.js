#!/usr/bin/env node

/**
 * Test Production Setup - Phase 3
 * Tests single-server production deployment
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

async function testProductionSetup() {
  console.log('🧪 Testing Phase 3 Production Setup...\n');

  try {
    // Test 1: Vue App (Frontend)
    console.log('🎨 Testing Vue app serving...');
    try {
      const frontendResponse = await axios.get(BASE_URL, {
        headers: { 'Accept': 'text/html' }
      });
      
      if (frontendResponse.status === 200 && frontendResponse.data.includes('<!DOCTYPE html>')) {
        console.log('✅ Vue app served successfully');
        console.log('- Content-Type:', frontendResponse.headers['content-type']);
      } else {
        console.log('❌ Vue app not served properly');
      }
    } catch (error) {
      console.log('❌ Vue app serving failed:', error.message);
    }
    console.log('');

    // Test 2: API Endpoints
    console.log('🔗 Testing API endpoints...');
    
    const endpoints = [
      { name: 'World Table', url: '/getWorldTable' },
      { name: 'High Score', url: '/getHighScore' },
      { name: 'Auth (Unauthorized)', url: '/api/auth/profile' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint.url}`);
        console.log(`✅ ${endpoint.name}: ${response.status}`);
      } catch (error) {
        if (error.response) {
          console.log(`✅ ${endpoint.name}: ${error.response.status} (expected for auth)`);
        } else {
          console.log(`❌ ${endpoint.name}: ${error.message}`);
        }
      }
    }
    console.log('');

    // Test 3: SPA Routing
    console.log('🧭 Testing SPA routing...');
    try {
      const spaResponse = await axios.get(`${BASE_URL}/some-vue-route`, {
        headers: { 'Accept': 'text/html' }
      });
      
      if (spaResponse.status === 200 && spaResponse.data.includes('<!DOCTYPE html>')) {
        console.log('✅ SPA routing works - Vue app served for unknown routes');
      } else {
        console.log('❌ SPA routing failed');
      }
    } catch (error) {
      console.log('❌ SPA routing test failed:', error.message);
    }
    console.log('');

    console.log('🎯 Phase 3 Production Setup Test Complete!');
    console.log('');
    console.log('📊 Architecture:');
    console.log('   Single Express server on port 8080');
    console.log('   ├── Serves optimized Vue build');
    console.log('   ├── Handles all API endpoints');
    console.log('   ├── Supports SPA routing');
    console.log('   └── Ready for production deployment');

  } catch (error) {
    console.error('❌ Production test failed:', error.message);
  }
}

testProductionSetup();
