<template>
  <div class="admin-view">
    <h1>⚙️ Administration Panel</h1>
    
    <div class="admin-sections">
      <!-- Economic Parameters -->
      <div class="admin-card">
        <h2>📊 Economic Parameters</h2>
        <p>Configure simulation parameters and economic factors</p>
        <!-- Will migrate legacy/html/adminView.html functionality -->
        <div class="placeholder-note">
          🚧 Will integrate existing parameter controls from legacy admin panel
        </div>
      </div>

      <!-- System Control -->
      <div class="admin-card">
        <h2>🎮 Simulation Control</h2>
        <p>Start, stop, and configure the economic simulation</p>
        <div class="control-buttons">
          <button class="control-btn primary">▶️ Start Simulation</button>
          <button class="control-btn secondary">⏸️ Pause Simulation</button>
          <button class="control-btn danger">⏹️ Stop Simulation</button>
        </div>
      </div>

      <!-- User Management -->
      <div class="admin-card">
        <h2>👥 User Management</h2>
        <p>Manage user accounts and permissions</p>
        <!-- Will integrate with existing auth system -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Admin view - will integrate legacy adminApp.js functionality
</script>

<style scoped>
.admin-view {
  padding: 2rem;
}

.admin-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.admin-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.admin-card h2 {
  margin-top: 0;
  color: #333;
}

.placeholder-note {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 4px;
  color: #6b7280;
  font-style: italic;
  margin-top: 1rem;
}

.control-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.control-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.control-btn.primary {
  background: #10b981;
  color: white;
}

.control-btn.secondary {
  background: #f59e0b;
  color: white;
}

.control-btn.danger {
  background: #ef4444;
  color: white;
}

.control-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}
</style>
