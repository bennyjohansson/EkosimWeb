<template>
  <div class="admin-parameter-card">
    <div class="parameter-header">
      <div class="parameter-info">
        <h3>{{ parameter.label }}</h3>
        <p class="parameter-description">{{ parameter.description }}</p>
      </div>
    </div>
    
    <div class="parameter-content">
      <!-- Input and Button -->
      <div class="input-section">
        <div class="input-group">
          <input
            :id="`admin-param-${parameter.key}`"
            v-model.number="displayValue"
            type="number"
            :step="parameter.step"
            :min="parameter.min"
            :max="parameter.max"
            :placeholder="currentValue"
            class="param-input"
            :disabled="isUpdating"
          />
          <button
            @click="updateParameter"
            :disabled="isUpdating || displayValue === null"
            class="update-button"
          >
            {{ isUpdating ? '...' : 'Set' }}
          </button>
        </div>
        
        <!-- Current value displayed below input -->
        <div class="current-value-hint">
          Current: {{ currentValue }}
        </div>
      </div>

      <!-- Mathematical Formula (minimal styling) -->
      <div v-if="parameter.mathTex" class="math-display">
        <MathFormula :formula="parameter.mathTex" :displayMode="true" />
      </div>
    </div>
    
    <div v-if="updateMessage" class="message" :class="messageType">
      {{ updateMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useSimulationStore } from '@/stores/simulation'
import MathFormula from '@/components/MathFormula.vue'

interface AdminParameter {
  key: string
  label: string
  description: string
  defaultValue: number
  min: number
  max: number
  step: number
  equation: string
  mathTex?: string
}

interface Props {
  parameter: AdminParameter
  selectedCountry: string
}

interface Emits {
  (e: 'parameterUpdated', key: string, value: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const store = useSimulationStore()

// Reactive state
const displayValue = ref<number | null>(null)
const isUpdating = ref(false)
const updateMessage = ref('')
const messageType = ref<'success' | 'error'>('success')

// Computed properties
const currentValue = computed(() => {
  const param = store.parameters.find(p => p.PARAMETER === props.parameter.key)
  if (!param) return props.parameter.defaultValue.toString()
  
  const value = parseFloat(String(param.VALUE))
  return value.toString()
})

// Watch for country changes
watch(() => props.selectedCountry, async (newCountry) => {
  if (newCountry) {
    await store.loadParameters()
    clearMessage()
    resetDisplayValue()
  }
})

// Watch for parameter changes
watch(() => currentValue.value, (newVal) => {
  if (displayValue.value === null) {
    displayValue.value = parseFloat(newVal)
  }
}, { immediate: true })

// Methods
const updateParameter = async () => {
  if (isUpdating.value || displayValue.value === null) return
  
  const inputValue = displayValue.value
  
  // Show warning for values outside recommended range, but continue
  if (inputValue < props.parameter.min || inputValue > props.parameter.max) {
    showMessage(`Warning: Value ${inputValue} is outside recommended range (${props.parameter.min}-${props.parameter.max})`, 'error')
  }
  
  isUpdating.value = true
  clearMessage()
  
  try {
    // Use the existing parameter update method
    await store.updateBankParameter(props.parameter.key as any, inputValue)
    
    emit('parameterUpdated', props.parameter.key, inputValue)
    showMessage(`${props.parameter.label} successfully set to ${inputValue}`, 'success')
    
    // Reload parameters to show updated values
    await store.loadParameters()
    
  } catch (error) {
    console.error(`Failed to update parameter ${props.parameter.key}:`, error)
    showMessage('Failed to update parameter. Please try again.', 'error')
    // Reset input value to current value on error
    resetDisplayValue()
  } finally {
    isUpdating.value = false
  }
}

const resetDisplayValue = () => {
  displayValue.value = parseFloat(currentValue.value)
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

onMounted(() => {
  resetDisplayValue()
})
</script>

<style scoped>
.admin-parameter-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin-bottom: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.admin-parameter-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.parameter-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.parameter-info h3 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 600;
}

.parameter-description {
  margin: 0;
  color: #718096;
  font-size: 0.9rem;
}

.parameter-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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
  font-size: 1rem;
  transition: border-color 0.2s ease;
  min-width: 0;
}

.current-value-hint {
  font-size: 0.75rem;
  color: #718096;
  font-style: italic;
  text-align: center;
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
  min-width: 70px;
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

.math-display {
  margin: 0;
  padding: 0.5rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-size: 0.85rem;
  overflow-x: auto;
  max-width: 100%;
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

/* Responsive Design */
@media (max-width: 767px) {
  .parameter-header {
    margin-bottom: 1rem;
  }
  
  .input-group {
    flex-direction: column;
  }
  
  .update-button {
    width: 100%;
  }
}
</style>
