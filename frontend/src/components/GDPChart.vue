<template>
  <div class="gdp-chart">
    <div class="chart-header">
      <h3>📈 GDP & Investment Analysis</h3>
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
              v-model="seriesVisibility.nominalGDP"
              @change="updateChart"
            />
            <span class="series-color" style="background-color: rgb(34, 197, 94)"></span>
            Nominal GDP
          </label>
          <label class="series-checkbox">
            <input 
              type="checkbox" 
              v-model="seriesVisibility.realGDP"
              @change="updateChart"
            />
            <span class="series-color" style="background-color: rgb(59, 130, 246)"></span>
            Real GDP
          </label>
          <label class="series-checkbox">
            <input 
              type="checkbox" 
              v-model="seriesVisibility.investment"
              @change="updateChart"
            />
            <span class="series-color" style="background-color: rgb(168, 85, 247)"></span>
            Investment ×10
          </label>
          <label class="series-checkbox">
            <input 
              type="checkbox" 
              v-model="seriesVisibility.itemsProduced"
              @change="updateChart"
            />
            <span class="series-color" style="background-color: rgb(245, 158, 11)"></span>
            Items Produced
          </label>
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
          <span class="label">Country:</span>
          <span class="value">{{ selectedCountry }}</span>
        </div>
        <div class="info-item">
          <span class="label">Latest GDP:</span>
          <span class="value">{{ latestGDP || 'N/A' }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      <strong>Error:</strong> {{ error }}
    </div>

    <!-- Debug: Show raw data structure -->
    <div v-if="dataPoints.length > 0" class="debug-section">
      <details>
        <summary>🔍 Debug: GDP Data Structure (click to expand)</summary>
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
import { simulationAPI, parseAPIError } from '@/services/simulationAPI'
import type { CountryCode, TimeDataPoint } from '@/types/simulation'

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
}

const props = withDefaults(defineProps<Props>(), {
  selectedCountry: 'Bennyland'
})

// Template refs
const chartCanvas = ref<HTMLCanvasElement>()

// Reactive state
const dataPoints = ref<TimeDataPoint[]>([])
const isLoading = ref(false)
const isAutoUpdating = ref(false)
const error = ref<string>('')
const lastTimestamp = ref(0)
const isInitialLoad = ref(true)
let chart: Chart | null = null
let updateInterval: ReturnType<typeof setInterval> | null = null

// Series visibility controls
const seriesVisibility = ref({
  nominalGDP: true,
  realGDP: true,
  investment: true,
  itemsProduced: false
})

// Computed properties
const latestTimestamp = computed(() => {
  if (dataPoints.value.length === 0) return 'No data'
  const latest = dataPoints.value[dataPoints.value.length - 1]
  return `Time: ${latest.TIME}`
})

const latestGDP = computed(() => {
  if (dataPoints.value.length === 0) return null
  const latest = dataPoints.value[dataPoints.value.length - 1]
  return latest.GDP_NOMINAL?.toLocaleString() || 'N/A'
})

// Chart configuration
function createChartConfig(): ChartConfiguration {
  const hasData = dataPoints.value.length > 0
  const labels = hasData ? dataPoints.value.map(d => d.TIME.toString()) : ['0']
  
  // Build datasets array based on visibility settings
  const datasets = []
  
  if (seriesVisibility.value.nominalGDP && hasData) {
    datasets.push({
      label: 'Nominal GDP',
      data: dataPoints.value.map(d => ({ x: d.TIME, y: d.GDP_NOMINAL || 0 })),
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
      tension: 0.4,
      fill: false,
      pointRadius: 0
    })
  }
  
  if (seriesVisibility.value.realGDP && hasData) {
    // Calculate Real GDP: Nominal GDP * (Price at time 1) / (Current Price)
    const basePrice = dataPoints.value.length > 1 ? dataPoints.value[1].PRICE || 1 : 1
    datasets.push({
      label: 'Real GDP',
      data: dataPoints.value.map(d => ({
        x: d.TIME,
        y: d.GDP_NOMINAL && d.PRICE ? (d.GDP_NOMINAL * basePrice / d.PRICE) : 0
      })),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      tension: 0.4,
      fill: false,
      pointRadius: 0
    })
  }
  
  if (seriesVisibility.value.investment && hasData) {
    datasets.push({
      label: 'Investment ×10',
      data: dataPoints.value.map(d => ({ x: d.TIME, y: (d.INVESTMENTS || 0) * 10 })),
      borderColor: 'rgb(168, 85, 247)',
      backgroundColor: 'rgba(168, 85, 247, 0.2)',
      tension: 0.4,
      fill: false,
      pointRadius: 0
    })
  }
  
  if (seriesVisibility.value.itemsProduced && hasData) {
    datasets.push({
      label: 'Items Produced',
      data: dataPoints.value.map(d => ({ x: d.TIME, y: d.GDP_ITEMS || 0 })),
      borderColor: 'rgb(245, 158, 11)',
      backgroundColor: 'rgba(245, 158, 11, 0.2)',
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
          text: `GDP & Investment Analysis - ${props.selectedCountry}`,
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
    console.error('GDP Chart canvas not available')
    error.value = 'Chart canvas element not found'
    return
  }
  
  if (dataPoints.value.length === 0) {
    console.warn('No data points available for GDP chart initialization')
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
    
    console.log('GDP Chart created successfully')
    
  } catch (err) {
    console.error('Error during GDP chart initialization:', err)
    error.value = `GDP Chart initialization failed: ${err instanceof Error ? err.message : String(err)}`
  }
}

// Load data from API
async function loadData() {
  if (isLoading.value) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    const response = await simulationAPI.getTimeDataUpdates(
      props.selectedCountry,
      lastTimestamp.value
    )
    // Simulation restart detection
    if (response.maxTimestamp < lastTimestamp.value) {
      console.warn('[GDPChart] Detected simulation restart: maxTimestamp', response.maxTimestamp, '< lastTimestamp', lastTimestamp.value, '. Resetting lastTimestamp to 0 and reloading data.')
      lastTimestamp.value = 0
      dataPoints.value = []
      isInitialLoad.value = true
      await loadData()
      return
    }
    if (response.message === 'success') {
      if (response.data.length > 0) {
        console.log('GDP data loaded:', {
          count: response.data.length,
          firstPoint: response.data[0],
          hasGDP: response.data[0].GDP_NOMINAL !== undefined
        })
        // On initial load with all historical data, only keep recent data (last 100 cycles)
        if (isInitialLoad.value && response.data.length > 100) {
          const recentData = response.data.slice(-100)
          dataPoints.value = recentData
          console.log('GDP Chart: Filtered to last 100 cycles on initial load')
        } else {
          // Append new data points for incremental updates
          dataPoints.value.push(...response.data)
        }
        isInitialLoad.value = false
        // Update last timestamp
        const maxTime = Math.max(...response.data.map(d => d.TIME))
        lastTimestamp.value = maxTime
        // Initialize chart if it doesn't exist, otherwise update it
        if (!chart) {
          await initChart()
        } else {
          updateChart()
        }
      }
    } else {
      throw new Error(response.error || 'Failed to load GDP data')
    }
  } catch (err) {
    error.value = parseAPIError(err)
  } finally {
    isLoading.value = false
  }
}

// Update chart with new data
function updateChart() {
  if (!chart) {
    console.warn('GDP Chart not initialized, cannot update')
    return
  }
  
  try {
    const config = createChartConfig()
    chart.data = config.data
    chart.options.plugins!.title!.text = `GDP & Investment Analysis - ${props.selectedCountry}`
    chart.update('none')
    
    console.log('GDP Chart updated successfully')
  } catch (err) {
    console.error('Error updating GDP chart:', err)
    error.value = `GDP Chart update failed: ${err instanceof Error ? err.message : String(err)}`
  }
}

// Start auto-updating
function startAutoUpdate() {
  if (isAutoUpdating.value) return
  
  isAutoUpdating.value = true
  updateInterval = setInterval(() => {
    loadData()
  }, 3000) // Update every 3 seconds
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
  console.log('GDP Chart component mounted, loading data...')
  await loadData()
  // Start auto-update by default
  startAutoUpdate()
})

// Cleanup on unmount
onUnmounted(() => {
  stopAutoUpdate()
  if (chart) {
    chart.destroy()
  }
})

// Watch for country changes
watch(() => props.selectedCountry, async () => {
  // Reset data when country changes
  dataPoints.value = []
  lastTimestamp.value = 0
  
  // Update chart title and reload data
  if (chart) {
    updateChart()
  }
  await loadData()
})
</script>

<style scoped>
.gdp-chart {
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
  border-left: 3px solid #34d399;
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
  background: #34d399;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-family: 'Monaco', 'Consolas', monospace;
}

/* Series visibility controls */
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
}
</style>
