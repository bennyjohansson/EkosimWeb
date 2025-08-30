<template>
  <div class="highscore-view">
    <h1>🏆 Economic Simulation High Scores</h1>
    
    <div class="highscore-sections">
      <!-- Leaderboard -->
      <div class="highscore-card main-leaderboard">
        <h2>👑 Top Performers</h2>
        <div class="leaderboard">
          <div class="leaderboard-header">
            <span class="rank-col">Rank</span>
            <span class="player-col">Player</span>
            <span class="score-col">Economic Score</span>
            <span class="country-col">Country</span>
            <span class="date-col">Date</span>
          </div>
          
          <!-- Placeholder data - will populate from API -->
          <div class="leaderboard-row placeholder">
            <span class="rank">1</span>
            <span class="player">Loading...</span>
            <span class="score">--</span>
            <span class="country">--</span>
            <span class="date">--</span>
          </div>
          <div class="leaderboard-row placeholder">
            <span class="rank">2</span>
            <span class="player">Loading...</span>
            <span class="score">--</span>
            <span class="country">--</span>
            <span class="date">--</span>
          </div>
          <div class="leaderboard-row placeholder">
            <span class="rank">3</span>
            <span class="player">Loading...</span>
            <span class="score">--</span>
            <span class="country">--</span>
            <span class="date">--</span>
          </div>
        </div>
        <div class="placeholder-note">
          🚧 Will integrate existing high score data from legacy/html/highscore.html
        </div>
      </div>

      <!-- Scoring Categories -->
      <div class="highscore-card">
        <h2>📊 Scoring Categories</h2>
        <div class="categories">
          <div class="category-item">
            <span class="category-icon">💰</span>
            <div class="category-content">
              <h4>Economic Growth</h4>
              <p>GDP growth and economic expansion</p>
            </div>
          </div>
          <div class="category-item">
            <span class="category-icon">👥</span>
            <div class="category-content">
              <h4>Employment Rate</h4>
              <p>Job creation and unemployment reduction</p>
            </div>
          </div>
          <div class="category-item">
            <span class="category-icon">🏭</span>
            <div class="category-content">
              <h4>Industrial Efficiency</h4>
              <p>Production optimization and capacity utilization</p>
            </div>
          </div>
          <div class="category-item">
            <span class="category-icon">💹</span>
            <div class="category-content">
              <h4>Market Stability</h4>
              <p>Price stability and market equilibrium</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Your Performance -->
      <div class="highscore-card">
        <h2>📈 Your Performance</h2>
        <div class="personal-stats">
          <div class="stat-card">
            <h3>Current Rank</h3>
            <span class="stat-value">#--</span>
          </div>
          <div class="stat-card">
            <h3>Best Score</h3>
            <span class="stat-value">--</span>
          </div>
          <div class="stat-card">
            <h3>Games Played</h3>
            <span class="stat-value">--</span>
          </div>
          <div class="stat-card">
            <h3>Average Score</h3>
            <span class="stat-value">--</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// High Score view - will integrate legacy highscore functionality
</script>

<style scoped>
.highscore-view {
  padding: 2rem;
}

.highscore-sections {
  display: grid;
  gap: 2rem;
  margin-top: 2rem;
}

.highscore-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.highscore-card h2 {
  margin-top: 0;
  color: #333;
}

.main-leaderboard {
  grid-column: 1 / -1;
}

.leaderboard {
  display: grid;
  gap: 0.5rem;
}

.leaderboard-header {
  display: grid;
  grid-template-columns: 60px 1fr 120px 120px 100px;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
  font-weight: 600;
  color: #374151;
}

.leaderboard-row {
  display: grid;
  grid-template-columns: 60px 1fr 120px 120px 100px;
  gap: 1rem;
  padding: 1rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  transition: background 0.2s;
}

.leaderboard-row:hover {
  background: #f9fafb;
}

.leaderboard-row.placeholder {
  opacity: 0.6;
}

.rank {
  font-weight: bold;
  color: #667eea;
}

.categories {
  display: grid;
  gap: 1rem;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
  border-left: 4px solid #10b981;
}

.category-icon {
  font-size: 1.5rem;
}

.category-content h4 {
  margin: 0 0 0.25rem 0;
  color: #1f2937;
}

.category-content p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.personal-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  text-align: center;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 6px;
  border-left: 4px solid #f59e0b;
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
}

.placeholder-note {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 4px;
  color: #6b7280;
  font-style: italic;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .leaderboard-header,
  .leaderboard-row {
    grid-template-columns: 50px 1fr 80px;
    gap: 0.5rem;
  }
  
  .country-col,
  .date-col,
  .country,
  .date {
    display: none;
  }
}
</style>
