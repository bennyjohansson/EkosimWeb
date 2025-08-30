<template>
  <div class="dashboard-view">
    <h1>📊 Economic Dashboard</h1>
    
    <div class="dashboard-grid">
      <!-- Country Overview -->
      <div class="dashboard-card">
        <h2>🏛️ Country Overview</h2>
        <p>Economic indicators and key metrics</p>
        <!-- Will integrate with existing country data -->
      </div>

      <!-- Real-time Charts -->
      <div class="dashboard-card">
        <h2>📈 Economic Charts</h2>
        <p>Money flow, GDP, and market data</p>
        <!-- Will use existing MoneyChart component -->
      </div>

      <!-- Quick Actions -->
      <div class="dashboard-card">
        <h2>⚡ Quick Actions</h2>
        <div class="action-buttons">
          <button class="action-btn">View Companies</button>
          <button class="action-btn">Check Bank Status</button>
          <button class="action-btn">Admin Panel</button>
        </div>
      </div>

      <!-- System Status -->
      <div class="dashboard-card">
        <h2>🔧 System Status</h2>
        <div class="status-list">
          <div class="status-item">
            <span class="status-dot green"></span>
            Simulation Running
          </div>
          <div class="status-item">
            <span class="status-dot green"></span>
            Database Connected
          </div>
          <div class="status-item">
            <span class="status-dot green"></span>
            APIs Responsive
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Clean dashboard view ready for data integration
</script>

<style scoped>
.dashboard-view {
  padding: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.dashboard-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.dashboard-card h2 {
  margin-top: 0;
  color: #333;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.75rem;
  border: none;
  background: #667eea;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #5a6fd8;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.green {
  background: #10b981;
}
</style>
