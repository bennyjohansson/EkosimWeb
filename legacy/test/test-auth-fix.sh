#!/bin/bash

echo "🔧 Testing Authentication Fix"
echo "============================="
echo ""

# Wait for server restart
echo "Please restart your server (npm run dev) and then press Enter to continue testing..."
read -p "Press Enter when server is restarted: "

BASE_URL="http://localhost:8080"

# Generate unique test user to avoid conflicts
TIMESTAMP=$(date +%s)
TEST_USER="testuser$TIMESTAMP"
TEST_EMAIL="test$TIMESTAMP@example.com"

echo ""
echo "🔐 Step 1: Register a fresh test user ($TEST_USER)"
echo "------------------------------------------------"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$TEST_USER\",
    \"email\": \"$TEST_EMAIL\", 
    \"password\": \"password123\",
    \"level\": \"beginner\",
    \"role\": \"user\",
    \"assignedCountry\": \"Bennyland\"
  }")

echo "Registration response:"
echo "$REGISTER_RESPONSE" | jq '.'

echo ""
echo "🔐 Step 2: Login to get JWT token"
echo "---------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"password123\"
  }")

echo "Login response:"
echo "$LOGIN_RESPONSE" | jq '.'

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Login failed or no token received"
  exit 1
fi

echo "✅ Login successful, token received: ${TOKEN:0:30}..."

echo ""
echo "🚨 CRITICAL TEST: PUT to assigned country (should work)"
echo "======================================================"
echo "Testing PUT to Bennyland (user IS assigned to this country)..."
PUT_ASSIGNED=$(curl -s -X PUT "$BASE_URL/ekosim/put/Bennyland" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"PARAMETER": "TargetInterestRate", "VALUE": "0.06"}')

echo "Response:"
echo "$PUT_ASSIGNED"

echo ""
echo "🚨 CRITICAL TEST: PUT to NON-assigned country (should FAIL)"
echo "=========================================================="
echo "Testing PUT to Saraland (user is NOT assigned to this country)..."
PUT_NOT_ASSIGNED=$(curl -s -X PUT "$BASE_URL/ekosim/put/Saraland" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"PARAMETER": "TargetInterestRate", "VALUE": "0.07"}')

echo "Response:"
echo "$PUT_NOT_ASSIGNED"

echo ""
echo "🚨 CRITICAL TEST: PUT without authentication (should FAIL)"
echo "========================================================"
echo "Testing PUT without any token..."
PUT_NO_AUTH=$(curl -s -X PUT "$BASE_URL/ekosim/put/Bennyland" \
  -H "Content-Type: application/json" \
  -d '{"PARAMETER": "TargetInterestRate", "VALUE": "0.08"}')

echo "Response:"
echo "$PUT_NO_AUTH"

echo ""
echo "🎉 Authentication Testing Complete!"
echo "=================================="
echo ""
echo "Expected results:"
echo "✅ PUT to assigned country (Bennyland): Should succeed" 
echo "❌ PUT to non-assigned country (Saraland): Should return 403 Forbidden"
echo "❌ PUT without authentication: Should return 401 Unauthorized"
