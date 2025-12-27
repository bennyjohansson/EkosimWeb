#!/bin/bash

# Simple test script for authentication API
# Run this after starting the server with: node server.js

echo "🧪 Testing Authentication API..."
echo ""

# Test basic server connectivity
echo "📡 Testing server connectivity..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/)
if [ "$response" = "200" ]; then
    echo "✅ Server is running and responsive"
else
    echo "❌ Server not responding (HTTP $response)"
    exit 1
fi
echo ""

# Test user registration
echo "👤 Testing user registration..."
registration_response=$(curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser_' $(date +%s) '",
    "email": "test' $(date +%s) '@example.com", 
    "password": "testpass123",
    "level": "beginner"
  }')

if echo "$registration_response" | grep -q "success.*true"; then
    echo "✅ User registration successful"
    # Extract token from response (basic extraction)
    token=$(echo "$registration_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "📄 Token received: ${token:0:20}..."
else
    echo "❌ User registration failed"
    echo "Response: $registration_response"
fi
echo ""

# Test login with existing user
echo "🔐 Testing user login..."
login_response=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }')

if echo "$login_response" | grep -q "success.*true"; then
    echo "✅ User login successful"
    login_token=$(echo "$login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "📄 Login token: ${login_token:0:20}..."
elif echo "$login_response" | grep -q "User not found"; then
    echo "ℹ️  User not found (expected for first run)"
else
    echo "❌ Login failed"
    echo "Response: $login_response"
fi
echo ""

# Test token verification
if [ ! -z "$token" ]; then
    echo "🎫 Testing token verification..."
    verify_response=$(curl -s -X POST http://localhost:8080/api/auth/verify \
      -H "Content-Type: application/json" \
      -d "{\"token\": \"$token\"}")
    
    if echo "$verify_response" | grep -q "success.*true"; then
        echo "✅ Token verification successful"
    else
        echo "❌ Token verification failed"
        echo "Response: $verify_response"
    fi
    echo ""
fi

# Test protected route
if [ ! -z "$token" ]; then
    echo "🔒 Testing protected route..."
    profile_response=$(curl -s -X GET http://localhost:8080/api/auth/profile \
      -H "Authorization: Bearer $token")
    
    if echo "$profile_response" | grep -q "success.*true"; then
        echo "✅ Protected route access successful"
    else
        echo "❌ Protected route access failed"
        echo "Response: $profile_response"
    fi
    echo ""
fi

# Test unauthorized access
echo "🚫 Testing unauthorized access..."
unauth_response=$(curl -s -o /dev/null -w "%{http_code}" -X GET http://localhost:8080/api/auth/profile)
if [ "$unauth_response" = "401" ]; then
    echo "✅ Correctly rejected unauthorized access"
else
    echo "❌ Unexpected response for unauthorized access: $unauth_response"
fi
echo ""

echo "🎉 Authentication API testing completed!"
echo "🚀 Ready for frontend integration"
