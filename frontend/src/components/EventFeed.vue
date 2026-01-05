<template>
  <div class="event-feed">
    <div class="event-feed-header">
      <h3>📋 Simulation Events</h3>
      <div class="event-filters">
        <select v-model="selectedSeverity" @change="fetchEvents" class="filter-select">
          <option value="">All Severities</option>
          <option value="INFO">INFO</option>
          <option value="WARNING">WARNING</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>
        <select v-model="selectedEventType" @change="fetchEvents" class="filter-select">
          <option value="">All Events</option>
          <option value="COMPANY_CREATED">Company Created</option>
          <option value="COMPANY_BANKRUPT">Company Bankrupt</option>
          <option value="BANKING_CRISIS">Banking Crisis</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="event-loading">Loading events...</div>
    <div v-else-if="error" class="event-error">{{ error }}</div>
    <div v-else-if="events.length === 0" class="event-empty">No events found</div>
    
    <div v-else class="event-list">
      <div 
        v-for="event in events" 
        :key="event.id" 
        class="event-item"
        :class="`severity-${event.severity.toLowerCase()}`"
      >
        <div class="event-badge" :class="`badge-${event.severity.toLowerCase()}`">
          {{ event.severity }}
        </div>
        <div class="event-content">
          <div class="event-header">
            <span class="event-type">{{ formatEventType(event.event_type) }}</span>
            <span class="event-time">Time {{ event.simulation_time }}</span>
          </div>
          <div class="event-description">{{ event.description }}</div>
          <div v-if="event.event_data && Object.keys(event.event_data).length > 0" class="event-details">
            <span 
              v-for="(value, key) in event.event_data" 
              :key="key"
              class="event-detail"
            >
              {{ key }}: <strong>{{ formatValue(value) }}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { simulationAPI } from '@/services/simulationAPI'
import type { CountryCode } from '@/types/simulation'

const props = defineProps<{
  country: CountryCode
}>()

const events = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const selectedSeverity = ref('')
const selectedEventType = ref('')
let pollingInterval: number | null = null

const fetchEvents = async () => {
  // Don't show loading spinner during polling updates
  const isInitialLoad = events.value.length === 0
  if (isInitialLoad) {
    loading.value = true
  }
  error.value = null
  
  try {
    const filters: any = { limit: 20 }
    if (selectedSeverity.value) filters.severity = selectedSeverity.value
    if (selectedEventType.value) filters.eventType = selectedEventType.value
    
    const response = await simulationAPI.getSimulationEvents(props.country, filters)
    
    if (response.message === 'success') {
      events.value = response.data
    } else {
      error.value = 'Failed to load events'
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
    console.error('Failed to fetch events:', e)
  } finally {
    if (isInitialLoad) {
      loading.value = false
    }
  }
}

const startPolling = () => {
  // Clear any existing interval
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
  
  // Poll every 5 seconds
  pollingInterval = window.setInterval(() => {
    fetchEvents()
  }, 5000)
}

const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}

const formatEventType = (type: string): string => {
  return type.split('_').map(word => 
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ')
}

const formatValue = (value: any): string => {
  if (typeof value === 'number') {
    return value.toLocaleString()
  }
  return String(value)
}

onMounted(() => {
  fetchEvents()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})

watch(() => props.country, () => {
  fetchEvents()
  // Restart polling with new country
  startPolling()
})

// Restart polling when filters change
watch([selectedSeverity, selectedEventType], () => {
  startPolling()
})
</script>

<style scoped>
.event-feed {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.event-feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.event-feed-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #2c3e50;
}

.event-filters {
  display: flex;
  gap: 0.5rem;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
}

.filter-select:hover {
  border-color: #42b983;
}

.event-loading, .event-error, .event-empty {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.event-error {
  color: #e74c3c;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
}

.event-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 6px;
  border-left: 4px solid;
  background: #f8f9fa;
  transition: transform 0.2s, box-shadow 0.2s;
}

.event-item:hover {
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.event-item.severity-info {
  border-left-color: #3498db;
}

.event-item.severity-warning {
  border-left-color: #f39c12;
  background: #fffbf0;
}

.event-item.severity-critical {
  border-left-color: #e74c3c;
  background: #fff5f5;
}

.event-badge {
  flex-shrink: 0;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  height: fit-content;
}

.badge-info {
  background: #3498db;
  color: white;
}

.badge-warning {
  background: #f39c12;
  color: white;
}

.badge-critical {
  background: #e74c3c;
  color: white;
}

.event-content {
  flex: 1;
  min-width: 0;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  gap: 1rem;
}

.event-type {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.event-time {
  font-size: 0.75rem;
  color: #7f8c8d;
  white-space: nowrap;
}

.event-description {
  color: #34495e;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.event-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.event-detail {
  font-size: 0.8rem;
  color: #7f8c8d;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #ecf0f1;
}

.event-detail strong {
  color: #2c3e50;
}

/* Scrollbar styling */
.event-list::-webkit-scrollbar {
  width: 6px;
}

.event-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.event-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.event-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
