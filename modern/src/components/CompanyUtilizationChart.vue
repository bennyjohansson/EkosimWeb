<template>
  <div class="company-utilization-chart">
    <div class="chart-header">
      <h3>📈 Company Utilization Analysis</h3>
      <div class="chart-controls">
        <button @click="startAutoUpdate" :disabled="isAutoUpdating" class="btn btn-small">
          {{ isAutoUpdating ? 'Auto-updating...' : 'Start Auto-Update' }}
        </button>
        <button @click="stopAutoUpdate" :disabled="!isAutoUpdating" class="btn btn-small">
          Stop Auto-Update
        </button>
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
          <span class="label">Current Utilization:</span>
          <span class="value">{{ currentUtilization }}</span>
        </div>
        <div class="info-item">
          <span class="label">Average Utilization:</span>
          <span class="value">{{ averageUtilization }}</span>
        </div>
        <div class="info-item">
          <span class="label">Max Utilization:</span>
          <span class="value">{{ maxUtilization }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      <strong>Error:</strong> {{ error }}
    </div>

    <!-- Debug: Show utilization calculation -->
    <div v-if="dataPoints.length > 0" class="debug-section">
      <details>
        <summary>🔍 Debug: Utilization Calculation (click to expand)</summary>
        <div class="debug-content">
          <h4>Latest Calculation:</h4>
          <pre>{{ utilizationDebugInfo }}</pre>
          
          <h4>Recent Utilization Values:</h4>
          <div class="utilization-list">
            <span 
              v-for="(util, index) in recentUtilizations" 
              :key="index"
              class="utilization-value"
            >
              {{ util }}%
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
  Filler,
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
  Legend,
  Filler
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

// Computed properties
const latestTimestamp = computed(() => {
  if (dataPoints.value.length === 0) return 'No data'
  const latest = dataPoints.value[dataPoints.value.length - 1]
  return `Time: ${latest.TIME_STAMP}`
})

const utilizationData = computed(() => {
  return dataPoints.value.map(d => {
    const capacity = d.CAPACITY || 0
    const production = d.PRODUCTION || 0
    
    if (capacity === 0) return 0
    return (production / capacity) * 100 // Convert to percentage
  })
})

const currentUtilization = computed(() => {
  if (utilizationData.value.length === 0) return 'N/A'
  const latest = utilizationData.value[utilizationData.value.length - 1]
  return `${latest.toFixed(1)}%`
})

const averageUtilization = computed(() => {
  if (utilizationData.value.length === 0) return 'N/A'
  const sum = utilizationData.value.reduce((acc, val) => acc + val, 0)
  const avg = sum / utilizationData.value.length
  return `${avg.toFixed(1)}%`
})

const maxUtilization = computed(() => {
  if (utilizationData.value.length === 0) return 'N/A'
  const max = Math.max(...utilizationData.value)
  return `${max.toFixed(1)}%`
})

const utilizationDebugInfo = computed(() => {
  if (dataPoints.value.length === 0) return 'No data'
  
  const latest = dataPoints.value[dataPoints.value.length - 1]
  const capacity = latest.CAPACITY || 0
  const production = latest.PRODUCTION || 0
  const utilization = capacity === 0 ? 0 : (production / capacity) * 100
  
  return {
    timestamp: latest.TIME_STAMP,
    production: production,
    capacity: capacity,
    calculation: `${production} / ${capacity} = ${utilization.toFixed(3)}%`,
    utilization: `${utilization.toFixed(1)}%`
  }
})

const recentUtilizations = computed(() => {
  return utilizationData.value.slice(-10).map(u => u.toFixed(1))
})

// Chart configuration
function createChartConfig(): ChartConfiguration {
  const hasData = dataPoints.value.length > 0
  const labels = hasData ? dataPoints.value.map(d => d.TIME_STAMP.toString()) : ['0']
  
  const datasets = []
  
  if (hasData) {
    datasets.push({
      label: 'Utilization %',
      data: dataPoints.value.map((d, index) => ({ 
        x: d.TIME_STAMP, 
        y: utilizationData.value[index] 
      })),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      tension: 0.4,
      fill: true, // Fill area under curve for utilization
      pointRadius: 1,
      borderWidth: 2
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
          text: `Company Utilization - ${props.selectedCompany} (${props.selectedCountry})`,
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
              const value = context.parsed.y
              return `Utilization: ${value.toFixed(1)}%`
            }
          }
        }
      },
      scales: {
        x: {
          type: 'linear' as const,
          display: true,
          title: {
            display: true,
            text: 'Time'
          },
          min: 0,
          ticks: {
            stepSize: 10
          }
        },
        y: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
          title: {
            display: true,
            text: 'Utilization (%)'
          },
          beginAtZero: true,
          max: 100, // Cap at 100% utilization
          grid: {
            color: function(context) {
              // Highlight 100% line
              if (context.tick.value === 100) {
                return 'rgba(239, 68, 68, 0.5)' // Red line at 100%
              }
              // Highlight optimal range (70-90%)
              if (context.tick.value === 70 || context.tick.value === 90) {
                return 'rgba(34, 197, 94, 0.3)' // Green lines at optimal range
              }
              return 'rgba(0, 0, 0, 0.1)'
            }
          }
        }
      }
    }
  }
}

// Initialize chart
async function initChart() {
  await nextTick()
  
  if (!chartCanvas.value) {
    console.error('Company Utilization Chart canvas not available')
    error.value = 'Chart canvas element not found'
    return
  }
  
  if (dataPoints.value.length === 0) {
    console.warn('No data points available for company utilization chart initialization')
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
    
    console.log('Company Utilization Chart created successfully')
    
  } catch (err) {
    console.error('Error during company utilization chart initialization:', err)
    error.value = `Company Utilization Chart initialization failed: ${err instanceof Error ? err.message : String(err)}`
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
    
    console.log('Company utilization data loaded:', {
      count: dataPoints.value.length,
      company: props.selectedCompany,
      currentUtilization: currentUtilization.value
    })
    
    // Initialize chart if it doesn't exist, otherwise update it
    if (!chart) {
      await initChart()
    } else {
      updateChart()
    }
    
  } catch (err) {
    console.error('Failed to load company utilization data:', err)
    error.value = `Failed to load company data: ${err instanceof Error ? err.message : String(err)}`
  } finally {
    isLoading.value = false
  }
}

// Update chart with new data
function updateChart() {
  if (!chart) {
    console.warn('Company Utilization Chart not initialized, cannot update')
    return
  }
  
  try {
    const config = createChartConfig()
    chart.data = config.data
    chart.options.plugins!.title!.text = `Company Utilization - ${props.selectedCompany} (${props.selectedCountry})`
    chart.update('none')
    
    console.log('Company Utilization Chart updated successfully')
  } catch (err) {
    console.error('Error updating company utilization chart:', err)
    error.value = `Company Utilization Chart update failed: ${err instanceof Error ? err.message : String(err)}`
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
  console.log('Company Utilization Chart component mounted')
  
  if (props.selectedCompany) {
    await loadData()
    // Start auto-update by default if we have a company
    startAutoUpdate()
  }
})

// Cleanup on unmount
onUnmounted(() => {
  stopAutoUpdate()
  if (chart) {
    chart.destroy()
  }
})

// Watch for company/country changes
watch(() => [props.selectedCountry, props.selectedCompany], async () => {
  // Reset data when company/country changes
  dataPoints.value = []
  
  // Update chart and reload data
  if (chart) {
    updateChart()
  }
  
  if (props.selectedCompany) {
    await loadData()
  }
})

// Watch store data for real-time updates
watch(() => store.companyTimeSeriesData, (newData) => {
  if (newData.length > dataPoints.value.length) {
    dataPoints.value = [...newData]
    if (chart) {
      updateChart()
    }
  }
}, { deep: true })
</script>

<style scoped>
.company-utilization-chart {
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
  height: 300px;
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
  border-left: 3px solid #3b82f6;
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

.utilization-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.utilization-value {
  background: #3b82f6;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-family: 'Monaco', 'Consolas', monospace;
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
  
  .chart-container {
    height: 250px;
  }
}
</style>
