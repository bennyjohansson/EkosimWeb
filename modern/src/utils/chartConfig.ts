
/**
 * Chart.js configuration utilities for economic simulation charts
 */

import type { 
  ChartConfiguration, 
  MoneyDataPoint, 
  TimeDataPoint 
} from '@/types/simulation'

/**
 * Create line chart configuration for money data
 */
export function createMoneyChart(data: MoneyDataPoint[]): ChartConfiguration {
  return {
    type: 'line',
    data: {
      labels: data.map(d => d.TIME.toString()),
      datasets: [
        {
          label: 'Money Supply',
          data: data.map(d => ({ x: d.TIME, y: d.MONEY_SUPPLY || 0 })),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: false
        },
        {
          label: 'Interest Rate (%)',
          data: data.map(d => ({ x: d.TIME, y: (d.INTEREST_RATE || 0) * 100 })),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Money Supply & Interest Rates'
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Time'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Value'
          }
        }
      }
    }
  }
}

/**
 * Create line chart configuration for GDP data
 */
export function createGDPChart(data: TimeDataPoint[]): ChartConfiguration {
  return {
    type: 'line',
    data: {
      labels: data.map(d => d.TIME.toString()),
      datasets: [
        {
          label: 'GDP',
          data: data.map(d => ({ x: d.TIME, y: d.GDP })),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: false
        },
        {
          label: 'Total Money',
          data: data.map(d => ({ x: d.TIME, y: d.TOTAL_MONEY || 0 })),
          borderColor: 'rgb(255, 206, 86)',
          backgroundColor: 'rgba(255, 206, 86, 0.2)',
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'GDP & Economic Indicators'
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Time'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Value'
          }
        }
      }
    }
  }
}
