# EkoWeb - Web Interface & API

**Node.js API Server + Vue.js Frontend**

## Overview

EkoWeb provides the complete web interface for EkoSim, consisting of a Node.js/Express API server and a modern Vue 3 TypeScript frontend. It bridges the gap between the C++ simulation engine and users through a responsive web application.

## Repository Structure

```
EkoWeb/
├── api/              # Node.js/Express API Server (formerly "legacy")
│   ├── server.js     # Main API server (port 3001)
│   ├── routes/       # API endpoints (auth, simulation data)
│   ├── services/     # Business logic (UserService, SimulationService)
│   ├── database/     # Database adapters (PostgreSQL, SQLite)
│   ├── middleware/   # Authentication, rate limiting
│   └── config/       # Configuration (auth, database)
│
└── frontend/         # Vue 3 + TypeScript SPA (formerly "modern")
    ├── src/
    │   ├── views/    # Main pages (Dashboard, Company, Bank, Admin)
    │   ├── components/  # Reusable UI components (charts, controls)
    │   ├── services/    # API clients (simulationAPI, authService)
    │   ├── stores/      # Pinia state management
    │   ├── router/      # Vue Router configuration
    │   └── types/       # TypeScript interfaces
    └── dist/         # Production build output
```

## API Server (`api/`)

### What It Does

The API server is the **production backend** that:

- **Authentication**: JWT-based user authentication and authorization
- **Data Proxy**: Retrieves simulation data from PostgreSQL and C++ backend
- **Parameter Updates**: Sends user changes to the simulation engine
- **User Management**: Registration, login, profile management
- **Country Access Control**: Multi-tenant isolation per user/country
- **Static File Serving**: Serves the Vue frontend in production mode

### Key Endpoints

```
POST   /api/auth/register        # User registration
POST   /api/auth/login           # User login
GET    /api/auth/profile         # User profile (protected)

GET    /ekosim/read/:country     # Read economic parameters
PUT    /ekosim/put/:country      # Update parameters
GET    /ekosim/getCompany/:country  # Company data
GET    /ekosim/moneytable/update/:country  # Money time series
GET    /ekosim/timetable/update/:country   # Economic indicators
GET    /ekosim/worldtable/       # World rankings
GET    /ekosim/getHighScore/     # High scores
```

### Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Authentication**: JWT + bcrypt
- **Database**: PostgreSQL (primary) + SQLite (legacy)
- **Security**: Rate limiting, CORS, input validation
- **Port**: 3001 (API)

## Frontend (`frontend/`)

### What It Does

Modern single-page application providing:

- **Interactive Dashboard**: Real-time economic indicators and charts
- **Company Management**: Control production, pricing, employment
- **Bank Operations**: Adjust interest rates and monetary policy
- **Admin Panel**: Modify core economic parameters
- **High Scores**: View historical performance rankings
- **Responsive UI**: Works on desktop, tablet, and mobile

### Technology Stack

- **Framework**: Vue 3 (Composition API)
- **Language**: TypeScript
- **State Management**: Pinia
- **Routing**: Vue Router
- **Build Tool**: Vite
- **Charts**: Chart.js
- **Styling**: Modern CSS with responsive design
- **Port**: 3000 (production), 5173 (development)

### Key Views

- **DashboardView** - Economic overview with GDP, money supply, employment
- **CompanyView** - Individual company metrics and controls
- **BankView** - Interest rate management and monetary policy
- **AdminView** - System-wide parameter adjustments
- **HighScoreView** - Historical performance leaderboard
- **LoginView** - User authentication

## Development

### API Server

```bash
cd api
npm install
npm start  # Runs on port 3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev  # Vite dev server on port 5173
```

### Production Build

```bash
cd frontend
npm run build  # Creates dist/ folder
```

The API server automatically serves the built frontend in production mode.

## API-Frontend Communication

1. Frontend makes HTTP requests to `/ekosim/*` and `/api/*` endpoints
2. Vite dev server proxies these to `localhost:3001` (API server)
3. API server queries PostgreSQL for data
4. API server returns JSON responses
5. Frontend updates UI reactively with Pinia stores

## Authentication Flow

1. User registers/logs in via `LoginView`
2. API generates JWT token
3. Frontend stores token in localStorage
4. All subsequent requests include `Authorization: Bearer <token>`
5. API middleware verifies token and checks country access
6. Protected routes redirect to login if token invalid

## Database Integration

- **PostgreSQL** (primary): User accounts, simulation state, time series data
- **SQLite** (legacy): Being phased out, still used for backward compatibility

## Environment Variables

```bash
# API Server (.env)
PORT=3001
NODE_ENV=production
POSTGRES_HOST=ekosim-postgres
POSTGRES_PORT=5432
POSTGRES_DB=ekosim
POSTGRES_USER=ekosim
POSTGRES_PASSWORD=<secret>
JWT_SECRET=<secret>
```

---

**Part of the EkoSim Platform** - See also:

- [ekosim](../ekosim/README.md) - C++ simulation engine
- [EkoSim-Infrastructure](../EkoSim-Infrastructure/README.md) - Docker orchestration
