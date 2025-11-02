<template>
  <div class="bank-view">
    <!-- View Header -->
    <div class="view-header">
      <h1 class="view-title">🏦 Bank Management</h1>
      <p class="view-subtitle">Monitor and control banking parameters, interest rates, and capital ratios</p>
    </div>
    
    <!-- Country Selection -->
    <div class="country-selector">
      <label for="bank-country-select">Country: </label>
      <select 
        id="bank-country-select"
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
    <div class="bank-content">
      
      <!-- Charts Section -->
      <div class="charts-section">
        <!-- Capital Distribution Chart -->
        <div class="chart-section">
          <div class="chart-header">
            <h2>💰 Capital Distribution</h2>
            <p class="chart-description">Capital distribution across economic sectors and banking system</p>
          </div>
          <CapitalDistributionChart 
            :selectedCountry="store.simulationState.selectedCountry" 
          />
        </div>

        <!-- Economic Indicators Chart -->
        <div class="chart-section">
          <div class="chart-header">
            <h2>📊 Economic Indicators Timeline</h2>
            <p class="chart-description">Key economic metrics over time (Interest Rate, Price ×10, Inflation, Growth)</p>
          </div>
          <EconomicIndicatorsChart 
            :selectedCountry="store.simulationState.selectedCountry" 
          />
        </div>

        <!-- Bank Capital Chart -->
        <div class="chart-section">
          <div class="chart-header">
            <h2>🏦 Banking Capital & Metrics</h2>
            <p class="chart-description">Bank capital ratios, reserves and financial stability indicators</p>
          </div>
          <BankChart 
            :selectedCountry="store.simulationState.selectedCountry" 
          />
        </div>

        <!-- Interest Rate Chart -->
        <div class="chart-section">
          <div class="chart-header">
            <h2>📈 Interest Rate Analysis</h2>
            <p class="chart-description">Market interest rates and monetary policy trends</p>
          </div>
          <BankChartInterestRate 
            ref="interestRateChart"
            :selectedCountry="store.simulationState.selectedCountry" 
          />
        </div>
      </div>

      <!-- Parameter Controls Section -->
      <div class="controls-section">
        <div class="controls-header">
          <h2>⚙️ Banking Parameters</h2>
          <p class="controls-description">Configure interest rates and capital requirements</p>
        </div>
        
        <div class="parameter-cards">
          <div class="parameter-card">
            <div class="parameter-header">
              <h3>📊 Market Interest Rate</h3>
              <p class="parameter-description">Current market-determined interest rate</p>
            </div>
            <div class="parameter-content">
              <div class="current-value">
                <span class="value">{{ marketInterestRate }}%</span>
                <span class="label">Current Rate</span>
              </div>
              <button 
                @click="useMarketRate" 
                class="btn btn-secondary"
                :disabled="isUpdating"
              >
                Use Market Rate
              </button>
            </div>
          </div>

          <div class="parameter-card">
            <div class="parameter-header">
              <h3>🎯 Target Interest Rate</h3>
              <p class="parameter-description">Set custom target interest rate policy</p>
            </div>
            <div class="parameter-content">
              <div class="current-value">
                <span class="value">{{ targetInterestRate }}%</span>
                <span class="label">Current Target</span>
              </div>
              <div class="input-group">
                <input 
                  v-model.number="newTargetInterestRate" 
                  type="number" 
                  class="parameter-input" 
                  step="0.1"
                  :placeholder="targetInterestRate"
                  :value="newTargetInterestRate || targetInterestRate"
                />
                <span class="input-suffix">%</span>
                <button 
                  @click="updateTargetRate" 
                  class="btn btn-primary"
                  :disabled="isUpdating || (!newTargetInterestRate && newTargetInterestRate !== 0)"
                >
                  Set Rate
                </button>
              </div>
            </div>
          </div>

          <div class="parameter-card">
            <div class="parameter-header">
              <h3>🏛️ Capital Reserve Ratio</h3>
              <p class="parameter-description">Required capital as percentage of total assets</p>
            </div>
            <div class="parameter-content">
              <div class="current-value">
                <span class="value">{{ capitalRatio }}%</span>
                <span class="label">Current Ratio</span>
              </div>
              <div class="input-group">
                <input 
                  v-model.number="newCapitalRatio" 
                  type="number" 
                  class="parameter-input" 
                  step="0.1"
                  :placeholder="capitalRatio"
                  :value="newCapitalRatio || capitalRatio"
                />
                <span class="input-suffix">%</span>
                <button 
                  @click="updateCapitalRatio" 
                  class="btn btn-primary"
                  :disabled="isUpdating || (!newCapitalRatio && newCapitalRatio !== 0)"
                >
                  Set Ratio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="store.isLoading" class="loading">
      Loading bank data...
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref, nextTick } from 'vue'
import { useSimulationStore } from '@/stores/simulation'
import CapitalDistributionChart from '@/components/CapitalDistributionChart.vue'
import EconomicIndicatorsChart from '@/components/EconomicIndicatorsChart.vue'
import BankChart from '@/components/BankChart.vue'
import BankChartInterestRate from '@/components/BankChartInterestRate.vue'

const store = useSimulationStore()

// Template refs
const interestRateChart = ref(null)

// Reactive variables for form inputs
const newTargetInterestRate = ref<number | null>(null)
const newCapitalRatio = ref<number | null>(null)
const isUpdating = ref(false)

// Computed properties for displaying current values
const targetInterestRate = computed(() => {
  const param = store.parameters.find(p => p.PARAMETER === 'TargetInterestRate')
  return param ? (parseFloat(String(param.VALUE)) * 100).toFixed(2) : '0.00'
})

const marketInterestRate = computed(() => {
  // Use the exact same logic as BankChartInterestRate component
  if (store.timeData.length === 0) return '0.00'
  const latest = store.timeData[store.timeData.length - 1]
  
  // Debug logging
  console.log('BankView - timeData length:', store.timeData.length)
  console.log('BankView - latest timeData:', latest)
  
  // TimeDataPoint should have INTEREST_RATE field based on legacy code
  const rate = (latest as any).INTEREST_RATE
  console.log('BankView - INTEREST_RATE value:', rate)
  
  return (rate ? (rate * 100).toFixed(2) : '0.00')
})

const capitalRatio = computed(() => {
  // Try both parameter names for backward compatibility
  const param = store.parameters.find(p => p.PARAMETER === 'CapitalReserveRatio') ||
                store.parameters.find(p => p.PARAMETER === 'CapitalRatio')
  return param ? (parseFloat(String(param.VALUE)) * 100).toFixed(2) : '0.00'
})

onMounted(async () => {
  await store.initialize()
  await store.loadBankData()
  await store.loadParameters()
  await store.loadTimeDataUpdates()
})

// Cleanup chart on unmount (not needed anymore but keeping for clean structure)
onUnmounted(() => {
  // No chart cleanup needed since we're using MoneyChart component
})

// Handle using market rate
const useMarketRate = async () => {
  if (isUpdating.value) return
  
  isUpdating.value = true
  try {
    // Set InterestRateMethod to 1 for market rate (from legacy code)
    await store.updateBankParameter('InterestRateMethod', 1)
    console.log('Switched to market interest rate method')
    // Refresh parameters to show updated values
    await store.loadParameters()
  } catch (error) {
    console.error('Failed to switch to market rate:', error)
  } finally {
    isUpdating.value = false
  }
}

// Handle individual parameter updates
const updateTargetRate = async () => {
  if (isUpdating.value || (!newTargetInterestRate.value && newTargetInterestRate.value !== 0)) return
  
  isUpdating.value = true
  try {
    // Set InterestRateMethod to 2 for target rate (from legacy code)
    await store.updateBankParameter('InterestRateMethod', 2)
    // Set the target rate value (convert percentage to decimal)
    await store.updateBankParameter('TargetInterestRate', newTargetInterestRate.value / 100)
    console.log(`Target interest rate set to ${newTargetInterestRate.value}%`)
    newTargetInterestRate.value = null
    await nextTick()
    await store.loadParameters()
  } catch (error) {
    console.error('Failed to update target rate:', error)
  } finally {
    isUpdating.value = false
  }
}

const updateCapitalRatio = async () => {
  if (isUpdating.value || (!newCapitalRatio.value && newCapitalRatio.value !== 0)) return
  
  isUpdating.value = true
  try {
    // Use CapitalReserveRatio parameter name from legacy code (convert percentage to decimal)
    await store.updateBankParameter('CapitalReserveRatio', newCapitalRatio.value / 100)
    console.log(`Capital reserve ratio set to ${newCapitalRatio.value}%`)
    newCapitalRatio.value = null
    await nextTick()
    await store.loadParameters()
  } catch (error) {
    console.error('Failed to update capital ratio:', error)
  } finally {
    isUpdating.value = false
  }
}

// Handle country selection change
const handleCountryChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement
  const selectedCountry = target.value
  
  if (selectedCountry && selectedCountry !== store.simulationState.selectedCountry) {
    await store.setCountry(selectedCountry)
  }
}
</script>

<style scoped>
.bank-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

/* View Header */
.view-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.view-title {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.view-subtitle {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

/* Country Selection */
.country-selector {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.country-selector label {
  font-weight: 600;
  color: #495057;
  font-size: 1rem;
}

.country-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: white;
  font-size: 1rem;
  min-width: 200px;
  transition: border-color 0.2s;
}

.country-select:focus {
  outline: none;
  border-color: #667eea;
}

.country-select:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

/* Main Content */
.bank-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

/* Charts Section */
.charts-section {
  display: flex;
  flex-direction: column;
  gap: 0; /* Remove gap since chart-section has margin-bottom */
}

.chart-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.chart-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.chart-header {
  margin-bottom: 1rem;
  text-align: center;
}

.chart-header h2 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 600;
}

.chart-description {
  margin: 0;
  color: #718096;
  font-size: 0.95rem;
  font-style: italic;
}

/* Controls Section */
.controls-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.controls-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f8f9fa;
}

.controls-header h2 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

.controls-description {
  margin: 0;
  color: #6c757d;
  font-size: 0.95rem;
}

/* Parameter Cards */
.parameter-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.parameter-card {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.parameter-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1);
}

.parameter-header {
  margin-bottom: 1rem;
}

.parameter-header h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

.parameter-description {
  margin: 0;
  color: #6c757d;
  font-size: 0.85rem;
  line-height: 1.4;
}

.parameter-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.current-value {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 2px solid #27ae60;
}

.current-value .value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #27ae60;
  margin-bottom: 0.25rem;
}

.current-value .label {
  font-size: 0.8rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.parameter-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.parameter-input:focus {
  outline: none;
  border-color: #667eea;
}

.input-suffix {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.9rem;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
  color: white;
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(149, 165, 166, 0.3);
}

.btn-secondary:disabled {
  background: #ecf0f1;
  color: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Loading */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.1rem;
  color: #6c757d;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .parameter-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .bank-view {
    padding: 0.5rem;
  }
  
  .view-header {
    padding: 1.5rem 1rem;
    margin-bottom: 1.5rem;
  }
  
  .view-title {
    font-size: 2rem;
  }
  
  .view-subtitle {
    font-size: 1rem;
  }
  
  .country-selector {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
  }
  
  .country-select {
    width: 100%;
    min-width: 0;
  }
  
  .bank-content {
    gap: 1.5rem;
  }
  
  .parameter-cards {
    gap: 1rem;
  }
  
  .parameter-card {
    padding: 1rem;
  }
  
  .input-group {
    flex-wrap: wrap;
  }
  
  .parameter-input {
    min-width: 100px;
  }
}

@media (max-width: 480px) {
  .view-title {
    font-size: 1.75rem;
  }
  
  .current-value .value {
    font-size: 1.25rem;
  }
  
  .btn {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
}
</style>
