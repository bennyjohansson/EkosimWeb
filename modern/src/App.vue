<template>
  <div id="app">
    <header class="app-header">
      <h1>🏛️ EkoSim - Economic Simulation Dashboard</h1>
      <nav class="app-nav">
        <a href="#dashboard" class="nav-link active">Dashboard</a>
        <a href="#admin" class="nav-link">Admin</a>
        <a href="#company" class="nav-link">Company</a>
        <a href="#bank" class="nav-link">Bank</a>
        <a href="#highscore" class="nav-link">High Score</a>
      </nav>
    </header>
    
    <main class="app-main">
      <!-- This will be replaced with Vue Router views -->
      <div class="dashboard-placeholder">
        <h2>🚧 Modern EkoSim Dashboard</h2>
        <p>Clean Vue 3 + TypeScript frontend ready for feature development</p>
        
        <div class="quick-stats">
          <div class="stat-card">
            <h3>API Connection</h3>
            <span class="status-indicator">🟢 Connected</span>
          </div>
          <div class="stat-card">
            <h3>Authentication</h3>
            <span class="status-indicator">🔐 Ready</span>
          </div>
          <div class="stat-card">
            <h3>Database</h3>
            <span class="status-indicator">💾 Active</span>
          </div>
        </div>
      </div>
    </main>
    
    <footer class="app-footer">
      <p>EkoSim v2.0 - Modern Economic Simulation Platform</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Clean minimal App.vue ready for routing
</script>

<style scoped>
.app-header {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-bottom: 2rem;
}

.app-header h1 {
  margin: 0;
  font-size: 2.5rem;
}

.subtitle {
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.app-main {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.status-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #667eea;
}

.status-card h2 {
  color: #2d3748;
  margin-top: 0;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
}

.feature {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.icon {
  font-size: 1.2rem;
}

.app-footer {
  text-align: center;
  padding: 2rem;
  margin-top: 3rem;
  color: #718096;
  border-top: 1px solid #e2e8f0;
}
</style>
