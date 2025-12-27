# Legacy Unused Files

**Historical Reference Only - Not Used in Production**

## What's Here

This folder contains the original frontend implementation from EkoSim's early development. These files are **no longer used** by the production application.

### Contents

- `index.html` - Original jQuery/Bootstrap single-page application
- `html/` - Old HTML view files (login, company view, bank view, admin view)
- `app/` - Old JavaScript frontend code (jQuery-based):
  - `app.js` - Main application logic
  - `adminApp.js`, `companyApp.js`, `bankApp.js` - View controllers
  - `fireBase.js` - Old Firebase authentication (replaced by JWT)
  - `main.js`, `login.js` - Authentication integration
- `css/` - Old stylesheets
- `images/` - Old image assets
- `Old/` - Even older code artifacts

## Why It's Preserved

These files are kept for:

- Historical reference
- Understanding the application's evolution
- Potential code reuse for specific features
- Documentation of previous architecture decisions

## Current Architecture

The production EkoSim platform now uses:

**Frontend**: Vue 3 + TypeScript + Vite (`../frontend/`)

- Modern component-based architecture
- Type-safe development
- Reactive state management with Pinia
- Vue Router for navigation

**API Server**: Node.js + Express (`../api/`)

- RESTful API endpoints
- JWT authentication
- PostgreSQL integration
- Clean separation from frontend

## Migration Status

✅ **Completed**

- User authentication (Firebase → JWT)
- Frontend framework (jQuery → Vue 3)
- Type safety (JavaScript → TypeScript)
- Build system (None → Vite)
- State management (Ad-hoc → Pinia)

## Safe to Delete?

These files can be safely deleted without affecting production. They are retained for historical purposes only. If you need to remove them:

```bash
git rm -r legacy-unused/
git commit -m "chore: remove legacy unused frontend files"
```

---

**Last Updated**: December 27, 2025
