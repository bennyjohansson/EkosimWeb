#!/bin/bash

echo "🧪 Testing EkoSim Authentication & Country Access Control"
echo "========================================================"

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
  }' | jq '.'

echo ""
echo "🔐 Step 2: Login to get JWT token"
echo "---------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty')

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed or no token received"
  echo "$LOGIN_RESPONSE" | jq '.'
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
  }' | jq '.'

echo ""
echo "🔐 Step 4: Login admin to get admin token"
echo "----------------------------------------"
ADMIN_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com", 
    "password": "admin123"
  }')

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN_RESPONSE" | jq -r '.token // empty')

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Admin login failed or no token received"
  echo "$ADMIN_LOGIN_RESPONSE" | jq '.'
  exit 1
fi

echo "✅ Admin login successful, token received: ${ADMIN_TOKEN:0:20}..."

echo ""
echo "📊 Step 5: Test GET endpoint without auth (should work)"
echo "-----------------------------------------------------"
curl -s "$BASE_URL/ekosim/getAvailableCountries" | jq '.'

echo ""
echo "📊 Step 6: Test GET endpoint with regular user auth (assigned country)"
echo "--------------------------------------------------------------------"
curl -s -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/ekosim/getAllParameters/Bennyland" | jq '.'

echo ""
echo "📊 Step 7: Test GET endpoint with regular user auth (NOT assigned country)"
echo "------------------------------------------------------------------------"
curl -s -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/ekosim/getAllParameters/Saraland" | jq '.'

echo ""
echo "📊 Step 8: Test GET endpoint with admin auth (any country)"
echo "---------------------------------------------------------" 
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$BASE_URL/ekosim/getAllParameters/Saraland" | jq '.'

echo ""
echo "✏️  Step 9: Test PUT endpoint without auth (should fail)"
echo "------------------------------------------------------"
curl -s -X PUT "$BASE_URL/ekosim/put/Bennyland" \
  -H "Content-Type: application/json" \
  -d '{"PARAMETER": "TargetInterestRate", "VALUE": "0.05"}' | jq '.'

echo ""
echo "✏️  Step 10: Test PUT endpoint with regular user auth (assigned country)"
echo "----------------------------------------------------------------------"
curl -s -X PUT "$BASE_URL/ekosim/put/Bennyland" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"PARAMETER": "TargetInterestRate", "VALUE": "0.05"}' | jq '.'

echo ""
echo "✏️  Step 11: Test PUT endpoint with regular user auth (NOT assigned country)"
echo "--------------------------------------------------------------------------"
curl -s -X PUT "$BASE_URL/ekosim/put/Saraland" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"PARAMETER": "TargetInterestRate", "VALUE": "0.05"}' | jq '.'

echo ""
echo "✏️  Step 12: Test PUT endpoint with admin auth (any country)"
echo "----------------------------------------------------------"
curl -s -X PUT "$BASE_URL/ekosim/put/Saraland" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"PARAMETER": "TargetInterestRate", "VALUE": "0.05"}' | jq '.'

echo ""
echo "🎉 Testing Complete!"
echo "==================="
