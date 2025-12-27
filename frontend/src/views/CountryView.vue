<template>
  <div class="country-view">
    <h1>🏛️ Country Economic Dashboard</h1>
    
    <!-- Country Selection -->
    <div class="country-selector">
      <label for="country-country-select">Country: </label>
      <select 
        id="country-country-select"
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

    <div class="country-grid">
      <!-- Money Distribution Chart -->
      <div class="chart-section">
        <div class="chart-header">
          <h2>💰 Capital Distribution</h2>
          <p class="chart-description">Capital distribution across economic sectors</p>
        </div>
        <CapitalDistributionChart 
          :selectedCountry="store.simulationState.selectedCountry" 
        />
      </div>

      <!-- GDP and Investment Chart -->
      <div class="chart-section">
        <div class="chart-header">
          <h2>📈 GDP & Investment</h2>
          <p class="chart-description">Economic growth and investment trends</p>
        </div>
        <GDPChart 
          :selectedCountry="store.simulationState.selectedCountry" 
        />
      </div>

      <!-- Economic Indicators Timeline -->
      <div class="chart-section">
        <div class="chart-header">
          <h2>📊 Economic Indicators Timeline</h2>
          <p class="chart-description">Key economic metrics over time (Interest Rate, Price ×10, Inflation, Growth)</p>
        </div>
        <EconomicIndicatorsChart 
          :selectedCountry="store.simulationState.selectedCountry" 
        />
      </div>

      <!-- Interest Rate Parameter Control -->
      <div class="chart-section">
        <ParameterControl 
          :selectedCountry="store.simulationState.selectedCountry" 
        />
      </div>
    </div>

    <div v-if="store.isLoading" class="loading">
      <div class="spinner"></div>
      Loading country data...
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSimulationStore } from '@/stores/simulation'
import CapitalDistributionChart from '@/components/CapitalDistributionChart.vue'
import GDPChart from '@/components/GDPChart.vue'
import EconomicIndicatorsChart from '@/components/EconomicIndicatorsChart.vue'
import ParameterControl from '@/components/ParameterControl.vue'

const store = useSimulationStore()

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
</script>

<style scoped>
.country-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

.country-view h1 {
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

.country-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
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
  .country-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1200px) {
  .country-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .country-view {
    padding: 0.5rem;
  }
  
  .country-view h1 {
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
  
  .chart-section {
    padding: 1rem;
  }
  
  .chart-header h2 {
    font-size: 1.3rem;
  }
}
</style>
