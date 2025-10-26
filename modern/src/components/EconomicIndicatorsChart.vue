<template>
  <div class="indicators-chart">
    <div class="chart-header">
      <h3>📊 Economic Indicators Timeline</h3>
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
      
      <!-- Series Visibility Controls -->
      <div class="series-controls">
        <h4>📈 Economic Metrics</h4>
        <div class="series-checkboxes">
          <label class="series-checkbox">
            <input 
              type="checkbox" 
              v-model="seriesVisibility.interestRate"
              @change="updateChart"
            />
            <span class="series-color" style="background-color: rgb(147, 51, 234)"></span>
            Interest Rate %
          </label>
          <label class="series-checkbox">
            <input 
              type="checkbox" 
              v-model="seriesVisibility.inflation"
              @change="updateChart"
            />
            <span class="series-color" style="background-color: rgb(255, 127, 0)"></span>
            Inflation %
          </label>
          <label class="series-checkbox">
            <input 
              type="checkbox" 
              v-model="seriesVisibility.growth"
              @change="updateChart"
            />
            <span class="series-color" style="background-color: rgb(34, 197, 94)"></span>
            Growth %
          </label>
          <label class="series-checkbox">
            <input 
              type="checkbox" 
              v-model="seriesVisibility.unemployment"
              @change="updateChart"
            />
            <span class="series-color" style="background-color: rgb(239, 68, 68)"></span>
            Unemployment ×10
          </label>
          <label class="series-checkbox">
            <input 
              type="checkbox" 
              v-model="seriesVisibility.averageWage"
              @change="updateChart"
            />
            <span class="series-color" style="background-color: rgb(168, 85, 247)"></span>
            Average Wage ÷1000
          </label>
        </div>
        
        <!-- Reset button -->
        <div class="reset-controls">
          <button @click="resetToDefaults" class="btn btn-reset">
            Reset to Defaults
          </button>
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
          <span class="label">Latest Interest Rate:</span>
          <span class="value">{{ latestInterestRate || 'N/A' }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      <strong>Error:</strong> {{ error }}
    </div>

    <!-- Debug: Show raw data structure -->
    <div v-if="dataPoints.length > 0" class="debug-section">
      <details>
        <summary>🔍 Debug: Economic Data Structure (click to expand)</summary>
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
let chart: Chart | null = null
let updateInterval: ReturnType<typeof setInterval> | null = null

// Series visibility controls
const seriesVisibility = ref({
  interestRate: true,
  inflation: true,
  growth: true,
  unemployment: false,
  averageWage: false
})

// Computed properties
const latestTimestamp = computed(() => {
  if (dataPoints.value.length === 0) return 'No data'
  const latest = dataPoints.value[dataPoints.value.length - 1]
  return `Time: ${latest.TIME}`
})

const latestInterestRate = computed(() => {
  if (dataPoints.value.length === 0) return null
  const latest = dataPoints.value[dataPoints.value.length - 1]
  return latest.INTEREST_RATE ? `${(latest.INTEREST_RATE * 100).toFixed(2)}%` : 'N/A'
})

const resetToDefaults = () => {
  seriesVisibility.value = {
    interestRate: true,
    inflation: true,
    growth: true,
    unemployment: false,
    averageWage: false
  }
}

// Create interest rate time series from database time data
function createInterestRateTimeSeries(hasData: boolean): Array<{ x: number, y: number }> {
  if (!hasData || dataPoints.value.length === 0) {
    return [{ x: 0, y: 0 }]
  }

  return dataPoints.value.map(d => ({
    x: d.TIME,
    y: (d.INTEREST_RATE || 0) * 100 // Convert to percentage
  }))
}

// Calculate inflation from price data
function calculateInflation(hasData: boolean): Array<{ x: number, y: number }> {
  if (!hasData || dataPoints.value.length <= 1) {
    return [{ x: 0, y: 0 }]
  }

  const result: Array<{ x: number, y: number }> = []
  
  // Calculate raw inflation: (price[i+1]/price[i] - 1) * 100
  const rawInflation: number[] = []
  for (let i = 0; i < dataPoints.value.length - 1; i++) {
    const currentPrice = dataPoints.value[i].PRICE || 1
    const nextPrice = dataPoints.value[i + 1].PRICE || 1
    
    const inflationRate = ((nextPrice / currentPrice) - 1) * 100
    rawInflation.push(inflationRate)
  }
  
  // Apply 10-point moving average to smooth the data
  for (let i = 0; i < rawInflation.length; i++) {
    const startIdx = Math.max(0, i - 9)
    const endIdx = i + 1
    const slice = rawInflation.slice(startIdx, endIdx)
    const average = slice.reduce((sum, val) => sum + val, 0) / slice.length
    
    result.push({
      x: dataPoints.value[i].TIME,
      y: average
    })
  }
  
  // Add last point with same inflation as previous
  if (result.length > 0 && dataPoints.value.length > 0) {
    const lastDataPoint = dataPoints.value[dataPoints.value.length - 1]
    result.push({
      x: lastDataPoint.TIME,
      y: result[result.length - 1].y
    })
  }
  
  return result
}

// Calculate growth from GDP data
function calculateGrowth(hasData: boolean): Array<{ x: number, y: number }> {
  if (!hasData || dataPoints.value.length <= 1) {
    return [{ x: 0, y: 0 }]
  }

  const result: Array<{ x: number, y: number }> = []
  
  // Calculate raw real GDP growth
  const rawGrowth: number[] = []
  const prices = dataPoints.value.map(d => d.PRICE || 1)
  const nominalGDP = dataPoints.value.map(d => d.GDP_NOMINAL || 0)
  
  // Calculate real GDP for each point
  const realGDP: number[] = []
  for (let i = 0; i < dataPoints.value.length; i++) {
    realGDP[i] = nominalGDP[i] * (prices[1] || 1) / (prices[i] || 1)
  }
  
  // Calculate growth rates
  for (let i = 0; i < realGDP.length - 1; i++) {
    if (realGDP[i] > 0) {
      const growthRate = ((realGDP[i + 1] / realGDP[i]) - 1) * 100
      rawGrowth.push(growthRate)
    } else {
      rawGrowth.push(0)
    }
  }
  
  // Apply 10-point moving average to smooth the data
  for (let i = 0; i < rawGrowth.length; i++) {
    const startIdx = Math.max(0, i - 9)
    const endIdx = i + 1
    const slice = rawGrowth.slice(startIdx, endIdx)
    const average = slice.reduce((sum, val) => sum + val, 0) / slice.length
    
    result.push({
      x: dataPoints.value[i].TIME,
      y: average
    })
  }
  
  // Add last point with same growth as previous
  if (result.length > 0 && dataPoints.value.length > 0) {
    const lastDataPoint = dataPoints.value[dataPoints.value.length - 1]
    result.push({
      x: lastDataPoint.TIME,
      y: result[result.length - 1].y
    })
  }
  
  return result
}

// Calculate unemployment data
function calculateUnemployment(hasData: boolean): Array<{ x: number, y: number }> {
  if (!hasData || !dataPoints.value.length) {
    return []
  }
  
  return dataPoints.value.map((point, i) => ({
    x: i,
    y: (point.UNEMPLOYMENT || 0) * 10
  }))
}

// Calculate average wage data
function calculateAverageWage(hasData: boolean): Array<{ x: number, y: number }> {
  if (!hasData || !dataPoints.value.length) {
    return []
  }
  
  return dataPoints.value.map((point, i) => ({
    x: i,
    y: (point.WAGES || 0) / 1000
  }))
}

// Chart configuration
function createChartConfig(): ChartConfiguration {
  const hasData = dataPoints.value.length > 0
  const labels = hasData ? dataPoints.value.map(d => d.TIME.toString()) : ['0']
  
  // Build datasets based on what's enabled
  const datasets = []
  
  if (seriesVisibility.value.interestRate) {
    const interestRateData = createInterestRateTimeSeries(hasData)
    datasets.push({
      label: 'Interest Rate %',
      data: interestRateData,
      borderColor: 'rgb(147, 51, 234)',
      backgroundColor: 'rgba(147, 51, 234, 0.2)',
      tension: 0.4,
      fill: false,
      pointRadius: 0
    })
  }
  
  if (seriesVisibility.value.inflation) {
    const inflationData = calculateInflation(hasData)
    datasets.push({
      label: 'Inflation %',
      data: inflationData,
      borderColor: 'rgb(255, 127, 0)',
      backgroundColor: 'rgba(255, 127, 0, 0.2)',
      tension: 0.4,
      fill: false,
      pointRadius: 0
    })
  }
  
  if (seriesVisibility.value.growth) {
    const growthData = calculateGrowth(hasData)
    datasets.push({
      label: 'Growth %',
      data: growthData,
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
      tension: 0.4,
      fill: false,
      pointRadius: 0
    })
  }

  if (seriesVisibility.value.unemployment) {
    const unemploymentData = calculateUnemployment(hasData)
    datasets.push({
      label: 'Unemployment ×10',
      data: unemploymentData,
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      tension: 0.4,
      fill: false,
      pointRadius: 0
    })
  }

  if (seriesVisibility.value.averageWage) {
    const averageWageData = calculateAverageWage(hasData)
    datasets.push({
      label: 'Average Wage ÷1000',
      data: averageWageData,
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
        intersect: false,
        mode: 'index'
      },
      plugins: {
        title: {
          display: true,
          text: `Economic Indicators Timeline - ${props.selectedCountry}`,
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          display: true,
          position: 'top',
          labels: { font: { size: 12 } }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgba(147, 51, 234, 0.8)',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          type: 'linear',
          title: {
            display: true,
            text: 'Time'
          }
        },
        y: {
          type: 'linear',
          title: {
            display: true,
            text: 'Percentage (%)'
          },
          min: -5,
          max: 20
        }
      }
    }
  }
}

// Initialize chart
async function initChart() {
  await nextTick()
  
  if (!chartCanvas.value) {
    console.error('Economic indicators chart canvas not available')
    error.value = 'Chart canvas element not found'
    return
  }
  
  if (dataPoints.value.length === 0) {
    console.warn('No data points available for economic indicators chart initialization')
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
    
    console.log('Economic Indicators Chart created successfully')
    
  } catch (err) {
    console.error('Error during economic indicators chart initialization:', err)
    error.value = `Economic indicators chart initialization failed: ${err instanceof Error ? err.message : String(err)}`
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
    
    if (response.message === 'success') {
      if (response.data.length > 0) {
        console.log('Economic indicators data loaded:', {
          count: response.data.length,
          firstPoint: response.data[0],
          hasInterestRate: response.data[0].INTEREST_RATE !== undefined
        })
        
        // Append new data points
        dataPoints.value.push(...response.data)
        
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
      throw new Error(response.error || 'Failed to load economic indicators data')
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
    console.warn('Economic Indicators Chart not initialized, cannot update')
    return
  }
  
  try {
    const config = createChartConfig()
    chart.data = config.data
    chart.options.plugins!.title!.text = `Economic Indicators Timeline - ${props.selectedCountry}`
    chart.update('none')
    
    console.log('Economic Indicators Chart updated successfully')
  } catch (err) {
    console.error('Error updating economic indicators chart:', err)
    error.value = `Economic indicators chart update failed: ${err instanceof Error ? err.message : String(err)}`
  }
}

// Start auto-updating
function startAutoUpdate() {
  if (isAutoUpdating.value) return
  
  isAutoUpdating.value = true
  updateInterval = setInterval(() => {
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
  console.log('Economic Indicators Chart component mounted, loading data...')
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
  dataPoints.value = []
  lastTimestamp.value = 0
  
  if (chart) {
    updateChart()
  }
  await loadData()
})
</script>

<style scoped>
.indicators-chart {
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
  border-left: 3px solid #9333ea;
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
  background: #9333ea;
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
