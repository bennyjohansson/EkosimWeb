<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-card">
        <h1>🏦 EkoSim {{ isRegistering ? 'Register' : 'Login' }}</h1>
        <p class="login-subtitle">{{ isRegistering ? 'Create your Economic Simulation account' : 'Access the Economic Simulation Dashboard' }}</p>
        
        <form @submit.prevent="isRegistering ? handleRegister() : handleLogin()" class="login-form">
          <!-- Registration-only fields -->
          <div v-if="isRegistering" class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              v-model="username"
              type="text"
              class="form-input"
              placeholder="Enter your username"
              required
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input 
              id="email"
              v-model="email" 
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
              v-model="password" 
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
            {{ isLoading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign In') }}
          </button>
        </form>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="successMessage" class="success-message">
          ✅ {{ successMessage }}
        </div>

        <!-- Toggle between login/register -->
        <div class="form-toggle">
          <p v-if="!isRegistering">
            Need an account? 
            <button type="button" class="link-button" @click="toggleMode">
              Register here
            </button>
          </p>
          <p v-else>
            Already have an account? 
            <button type="button" class="link-button" @click="toggleMode">
              Sign in here
            </button>
          </p>
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

// Form state
const isRegistering = ref(false)
const email = ref('modern1758657141@example.com')
const password = ref('password123')
const username = ref('')
const isLoading = ref(false)
const error = ref('')
const successMessage = ref('')

// Toggle between login and registration
const toggleMode = () => {
  isRegistering.value = !isRegistering.value
  error.value = ''
  successMessage.value = ''
  
  if (isRegistering.value) {
    // Clear form for registration
    email.value = ''
    password.value = ''
    username.value = ''
  } else {
    // Reset to demo values for login
    email.value = 'modern1758657141@example.com'
    password.value = 'password123'
  }
}

// Handle login
async function handleLogin() {
  isLoading.value = true
  error.value = ''
  
  try {
    await store.login(email.value, password.value)
    successMessage.value = 'Login successful! Redirecting...'
    
    setTimeout(() => {
      const redirect = router.currentRoute.value.query.redirect as string
      // Redirect to dashboard first, then user can select country
      router.push(redirect || '/dashboard')
    }, 1000)
    
  } catch (err: any) {
    error.value = err.message || 'Login failed'
  } finally {
    isLoading.value = false
  }
}

// Handle registration
const handleRegister = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    // Register user via API (without country assignment)
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        password: password.value,
        level: 'beginner',
        role: 'user'
        // Note: assignedCountry removed - user will select later
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      successMessage.value = 'Registration successful! Logging you in...'
      
      // Auto-login after successful registration
      setTimeout(async () => {
        await store.login(email.value, password.value)
        // Redirect to dashboard where user can select a country
        router.push('/dashboard')
      }, 1500)
      
    } else {
      throw new Error(result.error || 'Registration failed')
    }
    
  } catch (error: any) {
    error.value = error.message || 'Registration failed'
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
  router.push(redirect || '/dashboard')
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

.form-toggle {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.form-toggle p {
  color: #718096;
  margin: 0;
  font-size: 0.9rem;
}

.link-button {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
  font-weight: 500;
}

.link-button:hover {
  color: #5a6fd8;
}

.success-message {
  color: #38a169;
  text-align: center;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  border-radius: 6px;
  font-weight: 500;
}
</style>
