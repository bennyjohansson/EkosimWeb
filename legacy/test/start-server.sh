#!/bin/bash
# Script to start the server cleanly

echo "🚀 Starting EkoWeb Server with Authentication..."
echo "📍 Server will run on http://localhost:8080"
echo "🔐 Authentication endpoints available at /api/auth/*"
echo ""
echo "Press Ctrl+C to stop the server"
echo "----------------------------------------"

cd "$(dirname "$0")"
node server.js
