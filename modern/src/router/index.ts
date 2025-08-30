import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import AdminView from '@/views/AdminView.vue'
import CompanyView from '@/views/CompanyView.vue'
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
  // Placeholder routes for future views
  {
    path: '/bank',
    name: 'Bank',
    component: () => import('@/views/DashboardView.vue'), // Temporary fallback
    meta: { requiresAuth: true }
  },
  {
    path: '/highscore',
    name: 'HighScore',
    component: () => import('@/views/DashboardView.vue') // Temporary fallback
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guards for authentication
router.beforeEach((to, from, next) => {
  // Import store inside the guard to avoid circular dependency
  const { useSimulationStore } = require('@/stores/simulation')
  const store = useSimulationStore()
  
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (store.isAuthenticated) {
      next() // User is authenticated, proceed
    } else {
      // Redirect to login with return path
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
    }
  } else {
    next() // Route doesn't require auth, proceed
  }
})

export default router
