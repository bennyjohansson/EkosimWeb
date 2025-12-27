<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h2 class="auth-title">
          {{ isLoginMode ? 'Welcome Back' : 'Create Account' }}
        </h2>
        <p class="auth-subtitle">
          {{ isLoginMode ? 'Sign in to your EcoSim account' : 'Join the economic simulation' }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div v-if="!isLoginMode" class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            class="form-control"
            placeholder="Choose a username"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-control"
            placeholder="Enter your email"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-control"
            placeholder="Enter your password"
            required
            minlength="6"
          />
        </div>

        <div v-if="!isLoginMode" class="form-group">
          <label for="level">Experience Level</label>
          <select id="level" v-model="form.level" class="form-control" required>
            <option value="">Select your level</option>
            <option value="beginner">Beginner - New to economics</option>
            <option value="intermediate">Intermediate - Some knowledge</option>
            <option value="advanced">Advanced - Economics background</option>
          </select>
        </div>

        <div class="form-group">
          <button
            type="submit"
            class="btn btn-primary btn-block"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm"></span>
            {{ loading ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Create Account') }}
          </button>
        </div>

        <div class="auth-switch">
          {{ isLoginMode ? "Don't have an account?" : "Already have an account?" }}
          <a href="#" @click.prevent="switchMode">
            {{ isLoginMode ? 'Create one' : 'Sign in' }}
          </a>
        </div>
      </form>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
// Note: These imports will be available when we migrate to the modern architecture
// import { useRouter } from 'vue-router'
// import { useAuthStore } from '@/stores/authStore'
// import type { AuthCredentials } from '@/types/simulation'

// For preview purposes, define the form type locally
interface AuthFormData {
  username: string
  email: string
  password: string
  level: 'beginner' | 'intermediate' | 'advanced'
}

// For preview purposes, we'll mock these
// const router = useRouter()
// const authStore = useAuthStore()

// Reactive state
const isLoginMode = ref(true)
const loading = ref(false)
const error = ref('')
const success = ref('')

const form = reactive<AuthFormData>({
  username: '',
  email: '',
  password: '',
  level: 'beginner'
})

// Methods
const switchMode = () => {
  isLoginMode.value = !isLoginMode.value
  clearMessages()
}

const clearMessages = () => {
  error.value = ''
  success.value = ''
}

const handleSubmit = async () => {
  if (loading.value) return

  loading.value = true
  clearMessages()

  try {
    // This will be implemented when we migrate to modern architecture
    // let result
    // 
    // if (isLoginMode.value) {
    //   result = await authStore.login(form.email, form.password)
    // } else {
    //   result = await authStore.register(form)
    // }

    // For now, mock the authentication
    console.log('Form submission:', { isLoginMode: isLoginMode.value, form })
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    success.value = isLoginMode.value ? 'Login successful! Redirecting...' : 'Account created! Redirecting...'
    
    setTimeout(() => {
      // router.push('/')
      console.log('Would redirect to main app')
    }, 1500)

  } catch (err) {
    error.value = 'An unexpected error occurred. Please try again.'
    console.error('Auth error:', err)
  }

  loading.value = false
}
</script>

<style scoped>
/* Modern authentication form styles */
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 400px;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-title {
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.auth-subtitle {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

.auth-form .form-group {
  margin-bottom: 1.5rem;
}

.auth-form label {
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
  display: block;
}

.auth-form .form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 5px;
  transition: border-color 0.3s ease;
  font-size: 1rem;
}

.auth-form .form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
  outline: none;
}

.btn {
  cursor: pointer;
  border: none;
  border-radius: 5px;
  font-weight: 500;
  text-align: center;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.75rem 1.5rem;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-block {
  width: 100%;
}

.auth-switch {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}

.auth-switch a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.auth-switch a:hover {
  text-decoration: underline;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.alert {
  padding: 0.75rem 1rem;
  margin-top: 1rem;
  border-radius: 5px;
  font-weight: 500;
}

.alert-danger {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.alert-success {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}
</style>
