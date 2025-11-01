<template>
  <div class="company-view">
    <!-- View Header -->
    <div class="view-header">
      <h1 class="view-title">🏢 Company Management</h1>
      <p class="view-subtitle">Monitor and control company parameters, production metrics, and utilization</p>
    </div>
    
    <!-- Country Selection -->
    <div class="country-selector">
      <label for="company-country-select">Country: </label>
      <select 
        id="company-country-select"
        :value="store.simulationState.selectedCountry"
        @change="handleCountryChange"
        class="country-select"
        :disabled="store.isLoading"
      >
        <option value="" disabled>Select a country...</option>
        <option 
          v-for="country in store.availableCountries" 
          :key="country" 
          :value="country"
        >
          {{ country }}
        </option>
      </select>
    </div>
    
    <!-- Main Content Area -->
    <div class="company-content">
      
      <!-- Charts Section -->
      <div class="charts-section">
        <div class="chart-container">
          <CompanyProductionChart 
            v-if="selectedCountry && store.selectedCompany"
            :selectedCountry="selectedCountry"
            :selectedCompany="store.selectedCompany"
            class="production-chart"
          />
        </div>
        
        <div class="chart-container">
          <CompanyUtilizationChart 
            v-if="selectedCountry && store.selectedCompany"
            :selectedCountry="selectedCountry"
            :selectedCompany="store.selectedCompany"
            class="utilization-chart"
          />
        </div>
      </div>
      
      <!-- Parameter Controls Section -->
      <div class="controls-section">
        <CompanyParameterCard 
          v-if="selectedCountry"
          :selectedCountry="selectedCountry"
          class="parameter-controls"
        />
      </div>
      
      <!-- Quick Info Panel -->
      <div v-if="currentCompanyData" class="quick-info-panel">
        <h3 class="info-title">📋 Quick Company Info</h3>
        <div class="info-grid">
          <div class="info-item production">
            <div class="info-icon">🏭</div>
            <div class="info-content">
              <span class="info-label">Production</span>
              <span class="info-value">{{ formatNumber(currentCompanyData.PRODUCTION) }}</span>
            </div>
          </div>
          
          <div class="info-item capacity">
            <div class="info-icon">⚡</div>
            <div class="info-content">
              <span class="info-label">Capacity</span>
              <span class="info-value">{{ formatNumber(currentCompanyData.CAPACITY) }}</span>
            </div>
          </div>
          
          <div class="info-item employees">
            <div class="info-icon">👥</div>
            <div class="info-content">
              <span class="info-label">Employees</span>
              <span class="info-value">{{ formatNumber(currentCompanyData.EMPLOYEES) }}</span>
            </div>
          </div>
          
          <div class="info-item utilization">
            <div class="info-icon">📊</div>
            <div class="info-content">
              <span class="info-label">Utilization</span>
              <span class="info-value utilization-value">{{ utilizationDisplay }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- No Country Selected State -->
      <div v-else class="no-country-state">
        <div class="no-country-content">
          <div class="no-country-icon">🌍</div>
          <h3>No Country Selected</h3>
          <p>Please select a country from the navigation to access company management features.</p>
          <div class="navigation-hint">
            Use the country selector in the main navigation to get started.
          </div>
        </div>
      </div>
      
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading company data...</div>
      </div>
    </div>
    
    <!-- Error State -->
    <div v-if="error" class="error-message">
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <div class="error-text">{{ error }}</div>
        <button @click="retryLoad" class="retry-button">Try Again</button>
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSimulationStore } from '@/stores/simulation'
import CompanyProductionChart from '@/components/CompanyProductionChart.vue'
import CompanyUtilizationChart from '@/components/CompanyUtilizationChart.vue'
import CompanyParameterCard from '@/components/CompanyParameterCard.vue'
import type { CountryCode } from '@/types/simulation'

// Props (if coming from route params)
interface Props {
  country?: CountryCode
}

const props = defineProps<Props>()
const router = useRouter()
const store = useSimulationStore()

// Reactive state
const isLoading = ref(false)
const error = ref('')

// Computed properties following AdminView pattern
const selectedCountry = computed((): CountryCode => {
  // Priority: 1. Props, 2. Store, 3. Route params, 4. Empty string
  return props.country || store.simulationState.selectedCountry || (router.currentRoute.value.params.country as CountryCode) || ''
})

const currentCompanyData = computed(() => {
  return store.latestCompanyData
})

const utilizationDisplay = computed(() => {
  if (!currentCompanyData.value) return 'N/A'
  
  const capacity = currentCompanyData.value.CAPACITY || 0
  const production = currentCompanyData.value.PRODUCTION || 0
  
  if (capacity === 0) return '0.0%'
  return `${((production / capacity) * 100).toFixed(1)}%`
})

// Utility functions
const formatNumber = (value: number | undefined): string => {
  if (value === undefined || value === null) return 'N/A'
  return value.toLocaleString()
}

const retryLoad = async () => {
  error.value = ''
  await initializeView()
}

// Handle country selection change (following AdminView pattern)
const handleCountryChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement
  const newCountry = target.value as CountryCode
  
  if (newCountry && newCountry !== store.simulationState.selectedCountry) {
    await store.setCountry(newCountry)
    await initializeView()
  }
}

// Initialization
const initializeView = async () => {
  if (!selectedCountry.value) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    // Initialize store if needed
    if (!store.simulationState.selectedCountry || store.simulationState.selectedCountry !== selectedCountry.value) {
      await store.setCountry(selectedCountry.value)
    }
    
    // Load available companies
    await store.loadAvailableCompanies()
    
    // Load initial company data if companies available
    if (store.availableCompanies.length > 0 && !store.selectedCompany) {
      const firstCompany = store.availableCompanies[0]
      await store.setSelectedCompany(firstCompany)
      await store.loadCompanyData()
    }
    
    console.log('Company view initialized successfully')
    
  } catch (err) {
    console.error('Failed to initialize company view:', err)
    error.value = 'Failed to load company data. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// Watch for country changes
watch(() => selectedCountry.value, async (newCountry, oldCountry) => {
  if (newCountry && newCountry !== oldCountry) {
    console.log(`Country changed from ${oldCountry} to ${newCountry}`)
    await initializeView()
  }
}, { immediate: false })

// Component lifecycle following AdminView pattern
onMounted(async () => {
  console.log('CompanyView mounted, selectedCountry:', selectedCountry.value)
  
  // Initialize store first
  await store.initialize()
  
  if (selectedCountry.value) {
    await initializeView()
  }
})
</script>

<style scoped>
.company-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

.view-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.view-title {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.view-subtitle {
  margin: 0;
  color: #718096;
  font-size: 1.1rem;
  font-weight: 400;
}

.country-selector {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.country-selector label {
  font-weight: 600;
  color: white;
  font-size: 1.1rem;
}

.country-select {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  background: white;
  font-size: 1rem;
  min-width: 200px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.country-select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
}

.country-select:disabled {
  background: #f0f0f0;
  cursor: not-allowed;
}

.company-content {
  display: grid;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.charts-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.chart-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.controls-section {
  display: grid;
  gap: 2rem;
}

.quick-info-panel {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.info-title {
  margin: 0 0 1.5rem 0;
  color: #2d3748;
  font-size: 1.3rem;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.info-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.info-item.production {
  border-left-color: #10b981;
}

.info-item.capacity {
  border-left-color: #3b82f6;
}

.info-item.employees {
  border-left-color: #f59e0b;
}

.info-item.utilization {
  border-left-color: #8b5cf6;
}

.info-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.info-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.info-label {
  color: #718096;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.info-value {
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 600;
  font-family: 'Monaco', 'Consolas', monospace;
}

.utilization-value {
  color: #8b5cf6;
}

.no-country-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.no-country-content {
  text-align: center;
  padding: 3rem;
  max-width: 400px;
}

.no-country-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.no-country-content h3 {
  margin: 0 0 1rem 0;
  color: #2d3748;
  font-size: 1.5rem;
}

.no-country-content p {
  margin: 0 0 1.5rem 0;
  color: #718096;
  line-height: 1.5;
}

.navigation-hint {
  background: #f7fafc;
  padding: 1rem;
  border-radius: 8px;
  color: #4a5568;
  font-size: 0.9rem;
  border-left: 3px solid #667eea;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.loading-text {
  color: #2d3748;
  font-weight: 500;
}

.error-message {
  background: #fed7d7;
  border: 1px solid #feb2b2;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.error-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.error-text {
  flex: 1;
  color: #742a2a;
  font-weight: 500;
}

.retry-button {
  padding: 0.5rem 1rem;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.retry-button:hover {
  background: #c53030;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .company-view {
    padding: 1rem;
  }
  
  .view-title {
    font-size: 2rem;
  }
  
  .view-subtitle {
    font-size: 1rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .country-selector {
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
  }
  
  .country-select {
    min-width: 100%;
  }
  
  .view-header {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .view-title {
    font-size: 1.8rem;
  }
  
  .info-item {
    flex-direction: column;
    text-align: center;
  }
  
  .error-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>
