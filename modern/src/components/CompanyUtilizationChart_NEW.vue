<template>
  <div class="company-utilization-chart">
    <div class="chart-header">
      <h3>📊 Company Utilization</h3>
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
          <span class="value utilization-highlight">{{ currentUtilization }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      <strong>Error:</strong> {{ error }}
    </div>

    <!-- Debug: Show raw data structure -->
    <div v-if="dataPoints.length > 0" class="debug-section">
      <details>
        <summary>🔍 Debug: Raw Data Structure (click to expand)</summary>
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

// Template refs
const chartCanvas = ref<HTMLCanvasElement>()

// Reactive state
const dataPoints = ref<CompanyTimeSeriesData[]>([])
const isLoading = ref(false)
const isAutoUpdating = ref(false)
const error = ref<string>('')
const lastTimestamp = ref(0)
const isInitialLoad = ref(true)
let chart: Chart | null = null
let updateInterval: ReturnType<typeof setInterval> | null = null

// Computed properties
const latestTimestamp = computed(() => {
  if (dataPoints.value.length === 0) return 'No data'
  const latest = dataPoints.value[dataPoints.value.length - 1]
  return `Time: ${latest.TIME_STAMP}`
})

const currentUtilization = computed(() => {
  if (dataPoints.value.length === 0) return 'N/A'
  const latest = dataPoints.value[dataPoints.value.length - 1]
  const capacity = latest.CAPACITY || 0
  const production = latest.PRODUCTION || 0
  
  if (capacity === 0) return '0.0%'
  return `${((production / capacity) * 100).toFixed(1)}%`
})

// Chart configuration
function createChartConfig(): ChartConfiguration {
  const hasData = dataPoints.value.length > 0
  const labels = hasData ? dataPoints.value.map(d => d.TIME_STAMP.toString()) : ['0']
  
  // Calculate utilization percentage for each data point
  const utilizationData = hasData 
    ? dataPoints.value.map(d => {
        const capacity = d.CAPACITY || 0
        const production = d.PRODUCTION || 0
        const utilization = capacity > 0 ? (production / capacity) * 100 : 0
        return { x: d.TIME_STAMP, y: utilization }
      })
    : [{ x: 0, y: 0 }]

  return {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Utilization %',
          data: utilizationData,
          borderColor: 'rgb(139, 92, 246)',
          backgroundColor: 'rgba(139, 92, 246, 0.2)',
          tension: 0.4,
          fill: true,
          pointRadius: 0
        }
      ]
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
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y.toFixed(1) + '%';
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
            text: 'Utilization %'
          },
          min: 0,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
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
    console.error('Company Utilization chart canvas not available')
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
    error.value = `Company utilization chart initialization failed: ${err instanceof Error ? err.message : String(err)}`
  }
}

// Load data from API
async function loadData() {
  if (isLoading.value || !props.selectedCompany) return
  console.log('[CompanyUtilizationChart] loadData called. selectedCompany:', props.selectedCompany, 'lastTimestamp:', lastTimestamp.value)
  isLoading.value = true
  error.value = ''
  try {
    const response = await simulationAPI.getCompanyUpdates(
      props.selectedCountry,
      props.selectedCompany,
      lastTimestamp.value
    )
    console.log('[CompanyUtilizationChart] API response:', response)
    if (response.message === 'success') {
      // Check for simulation restart: backend reset
      if (typeof response.maxTimestamp !== 'undefined' && response.maxTimestamp < lastTimestamp.value) {
        console.warn('[CompanyUtilizationChart] Detected simulation restart: maxTimestamp', response.maxTimestamp, '< lastTimestamp', lastTimestamp.value, '. Resetting lastTimestamp to 0 and reloading data.')
        lastTimestamp.value = 0
        dataPoints.value = []
        isInitialLoad.value = true
        // Reload all data from beginning
        await loadData()
        return
      }
      if (response.data.length > 0) {
        console.log('[CompanyUtilizationChart] Data loaded:', {
          count: response.data.length,
          firstPoint: response.data[0],
          lastPoint: response.data[response.data.length - 1],
          isInitial: isInitialLoad.value,
          maxTimestamp: response.maxTimestamp
        })
        // On initial load, filter to show only last 100 cycles to avoid displaying full history
        if (isInitialLoad.value && response.data.length > 100) {
          const recentData = response.data.slice(-100)
          dataPoints.value = recentData
          console.log(`[CompanyUtilizationChart] Filtered initial data from ${response.data.length} to ${recentData.length} records (last 100 cycles)`)
          isInitialLoad.value = false
        } else {
          // Append new data points for subsequent updates
          dataPoints.value.push(...response.data)
          if (isInitialLoad.value) {
            isInitialLoad.value = false
          }
        }
        // Update last timestamp
        const maxTime = Math.max(...response.data.map(d => d.TIME_STAMP))
        lastTimestamp.value = maxTime
        console.log('[CompanyUtilizationChart] Updated lastTimestamp to', lastTimestamp.value)
        // Initialize chart if it doesn't exist, otherwise update it
        if (!chart) {
          await initChart()
        } else {
          updateChart()
        }
      } else {
        console.log('[CompanyUtilizationChart] No new data returned from API. maxTimestamp:', response.maxTimestamp, 'lastTimestamp:', lastTimestamp.value)
      }
    } else {
      console.error('[CompanyUtilizationChart] API error:', response.error)
      throw new Error(response.error || 'Failed to load company utilization data')
    }
  } catch (err) {
    console.error('[CompanyUtilizationChart] Exception in loadData:', err)
    error.value = parseAPIError(err)
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
    error.value = `Company utilization chart update failed: ${err instanceof Error ? err.message : String(err)}`
  }
}

// Start auto-updating
function startAutoUpdate() {
  if (isAutoUpdating.value) return
  console.log('[CompanyUtilizationChart] startAutoUpdate called. Polling every 3s.')
  isAutoUpdating.value = true
  updateInterval = setInterval(() => {
    console.log('[CompanyUtilizationChart] Polling... lastTimestamp:', lastTimestamp.value)
    loadData()
  }, 3000)
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
  console.log('Company Utilization Chart component mounted, loading data...')
  if (props.selectedCompany && props.selectedCompany !== '') {
    await loadData()
    // Start auto-update by default
    startAutoUpdate()
  } else {
    console.warn('Company Utilization Chart: No company selected on mount, skipping initial data load')
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
watch(() => [props.selectedCountry, props.selectedCompany], async (newVal, oldVal) => {
  if (newVal[0] !== oldVal[0] || newVal[1] !== oldVal[1]) {
    // Stop auto-update
    stopAutoUpdate()
    // Reset state
    dataPoints.value = []
    lastTimestamp.value = 0
    isInitialLoad.value = true
    
    if (props.selectedCompany && props.selectedCompany !== '') {
      await loadData()
      startAutoUpdate()
    } else {
      console.warn('Company Utilization Chart: selectedCompany is empty, skipping data load')
    }
  }
})
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
  border-left: 3px solid #8b5cf6;
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

.utilization-highlight {
  color: #8b5cf6;
  font-size: 1rem;
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
  background: #8b5cf6;
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
}
</style>
