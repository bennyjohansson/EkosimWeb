<!-- filepath: /Users/bennyjohansson/Documents/Projects/EkoWeb/modern/src/components/MoneyChart.vue -->

<template>
  <div class="money-chart">
    <div class="chart-header">
      <h3>💰 Economic Capital Distribution</h3>
      <div class="chart-controls">
        <button @click="loadData" :disabled="isLoading" class="btn btn-small">
          {{ isLoading ? 'Loading...' : 'Refresh Data' }}
        </button>
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
          <span class="label">Country:</span>
          <span class="value">{{ selectedCountry }}</span>
        </div>
        <div class="info-item">
          <span class="label">Last Total Capital:</span>
          <span class="value">{{ latestMoneySupply || 'N/A' }}</span>
        </div>
        <div class="info-item">
          <span class="label">Chart Status:</span>
          <span class="value">{{ chart ? 'Initialized' : 'Not Initialized' }}</span>
        </div>
        <div class="info-item">
          <span class="label">Data Range:</span>
          <span class="value">{{ getDataRange() }}</span>
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
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
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
import type { CountryCode, MoneyDataPoint } from '@/types/simulation'

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

console.log('Chart.js components registered:', {
  registry: Chart.registry,
  controllers: Object.keys(Chart.registry.controllers || {}),
  elements: Object.keys(Chart.registry.elements || {}),
  plugins: Object.keys(Chart.registry.plugins || {}),
  scales: Object.keys(Chart.registry.scales || {})
})

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
const dataPoints = ref<MoneyDataPoint[]>([])
const isLoading = ref(false)
const isAutoUpdating = ref(false)
const error = ref<string>('')
const lastTimestamp = ref(0)
let chart: Chart | null = null
let updateInterval: ReturnType<typeof setInterval> | null = null

// Computed properties
const latestTimestamp = computed(() => {
  if (dataPoints.value.length === 0) return 'No data'
  const latest = dataPoints.value[dataPoints.value.length - 1]
  return `Time: ${latest.TIME}`
})

const latestMoneySupply = computed(() => {
  if (dataPoints.value.length === 0) return null
  const latest = dataPoints.value[dataPoints.value.length - 1]
  return latest.TOTAL_CAPITAL?.toLocaleString() || 'N/A'
})

// Helper function to check data range
function getDataRange() {
  if (dataPoints.value.length === 0) return 'No data'
  
  const totalCapitalValues = dataPoints.value
    .map(d => d.TOTAL_CAPITAL || 0)
    .filter(v => v > 0)
  
  if (totalCapitalValues.length === 0) return 'All zeros'
  
  const min = Math.min(...totalCapitalValues)
  const max = Math.max(...totalCapitalValues)
  return `${min.toLocaleString()} - ${max.toLocaleString()}`
}

// Chart configuration
function createChartConfig(): ChartConfiguration {
  // If no data, show a sample point
  const hasData = dataPoints.value.length > 0
  const labels = hasData ? dataPoints.value.map(d => d.TIME.toString()) : ['0']
  
  const totalCapitalData = hasData ? dataPoints.value.map(d => ({ x: d.TIME, y: d.TOTAL_CAPITAL || 0 })) : [{ x: 0, y: 0 }]
  const consumerCapitalData = hasData ? dataPoints.value.map(d => ({ x: d.TIME, y: d.CONSUMER_CAPITAL || 0 })) : [{ x: 0, y: 0 }]
  const bankCapitalData = hasData ? dataPoints.value.map(d => ({ x: d.TIME, y: d.BANK_CAPITAL || 0 })) : [{ x: 0, y: 0 }]
  const companyCapitalData = hasData ? dataPoints.value.map(d => ({ x: d.TIME, y: d.COMPANY_CAIPTAL || 0 })) : [{ x: 0, y: 0 }]
  
  console.log('Chart data preview:', {
    labels: labels.slice(0, 3),
    totalCapital: totalCapitalData.slice(0, 3),
    consumerCapital: consumerCapitalData.slice(0, 3),
    bankCapital: bankCapitalData.slice(0, 3),
    companyCapital: companyCapitalData.slice(0, 3),
    dataPointsCount: dataPoints.value.length
  })

  return {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Total Capital',
          data: totalCapitalData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
          fill: false,
          pointRadius: 2
        },
        {
          label: 'Consumer Capital',
          data: consumerCapitalData,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.4,
          fill: false,
          pointRadius: 2
        },
        {
          label: 'Bank Capital',
          data: bankCapitalData,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.4,
          fill: false,
          pointRadius: 2
        },
        {
          label: 'Company Capital',
          data: companyCapitalData,
          borderColor: 'rgb(255, 206, 86)',
          backgroundColor: 'rgba(255, 206, 86, 0.2)',
          tension: 0.4,
          fill: false,
          pointRadius: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: `Economic Capital Distribution - ${props.selectedCountry}`,
          font: {
            size: 16
          }
        },
        legend: {
          display: true,
          position: 'top' as const
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
            text: 'Capital Amount'
          },
          beginAtZero: true
        }
      }
    }
  }
}

// Initialize chart
async function initChart() {
  console.log('=== CHART INITIALIZATION START ===')
  await nextTick()
  
  if (!chartCanvas.value) {
    console.error('Chart canvas not available')
    error.value = 'Chart canvas element not found'
    return
  }
  
  console.log('Canvas element found:', chartCanvas.value)
  console.log('Canvas parent:', chartCanvas.value.parentElement)
  console.log('Canvas dimensions:', {
    clientWidth: chartCanvas.value.clientWidth,
    clientHeight: chartCanvas.value.clientHeight,
    offsetWidth: chartCanvas.value.offsetWidth,
    offsetHeight: chartCanvas.value.offsetHeight
  })
  
  if (dataPoints.value.length === 0) {
    console.warn('No data points available for chart initialization')
    error.value = 'No data available for chart'
    return
  }
  
  console.log('Data points available:', dataPoints.value.length)
  console.log('First data point:', dataPoints.value[0])
  
  try {
    // Destroy existing chart if it exists
    if (chart) {
      console.log('Destroying existing chart')
      chart.destroy()
      chart = null
    }
    
    // Also check if there's any chart instance attached to this canvas
    const canvasId = chartCanvas.value.id
    if (canvasId) {
      console.log('Canvas has ID:', canvasId)
      // Try to get any existing chart instance for this canvas
      const existingChart = Chart.getChart(chartCanvas.value)
      if (existingChart) {
        console.log('Found existing chart instance, destroying it')
        existingChart.destroy()
      }
    }
    
    const config = createChartConfig()
    console.log('Chart config created:', {
      type: config.type,
      datasetCount: config.data.datasets.length,
      labelCount: config.data.labels?.length,
      firstDataset: config.data.datasets[0]
    })
    
    console.log('Creating new Chart instance...')
    chart = new Chart(chartCanvas.value, config)
    console.log('Chart created successfully:', chart)
    console.log('Chart canvas after creation:', chart.canvas)
    console.log('Chart data after creation:', chart.data)
    
    // Force a render
    chart.update()
    console.log('Chart update called')
    
  } catch (err) {
    console.error('Error during chart initialization:', err)
    if (err instanceof Error) {
      console.error('Error message:', err.message)
      console.error('Error stack:', err.stack)
    }
    error.value = `Chart initialization failed: ${err instanceof Error ? err.message : String(err)}`
  }
  
  console.log('=== CHART INITIALIZATION END ===')
}

// Load data from API
async function loadData() {
  if (isLoading.value) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    const response = await simulationAPI.getMoneyDataUpdates(
      props.selectedCountry,
      lastTimestamp.value
    )
    
    if (response.message === 'success') {
      if (response.data.length > 0) {
        // Debug: Log the actual data structure
        console.log('Raw API response data:', response.data)
        console.log('First data point:', response.data[0])
        console.log('Available fields:', Object.keys(response.data[0] || {}))
        
        // Append new data points
        dataPoints.value.push(...response.data)
        
        // Update last timestamp
        const maxTime = Math.max(...response.data.map(d => d.TIME))
        lastTimestamp.value = maxTime
        
        // Initialize chart if it doesn't exist, otherwise update it
        if (!chart) {
          console.log('No chart exists, initializing with data...')
          await initChart()
        } else {
          console.log('Chart exists, updating with new data...')
          updateChart()
        }
      }
    } else {
      throw new Error(response.error || 'Failed to load data')
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
    console.warn('Chart not initialized, cannot update')
    return
  }
  
  try {
    const config = createChartConfig()
    console.log('Updating chart with data points:', dataPoints.value.length)
    console.log('Sample data point:', dataPoints.value[0])
    console.log('Chart datasets:', config.data.datasets.map(d => ({
      label: d.label,
      dataLength: d.data.length,
      sampleValues: d.data.slice(0, 3)
    })))
    
    chart.data = config.data
    chart.options.plugins!.title!.text = `Economic Capital Distribution - ${props.selectedCountry}`
    chart.update('none') // No animation for real-time updates
    
    console.log('Chart updated successfully')
  } catch (err) {
    console.error('Error updating chart:', err)
    error.value = `Chart update failed: ${err instanceof Error ? err.message : String(err)}`
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
  console.log('Component mounted, loading data...')
  await loadData()
  // Chart will be initialized in loadData after data is available
})

// Cleanup on unmount
onUnmounted(() => {
  stopAutoUpdate()
  if (chart) {
    chart.destroy()
  }
})

// Watch for country changes
import { watch } from 'vue'
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
.money-chart {
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
}

.chart-container {
  margin: 1rem 0;
  height: 400px;
  position: relative;
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
  border-left: 3px solid #667eea;
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
  border-radius: 4px 4px 0 0;
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
  background: #667eea;
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
