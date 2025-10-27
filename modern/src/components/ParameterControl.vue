<template>
  <div class="parameter-control">
    <div class="parameter-header">
      <h3>⚙️ Parameter Control</h3>
      <p class="parameter-description">Adjust key economic policy parameters</p>
    </div>
    
    <div class="parameters-grid">
      <div 
        v-for="param in parameterConfigs" 
        :key="param.key"
        class="parameter-item"
      >
        <label 
          :for="`param-${param.key}`"
          class="parameter-label"
          :title="param.tooltip"
        >
          {{ param.label }}
        </label>
        <div class="input-group">
          <input
            :id="`param-${param.key}`"
            v-model.number="parameterValues[param.key as string]"
            type="number"
            :step="param.step"
            :min="param.min"
            :max="param.max"
            :placeholder="getCurrentValue(param.key)"
            class="param-input"
            :disabled="isUpdating"
          />
          <button
            @click="updateParameter(param.key)"
            :disabled="isUpdating || !hasChanged(param.key)"
            class="update-button"
          >
            {{ isUpdating ? '...' : 'Set' }}
          </button>
        </div>
        <div class="current-value-hint">
          Current: {{ getCurrentValue(param.key) }}{{ param.unit }}
        </div>
      </div>
    </div>
    
    <div v-if="updateMessage" class="message" :class="messageType">
      {{ updateMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { useSimulationStore } from '@/stores/simulation'
import type { EconomicParameterType } from '@/types/simulation'

interface Props {
  selectedCountry: string
}

interface ParameterConfig {
  key: EconomicParameterType
  label: string
  tooltip: string
  defaultValue: number
  min: number
  max: number
  step: number
  unit: string
}

const props = defineProps<Props>()
const store = useSimulationStore()

// Parameter configurations based on legacy tooltips and values
const parameterConfigs: ParameterConfig[] = [
  {
    key: 'TargetInterestRate',
    label: 'Interest %',
    tooltip: 'Target interest rate in model',
    defaultValue: 4,
    min: 0,
    max: 50,
    step: 0.1,
    unit: '%'
  },
  {
    key: 'AverageSpendwill',
    label: 'Spendwill %',
    tooltip: 'Average share of available capital a consumer spend. Deposit amount sensitive to interest rate.',
    defaultValue: 70,
    min: 0,
    max: 100,
    step: 1,
    unit: '%'
  },
  {
    key: 'AverageBorrowwill',
    label: 'Borrowwill %',
    tooltip: 'Parameter to control how much a consumer borrows. Correlated with interest rate.',
    defaultValue: 1,
    min: 0,
    max: 50,
    step: 0.1,
    unit: '%'
  },
  {
    key: 'InflationTarget',
    label: 'Inflation Target %',
    tooltip: 'Indicator of target wage-inflation. Controlled by money printing for budget deficit (QE).',
    defaultValue: 1,
    min: 0,
    max: 20,
    step: 0.1,
    unit: '%'
  },
  {
    key: 'IncomeTax',
    label: 'Income Tax %',
    tooltip: 'Income tax as percentage of salary. Distributed evenly among citizens.',
    defaultValue: 30,
    min: 0,
    max: 100,
    step: 1,
    unit: '%'
  },
  {
    key: 'CapitalGainsTax',
    label: 'Capital Gains Tax %',
    tooltip: 'Capital gains tax as percentage of dividends. Distributed evenly among citizens.',
    defaultValue: 30,
    min: 0,
    max: 100,
    step: 1,
    unit: '%'
  },
  {
    key: 'BudgetBalance',
    label: 'Budget Balance %',
    tooltip: 'Budget balance. Surplus paid directly to consumers as social benefit. Works similar to inflation target.',
    defaultValue: 0,
    min: -50,
    max: 50,
    step: 0.1,
    unit: '%'
  }
]

// Reactive state
const parameterValues = reactive<Record<string, number | null>>({
  TargetInterestRate: null,
  AverageSpendwill: null,
  AverageBorrowwill: null,
  InflationTarget: null,
  IncomeTax: null,
  CapitalGainsTax: null,
  BudgetBalance: null
})

const isUpdating = ref(false)
const updateMessage = ref('')
const messageType = ref<'success' | 'error'>('success')

// Helper functions
const getCurrentValue = (paramKey: EconomicParameterType): string => {
  const param = store.parameters.find(p => p.PARAMETER === paramKey)
  if (!param) return '0.0'
  
  const value = parseFloat(String(param.VALUE)) * 100 // Convert to percentage
  return value.toFixed(1)
}

const hasChanged = (paramKey: EconomicParameterType): boolean => {
  const inputValue = parameterValues[paramKey as string]
  if (inputValue === null) return false
  
  const currentValue = parseFloat(getCurrentValue(paramKey))
  const config = parameterConfigs.find(c => c.key === paramKey)
  
  return inputValue !== currentValue && 
         inputValue >= config!.min && 
         inputValue <= config!.max
}

// Watch for country changes to reload parameters and reset inputs
watch(() => props.selectedCountry, async (newCountry) => {
  if (newCountry) {
    await store.loadParameters()
    clearMessage()
    resetParameterValues()
  }
})

// Watch for parameter changes to update input values
watch(() => store.parameters, () => {
  resetParameterValues()
}, { deep: true })

// Methods
const updateParameter = async (paramKey: EconomicParameterType) => {
  if (!hasChanged(paramKey) || isUpdating.value) return
  
  isUpdating.value = true
  clearMessage()
  
  try {
    const inputValue = parameterValues[paramKey as string]!
    const config = parameterConfigs.find(c => c.key === paramKey)!
    
    // Handle special case for Interest Rate (needs InterestRateMethod = 2)
    if (paramKey === 'TargetInterestRate') {
      await store.updateBankParameter('InterestRateMethod', 2)
    }
    
    // Convert percentage to decimal for backend
    await store.updateBankParameter(paramKey, inputValue / 100)
    
    showMessage(`${config.label} successfully set to ${inputValue}${config.unit}`, 'success')
    
    // Reload parameters to show updated values
    await store.loadParameters()
    
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
  parameterConfigs.forEach(config => {
    resetParameterValue(config.key)
  })
}

const resetParameterValue = (paramKey: EconomicParameterType) => {
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

// Initialize parameter values when component mounts
resetParameterValues()
</script>

<style scoped>
.parameter-control {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin-bottom: 1rem;
}

.parameter-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.parameter-header h3 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-size: 1.3rem;
  font-weight: 600;
}

.parameter-description {
  margin: 0;
  color: #718096;
  font-size: 0.9rem;
  font-style: italic;
}

.parameters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.parameter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.parameter-label {
  color: #4a5568;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: help;
  position: relative;
}

.parameter-label:hover {
  color: #2d3748;
}

.input-group {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}

.param-input {
  flex: 1;
  padding: 0.6rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
  min-width: 0; /* Allows flex item to shrink below content size */
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
  padding: 0.6rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-size: 0.85rem;
  min-width: 50px;
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

.message {
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 500;
  text-align: center;
  margin-top: 1rem;
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

/* Responsive Design */
@media (max-width: 768px) {
  .parameter-control {
    padding: 1rem;
  }
  
  .parameters-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .input-group {
    flex-direction: column;
  }
  
  .update-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .parameters-grid {
    grid-template-columns: 1fr;
  }
  
  .parameter-header h3 {
    font-size: 1.1rem;
  }
  
  .param-input {
    font-size: 0.85rem;
  }
}
</style>
