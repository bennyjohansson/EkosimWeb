<!-- filepath: /Users/bennyjohansson/Documents/Projects/EkoWeb/modern/src/components/SimulationDemo.vue -->

<template>
  <div class="simulation-demo">
    <h2>🚀 TypeScript Interfaces Demo</h2>
    
    <!-- Country Selection -->
    <div class="demo-section">
      <h3>Country Selection</h3>
      <select 
        v-model="selectedCountry" 
        @change="handleCountryChange"
        class="form-select"
      >
        <option v-for="country in COUNTRIES" :key="country" :value="country">
          {{ country }}
        </option>
      </select>
      <p class="status">Selected: <strong>{{ selectedCountry }}</strong></p>
    </div>

    <!-- API Connection Test -->
    <div class="demo-section">
      <h3>API Connection Test</h3>
      <div class="api-test-controls">
        <button @click="testAPI" :disabled="isLoadingAPI" class="btn">
          {{ isLoadingAPI ? 'Testing...' : 'Test API Connection' }}
        </button>
        <button @click="testSpecificEndpoints" :disabled="isLoadingAPI" class="btn">
          Test All Endpoints
        </button>
      </div>
      
      <div v-if="apiStatus" class="status" :class="apiStatus.type">
        <strong>{{ apiStatus.type.toUpperCase() }}:</strong> {{ apiStatus.message }}
      </div>

      <div v-if="endpointResults.length > 0" class="endpoint-results">
        <h4>Endpoint Test Results:</h4>
        <div class="endpoint-grid">
          <div 
            v-for="result in endpointResults" 
            :key="result.endpoint"
            class="endpoint-result"
            :class="result.status"
          >
            <div class="endpoint-name">{{ result.endpoint }}</div>
            <div class="endpoint-status">{{ result.status }}</div>
            <div v-if="result.error" class="endpoint-error">{{ result.error }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Parameters Demo -->
    <div class="demo-section">
      <h3>Economic Parameters</h3>
      <button @click="loadParameters" :disabled="isLoadingParams" class="btn">
        {{ isLoadingParams ? 'Loading...' : 'Load Parameters' }}
      </button>
      
      <div v-if="parameters.length > 0" class="parameters-grid">
        <div 
          v-for="param in parameters.slice(0, 6)" 
          :key="param.PARAMETER"
          class="parameter-card"
        >
          <label>{{ formatParameterName(param.PARAMETER) }}</label>
          <input 
            v-model="param.VALUE" 
            @change="() => updateParameter(param)"
            :type="isNumericParameter(param.PARAMETER) ? 'number' : 'text'"
            class="form-input"
            :step="getParameterStep(param.PARAMETER)"
          />
        </div>
      </div>
    </div>

    <!-- Store State Demo -->
    <div class="demo-section">
      <h3>Pinia Store State</h3>
      <div class="store-info">
        <div class="info-item">
          <span class="label">Current Country:</span>
          <span class="value">{{ store.currentCountry }}</span>
        </div>
        <div class="info-item">
          <span class="label">Is Loading:</span>
          <span class="value">{{ store.isLoading }}</span>
        </div>
        <div class="info-item">
          <span class="label">Is Authenticated:</span>
          <span class="value">{{ store.isAuthenticated }}</span>
        </div>
        <div class="info-item">
          <span class="label">Parameters Count:</span>
          <span class="value">{{ store.currentParameters.length }}</span>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="store.hasError" class="demo-section error-section">
      <h3>Error State</h3>
      <div class="error-details">
        <strong>{{ store.lastError?.code }}:</strong> {{ store.lastError?.message }}
      </div>
    </div>

    <!-- TypeScript Type Information -->
    <div class="demo-section">
      <h3>TypeScript Interface Examples</h3>
      <div class="type-examples">
        <details>
          <summary>CountryCode Type</summary>
          <pre><code>type CountryCode = 'Bennyland' | 'Saraland' | 'Otherland'</code></pre>
        </details>
        
        <details>
          <summary>EconomicParameter Interface</summary>
          <pre><code>interface EconomicParameter {
  key: number
  PARAMETER: string
  VALUE: string | number
  DESCRIPTION?: string
}</code></pre>
        </details>

        <details>
          <summary>API Response Wrapper</summary>
          <pre><code>interface ApiResponse&lt;T&gt; {
  message: 'success' | 'error'
  data: T
  error?: string
}</code></pre>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSimulationStore } from '@/stores/simulation'
import { simulationAPI, parseAPIError } from '@/services/simulationAPI'
import type { 
  CountryCode, 
  EconomicParameter, 
  ParameterUpdate 
} from '@/types/simulation'
import { COUNTRIES } from '@/types/simulation'

// Store
const store = useSimulationStore()

// Local state
const selectedCountry = ref<CountryCode>('Bennyland')
const parameters = ref<EconomicParameter[]>([])
const isLoadingAPI = ref(false)
const isLoadingParams = ref(false)
const apiStatus = ref<{type: 'success' | 'error', message: string} | null>(null)
const endpointResults = ref<Array<{
  endpoint: string
  status: 'success' | 'error' | 'pending'
  error?: string
}>>([])

// Test API connection
async function testAPI() {
  isLoadingAPI.value = true
  apiStatus.value = null

  try {
    const isHealthy = await simulationAPI.testConnection()
    if (isHealthy) {
      apiStatus.value = { type: 'success', message: 'API connection successful!' }
    } else {
      apiStatus.value = { type: 'error', message: 'API connection failed' }
    }
  } catch (error) {
    apiStatus.value = { 
      type: 'error', 
      message: parseAPIError(error) 
    }
  } finally {
    isLoadingAPI.value = false
  }
}

// Test specific endpoints
async function testSpecificEndpoints() {
  isLoadingAPI.value = true
  endpointResults.value = []
  
  const endpoints = [
    { name: 'World Table', test: () => simulationAPI.getWorldTable() },
    { name: 'High Score', test: () => simulationAPI.getHighScore() },
    { name: 'Parameters', test: () => simulationAPI.getAllParameters(selectedCountry.value) },
    { name: 'Money Data', test: () => simulationAPI.getMoneyDataUpdates(selectedCountry.value, 0) },
    { name: 'Time Data', test: () => simulationAPI.getTimeDataUpdates(selectedCountry.value, 0) }
  ]

  for (const endpoint of endpoints) {
    try {
      endpointResults.value.push({ endpoint: endpoint.name, status: 'pending' })
      await endpoint.test()
      endpointResults.value[endpointResults.value.length - 1].status = 'success'
    } catch (error) {
      const result = endpointResults.value[endpointResults.value.length - 1]
      result.status = 'error'
      result.error = parseAPIError(error)
    }
  }
  
  isLoadingAPI.value = false
}

// Load parameters for current country
async function loadParameters() {
  isLoadingParams.value = true

  try {
    const response = await simulationAPI.getAllParameters(selectedCountry.value)
    if (response.message === 'success') {
      parameters.value = response.data
    } else {
      throw new Error(response.error || 'Failed to load parameters')
    }
  } catch (error) {
    console.error('Failed to load parameters:', parseAPIError(error))
  } finally {
    isLoadingParams.value = false
  }
}

// Update parameter
async function updateParameter(param: EconomicParameter) {
  try {
    const update: ParameterUpdate = {
      PARAMETER: param.PARAMETER as any,
      VALUE: param.VALUE
    }
    
    await simulationAPI.updateParameter(selectedCountry.value, update)
  } catch (error) {
    console.error('Failed to update parameter:', parseAPIError(error))
  }
}

// Handle country change
function handleCountryChange() {
  store.setCountry(selectedCountry.value)
  parameters.value = [] // Clear current parameters
}

// Utility functions for UI
function formatParameterName(param: string): string {
  return param.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}

function isNumericParameter(param: string): boolean {
  const numericParams = ['TargetInterestRate', 'AverageSpendwill', 'AverageBorrowwill']
  return numericParams.includes(param)
}

function getParameterStep(param: string): string {
  if (param.includes('Rate') || param.includes('will')) {
    return '0.01'
  }
  return '1'
}

// Initialize
onMounted(() => {
  store.initialize()
})
</script>

<style scoped>
.simulation-demo {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.demo-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.demo-section h3 {
  margin-top: 0;
  color: #2d3748;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.parameters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.parameter-card {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8f9fa;
}

.parameter-card label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #4a5568;
  font-size: 0.9rem;
}

.store-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 4px;
  border-left: 3px solid #667eea;
}

.label {
  font-weight: 500;
  color: #4a5568;
}

.value {
  font-family: 'Monaco', 'Consolas', monospace;
  color: #2d3748;
  font-weight: 600;
}

.status {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background: #f0f4f8;
  border-left: 3px solid #3182ce;
}

.status.success {
  background: #f0fff4;
  border-left-color: #38a169;
  color: #22543d;
}

.status.error {
  background: #fed7d7;
  border-left-color: #e53e3e;
  color: #742a2a;
}

.error-section {
  border-left: 4px solid #e53e3e;
  background: #fed7d7;
}

.error-details {
  color: #742a2a;
  font-family: 'Monaco', 'Consolas', monospace;
}

.type-examples details {
  margin: 1rem 0;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
}

.type-examples summary {
  padding: 0.75rem;
  background: #f7fafc;
  cursor: pointer;
  font-weight: 500;
}

.type-examples pre {
  margin: 0;
  padding: 1rem;
  background: #2d3748;
  color: #e2e8f0;
  overflow-x: auto;
  font-size: 0.9rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.api-test-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.endpoint-results {
  margin-top: 1rem;
}

.endpoint-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  margin-top: 1rem;
}

.endpoint-result {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.endpoint-result.success {
  background: #f0fff4;
  border-color: #38a169;
}

.endpoint-result.error {
  background: #fed7d7;
  border-color: #e53e3e;
}

.endpoint-result.pending {
  background: #fefefe;
  border-color: #a0aec0;
}

.endpoint-name {
  font-weight: 500;
  font-size: 0.9rem;
}

.endpoint-status {
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: 600;
}

.endpoint-result.success .endpoint-status {
  color: #22543d;
}

.endpoint-result.error .endpoint-status {
  color: #742a2a;
}

.endpoint-result.pending .endpoint-status {
  color: #4a5568;
}

.endpoint-error {
  font-size: 0.75rem;
  color: #742a2a;
  font-family: 'Monaco', 'Consolas', monospace;
}
</style>
