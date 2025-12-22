# Test and Debug Files

This directory contains test and debug files that were moved from the main project directories to keep the codebase clean.

## Authentication Tests
- `auth-test*.html` - Authentication flow test pages
- `login-debug.html` - Debug version of login page  
- `test-auth*.js`, `test-auth*.sh` - Authentication API and flow tests
- `debug-auth.html` - Authentication debugging interface

## Database Tests  
- `debug-postgres-users.js` - PostgreSQL user database debugging
- `test-postgres-*.js` - PostgreSQL connection and service tests
- `debug-db.sh` - Database debugging scripts
- `test-country-access*.js` - Country access control tests
- `test-user-service.js` - User service testing

## API Tests
- `test-api-*.sh` - API endpoint testing scripts  
- `test-production.js`, `test-proxy.js` - Production and proxy testing

## Legacy Tests
- `myChartTest.js`, `testpage.html` - Old chart and UI tests
- `firebase-test.html` - Firebase integration tests
- `simple-auth-test.html` - Simple authentication tests

## Development Scripts
- `start-server.sh` - Server startup scripts
- `init-user-db.js` - Database initialization
- `test-clean.sh` - Test cleanup utilities

## Usage

These files can be used for:
- Debugging authentication issues
- Testing database migrations  
- Validating API endpoints
- Development and troubleshooting

**Note**: These files may reference old file paths or configurations and might need updates before use.