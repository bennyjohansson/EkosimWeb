#!/bin/bash

echo "🧪 Testing EkoSim Authentication & Country Access Control (No jq version)"
echo "========================================================================="

BASE_URL="http://localhost:8080"

echo ""
echo "🔐 Step 1: Register a test user"
echo "--------------------------------"
curl -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "password123",
    "level": "beginner",
    "role": "user",
    "assignedCountry": "Bennyland"
  }'

echo ""
echo ""
echo "🔐 Step 2: Login to get JWT token"
echo "---------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo "Login response: $LOGIN_RESPONSE"

# Extract token manually (basic approach)
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed or no token received"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful, token received: ${TOKEN:0:20}..."

echo ""
echo "🔐 Step 3: Register an admin user" 
echo "---------------------------------"
curl -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123", 
    "level": "expert",
    "role": "admin"
  }'

echo ""
echo ""
echo "📊 Step 4: Test GET endpoint without auth (should work)"
echo "-----------------------------------------------------"
curl -s "$BASE_URL/ekosim/getAvailableCountries"

echo ""
echo ""
echo "📊 Step 5: Test GET endpoint with user auth (assigned country: Bennyland)"
echo "------------------------------------------------------------------------"
curl -s -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/ekosim/getAllParameters/Bennyland"

echo ""
echo ""
echo "📊 Step 6: Test GET endpoint with user auth (NOT assigned country: Saraland)"
echo "---------------------------------------------------------------------------"
curl -s -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/ekosim/getAllParameters/Saraland"

echo ""
echo ""
echo "✏️  Step 7: Test PUT endpoint without auth (should fail)"
echo "------------------------------------------------------"
curl -s -X PUT "$BASE_URL/ekosim/put/Bennyland" \
  -H "Content-Type: application/json" \
  -d '{"PARAMETER": "TargetInterestRate", "VALUE": "0.05"}'

echo ""
echo ""
echo "✏️  Step 8: Test PUT endpoint with user auth (assigned country)"
echo "-------------------------------------------------------------"
curl -s -X PUT "$BASE_URL/ekosim/put/Bennyland" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"PARAMETER": "TargetInterestRate", "VALUE": "0.05"}'

echo ""
echo ""
echo "✏️  Step 9: Test PUT endpoint with user auth (NOT assigned country)"
echo "------------------------------------------------------------------"
curl -s -X PUT "$BASE_URL/ekosim/put/Saraland" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"PARAMETER": "TargetInterestRate", "VALUE": "0.05"}'

echo ""
echo ""
echo "🎉 Testing Complete!"
echo "==================="
