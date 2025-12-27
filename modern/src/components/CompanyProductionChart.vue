<template>
  <div class="company-production-chart">
    <div class="chart-header">
      <h3>🏭 Company Production Metrics</h3>
      <div class="chart-controls">
        <button @click="startAutoUpdate" :disabled="isAutoUpdating" class="btn btn-small">
          {{ isAutoUpdating ? 'Auto-updating...' : 'Start Auto-Update' }}
        </button>
        <button @click="stopAutoUpdate" :disabled="!isAutoUpdating" class="btn btn-small">
          Stop Auto-Update
        </button>
      </div>
      
      <!-- Series Visibility Controls -->
      <div class="series-controls">
        <h4>📊 Data Series</h4>
        <div class="series-checkboxes">
          <label class="series-checkbox">
            <input 
              type="checkbox" 
              v-model="seriesVisibility.capacity"
              @change="updateChart"
            />
            <span class="series-color" style="background-color: rgb(34, 197, 94)"></span>
            Capacity
          </label>
          <label class="series-checkbox">
            <input 
              type="checkbox" 
              v-model="seriesVisibility.production"
              @change="updateChart"
            />
            <span class="series-color" style="background-color: rgb(59, 130, 246)"></span>
            Production
          </label>
          <label class="series-checkbox">
            <input 
              type="checkbox" 
              v-model="seriesVisibility.employees"
              @change="updateChart"
            />
            <span class="series-color" style="background-color: rgb(168, 85, 247)"></span>
            Employees ×1000
          </label>
        </div>
        
        <!-- Reset button -->
        <div class="reset-controls">
          <button @click="resetToDefaults" class="btn btn-reset">
            Reset to Defaults
          </button>
        </div>
        
        <!-- Preset buttons -->
        <div class="preset-controls">
          <h4>Quick Presets:</h4>
          <div class="preset-buttons">
            <button @click="applyPreset('production')" class="btn btn-preset">
              Production Focus
            </button>
            <button @click="applyPreset('capacity')" class="btn btn-preset">
              Capacity Focus
            </button>
            <button @click="applyPreset('all')" class="btn btn-preset">
              All Metrics
            </button>
            <button @click="applyPreset('minimal')" class="btn btn-preset">
              Minimal View
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
    
    <div class="chart-info">
      <div class="info-grid">
        <div class="info-item">
          <span class="label">Data Points:</span>
          <span class="value">{{ dataPoints.length }}</span>
        </div>
        <div class="info-item">
          <span class="label">Latest Update:</span>
          <span class="value">{{ latestTimestamp }}</span>
        </div>
        <div class="info-item">
          <span class="label">Company:</span>
          <span class="value">{{ selectedCompany }}</span>
        </div>
        <div class="info-item">
          <span class="label">Latest Production:</span>
          <span class="value">{{ latestProduction || 'N/A' }}</span>
        </div>
        <div class="info-item">
          <span class="label">Latest Capacity:</span>
          <span class="value">{{ latestCapacity || 'N/A' }}</span>
        </div>
        <div class="info-item">
          <span class="label">Chart Status:</span>
          <span class="value">{{ chart ? 'Initialized' : 'Not Initialized' }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      <strong>Error:</strong> {{ error }}
    </div>

    <!-- Debug: Show raw data structure -->
    <div v-if="dataPoints.length > 0" class="debug-section">
      <details>
        <summary>🔍 Debug: Company Production Data (click to expand)</summary>
        <div class="debug-content">
          <h4>Latest Data Point:</h4>
          <pre>{{ JSON.stringify(dataPoints[dataPoints.length - 1], null, 2) }}</pre>
          
          <h4>Available Fields:</h4>
          <div class="field-list">
            <span 
              v-for="field in Object.keys(dataPoints[dataPoints.length - 1] || {})" 
              :key="field"
              class="field-tag"
            >
              {{ field }}
            </span>
          </div>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import {
  Chart,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  type ChartConfiguration
} from 'chart.js'
import { useSimulationStore } from '@/stores/simulation'
import type { CountryCode, CompanyName, CompanyTimeSeriesData } from '@/types/simulation'

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

// Props
interface Props {
  selectedCountry: CountryCode
  selectedCompany: CompanyName
}

const props = withDefaults(defineProps<Props>(), {
  selectedCountry: 'Bennyland',
  selectedCompany: ''
})

// Store
const store = useSimulationStore()

// Template refs
const chartCanvas = ref<HTMLCanvasElement>()

// Reactive state
const dataPoints = ref<CompanyTimeSeriesData[]>([])
const isLoading = ref(false)
const isAutoUpdating = ref(false)
const error = ref<string>('')
let chart: Chart | null = null
let updateInterval: ReturnType<typeof setInterval> | null = null

// Series visibility controls
const seriesVisibility = ref({
  capacity: true,
  production: true,
  employees: true
})

// localStorage functions for persistence
const STORAGE_KEY = 'companyProductionChartConfig'

const saveConfiguration = () => {
  try {
    const config = {
      visibleSeries: { ...seriesVisibility.value },
      lastUsed: new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    console.log('Company chart configuration saved:', config)
  } catch (error) {
    console.warn('Failed to save company chart configuration:', error)
  }
}

const loadConfiguration = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const config = JSON.parse(saved)
      if (config.visibleSeries) {
        seriesVisibility.value = { ...config.visibleSeries }
        console.log('Company chart configuration loaded:', config)
        return true
      }
    }
  } catch (error) {
    console.warn('Failed to load company chart configuration:', error)
  }
  return false
}

const resetToDefaults = () => {
  const defaults = {
    capacity: true,
    production: true,
    employees: true
  }
  
  seriesVisibility.value = { ...defaults }
  
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log('Company chart configuration reset to defaults')
  } catch (error) {
    console.warn('Failed to clear saved configuration:', error)
  }
}

// Preset configurations
const CHART_PRESETS = {
  production: {
    name: 'Production Focus',
    description: 'Focus on production metrics',
    config: {
      capacity: false,
      production: true,
      employees: true
    }
  },
  capacity: {
    name: 'Capacity Focus', 
    description: 'Focus on capacity metrics',
    config: {
      capacity: true,
      production: false,
      employees: false
    }
  },
  all: {
    name: 'All Metrics',
    description: 'Show all data series',
    config: {
      capacity: true,
      production: true,
      employees: true
    }
  },
  minimal: {
    name: 'Minimal',
    description: 'Only production',
    config: {
      capacity: false,
      production: true,
      employees: false
    }
  }
}

const applyPreset = (presetKey: keyof typeof CHART_PRESETS) => {
  const preset = CHART_PRESETS[presetKey]
  if (preset) {
    seriesVisibility.value = { ...preset.config }
    console.log(`Applied preset: ${preset.name}`)
  }
}

// Computed properties
const latestTimestamp = computed(() => {
  if (dataPoints.value.length === 0) return 'No data'
  const latest = dataPoints.value[dataPoints.value.length - 1]
  return `Time: ${latest.TIME_STAMP}`
})

const latestProduction = computed(() => {
  if (dataPoints.value.length === 0) return null
  const latest = dataPoints.value[dataPoints.value.length - 1]
  return latest.PRODUCTION?.toLocaleString() || 'N/A'
})

const latestCapacity = computed(() => {
  if (dataPoints.value.length === 0) return null
  const latest = dataPoints.value[dataPoints.value.length - 1]
  return latest.CAPACITY?.toLocaleString() || 'N/A'
})

// Chart configuration
function createChartConfig(): ChartConfiguration {
  const hasData = dataPoints.value.length > 0
  const labels = hasData ? dataPoints.value.map(d => d.TIME_STAMP.toString()) : ['0']
  
  // Build datasets array based on visibility settings
  const datasets = []
  
  if (seriesVisibility.value.capacity && hasData) {
    datasets.push({
      label: 'Capacity',
      data: dataPoints.value.map(d => ({ x: d.TIME_STAMP, y: d.CAPACITY || 0 })),
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
      tension: 0.4,
      fill: false,
      pointRadius: 0
    })
  }
  
  if (seriesVisibility.value.production && hasData) {
    datasets.push({
      label: 'Production',
      data: dataPoints.value.map(d => ({ x: d.TIME_STAMP, y: d.PRODUCTION || 0 })),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      tension: 0.4,
      fill: false,
      pointRadius: 0
    })
  }
  
  if (seriesVisibility.value.employees && hasData) {
    datasets.push({
      label: 'Employees ×1000',
      data: dataPoints.value.map(d => ({ x: d.TIME_STAMP, y: (d.EMPLOYEES || 0) * 1000 })),
      borderColor: 'rgb(168, 85, 247)',
      backgroundColor: 'rgba(168, 85, 247, 0.2)',
      tension: 0.4,
      fill: false,
      pointRadius: 0
    })
  }

  return {
    type: 'line',
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 200,
      layout: { autoPadding: true },
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: `Company Production - ${props.selectedCompany} (${props.selectedCountry})`,
          font: {
            size: 16
          }
        },
        legend: {
          display: true,
          position: 'top' as const,
          labels: { font: { size: 12 } }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y.toLocaleString();
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Time'
          }
        },
        y: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
          title: {
            display: true,
            text: 'Value'
          },
          beginAtZero: true
        }
      }
    }
  }
}

// Initialize chart
async function initChart() {
  await nextTick()
  
  if (!chartCanvas.value) {
    console.error('Company Production Chart canvas not available')
    error.value = 'Chart canvas element not found'
    return
  }
  
  if (dataPoints.value.length === 0) {
    console.warn('No data points available for company production chart initialization')
    error.value = 'No data available for chart'
    return
  }
  
  try {
    // Destroy existing chart if it exists
    if (chart) {
      chart.destroy()
      chart = null
    }
    
    const existingChart = Chart.getChart(chartCanvas.value)
    if (existingChart) {
      existingChart.destroy()
    }
    
    const config = createChartConfig()
    chart = new Chart(chartCanvas.value, config)
    chart.update()
    
    console.log('Company Production Chart created successfully')
    
  } catch (err) {
    console.error('Error during company production chart initialization:', err)
    error.value = `Company Production Chart initialization failed: ${err instanceof Error ? err.message : String(err)}`
  }
}

// Load data 
async function loadData() {
  if (isLoading.value || !props.selectedCompany) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    // Use the store's company time series data
    await store.loadCompanyTimeSeriesData()
    
    // Get data from store
    dataPoints.value = [...store.companyTimeSeriesData]
    
    console.log('Company production data loaded:', {
      count: dataPoints.value.length,
      company: props.selectedCompany,
      firstPoint: dataPoints.value[0]
    })
    
    // Initialize chart if it doesn't exist, otherwise update it
    if (!chart) {
      await initChart()
    } else {
      updateChart()
    }
    
  } catch (err) {
    console.error('Failed to load company production data:', err)
    error.value = `Failed to load company data: ${err instanceof Error ? err.message : String(err)}`
  } finally {
    isLoading.value = false
  }
}

// Update chart with new data
function updateChart() {
  if (!chart) {
    console.warn('Company Production Chart not initialized, cannot update')
    return
  }
  
  try {
    const config = createChartConfig()
    chart.data = config.data
    chart.options.plugins!.title!.text = `Company Production - ${props.selectedCompany} (${props.selectedCountry})`
    chart.update('none')
    
    console.log('Company Production Chart updated successfully')
  } catch (err) {
    console.error('Error updating company production chart:', err)
    error.value = `Company Production Chart update failed: ${err instanceof Error ? err.message : String(err)}`
  }
}

// Start auto-updating
function startAutoUpdate() {
  if (isAutoUpdating.value) return
  
  isAutoUpdating.value = true
  updateInterval = setInterval(() => {
    loadData()
  }, 2000) // Update every 2 seconds (matching legacy)
}

// Stop auto-updating
function stopAutoUpdate() {
  isAutoUpdating.value = false
  if (updateInterval) {
    clearInterval(updateInterval)
    updateInterval = null
  }
}

// Initialize on mount
onMounted(async () => {
  console.log('Company Production Chart component mounted')
  
  // Load saved configuration
  loadConfiguration()
  
  if (props.selectedCompany) {
    await loadData()
    // Start auto-update by default if we have a company
    startAutoUpdate()
  }
})

// Auto-save configuration when visibility changes
watch(seriesVisibility, () => {
  saveConfiguration()
}, { deep: true })

// Cleanup on unmount
onUnmounted(() => {
  stopAutoUpdate()
  if (chart) {
    chart.destroy()
  }
})

// Watch for company/country changes
watch(() => [props.selectedCountry, props.selectedCompany], async (newVal, oldVal) => {
  if (newVal[0] !== oldVal[0] || newVal[1] !== oldVal[1]) {
    // Stop auto-update first
    stopAutoUpdate()
    // Reset data when company/country changes
    dataPoints.value = []
    // Clear store data to prevent duplication
    store.companyTimeSeriesData = []
    
    if (props.selectedCompany) {
      await loadData()
      startAutoUpdate()
    }
  }
})

// Watch store data for real-time updates
watch(() => store.companyTimeSeriesData, (newData) => {
  if (newData.length > 0 && newData.length !== dataPoints.value.length) {
    dataPoints.value = [...newData]
    if (chart) {
      updateChart()
    }
  }
}, { deep: true })
</script>

<style scoped>
.company-production-chart {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 1rem 0;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.chart-header h3 {
  margin: 0;
  color: #2d3748;
}

.chart-controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-small:hover {
  background-color: #2563eb;
}

.btn-small:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.chart-container {
  position: relative;
  width: 100%;
  height: 400px;
  margin: 1rem 0;
}

.chart-container canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.chart-info {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  border-left: 3px solid #f59e0b;
}

.label {
  font-weight: 500;
  color: #4a5568;
  font-size: 0.9rem;
}

.value {
  font-family: 'Monaco', 'Consolas', monospace;
  color: #2d3748;
  font-weight: 600;
  font-size: 0.9rem;
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #fed7d7;
  border: 1px solid #e53e3e;
  border-radius: 4px;
  color: #742a2a;
}

.debug-section {
  margin-top: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
}

.debug-section summary {
  padding: 0.75rem;
  background: #f7fafc;
  cursor: pointer;
  font-weight: 500;
}

.debug-content {
  padding: 1rem;
  background: #fafafa;
}

.debug-content h4 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-size: 0.9rem;
}

.debug-content pre {
  background: #2d3748;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.8rem;
  margin: 0.5rem 0;
}

.field-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.field-tag {
  background: #f59e0b;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-family: 'Monaco', 'Consolas', monospace;
}

/* Series visibility controls - matching other chart components */
.series-controls {
  margin: 1rem 0;
  padding: 1rem;
  background: #f1f5f9;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.series-controls h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  color: #334155;
  font-weight: 600;
}

.series-checkboxes {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.series-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  font-size: 0.9rem;
  font-weight: 500;
  color: #475569;
}

.series-checkbox:hover {
  background-color: #e2e8f0;
}

.series-checkbox input[type="checkbox"] {
  margin: 0;
  cursor: pointer;
}

.series-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  display: inline-block;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.reset-controls {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.btn-reset {
  background-color: #f59e0b;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn-reset:hover {
  background-color: #d97706;
}

.btn-reset:active {
  background-color: #b45309;
}

.preset-controls {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.preset-controls h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #374151;
  font-weight: 600;
}

.preset-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-preset {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.btn-preset:hover {
  background-color: #2563eb;
}

.btn-preset:active {
  background-color: #1d4ed8;
}

@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .chart-controls {
    width: 100%;
    justify-content: flex-start;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .series-checkboxes {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .preset-buttons {
    flex-direction: column;
  }
  
  .btn-preset {
    width: 100%;
  }
}
</style>
