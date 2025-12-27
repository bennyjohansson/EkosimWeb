<template>
  <div class="admin-view">
    <h1>🔧 Admin Control Panel</h1>
    
    <!-- Country Selection -->
    <div class="country-selector">
      <label for="admin-country-select">Country: </label>
      <select 
        id="admin-country-select"
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

    <!-- GDP & Investment Analysis Chart -->
    <div class="chart-section">
      <div class="chart-header">
        <h2>� GDP & Investment Analysis</h2>
        <p class="chart-description">Economic performance and investment trends over time</p>
      </div>
      <GDPChart 
        :selectedCountry="store.simulationState.selectedCountry" 
      />
    </div>

    <!-- Admin Parameters Control -->
    <div class="parameters-section">
      <div class="parameters-header">
        <h2>⚙️ Production & Capacity Parameters</h2>
        <p class="parameters-description">Configure core economic simulation parameters with mathematical formulas</p>
      </div>
      
      <div class="parameters-grid">
        <AdminParameterCard
          v-for="param in adminParameters"
          :key="param.key"
          :parameter="param"
          :selectedCountry="store.simulationState.selectedCountry"
          @parameterUpdated="handleParameterUpdate"
        />
      </div>
    </div>

    <div v-if="store.isLoading" class="loading">
      <div class="spinner"></div>
      Loading admin data...
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSimulationStore } from '@/stores/simulation'
import GDPChart from '@/components/GDPChart.vue'
import AdminParameterCard from '@/components/AdminParameterCard.vue'

const store = useSimulationStore()

// Admin parameter configurations with equations (from legacy adminView.html)
const adminParameters = [
  {
    key: 'CapIncreaseParam_1',
    label: 'Cap. Inc Param',
    description: 'Capacity increase parameter',
    defaultValue: 8000,
    min: 1000,
    max: 50000,
    step: 100,
    equation: 'prod = capacity*(2/π)*atan((sk_sum*sk + mot_sum*mot)*ProdParam);',
    mathTex: '\\text{prod} = \\text{capacity} \\times \\frac{2}{\\pi} \\times \\arctan((\\text{sk\\_sum} \\times \\text{sk} + \\text{mot\\_sum} \\times \\text{mot}) \\times \\text{ProdParam})'
  },
  {
    key: 'CapIncreaseRate_1',
    label: 'Cap. Inc Rate',
    description: 'Capacity increase rate',
    defaultValue: 0.0003,
    min: 0.0001,
    max: 0.01,
    step: 0.0001,
    equation: 'CapIncr = CapIncrParam*log(CapIncrRate_1*items + 1);',
    mathTex: '\\text{CapIncr} = \\text{CapIncrParam} \\times \\ln(\\text{CapIncrRate\\_1} \\times \\text{items} + 1)'
  },
  {
    key: 'FacIncreaseRate_1',
    label: 'Factor Inc Rate',
    description: 'Factor increase rate',
    defaultValue: 0.005,
    min: 0.001,
    max: 0.1,
    step: 0.001,
    equation: 'f_incr. = fact_inc_rate*items/capacity;',
    mathTex: '\\text{f\\_incr} = \\text{fact\\_inc\\_rate} \\times \\frac{\\text{items}}{\\text{capacity}}'
  },
  {
    key: 'ItemEfficiencyRate',
    label: 'Item Eff. Rate',
    description: 'Item efficiency rate',
    defaultValue: 0.002,
    min: 0.0001,
    max: 0.01,
    step: 0.0001,
    equation: 'item_efficiency_increase = 0.5*log(ItemEfficiencyRate*items + 1);',
    mathTex: '\\text{item\\_efficiency\\_increase} = 0.5 \\times \\ln(\\text{ItemEfficiencyRate} \\times \\text{items} + 1)'
  },
  {
    key: 'ProductionParameter',
    label: 'Prod. Param.',
    description: 'Production parameter',
    defaultValue: 0.002,
    min: 0.0001,
    max: 0.01,
    step: 0.0001,
    equation: 'capacity_ -= decay_*capacity_;\nprod_const_skill_ -= decay_*prod_const_skill_;\nprod_const_mot_ -= decay_*prod_const_mot_;',
    mathTex: '\\begin{align}\\text{capacity} &\\mathrel{-}= \\text{decay} \\times \\text{capacity} \\\\ \\text{prod\\_const\\_skill} &\\mathrel{-}= \\text{decay} \\times \\text{prod\\_const\\_skill} \\\\ \\text{prod\\_const\\_mot} &\\mathrel{-}= \\text{decay} \\times \\text{prod\\_const\\_mot}\\end{align}'
  }
]

onMounted(async () => {
  await store.initialize()
})

// Handle country selection change
const handleCountryChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement
  const selectedCountry = target.value
  
  if (selectedCountry && selectedCountry !== store.simulationState.selectedCountry) {
    await store.setCountry(selectedCountry)
  }
}

// Handle parameter updates
const handleParameterUpdate = (parameterKey: string, value: number) => {
  console.log(`Admin parameter updated: ${parameterKey} = ${value}`)
  // Additional handling if needed
}
</script>

<style scoped>
.admin-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

.admin-view h1 {
  text-align: center;
  color: #2d3748;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: 700;
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

.parameters-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
}

.parameters-header {
  margin-bottom: 2rem;
  text-align: center;
}

.parameters-header h2 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 600;
}

.parameters-description {
  margin: 0;
  color: #718096;
  font-size: 0.95rem;
  font-style: italic;
}

.parameters-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-size: 1.1rem;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (min-width: 768px) {
  .parameters-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1200px) {
  .parameters-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .admin-view {
    padding: 0.5rem;
  }
  
  .admin-view h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  .country-selector {
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
  }
  
  .country-select {
    min-width: 100%;
  }
  
  .chart-section,
  .parameters-section {
    padding: 1rem;
  }
  
  .parameters-header h2,
  .chart-header h2 {
    font-size: 1.3rem;
  }
}
</style>
