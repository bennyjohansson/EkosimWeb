#!/bin/bash

echo "🔍 Database Investigation"
echo "========================"

# Get the most recent user registration
echo "Recent users:"
echo "SELECT id, email, assigned_country, role FROM users ORDER BY created_at DESC LIMIT 3;" | sqlite3 legacy/users.db

echo ""
echo "User countries table:"
echo "SELECT user_id, country_code, access_level FROM user_countries ORDER BY assigned_at DESC LIMIT 5;" | sqlite3 legacy/users.db

echo ""
echo "Checking specific test user..."
RECENT_USER_EMAIL=$(echo "SELECT email FROM users ORDER BY created_at DESC LIMIT 1;" | sqlite3 legacy/users.db)
echo "Most recent user: $RECENT_USER_EMAIL"

RECENT_USER_ID=$(echo "SELECT id FROM users ORDER BY created_at DESC LIMIT 1;" | sqlite3 legacy/users.db)
echo "Most recent user ID: $RECENT_USER_ID"

echo ""
echo "Countries for this user:"
echo "SELECT country_code, access_level FROM user_countries WHERE user_id = '$RECENT_USER_ID';" | sqlite3 legacy/users.db

echo ""
echo "Assigned country from users table:"
echo "SELECT assigned_country FROM users WHERE id = '$RECENT_USER_ID';" | sqlite3 legacy/users.db
