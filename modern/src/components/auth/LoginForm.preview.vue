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
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import type { AuthCredentials } from '@/types/simulation'

// Composables
const router = useRouter()
const authStore = useAuthStore()

// Reactive state
const isLoginMode = ref(true)
const loading = ref(false)
const error = ref('')
const success = ref('')

const form = reactive<AuthCredentials>({
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
    let result
    
    if (isLoginMode.value) {
      result = await authStore.login(form.email, form.password)
    } else {
      result = await authStore.register(form)
    }

    if (result.success) {
      success.value = isLoginMode.value ? 'Login successful! Redirecting...' : 'Account created! Redirecting...'
      
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } else {
      error.value = result.error || 'Authentication failed'
    }
  } catch (err) {
    error.value = 'An unexpected error occurred. Please try again.'
  }

  loading.value = false
}
</script>

<style scoped>
/* Same styles as the legacy version, but using Vue scoped CSS */
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

/* ... rest of the styles ... */
</style>
