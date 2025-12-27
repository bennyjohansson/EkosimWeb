import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import CountryView from '@/views/CountryView.vue'
import AdminView from '@/views/AdminView.vue'
import CompanyView from '@/views/CompanyView.vue'
import BankView from '@/views/BankView.vue'
import HighScoreView from '@/views/HighScoreView.vue'
import LoginView from '@/views/LoginView.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView
  },
  {
    path: '/country',
    name: 'Country',
    component: CountryView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminView,
    meta: { requiresAuth: true }
  },
  {
    path: '/company',
    name: 'Company', 
    component: CompanyView,
    meta: { requiresAuth: true }
  },
  {
    path: '/bank',
    name: 'Bank',
    component: BankView,
    meta: { requiresAuth: true }
  },
  {
    path: '/highscore',
    name: 'HighScore',
    component: HighScoreView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guards for authentication
router.beforeEach(async (to, _from, next) => {
  console.log('=== ROUTE GUARD ===')
  console.log('Navigating to:', to.path)
  console.log('Route meta:', to.meta)
  
  // Import store dynamically to avoid circular dependency
  const { useSimulationStore } = await import('@/stores/simulation')
  const store = useSimulationStore()
  
  console.log('User in store:', store.user)
  console.log('Is authenticated:', store.isAuthenticated)
  
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    console.log('Route requires authentication')
    if (store.isAuthenticated) {
      console.log('User is authenticated, proceeding')
      next() // User is authenticated, proceed
    } else {
      // Redirect to login with return path
      console.log('Route guard: Redirecting to login, not authenticated')
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
    }
  } else {
    console.log('Route does not require authentication, proceeding')
    next() // Route doesn't require auth, proceed
  }
  console.log('=== END ROUTE GUARD ===')
})

export default router
