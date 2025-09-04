<template>
  <div class="bank-view">
    <h1>🏦 Bank Management</h1>
    
    <div class="bank-compact-layout">
      <!-- Compact Parameter Controls -->
      <div class="controls-compact">
        <div class="control-group-compact">
          <span class="control-label">Market Rate</span>
          <span class="current-value-compact">{{ marketInterestRate }}%</span>
          <button 
            @click="useMarketRate" 
            class="btn-compact btn-secondary"
            :disabled="isUpdating"
          >
            Use
          </button>
        </div>
        
        <div class="control-group-compact">
          <span class="control-label">Target Rate</span>
          <input 
            v-model.number="newTargetInterestRate" 
            type="number" 
            class="control-input" 
            step="0.1"
            :placeholder="targetInterestRate"
            :value="newTargetInterestRate || targetInterestRate"
          />
          <span class="current-value-compact">{{ targetInterestRate }}%</span>
          <button 
            @click="updateTargetRate" 
            class="btn-compact btn-primary"
            :disabled="isUpdating || (!newTargetInterestRate && newTargetInterestRate !== 0)"
          >
            Set
          </button>
        </div>
        
        <div class="control-group-compact">
          <span class="control-label">Capital Ratio</span>
          <input 
            v-model.number="newCapitalRatio" 
            type="number" 
            class="control-input" 
            step="0.1"
            :placeholder="capitalRatio"
            :value="newCapitalRatio || capitalRatio"
          />
          <span class="current-value-compact">{{ capitalRatio }}%</span>
          <button 
            @click="updateCapitalRatio" 
            class="btn-compact btn-primary"
            :disabled="isUpdating || (!newCapitalRatio && newCapitalRatio !== 0)"
          >
            Set
          </button>
        </div>
      </div>

      <!-- Chart Section -->
      <div class="chart-compact">
        <h3>Bank Performance & Economic Data</h3>
        <MoneyChart :selectedCountry="store.simulationState.selectedCountry" />
      </div>
    </div>

    <div v-if="store.isLoading" class="loading">
      Loading bank data...
    </div>
    
    <!-- Remove simulationError block as it does not exist in the store -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref, nextTick, watch } from 'vue'
import { useSimulationStore } from '@/stores/simulation'
import MoneyChart from '@/components/MoneyChart.vue'

const store = useSimulationStore()

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
  const param = store.parameters.find(p => p.PARAMETER === 'MarketInterestRate')
  return param ? (parseFloat(String(param.VALUE)) * 100).toFixed(2) : '0.00'
})

const capitalRatio = computed(() => {
  // Try both parameter names for backward compatibility
  const param = store.parameters.find(p => p.PARAMETER === 'CapitalReserveRatio') ||
                store.parameters.find(p => p.PARAMETER === 'CapitalRatio')
  return param ? (parseFloat(String(param.VALUE)) * 100).toFixed(2) : '0.00'
})

const interestRateMethod = computed(() => {
  const param = store.parameters.find(p => p.PARAMETER === 'InterestRateMethod')
  if (!param) return 'Unknown'
  const method = parseFloat(String(param.VALUE))
  return method === 1 ? 'Target' : method === 2 ? 'Market' : 'Manual'
})

onMounted(async () => {
  await store.loadBankData()
  await store.loadParameters()
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
</script>

<style scoped>
.bank-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

.bank-compact-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem;
  overflow: hidden;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.controls-compact {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  max-width: 100%;
  overflow: hidden;
}

.control-group-compact {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  background: #f8f9fa;
  flex-wrap: nowrap;
  min-width: 0;
}

.control-label {
  min-width: 100px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
  flex-shrink: 0;
}

.control-input {
  width: 80px;
  flex-shrink: 0;
  padding: 0.4rem 0.6rem;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 0.9rem;
}

.current-value-compact {
  min-width: 70px;
  flex-shrink: 0;
  text-align: center;
  font-weight: 600;
  color: #27ae60;
  background: white;
  padding: 0.3rem 0.5rem;
  border-radius: 3px;
  border: 1px solid #27ae60;
  font-size: 0.85rem;
}

.btn-compact {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s;
  min-width: 60px;
  flex-shrink: 0;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
  transform: translateY(-1px);
}

.btn-secondary:disabled {
  background-color: #ecf0f1;
  color: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.chart-compact {
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

.chart-compact h3 {
  margin: 0 0 0.75rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  text-align: center;
  font-weight: 600;
}

.chart-wrapper {
  height: 300px;
  position: relative;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
  font-size: 1rem;
  color: #666;
}

.error {
  color: #e74c3c;
  text-align: center;
  padding: 0.75rem;
  background-color: #fdf2f2;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .bank-view {
    padding: 0.5rem;
  }
  
  .stats-row {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
    padding: 0.75rem;
  }
  
  .controls-compact {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 0.75rem;
  }
  
  .control-group-compact {
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 0.4rem;
    padding: 0.6rem;
  }
  
  .control-label {
    min-width: auto;
    flex: 0 0 100%;
    text-align: left;
    margin-bottom: 0.25rem;
  }
  
  .control-input {
    width: 70px;
    flex-shrink: 0;
  }
  
  .current-value-compact {
    min-width: 65px;
    flex-shrink: 0;
  }
  
  .btn-compact {
    min-width: 55px;
    flex-shrink: 0;
  }
  
  .chart-wrapper {
    height: 250px;
  }
}

@media (max-width: 480px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
}
</style>
