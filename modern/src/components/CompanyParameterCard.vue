<template>
  <div class="company-parameter-card">
    <div class="parameter-header">
      <div class="company-selection">
        <h3>🏢 Company Parameters</h3>
        <div class="company-selector">
          <select 
            :value="selectedCompany"
            @change="handleCompanyChange"
            class="company-select"
            :disabled="isLoading"
          >
            <option value="" disabled>Select a company...</option>
            <option 
              v-for="company in availableCompanies" 
              :key="company" 
              :value="company"
            >
              {{ company }}
            </option>
          </select>
        </div>
      </div>
      
      <!-- Change All Companies Toggle -->
      <div class="change-all-toggle">
        <label class="toggle-label">
          <input 
            type="checkbox" 
            v-model="changeAllCompanies"
            class="toggle-checkbox"
          />
          <span class="toggle-text">Apply to all companies</span>
        </label>
      </div>
    </div>
    
    <div class="parameters-grid">
      <!-- Wage Constant -->
      <div class="parameter-item">
        <div class="parameter-info">
          <label for="wage-const" class="parameter-label">
            💰 Wage Constant (%)
          </label>
          <p class="parameter-description">Share of sales that goes to wages</p>
        </div>
        <div class="input-group">
          <input
            id="wage-const"
            v-model.number="parameterValues.WAGE_CONST"
            type="number"
            step="1"
            min="0"
            max="100"
            :placeholder="getCurrentValue('WAGE_CONST')"
            class="param-input"
            :disabled="isUpdating"
          />
          <button
            @click="updateParameter('WAGE_CONST')"
            :disabled="isUpdating || !hasChanged('WAGE_CONST')"
            class="update-button"
          >
            {{ isUpdating ? '...' : 'OK' }}
          </button>
        </div>
        <div class="current-value-hint">
          Current: {{ getCurrentValue('WAGE_CONST') }}%
        </div>
      </div>

      <!-- Reinvestment Rate (PBR) -->
      <div class="parameter-item">
        <div class="parameter-info">
          <label for="reinvest" class="parameter-label">
            📈 Reinvestment Rate (%)
          </label>
          <p class="parameter-description">Profit Back Ratio - percentage of profit reinvested</p>
        </div>
        <div class="input-group">
          <input
            id="reinvest"
            v-model.number="parameterValues.PBR"
            type="number"
            step="1"
            min="0"
            max="100"
            :placeholder="getCurrentValue('PBR')"
            class="param-input"
            :disabled="isUpdating"
          />
          <button
            @click="updateParameter('PBR')"
            :disabled="isUpdating || !hasChanged('PBR')"
            class="update-button"
          >
            {{ isUpdating ? '...' : 'OK' }}
          </button>
        </div>
        <div class="current-value-hint">
          Current: {{ getCurrentValue('PBR') }}%
        </div>
      </div>

      <!-- Wage Change Limit -->
      <div class="parameter-item">
        <div class="parameter-info">
          <label for="wage-change" class="parameter-label">
            📊 Wage Change Limit (%)
          </label>
          <p class="parameter-description">Maximum wage change percentage per period</p>
        </div>
        <div class="input-group">
          <input
            id="wage-change"
            v-model.number="parameterValues.WAGE_CH"
            type="number"
            step="0.1"
            min="0"
            max="10"
            :placeholder="getCurrentValue('WAGE_CH')"
            class="param-input"
            :disabled="isUpdating"
          />
          <button
            @click="updateParameter('WAGE_CH')"
            :disabled="isUpdating || !hasChanged('WAGE_CH')"
            class="update-button"
          >
            {{ isUpdating ? '...' : 'OK' }}
          </button>
        </div>
        <div class="current-value-hint">
          Current: {{ getCurrentValue('WAGE_CH') }}%
        </div>
      </div>

      <!-- Investment Focus Slider -->
      <div class="parameter-item slider-item">
        <div class="parameter-info">
          <label for="invest-focus" class="parameter-label">
            ⚖️ Investment Focus
          </label>
          <p class="parameter-description">Balance between efficiency and capacity investments</p>
        </div>
        
        <div class="slider-container">
          <div class="slider-labels">
            <span class="slider-label-left">Efficiency</span>
            <span class="slider-value">{{ investFocusDisplay }}%</span>
            <span class="slider-label-right">Capacity</span>
          </div>
          <input
            id="invest-focus"
            v-model.number="parameterValues.CAP_VS_EFF_SPLIT"
            type="range"
            min="0"
            max="100"
            step="5"
            class="param-slider"
            :disabled="isUpdating"
            @change="updateParameter('CAP_VS_EFF_SPLIT')"
          />
        </div>
        
        <div class="current-value-hint">
          Current: {{ getCurrentValue('CAP_VS_EFF_SPLIT') }}% toward capacity
        </div>
      </div>
    </div>

    <!-- Current Company Data Display -->
    <div v-if="currentCompanyData" class="company-data-display">
      <h4>📋 Current Company Status</h4>
      <div class="company-stats">
        <div class="stat-item">
          <span class="stat-label">Capacity:</span>
          <span class="stat-value">{{ currentCompanyData.CAPACITY?.toLocaleString() || 'N/A' }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Production:</span>
          <span class="stat-value">{{ currentCompanyData.PRODUCTION?.toLocaleString() || 'N/A' }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Employees:</span>
          <span class="stat-value">{{ currentCompanyData.EMPLOYEES?.toLocaleString() || 'N/A' }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Utilization:</span>
          <span class="stat-value">{{ utilizationPercent }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="updateMessage" class="message" :class="messageType">
      {{ updateMessage }}
    </div>

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      Loading company data...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive, onMounted } from 'vue'
import { useSimulationStore } from '@/stores/simulation'
import type { CompanyParameterType, CompanyName, CountryCode } from '@/types/simulation'

interface Props {
  selectedCountry: CountryCode
}

const props = defineProps<Props>()
const store = useSimulationStore()

// Reactive state
const selectedCompany = ref<CompanyName>('')
const changeAllCompanies = ref(false)

const parameterValues = reactive<Record<string, number | null>>({
  WAGE_CONST: null,
  PBR: null,
  WAGE_CH: null,
  CAP_VS_EFF_SPLIT: null
})

const isUpdating = ref(false)
const isLoading = ref(false)
const updateMessage = ref('')
const messageType = ref<'success' | 'error'>('success')

// Computed properties
const availableCompanies = computed(() => store.availableCompanies)

const currentCompanyData = computed(() => {
  return store.latestCompanyData
})

const utilizationPercent = computed(() => {
  if (!currentCompanyData.value) return 'N/A'
  
  const capacity = currentCompanyData.value.CAPACITY || 0
  const production = currentCompanyData.value.PRODUCTION || 0
  
  if (capacity === 0) return '0.0%'
  return `${((production / capacity) * 100).toFixed(1)}%`
})

const investFocusDisplay = computed(() => {
  return parameterValues.CAP_VS_EFF_SPLIT || 0
})

// Helper functions
const getCurrentValue = (paramKey: CompanyParameterType): string => {
  if (!currentCompanyData.value) {
    return '0.0'
  }
  
  const value = currentCompanyData.value[paramKey]
  
  if (value === undefined || value === null) {
    return '0.0'
  }
  
  // Convert decimal to percentage for display
  // Backend stores values as decimals (0.0-1.0), we display as percentages
  let percentage: number
  if (typeof value === 'number') {
    percentage = value * 100
  } else {
    const numValue = parseFloat(String(value))
    percentage = numValue * 100
  }
  
  return percentage.toFixed(1)
}

const hasChanged = (paramKey: CompanyParameterType): boolean => {
  const inputValue = parameterValues[paramKey as string]
  if (inputValue === null) return false
  
  const currentValue = parseFloat(getCurrentValue(paramKey))
  return inputValue !== currentValue
}

// Watch for country changes
watch(() => props.selectedCountry, async (newCountry) => {
  if (newCountry) {
    await store.loadAvailableCompanies()
    clearMessage()
    resetParameterValues()
  }
})

// Watch for company selection changes
watch(() => store.selectedCompany, (newCompany) => {
  if (newCompany !== selectedCompany.value) {
    selectedCompany.value = newCompany
    resetParameterValues()
  }
})

// Watch for company data changes to update parameter values
watch(() => store.companyParameters, () => {
  resetParameterValues()
}, { deep: true })

// Watch for currentCompanyData changes (more specific)
watch(() => currentCompanyData.value, (newData) => {
  if (newData) {
    resetParameterValues()
  }
}, { immediate: true })

// Watch for availableCompanies to become populated (handles async loading)
watch(() => store.availableCompanies, async (companies) => {
  console.log('availableCompanies watcher triggered, companies:', companies)
  
  // Only auto-select if we don't have a selected company yet
  if (!selectedCompany.value && Array.isArray(companies) && companies.length > 0) {
    console.log('Auto-selecting first company from watcher:', companies[0])
    selectedCompany.value = companies[0]
    await store.setSelectedCompany(companies[0])
    await store.loadCompanyData()
    resetParameterValues()
  }
}, { immediate: true })

// Methods
const handleCompanyChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement
  const newCompany = target.value as CompanyName
  
  if (newCompany && newCompany !== selectedCompany.value) {
    selectedCompany.value = newCompany
    await store.setSelectedCompany(newCompany)
    clearMessage()
  }
}

const updateParameter = async (paramKey: CompanyParameterType) => {
  if (!hasChanged(paramKey) || isUpdating.value) return
  
  if (!selectedCompany.value && !changeAllCompanies.value) {
    showMessage('Please select a company first', 'error')
    return
  }
  
  isUpdating.value = true
  clearMessage()
  
  try {
    const inputValue = parameterValues[paramKey as string]!
    
    // Convert percentage input to decimal for backend storage
    // All parameters are stored as decimals (0.0-1.0) in the backend
    const backendValue = inputValue / 100
    
    await store.updateCompanyParameter(paramKey, backendValue, changeAllCompanies.value)
    
    const target = changeAllCompanies.value ? 'all companies' : selectedCompany.value
    showMessage(`${paramKey} successfully set to ${inputValue}% for ${target}`, 'success')
    
    // Reload company data to show updated values
    if (selectedCompany.value) {
      await store.loadCompanyData()
    }
    
  } catch (error) {
    console.error(`Failed to update parameter ${paramKey}:`, error)
    showMessage('Failed to update parameter. Please try again.', 'error')
    // Reset input value to current value on error
    resetParameterValue(paramKey)
  } finally {
    isUpdating.value = false
  }
}

const resetParameterValues = () => {
  console.log('resetParameterValues called, currentCompanyData:', currentCompanyData.value)
  
  if (!currentCompanyData.value) {
    console.warn('No current company data available, skipping parameter reset')
    return
  }
  
  console.log('Setting parameter values from company data')
  
  // Reset all parameter values to current company data
  parameterValues.WAGE_CONST = parseFloat(getCurrentValue('WAGE_CONST'))
  parameterValues.PBR = parseFloat(getCurrentValue('PBR'))
  parameterValues.WAGE_CH = parseFloat(getCurrentValue('WAGE_CH'))
  parameterValues.CAP_VS_EFF_SPLIT = parseFloat(getCurrentValue('CAP_VS_EFF_SPLIT'))
  
  console.log('Parameter values set:', {
    WAGE_CONST: parameterValues.WAGE_CONST,
    PBR: parameterValues.PBR,
    WAGE_CH: parameterValues.WAGE_CH,
    CAP_VS_EFF_SPLIT: parameterValues.CAP_VS_EFF_SPLIT
  })
}

const resetParameterValue = (paramKey: CompanyParameterType) => {
  const currentValue = getCurrentValue(paramKey)
  parameterValues[paramKey as string] = parseFloat(currentValue)
}

const showMessage = (message: string, type: 'success' | 'error') => {
  updateMessage.value = message
  messageType.value = type
  
  // Clear message after 3 seconds
  setTimeout(() => {
    clearMessage()
  }, 3000)
}

const clearMessage = () => {
  updateMessage.value = ''
}

// Initialize component
onMounted(async () => {
  console.log('CompanyParameterCard mounted')
  isLoading.value = true
  
  try {
    // Load available companies - the watcher will handle selection
    await store.loadAvailableCompanies()
    console.log('Available companies load initiated')
  } catch (error) {
    console.error('Failed to initialize company parameter card:', error)
    showMessage('Failed to load company data', 'error')
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.company-parameter-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin-bottom: 1rem;
}

.parameter-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.company-selection h3 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-size: 1.3rem;
  font-weight: 600;
}

.company-selector {
  margin-top: 0.5rem;
}

.company-select {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  font-size: 1rem;
  min-width: 200px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.company-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.company-select:disabled {
  background: #f7fafc;
  cursor: not-allowed;
}

.change-all-toggle {
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  color: #4a5568;
}

.toggle-checkbox {
  cursor: pointer;
}

.toggle-text {
  font-size: 0.9rem;
}

.parameters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.parameter-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.parameter-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.parameter-label {
  color: #2d3748;
  font-weight: 600;
  font-size: 1rem;
  margin: 0;
}

.parameter-description {
  margin: 0;
  color: #718096;
  font-size: 0.85rem;
  font-style: italic;
}

.input-group {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}

.param-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
  min-width: 0;
}

.param-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.param-input:disabled {
  background: #f7fafc;
  color: #a0aec0;
  cursor: not-allowed;
}

.update-button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 60px;
}

.update-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.update-button:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.current-value-hint {
  font-size: 0.75rem;
  color: #718096;
  font-style: italic;
  text-align: center;
}

/* Slider-specific styles */
.slider-item {
  grid-column: 1 / -1; /* Span full width */
}

.slider-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 500;
}

.slider-label-left {
  color: #10b981;
}

.slider-value {
  color: #2d3748;
  font-weight: 600;
  background: #e2e8f0;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-family: 'Monaco', 'Consolas', monospace;
}

.slider-label-right {
  color: #3b82f6;
}

.param-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #e2e8f0;
  outline: none;
  cursor: pointer;
}

.param-slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.param-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Company data display */
.company-data-display {
  margin-top: 1rem;
  padding: 1rem;
  background: #f1f5f9;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.company-data-display h4 {
  margin: 0 0 1rem 0;
  color: #2d3748;
  font-size: 1rem;
  font-weight: 600;
}

.company-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  border-left: 3px solid #667eea;
}

.stat-label {
  font-weight: 500;
  color: #4a5568;
  font-size: 0.85rem;
}

.stat-value {
  font-family: 'Monaco', 'Consolas', monospace;
  color: #2d3748;
  font-weight: 600;
  font-size: 0.85rem;
}

.message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 500;
  text-align: center;
}

.message.success {
  background: #f0fff4;
  color: #22543d;
  border: 1px solid #9ae6b4;
}

.message.error {
  background: #fed7d7;
  color: #742a2a;
  border: 1px solid #feb2b2;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-size: 1rem;
  color: #666;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .parameter-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .parameters-grid {
    grid-template-columns: 1fr;
  }
  
  .company-select {
    min-width: 100%;
  }
  
  .input-group {
    flex-direction: column;
  }
  
  .update-button {
    width: 100%;
  }
  
  .company-stats {
    grid-template-columns: 1fr;
  }
}
</style>
