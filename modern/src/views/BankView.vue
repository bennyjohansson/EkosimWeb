<template>
  <div class="bank-view">
    <h1>🏦 Bank Management</h1>
    
    <div class="bank-sections">
      <!-- Bank Overview -->
      <div class="bank-card">
        <h2>💰 Bank Overview</h2>
        <div class="bank-stats">
          <div class="stat-item">
            <span class="stat-label">Total Deposits</span>
            <span class="stat-value">--</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Loans</span>
            <span class="stat-value">--</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Interest Rate</span>
            <span class="stat-value">--</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Bank Capital</span>
            <span class="stat-value">--</span>
          </div>
        </div>
        <div class="placeholder-note">
          🚧 Will integrate existing bank data from legacy/app/bankApp.js
        </div>
      </div>

      <!-- Interest Rate Control -->
      <div class="bank-card">
        <h2>📊 Interest Rate Control</h2>
        <div class="rate-controls">
          <div class="control-item">
            <label>Deposit Rate (%)</label>
            <input type="number" class="control-input" min="0" max="20" step="0.1" />
          </div>
          <div class="control-item">
            <label>Loan Rate (%)</label>
            <input type="number" class="control-input" min="0" max="30" step="0.1" />
          </div>
          <div class="control-item">
            <label>Reserve Ratio (%)</label>
            <input type="number" class="control-input" min="0" max="100" step="1" />
          </div>
        </div>
        <button class="update-button">Update Interest Rates</button>
      </div>

      <!-- Bank Activities -->
      <div class="bank-card">
        <h2>🏛️ Bank Activities</h2>
        <div class="activities">
          <div class="activity-item">
            <span class="activity-icon">💵</span>
            <div class="activity-content">
              <h4>Consumer Loans</h4>
              <p>Manage consumer lending and credit policies</p>
            </div>
          </div>
          <div class="activity-item">
            <span class="activity-icon">🏢</span>
            <div class="activity-content">
              <h4>Business Loans</h4>
              <p>Corporate lending and investment financing</p>
            </div>
          </div>
          <div class="activity-item">
            <span class="activity-icon">💎</span>
            <div class="activity-content">
              <h4>Investment Portfolio</h4>
              <p>Bank's investment and asset management</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Bank view - will integrate legacy bankApp.js functionality
</script>

<style scoped>
.bank-view {
  padding: 2rem;
}

.bank-sections {
  display: grid;
  gap: 2rem;
  margin-top: 2rem;
}

.bank-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.bank-card h2 {
  margin-top: 0;
  color: #333;
}

.bank-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

.rate-controls {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
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

.control-input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

.update-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.update-button:hover {
  background: #5a6fd8;
}

.activities {
  display: grid;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
  border-left: 4px solid #667eea;
}

.activity-icon {
  font-size: 1.5rem;
}

.activity-content h4 {
  margin: 0 0 0.25rem 0;
  color: #1f2937;
}

.activity-content p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
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
