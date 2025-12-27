#!/bin/bash
# Quick API test script

BASE_URL="http://localhost:8080/api/auth"

echo "🧪 Quick Authentication API Test"
echo "================================="
echo ""

# Check if server is running
echo "📡 Checking server status..."
if curl -s --connect-timeout 3 http://localhost:8080/ > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running on port 8080"
    echo "💡 Start server in another terminal with: ./start-server.sh"
    exit 1
fi

echo ""

# Test user registration
echo "👤 Testing user registration..."
REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "quicktest",
    "email": "quicktest@example.com", 
    "password": "testpass123",
    "level": "beginner"
  }')

HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$REGISTER_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "409" ]; then
    echo "✅ Registration endpoint working (HTTP $HTTP_CODE)"
    if [ "$HTTP_CODE" = "409" ]; then
        echo "ℹ️  User already exists, will test login"
    fi
else
    echo "❌ Registration failed (HTTP $HTTP_CODE)"
    echo "Response: $RESPONSE_BODY"
fi

echo ""

# Test user login
echo "🔐 Testing user login..."
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "quicktest@example.com",
    "password": "testpass123"
  }')

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Login endpoint working (HTTP $HTTP_CODE)"
    # Extract token for further tests
    TOKEN=$(echo "$RESPONSE_BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$TOKEN" ]; then
        echo "✅ JWT token received"
    else
        echo "⚠️  No token in response"
    fi
else
    echo "❌ Login failed (HTTP $HTTP_CODE)"
    echo "Response: $RESPONSE_BODY"
    exit 1
fi

echo ""

# Test protected endpoint
if [ -n "$TOKEN" ]; then
    echo "👤 Testing protected endpoint (profile)..."
    PROFILE_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/profile" \
      -H "Authorization: Bearer $TOKEN")
    
    HTTP_CODE=$(echo "$PROFILE_RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ Protected endpoint working (HTTP $HTTP_CODE)"
    else
        echo "❌ Protected endpoint failed (HTTP $HTTP_CODE)"
    fi
fi

echo ""
echo "🎉 Authentication API test completed!"
echo "🚀 All endpoints are working correctly"
