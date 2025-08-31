
/**
 * Pinia store for Economic Simulation state management
 * 
 * Manages:
 * - Country selection and simulation state
 * - Economic parameters and updates
 * - Real-time data polling
 * - User authentication state
 * - Error handling and loading states
 */

import { defineStore } from 'pinia'
import { ref, computed, watch, readonly } from 'vue'
import type {
  CountryCode,
  SimulationState,
  User,
  EconomicParameter,
  EconomicParameterType,
  ParameterUpdate,
  MoneyDataPoint,
  TimeDataPoint,
  CompanyData,
  SimulationError
} from '@/types/simulation'

import { simulationAPI, parseAPIError, withRetry } from '@/services/simulationAPI'
import { DEFAULT_COUNTRY, COUNTRIES } from '@/types/simulation'

export const useSimulationStore = defineStore('simulation', () => {
  // ===== REACTIVE STATE =====
  
  // Core simulation state
  const simulationState = ref<SimulationState>({
    selectedCountry: DEFAULT_COUNTRY,
    lastMoneyTimestamp: 0,
    lastTimeTimestamp: 0,
    lastCompanyTimestamp: 0,
    isRunning: false,
    currentParameters: []
  })

  // User authentication
  const user = ref<User | null>(null)

  // Loading states
  const isLoading = ref(false)
  const isLoadingParameters = ref(false)
  const isPollingData = ref(false)

  // Data collections
  const parameters = ref<EconomicParameter[]>([])
  const moneyData = ref<MoneyDataPoint[]>([])
  const timeData = ref<TimeDataPoint[]>([])
  const companyData = ref<CompanyData[]>([])
  const bankData = ref<CompanyData[]>([])

  // Loading states for specific data
  const isLoadingBankData = ref(false)

  // Error handling
  const lastError = ref<SimulationError | null>(null)

  // Polling intervals
  let moneyDataPolling: ReturnType<typeof setInterval> | null = null
  let timeDataPolling: ReturnType<typeof setInterval> | null = null

  // ===== COMPUTED GETTERS =====

  const isAuthenticated = computed(() => {
    return user.value !== null
  })

  const currentCountry = computed(() => {
    return simulationState.value.selectedCountry
  })

  const currentParameters = computed(() => {
    return parameters.value
  })

  const hasError = computed(() => {
    return lastError.value !== null
  })

  const latestMoneyData = computed(() => {
    return moneyData.value[moneyData.value.length - 1] || null
  })

  const latestTimeData = computed(() => {
    return timeData.value[timeData.value.length - 1] || null
  })

  // ===== ACTIONS =====

  /**
   * Set selected country and reload data
   */
  async function setCountry(country: CountryCode) {
    if (!COUNTRIES.includes(country)) {
      setError('INVALID_COUNTRY', `Invalid country: ${country}`)
      return
    }

    simulationState.value.selectedCountry = country
    
    // Reset timestamps when switching countries
    simulationState.value.lastMoneyTimestamp = 0
    simulationState.value.lastTimeTimestamp = 0
    simulationState.value.lastCompanyTimestamp = 0
    
    // Clear existing data
    moneyData.value = []
    timeData.value = []
    companyData.value = []
    
    // Reload parameters for new country
    await loadParameters()
  }

  /**
   * Load economic parameters for current country
   */
  async function loadParameters() {
    if (isLoadingParameters.value) return

    isLoadingParameters.value = true
    clearError()

    try {
      const response = await withRetry(() =>
        simulationAPI.getAllParameters(currentCountry.value)
      )

      if (response.message === 'success') {
        parameters.value = response.data
        simulationState.value.currentParameters = response.data
      } else {
        throw new Error(response.error || 'Failed to load parameters')
      }
    } catch (error) {
      setError('LOAD_PARAMETERS_FAILED', parseAPIError(error))
    } finally {
      isLoadingParameters.value = false
    }
  }

  /**
   * Update an economic parameter
   */
  async function updateParameter(parameterUpdate: ParameterUpdate) {
    isLoading.value = true
    clearError()

    try {
      const response = await simulationAPI.updateParameter(
        currentCountry.value,
        parameterUpdate
      )

      if (response.message === 'success') {
        // Update local parameter value
        const paramIndex = parameters.value.findIndex(
          p => p.PARAMETER === parameterUpdate.PARAMETER
        )
        
        if (paramIndex !== -1) {
          parameters.value[paramIndex].VALUE = parameterUpdate.VALUE
        }
      } else {
        throw new Error(response.error || 'Failed to update parameter')
      }
    } catch (error) {
      setError('UPDATE_PARAMETER_FAILED', parseAPIError(error))
      throw error // Re-throw for component handling
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load latest money data updates
   */
  async function loadMoneyDataUpdates() {
    try {
      const response = await simulationAPI.getMoneyDataUpdates(
        currentCountry.value,
        simulationState.value.lastMoneyTimestamp
      )

      if (response.message === 'success' && response.data.length > 0) {
        // Append new data points
        moneyData.value.push(...response.data)
        
        // Update timestamp for next request
        const latestTimestamp = Math.max(
          ...response.data.map(d => d.TIME)
        )
        simulationState.value.lastMoneyTimestamp = latestTimestamp
      }
    } catch (error) {
      console.warn('Failed to load money data updates:', parseAPIError(error))
    }
  }

  /**
   * Load latest time data updates
   */
  async function loadTimeDataUpdates() {
    try {
      const response = await simulationAPI.getTimeDataUpdates(
        currentCountry.value,
        simulationState.value.lastTimeTimestamp
      )

      if (response.message === 'success' && response.data.length > 0) {
        // Append new data points
        timeData.value.push(...response.data)
        
        // Update timestamp for next request
        const latestTimestamp = Math.max(
          ...response.data.map(d => d.TIME)
        )
        simulationState.value.lastTimeTimestamp = latestTimestamp
      }
    } catch (error) {
      console.warn('Failed to load time data updates:', parseAPIError(error))
    }
  }

  /**
   * Load bank data (company data for the Bank)
   */
  async function loadBankData() {
    if (isLoadingBankData.value) return

    isLoadingBankData.value = true
    clearError()

    try {
      const response = await withRetry(() =>
        simulationAPI.getCompany(currentCountry.value, 'Bank')
      )

      if (response.message === 'success') {
        bankData.value = response.data
        console.log('Bank data loaded:', response.data)
      } else {
        throw new Error(response.error || 'Failed to load bank data')
      }
    } catch (error) {
      setError('LOAD_BANK_DATA_FAILED', parseAPIError(error))
    } finally {
      isLoadingBankData.value = false
    }
  }

  /**
   * Update bank parameter (like interest rate)
   */
  async function updateBankParameter(parameterName: EconomicParameterType, value: number) {
    clearError()

    try {
      const response = await withRetry(() =>
        simulationAPI.updateParameter(currentCountry.value, {
          PARAMETER: parameterName,
          VALUE: value.toString()
        })
      )

      if (response.message === 'success') {
        // Reload parameters to get updated values
        await loadParameters()
        // Reload bank data to get updated bank state
        await loadBankData()
        console.log(`Bank parameter ${parameterName} updated to ${value}`)
      } else {
        throw new Error(response.error || 'Failed to update bank parameter')
      }
    } catch (error) {
      setError('UPDATE_BANK_PARAMETER_FAILED', parseAPIError(error))
    }
  }

  /**
   * Start real-time data polling
   */
  function startDataPolling(interval: number = 2000) {
    if (isPollingData.value) return

    isPollingData.value = true
    simulationState.value.isRunning = true

    // Poll money data
    moneyDataPolling = setInterval(() => {
      if (isAuthenticated.value) {
        loadMoneyDataUpdates()
      }
    }, interval)

    // Poll time data  
    timeDataPolling = setInterval(() => {
      if (isAuthenticated.value) {
        loadTimeDataUpdates()
      }
    }, interval)
  }

  /**
   * Stop real-time data polling
   */
  function stopDataPolling() {
    if (!isPollingData.value) return

    isPollingData.value = false
    simulationState.value.isRunning = false

    if (moneyDataPolling) {
      clearInterval(moneyDataPolling)
      moneyDataPolling = null
    }

    if (timeDataPolling) {
      clearInterval(timeDataPolling)
      timeDataPolling = null
    }
  }

  /**
   * Initialize the store
   */
  async function initialize() {
    isLoading.value = true
    clearError()

    try {
      // Test API connection
      const isConnected = await simulationAPI.testConnection()
      if (!isConnected) {
        throw new Error('Unable to connect to simulation backend')
      }

      // Load initial parameters
      await loadParameters()

      // Load initial data
      await loadMoneyDataUpdates()
      await loadTimeDataUpdates()

    } catch (error) {
      setError('INITIALIZATION_FAILED', parseAPIError(error))
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Cleanup when store is destroyed
   */
  function cleanup() {
    stopDataPolling()
    clearError()
  }

  // ===== USER AUTHENTICATION =====

  async function login(email: string, _password: string) {
    isLoading.value = true
    clearError()

    try {
      // This would integrate with Firebase auth
      // For now, simulate login with new User interface
      user.value = {
        id: 'demo-user',
        username: email.split('@')[0],
        email,
        level: 'beginner',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      }
    } catch (error) {
      setError('LOGIN_FAILED', parseAPIError(error))
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    stopDataPolling()
    user.value = null
    clearError()
  }

  // ===== ERROR HANDLING =====

  function setError(code: string, message: string, details?: any) {
    lastError.value = {
      code,
      message,
      details,
      timestamp: Date.now()
    }
  }

  function clearError() {
    lastError.value = null
  }

  // ===== WATCHERS =====

  // Auto-save state to localStorage
  watch(
    () => simulationState.value.selectedCountry,
    (newCountry) => {
      localStorage.setItem('ekosim_selected_country', newCountry)
    }
  )

  // Restore state from localStorage
  const savedCountry = localStorage.getItem('ekosim_selected_country') as CountryCode
  if (savedCountry && COUNTRIES.includes(savedCountry)) {
    simulationState.value.selectedCountry = savedCountry
  }

  // ===== RETURN STORE INTERFACE =====

  return {
    // State
    simulationState: readonly(simulationState),
    user: readonly(user),
    parameters: readonly(parameters),
    moneyData: readonly(moneyData),
    timeData: readonly(timeData),
    companyData: readonly(companyData),
    bankData: readonly(bankData),
    lastError: readonly(lastError),

    // Loading states
    isLoading: readonly(isLoading),
    isLoadingParameters: readonly(isLoadingParameters),
    isLoadingBankData: readonly(isLoadingBankData),
    isPollingData: readonly(isPollingData),

    // Computed
    isAuthenticated,
    currentCountry,
    currentParameters,
    hasError,
    latestMoneyData,
    latestTimeData,

    // Actions
    setCountry,
    loadParameters,
    updateParameter,
    loadMoneyDataUpdates,
    loadTimeDataUpdates,
    loadBankData,
    updateBankParameter,
    startDataPolling,
    stopDataPolling,
    initialize,
    cleanup,
    login,
    logout,
    clearError
  }
})

// Export type for use in components
export type SimulationStore = ReturnType<typeof useSimulationStore>
