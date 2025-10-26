<template>
  <div class="highscore-view">
    <div class="page-header">
      <h1 class="page-title">🏆 Economic Performance Leaderboard</h1>
      <p class="page-description">
        Countries ranked by economic growth, inequality (Palma ratio), and environmental impact
      </p>
    </div>

    <div class="filters-section">
      <div class="ranking-weights">
        <h3>📊 Ranking Weights</h3>
        <div class="weight-controls">
          <div class="weight-input">
            <label>Growth Weight:</label>
            <input 
              type="range" 
              v-model.number="weights.growth" 
              min="0" 
              max="1" 
              step="0.1"
              @input="recalculateRankings"
            />
            <span>{{ (weights.growth * 100).toFixed(0) }}%</span>
          </div>
          <div class="weight-input">
            <label>Equality Weight:</label>
            <input 
              type="range" 
              v-model.number="weights.palma" 
              min="0" 
              max="1" 
              step="0.1"
              @input="recalculateRankings"
            />
            <span>{{ (weights.palma * 100).toFixed(0) }}%</span>
          </div>
          <div class="weight-input">
            <label>Environment Weight:</label>
            <input 
              type="range" 
              v-model.number="weights.environment" 
              min="0" 
              max="1" 
              step="0.1"
              @input="recalculateRankings"
            />
            <span>{{ (weights.environment * 100).toFixed(0) }}%</span>
          </div>
        </div>
        <button @click="resetWeights" class="btn btn-secondary">Reset to Default</button>
      </div>
    </div>

    <div class="highscore-table-container">
      <div class="table-controls">
        <button 
          @click="loadHighScoreData" 
          :disabled="isLoading" 
          class="btn btn-primary"
        >
          {{ isLoading ? 'Loading...' : 'Refresh Data' }}
        </button>
        <div class="table-info">
          <span>Showing top {{ Math.min(highScoreData.length, maxDisplayRows) }} of {{ highScoreData.length }} countries</span>
        </div>
      </div>

      <div v-if="error" class="error-message">
        <strong>Error:</strong> {{ error }}
      </div>

      <div v-if="isLoading" class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading highscore data...</p>
      </div>

      <div v-else-if="rankedData.length === 0" class="no-data">
        <p>No highscore data available. Click "Refresh Data" to load.</p>
      </div>

      <div v-else class="table-responsive">
        <table class="highscore-table">
          <thead>
            <tr>
              <th class="rank-col">Rank</th>
              <th class="country-col">Country</th>
              <th class="metric-col" title="Compound Annual Growth Rate">Growth</th>
              <th class="metric-col" title="Palma Ratio - Inequality Measure">Palma</th>
              <th class="metric-col" title="Environmental Impact Score">Env.</th>
              <th class="timestamp-col">Updated</th>
              <th class="subrank-col">G-Rnk</th>
              <th class="subrank-col">P-Rnk</th>
              <th class="subrank-col">E-Rnk</th>
              <th class="score-col">Score</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(entry, index) in displayedData" 
              :key="entry.COUNTRY"
              :class="{ 'top-rank': index < 3 }"
            >
              <td class="rank-cell">
                <span class="rank-badge" :class="getRankClass(index)">
                  {{ entry.TOTrank }}
                </span>
              </td>
              <td class="country-cell">
                <strong>{{ entry.COUNTRY }}</strong>
              </td>
              <td class="metric-cell growth">
                {{ formatPercentage(entry.GROWTH) }}
              </td>
              <td class="metric-cell palma">
                {{ formatNumber(entry.PALMA) }}
              </td>
              <td class="metric-cell environment">
                {{ Math.round(entry.ENV_IMP).toLocaleString() }}
              </td>
              <td class="timestamp-cell">
                {{ formatTimestamp(entry.TIMENOW) }}
              </td>
              <td class="subrank-cell">{{ entry.GROWTHrank }}</td>
              <td class="subrank-cell">{{ entry.PALMArank }}</td>
              <td class="subrank-cell">{{ entry.ENVrank }}</td>
              <td class="score-cell">
                <strong>{{ entry.TOTscore }}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Debug section -->
    <div v-if="rankedData.length > 0" class="debug-section">
      <details>
        <summary>🔍 Debug: Ranking Calculation Details</summary>
        <div class="debug-content">
          <h4>Current Weights:</h4>
          <pre>{{ JSON.stringify(weights, null, 2) }}</pre>
          
          <h4>Sample Calculation (First Entry):</h4>
          <pre v-if="rankedData[0]">{{ JSON.stringify(rankedData[0], null, 2) }}</pre>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { simulationAPI, parseAPIError } from '@/services/simulationAPI'
import type { HighScoreEntry } from '@/types/simulation'

// Reactive state
const highScoreData = ref<HighScoreEntry[]>([])
const isLoading = ref(false)
const error = ref<string>('')
const maxDisplayRows = ref(100)

// Ranking weights (matching legacy default of 1/3 each)
const weights = ref({
  growth: 1/3,
  palma: 1/3,
  environment: 1/3
})

// Extended interface for calculated rankings
interface RankedHighScoreEntry extends HighScoreEntry {
  GROWTHrank: number
  PALMArank: number
  ENVrank: number
  TOTscore: number
  TOTrank: number
}

const rankedData = ref<RankedHighScoreEntry[]>([])

// Computed property for displayed data (top N entries)
const displayedData = computed(() => {
  return rankedData.value.slice(0, maxDisplayRows.value)
})

// Load highscore data from API
async function loadHighScoreData() {
  if (isLoading.value) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    const response = await simulationAPI.getHighScore()
    
    if (response.message === 'success') {
      console.log('Highscore data loaded:', {
        count: response.data.length,
        sample: response.data[0]
      })
      
      highScoreData.value = response.data
      recalculateRankings()
    } else {
      throw new Error(response.error || 'Failed to load highscore data')
    }
  } catch (err) {
    error.value = parseAPIError(err)
    console.error('Error loading highscore data:', err)
  } finally {
    isLoading.value = false
  }
}

// Calculate rankings following legacy algorithm
function recalculateRankings() {
  if (highScoreData.value.length === 0) return
  
  console.log('Recalculating rankings with weights:', weights.value)
  
  // Create working copy of data with calculated ranking fields
  let workingData: RankedHighScoreEntry[] = highScoreData.value.map(entry => ({
    ...entry,
    GROWTHrank: 0,
    PALMArank: 0,
    ENVrank: 0,
    TOTscore: 0,
    TOTrank: 0
  }))
  
  // Calculate Growth Rankings (higher growth = better rank)
  workingData.sort((a, b) => b.GROWTH - a.GROWTH)
  let growthRank = 1
  for (let i = 0; i < workingData.length; i++) {
    if (i > 0 && workingData[i].GROWTH < workingData[i - 1].GROWTH) {
      growthRank++
    }
    workingData[i].GROWTHrank = growthRank
  }
  
  // Calculate Palma Rankings (lower palma = better rank)
  workingData.sort((a, b) => a.PALMA - b.PALMA)
  let palmaRank = 1
  for (let i = 0; i < workingData.length; i++) {
    if (i > 0 && workingData[i].PALMA > workingData[i - 1].PALMA) {
      palmaRank++
    }
    workingData[i].PALMArank = palmaRank
  }
  
  // Calculate Environment Rankings (lower environmental impact = better rank)
  workingData.sort((a, b) => a.ENV_IMP - b.ENV_IMP)
  let envRank = 1
  for (let i = 0; i < workingData.length; i++) {
    if (i > 0 && workingData[i].ENV_IMP > workingData[i - 1].ENV_IMP) {
      envRank++
    }
    workingData[i].ENVrank = envRank
  }
  
  // Calculate weighted total scores
  for (let entry of workingData) {
    entry.TOTscore = parseFloat((
      weights.value.growth * entry.GROWTHrank +
      weights.value.palma * entry.PALMArank +
      weights.value.environment * entry.ENVrank
    ).toFixed(2))
  }
  
  // Calculate total rankings (lower total score = better rank)
  workingData.sort((a, b) => a.TOTscore - b.TOTscore)
  let totalRank = 1
  for (let i = 0; i < workingData.length; i++) {
    if (i > 0 && workingData[i].TOTscore > workingData[i - 1].TOTscore) {
      totalRank++
    }
    workingData[i].TOTrank = totalRank
  }
  
  // Final sort by total rank for display
  workingData.sort((a, b) => a.TOTrank - b.TOTrank)
  
  rankedData.value = workingData
  
  console.log('Rankings calculated:', {
    totalEntries: workingData.length,
    topEntry: workingData[0],
    weights: weights.value
  })
}

// Reset weights to default
function resetWeights() {
  weights.value = {
    growth: 1/3,
    palma: 1/3,
    environment: 1/3
  }
  recalculateRankings()
}

// Formatting functions
function formatPercentage(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A'
  }
  // Convert decimal to percentage (e.g., 0.016 -> 1.6%)
  return `${(value * 100).toFixed(1)}%`
}

function formatNumber(value: number | undefined): string {
  return value ? value.toFixed(2) : 'N/A'
}

function formatTimestamp(timestamp: string): string {
  if (!timestamp || timestamp === 'N/A') {
    return 'N/A'
  }
  
  try {
    // Handle the format "2021-1-9 10:50:5"
    const parts = timestamp.split(' ')
    if (parts.length !== 2) return 'Invalid date'
    
    const datePart = parts[0]
    const timePart = parts[1]
    
    const dateParts = datePart.split('-')
    const timeParts = timePart.split(':')
    
    if (dateParts.length !== 3 || timeParts.length !== 3) return 'Invalid date'
    
    const year = parseInt(dateParts[0])
    const month = parseInt(dateParts[1]) - 1 // JavaScript months are 0-indexed
    const day = parseInt(dateParts[2])
    const hour = parseInt(timeParts[0])
    const minute = parseInt(timeParts[1])
    const second = parseInt(timeParts[2])
    
    const date = new Date(year, month, day, hour, minute, second)
    
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Error formatting timestamp:', timestamp, error)
    return 'Invalid date'
  }
}

function getRankClass(index: number): string {
  if (index === 0) return 'gold'
  if (index === 1) return 'silver'
  if (index === 2) return 'bronze'
  return 'regular'
}

// Initialize on mount
onMounted(async () => {
  console.log('HighScore view mounted, loading data...')
  await loadHighScoreData()
})
</script>

<style scoped>
.highscore-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.page-title {
  margin: 0 0 1rem 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.page-description {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

.filters-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.ranking-weights h3 {
  margin: 0 0 1rem 0;
  color: #374151;
}

.weight-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.weight-input {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.weight-input label {
  font-weight: 500;
  min-width: 120px;
  color: #4b5563;
}

.weight-input input[type="range"] {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  outline: none;
}

.weight-input span {
  font-weight: 600;
  color: #1f2937;
  min-width: 40px;
}

.highscore-table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.table-info {
  color: #6b7280;
  font-size: 0.9rem;
}

.table-responsive {
  overflow-x: auto;
  max-width: 100%;
}

.highscore-table {
  width: 100%;
  min-width: 1000px; /* Minimum width to prevent cramping */
  border-collapse: collapse;
  font-size: 0.85rem;
}

.highscore-table th {
  background: #374151;
  color: white;
  padding: 0.75rem 0.5rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.highscore-table td {
  padding: 0.6rem 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
}

/* Column width controls */
.rank-col { width: 60px; }
.country-col { width: 140px; min-width: 120px; }
.metric-col { width: 90px; text-align: center; }
.timestamp-col { width: 110px; }
.subrank-col { width: 70px; text-align: center; }
.score-col { width: 90px; text-align: center; }

.highscore-table tbody tr:hover {
  background: #f9fafb;
}

.top-rank {
  background: linear-gradient(90deg, #fef3c7 0%, transparent 100%);
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-weight: bold;
  font-size: 0.8rem;
}

.rank-badge.gold {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
}

.rank-badge.silver {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
  color: white;
}

.rank-badge.bronze {
  background: linear-gradient(135deg, #d97706, #b45309);
  color: white;
}

.rank-badge.regular {
  background: #e5e7eb;
  color: #374151;
}

.country-cell strong {
  color: #1f2937;
  font-size: 0.9rem;
}

.metric-cell {
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 500;
  font-size: 0.8rem;
  text-align: center;
}

.metric-cell.growth {
  color: #059669;
}

.metric-cell.palma {
  color: #dc2626;
}

.metric-cell.environment {
  color: #7c3aed;
}

.score-cell strong {
  color: #1f2937;
  font-size: 0.9em;
}

.subrank-cell {
  font-size: 0.8rem;
  color: #6b7280;
  text-align: center;
  font-weight: 500;
}

.timestamp-cell {
  font-size: 0.75rem;
  color: #6b7280;
  white-space: nowrap;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .highscore-table {
    min-width: 900px;
    font-size: 0.8rem;
  }
  
  .highscore-table th {
    padding: 0.6rem 0.4rem;
    font-size: 0.7rem;
  }
  
  .highscore-table td {
    padding: 0.5rem 0.4rem;
  }
  
  .country-col { width: 120px; }
  .metric-col { width: 80px; }
  .timestamp-col { width: 100px; }
  .subrank-col { width: 60px; }
}

@media (max-width: 768px) {
  .highscore-table {
    min-width: 800px;
    font-size: 0.75rem;
  }
  
  .highscore-table th {
    padding: 0.5rem 0.3rem;
  }
  
  .highscore-table td {
    padding: 0.4rem 0.3rem;
  }
  
  .rank-badge {
    width: 24px;
    height: 24px;
    font-size: 0.7rem;
  }
  
  .country-col { width: 100px; }
  .metric-col { width: 70px; }
  .timestamp-col { width: 90px; }
  .subrank-col { width: 50px; }
  .score-col { width: 80px; }
}

.loading-spinner {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  padding: 1rem;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 6px;
  color: #dc2626;
  margin: 1rem;
}

.no-data {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.debug-section {
  margin-top: 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
}

.debug-section summary {
  padding: 1rem;
  background: #f9fafb;
  cursor: pointer;
  font-weight: 500;
  border-radius: 6px 6px 0 0;
}

.debug-content {
  padding: 1rem;
}

.debug-content pre {
  background: #1f2937;
  color: #e5e7eb;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.8rem;
  margin: 0.5rem 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .highscore-view {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .weight-controls {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .table-controls {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .highscore-table {
    font-size: 0.8rem;
  }
  
  .highscore-table th,
  .highscore-table td {
    padding: 0.5rem 0.25rem;
  }
}
</style>
