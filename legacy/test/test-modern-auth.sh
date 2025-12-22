#!/bin/bash

echo "🧪 Testing Modern Frontend Authentication Integration"
echo "================================================="

BASE_URL="http://localhost:8080"

# Generate unique test user
TIMESTAMP=$(date +%s)
TEST_USER="modernuser$TIMESTAMP"
TEST_EMAIL="modern$TIMESTAMP@example.com"

echo ""
echo "🔐 Step 1: Register user for modern frontend testing"
echo "---------------------------------------------------"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$TEST_USER\",
    \"email\": \"$TEST_EMAIL\", 
    \"password\": \"password123\",
    \"level\": \"intermediate\",
    \"role\": \"user\",
    \"assignedCountry\": \"Bennyland\"
  }")

echo "Registration response:"
echo "$REGISTER_RESPONSE" | jq '.'

# Extract the user data for testing
USER_EMAIL=$(echo "$REGISTER_RESPONSE" | jq -r '.data.user.email // empty')
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.user.id // empty')

if [ -z "$USER_EMAIL" ]; then
  echo "❌ User registration failed"
  exit 1
fi

echo ""
echo "✅ User registered successfully:"
echo "   Email: $USER_EMAIL"
echo "   ID: $USER_ID"
echo ""
echo "🎯 This user can now be used to test the modern Vue frontend!"
echo "   1. Navigate to http://localhost:3000/login"
echo "   2. Login with: $USER_EMAIL / password123"
echo "   3. Test parameter modifications with proper JWT authentication"

echo ""
echo "🔍 User in database:"
echo "SELECT id, email, assigned_country, role FROM users WHERE email = '$USER_EMAIL';" | sqlite3 ../legacy/myDB/users.db

echo ""
echo "🔍 Country access:"
echo "SELECT user_id, country_code, access_level FROM user_countries WHERE user_id = '$USER_ID';" | sqlite3 ../legacy/myDB/users.db
