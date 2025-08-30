import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import AdminView from '@/views/AdminView.vue'
import CompanyView from '@/views/CompanyView.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminView
  },
  {
    path: '/company',
    name: 'Company', 
    component: CompanyView
  },
  // Placeholder routes for future views
  {
    path: '/bank',
    name: 'Bank',
    component: () => import('@/views/DashboardView.vue') // Temporary fallback
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

export default router
