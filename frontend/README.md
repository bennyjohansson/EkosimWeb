# EkoSim Modern Frontend

Modern Vue 3 + TypeScript frontend for the EkoSim economic simulation platform.

## 🚀 Features

- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Vite** for fast development and building
- **Pinia** for state management
- **Chart.js** for data visualization
- **Responsive design** with modern CSS

## 🏗️ Architecture

```
src/
├── components/          # Reusable UI components
│   ├── charts/         # Chart components (GDP, Money, Company)
│   ├── forms/          # Parameter input forms
│   └── layout/         # Navigation, layout components
├── views/              # Page-level components
│   ├── OverviewView.vue
│   ├── CompanyView.vue
│   ├── BankView.vue
│   ├── AdminView.vue
│   └── HighscoreView.vue
├── stores/             # Pinia state management
│   ├── simulation.ts   # Simulation data store
│   ├── auth.ts         # Authentication store
│   └── countries.ts    # Country/company selection
├── services/           # API layer
│   ├── simulationAPI.ts
│   └── websocket.ts
├── types/              # TypeScript definitions
│   ├── simulation.ts
│   └── api.ts
└── main.ts             # Application entry point
```

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- Legacy backend running on port 8080

### Setup
```bash
cd modern
npm install
npm run dev
```

### Available Scripts
- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking

## 🔗 API Integration

The frontend connects to the legacy Express.js backend via proxy:
- Development: `http://localhost:3000` → proxies `/ekosim/*` to `http://localhost:8080`
- All existing API endpoints preserved for compatibility

## 📊 Current Status

✅ **Completed:**
- Project setup and build system
- Vue 3 + TypeScript foundation
- Responsive CSS framework
- API proxy configuration
- Development environment

🔄 **In Progress:**
- TypeScript interfaces from legacy API analysis
- Chart components with Chart.js
- Country/company selection logic
- Dashboard view implementations

📋 **TODO:**
- Authentication integration
- WebSocket real-time updates
- Performance optimization
- Testing setup

## 🎯 Development Goals

1. **Maintain API Compatibility** - Work with existing backend
2. **Improve Developer Experience** - Modern tooling and TypeScript
3. **Better Performance** - Optimized builds and caching
4. **Enhanced UX** - Responsive design and better interactions
5. **Future-Proof Architecture** - Easy to extend and maintain

## 🔧 Configuration

### Vite Proxy Setup
API calls to `/ekosim/*` are automatically proxied to the legacy backend on port 8080.

### TypeScript
Strict mode enabled with path mapping for clean imports:
```typescript
import { SimulationAPI } from '@/services/simulationAPI'
import type { CountryData } from '@/types/simulation'
```

## 📈 Migration Strategy

1. **Phase 1**: Build modern components alongside legacy system
2. **Phase 2**: Migrate views one by one
3. **Phase 3**: Add modern features (WebSocket, enhanced charts)
4. **Phase 4**: Complete cutover when feature-complete
