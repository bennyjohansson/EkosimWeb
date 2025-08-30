<template>
  <div class="company-view">
    <h1>🏢 Company Management</h1>
    
    <div class="company-sections">
      <!-- Company Selection -->
      <div class="company-card">
        <h2>🎯 Select Company</h2>
        <select class="company-select">
          <option>Choose a company...</option>
          <!-- Will populate from API -->
        </select>
      </div>

      <!-- Company Statistics -->
      <div class="company-card">
        <h2>📊 Company Statistics</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Production</span>
            <span class="stat-value">--</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Capacity</span>
            <span class="stat-value">--</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Employees</span>
            <span class="stat-value">--</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Utilization</span>
            <span class="stat-value">--</span>
          </div>
        </div>
        <div class="placeholder-note">
          🚧 Will integrate existing company charts from legacy/app/companyApp.js
        </div>
      </div>

      <!-- Company Controls -->
      <div class="company-card">
        <h2>🎮 Company Controls</h2>
        <div class="control-grid">
          <div class="control-item">
            <label>Wage Constant (%)</label>
            <input type="number" class="control-input" min="0" max="100" />
          </div>
          <div class="control-item">
            <label>Reinvestment Rate (%)</label>
            <input type="number" class="control-input" min="0" max="100" />
          </div>
          <div class="control-item">
            <label>Investment Focus (%)</label>
            <input type="range" class="control-range" min="0" max="100" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Company view - will integrate legacy companyApp.js functionality
</script>

<style scoped>
.company-view {
  padding: 2rem;
}

.company-sections {
  display: grid;
  gap: 2rem;
  margin-top: 2rem;
}

.company-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.company-card h2 {
  margin-top: 0;
  color: #333;
}

.company-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 4px;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
}

.control-grid {
  display: grid;
  gap: 1rem;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-item label {
  font-weight: 500;
  color: #374151;
}

.control-input, .control-range {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

.placeholder-note {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 4px;
  color: #6b7280;
  font-style: italic;
  margin-top: 1rem;
}
</style>
