#!/bin/bash

echo "🧪 Testing EkoSim Authentication & Country Access Control (Clean)"
echo "================================================================"

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
echo "📊 Step 3: Test GET endpoint without auth (should work)"
echo "-----------------------------------------------------"
curl -s "$BASE_URL/ekosim/getAvailableCountries" | jq '.'

echo ""
echo "📊 Step 4: Test GET endpoint with user auth (assigned country: Bennyland)"
echo "------------------------------------------------------------------------"
curl -s -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/ekosim/getAllParameters/Bennyland" | jq '.'

echo ""
echo "📊 Step 5: Test GET endpoint with user auth (NOT assigned country: Saraland)"
echo "---------------------------------------------------------------------------"
curl -s -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/ekosim/getAllParameters/Saraland" | jq '.'

echo ""
echo "✏️  Step 6: Test PUT endpoint without auth (should fail)"
echo "------------------------------------------------------"
curl -s -X PUT "$BASE_URL/ekosim/put/Bennyland" \
  -H "Content-Type: application/json" \
  -d '{"PARAMETER": "TargetInterestRate", "VALUE": "0.05"}' | jq '.'

echo ""
echo "✏️  Step 7: Test PUT endpoint with user auth (assigned country)"
echo "-------------------------------------------------------------"
curl -s -X PUT "$BASE_URL/ekosim/put/Bennyland" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"PARAMETER": "TargetInterestRate", "VALUE": "0.05"}' | jq '.'

echo ""
echo "✏️  Step 8: Test PUT endpoint with user auth (NOT assigned country)"
echo "------------------------------------------------------------------"
curl -s -X PUT "$BASE_URL/ekosim/put/Saraland" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"PARAMETER": "TargetInterestRate", "VALUE": "0.05"}' | jq '.'

echo ""
echo "🎉 Testing Complete!"
echo "==================="
