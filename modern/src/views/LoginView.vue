<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-card">
        <h1>🔐 EkoSim Login</h1>
        <p class="login-subtitle">Access the Economic Simulation Dashboard</p>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              id="email"
              v-model="loginForm.email" 
              type="email" 
              required 
              class="form-input"
              placeholder="Enter your email"
            />
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              id="password"
              v-model="loginForm.password" 
              type="password" 
              required 
              class="form-input"
              placeholder="Enter your password"
            />
          </div>
          
          <button 
            type="submit" 
            :disabled="isLoading" 
            class="login-button"
          >
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <!-- Demo login for development -->
        <div class="demo-section">
          <hr class="divider">
          <p class="demo-text">Development Mode</p>
          <button @click="handleDemoLogin" class="demo-button">
            🚀 Demo Login (Skip Authentication)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSimulationStore } from '@/stores/simulation'

const router = useRouter()
const store = useSimulationStore()

const loginForm = ref({
  email: '',
  password: ''
})

const isLoading = ref(false)
const error = ref('')

async function handleLogin() {
  isLoading.value = true
  error.value = ''
  
  try {
    // Will integrate with actual auth service later
    await store.login(loginForm.value.email, loginForm.value.password)
    
    // Redirect to intended route or dashboard
    const redirect = router.currentRoute.value.query.redirect as string
    router.push(redirect || '/')
  } catch (err) {
    error.value = 'Invalid email or password'
  } finally {
    isLoading.value = false
  }
}

function handleDemoLogin() {
  // Quick demo login for development
  store.user = {
    id: 'demo-user',
    username: 'Demo User',
    email: 'demo@ekosim.com',
    level: 'expert',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  }
  
  const redirect = router.currentRoute.value.query.redirect as string
  router.push(redirect || '/')
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.login-card h1 {
  text-align: center;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
}

.login-subtitle {
  text-align: center;
  color: #718096;
  margin: 0 0 2rem 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #2d3748;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.login-button {
  padding: 0.75rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.5rem;
}

.login-button:hover:not(:disabled) {
  background: #5a6fd8;
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #e53e3e;
  text-align: center;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fed7d7;
  border-radius: 6px;
}

.demo-section {
  margin-top: 1.5rem;
}

.divider {
  border: none;
  height: 1px;
  background: #e2e8f0;
  margin: 1rem 0;
}

.demo-text {
  text-align: center;
  color: #718096;
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
}

.demo-button {
  width: 100%;
  padding: 0.75rem;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.demo-button:hover {
  background: #38a169;
}
</style>
