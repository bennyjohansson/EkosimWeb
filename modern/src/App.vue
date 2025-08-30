<template>
  <div id="app">
    <header class="app-header">
      <h1>🏛️ EkoSim - Economic Simulation Dashboard</h1>
      <nav class="app-nav">
        <router-link to="/" class="nav-link">Dashboard</router-link>
        <router-link to="/admin" class="nav-link">Admin</router-link>
        <router-link to="/company" class="nav-link">Company</router-link>
        <router-link to="/bank" class="nav-link">Bank</router-link>
        <router-link to="/highscore" class="nav-link">High Score</router-link>
      </nav>
    </header>
    
    <main class="app-main">
      <!-- Vue Router will render views here -->
      <router-view />
    </main>
    
    <footer class="app-footer">
      <p>EkoSim v2.0 - Modern Economic Simulation Platform</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Clean App.vue with Vue Router integration
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

.app-nav {
  margin-top: 1rem;
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
}

/* Vue Router active link styles */
.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
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

.dashboard-placeholder {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.dashboard-placeholder h2 {
  color: #2d3748;
  margin-top: 0;
  margin-bottom: 1rem;
}

.dashboard-placeholder p {
  color: #718096;
  margin-bottom: 2rem;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.stat-card {
  background: #f7fafc;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-size: 1rem;
}

.status-indicator {
  font-size: 0.875rem;
  font-weight: 500;
}

.app-footer {
  text-align: center;
  padding: 2rem;
  margin-top: 3rem;
  color: #718096;
  border-top: 1px solid #e2e8f0;
}
</style>
