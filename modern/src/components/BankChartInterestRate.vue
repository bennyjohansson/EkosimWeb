<template>
  <div class="bank-chart">
    <div class="chart-header">
      <h3>🏦 Banking Metrics - Interest Rates</h3>
      <div class="chart-controls">
        <button @click="loadData" :disabled="isLoading" class="btn btn-small">
          {{ isLoading ? 'Loading...' : 'Refresh Data' }}
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
          <span class="label">Latest Interest Rate:</span>
          <span class="value">{{ latestInterestRate }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Chart, registerables } from 'chart.js'
import { simulationAPI } from '@/services/simulationAPI'
import type { CountryCode, TimeDataPoint } from '@/types/simulation'

// Register Chart.js
Chart.register(...registerables)

// Props
const props = defineProps<{
  selectedCountry: CountryCode
}>()

// Reactive data
const chartCanvas = ref<HTMLCanvasElement | null>(null)
const dataPoints = ref<TimeDataPoint[]>([])
const isLoading = ref(false)
const error = ref('')
const lastTimestamp = ref(0)

let chart: Chart | null = null
let updateInterval: ReturnType<typeof setInterval> | null = null

// Computed values
const latestInterestRate = computed(() => {
  if (dataPoints.value.length === 0) return 'N/A'
  const latest = dataPoints.value[dataPoints.value.length - 1]
  // TimeDataPoint should have INTEREST_RATE field based on legacy code
  return ((latest as any).INTEREST_RATE ? ((latest as any).INTEREST_RATE * 100).toFixed(2) + '%' : 'N/A')
})

// Data loading
async function loadData() {
  if (isLoading.value) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    console.log(`🏦 Loading interest rate data for ${props.selectedCountry}...`)
    
    // Try to get TIME_DATA first
    const timeResponse = await simulationAPI.getTimeDataUpdates(
      props.selectedCountry,
      lastTimestamp.value
    )
    
    if (timeResponse.message === 'success' && timeResponse.data && timeResponse.data.length > 0) {
      console.log('🏦 Time data received:', timeResponse.data.length, 'points')
      console.log('🏦 Sample data:', timeResponse.data[0])
      
      // Append new data points
      dataPoints.value.push(...timeResponse.data)
      
      // Update last timestamp
      const maxTime = Math.max(...timeResponse.data.map(d => d.TIME))
      lastTimestamp.value = maxTime
      
      console.log(`🏦 Total data points: ${dataPoints.value.length}`)
    } else {
      console.log('🏦 No new time data available, trying to get current parameter values...')
      
      // Fallback: get current interest rate from parameters
      try {
        const paramResponse = await simulationAPI.getParameter(props.selectedCountry, 'TargetInterestRate')
        if (paramResponse.message === 'success' && paramResponse.data) {
          const currentTime = Date.now()
          const currentRate = parseFloat(String(paramResponse.data.VALUE))
          
          console.log('🏦 Got current interest rate from parameters:', currentRate)
          
          // Create a synthetic data point
          const syntheticPoint: any = {
            TIME: currentTime,
            INTEREST_RATE: currentRate
          }
          
          // Only add if we don't have recent data or if the rate changed
          const lastPoint = dataPoints.value[dataPoints.value.length - 1]
          if (!lastPoint || Math.abs((lastPoint as any).INTEREST_RATE - currentRate) > 0.0001 || currentTime - lastPoint.TIME > 10000) {
            dataPoints.value.push(syntheticPoint)
            console.log('🏦 Added synthetic data point')
          }
        }
      } catch (paramError) {
        console.error('🏦 Failed to get parameter:', paramError)
      }
    }
    
    // Update chart
    updateChart()
    
  } catch (err) {
    error.value = 'Network error occurred'
    console.error('🏦 Network Error:', err)
  } finally {
    isLoading.value = false
  }
}

// Chart management
function updateChart() {
  if (!chart || dataPoints.value.length === 0) return
  
  console.log('🏦 Updating chart with', dataPoints.value.length, 'data points')
  
  // Prepare data
  const labels = dataPoints.value.map(d => d.TIME.toString())
  const interestRateData = dataPoints.value.map(d => ((d as any).INTEREST_RATE || 0) * 100) // Convert to percentage
  
  // Update chart data
  chart.data.labels = labels
  chart.data.datasets[0].data = interestRateData
  
  chart.update('none') // No animation for better performance
  
  console.log('🏦 Chart updated. Latest interest rate:', interestRateData[interestRateData.length - 1])
}

function initChart() {
  if (!chartCanvas.value) return
  
  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return
  
  console.log('🏦 Initializing interest rate chart')
  
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Interest Rate %',
        data: [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.1,
        fill: false,
        pointRadius: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Interest Rate %'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Time'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: `Interest Rates - ${props.selectedCountry}`,
          font: {
            size: 14
          }
        },
        legend: {
          display: true,
          position: 'top'
        }
      },
      animation: {
        duration: 0
      }
    }
  })
  
  console.log('🏦 Interest rate chart initialized')
}

function startAutoUpdate() {
  if (updateInterval) return
  
  updateInterval = setInterval(() => {
    loadData()
  }, 2000)
  
  console.log('🏦 Auto-update started')
}

function stopAutoUpdate() {
  if (updateInterval) {
    clearInterval(updateInterval)
    updateInterval = null
  }
  console.log('🏦 Auto-update stopped')
}

// Lifecycle
onMounted(async () => {
  console.log('🏦 BankChart mounted for country:', props.selectedCountry)
  
  initChart()
  
  if (props.selectedCountry) {
    await loadData()
    startAutoUpdate()
  }
})

onUnmounted(() => {
  console.log('🏦 BankChart unmounting')
  stopAutoUpdate()
  
  if (chart) {
    chart.destroy()
    chart = null
  }
})

// Watch for country changes
import { watch } from 'vue'
watch(() => props.selectedCountry, async (newCountry) => {
  if (newCountry) {
    console.log('🏦 Country changed to:', newCountry)
    
    dataPoints.value = []
    lastTimestamp.value = 0
    
    if (chart) {
      chart.options.plugins!.title!.text = `Interest Rates - ${newCountry}`
    }
    
    await loadData()
  }
})
</script>

<style scoped>
.bank-chart {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-top: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  color: #2c3e50;
}

.chart-controls {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}

.chart-info {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-weight: 600;
  color: #6c757d;
}

.value {
  font-weight: bold;
  color: #2c3e50;
}
</style>
