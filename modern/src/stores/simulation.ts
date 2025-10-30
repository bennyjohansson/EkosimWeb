
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
  CompanyName,
  CompanyTimeSeriesData,
  CompanyParameterType,
  CompanyParameterUpdate,
  SimulationError
} from '@/types/simulation'

import { simulationAPI, parseAPIError, withRetry } from '@/services/simulationAPI'

export const useSimulationStore = defineStore('simulation', () => {
  // ===== REACTIVE STATE =====
  
  // Available countries loaded from database
  const availableCountries = ref<CountryCode[]>([])
  
  // Core simulation state
  const simulationState = ref<SimulationState>({
    selectedCountry: '',  // Will be set after loading available countries
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

  // Company-specific state
  const availableCompanies = ref<CompanyName[]>([])
  const selectedCompany = ref<CompanyName>('')
  const companyTimeSeriesData = ref<CompanyTimeSeriesData[]>([])
  const companyParameters = ref<CompanyData[]>([])
  const lastCompanyTimeSeriesTimestamp = ref(0)

  // Loading states for specific data
  const isLoadingBankData = ref(false)
  const isLoadingCompanyData = ref(false)
  const isLoadingCompanyList = ref(false)

  // Error handling
  const lastError = ref<SimulationError | null>(null)

  // Polling intervals
  let moneyDataPolling: ReturnType<typeof setInterval> | null = null
  let timeDataPolling: ReturnType<typeof setInterval> | null = null
  let companyDataPolling: ReturnType<typeof setInterval> | null = null

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

  // Company-specific computed properties
  const currentCompany = computed(() => {
    return selectedCompany.value
  })

  const latestCompanyData = computed(() => {
    return companyParameters.value[companyParameters.value.length - 1] || null
  })

  const latestCompanyTimeSeriesData = computed(() => {
    return companyTimeSeriesData.value[companyTimeSeriesData.value.length - 1] || null
  })

  // ===== ACTIONS =====

  /**
   * Load available countries from database
   */
  async function loadAvailableCountries() {
    try {
      isLoading.value = true
      const response = await simulationAPI.getAvailableCountries()
      
      if (response.message === 'success') {
        availableCountries.value = response.data
        
        // Set default country to first available if none selected
        if (!simulationState.value.selectedCountry && response.data.length > 0) {
          simulationState.value.selectedCountry = response.data[0]
        }
      } else {
        setError('API_ERROR', response.error || 'Failed to load available countries')
      }
    } catch (error) {
      setError('NETWORK_ERROR', `Failed to load countries: ${error}`)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Set selected country and reload data
   */
  async function setCountry(country: CountryCode) {
    if (!availableCountries.value.includes(country)) {
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

  // ===== COMPANY MANAGEMENT =====

  /**
   * Load available companies for current country
   */
  async function loadAvailableCompanies() {
    if (isLoadingCompanyList.value) return

    isLoadingCompanyList.value = true
    clearError()

    try {
      const response = await withRetry(() =>
        simulationAPI.getCompanyList(currentCountry.value)
      )

      if (response.message === 'success') {
        availableCompanies.value = response.data
        
        // Set default company to first available if none selected
        if (!selectedCompany.value && response.data.length > 0) {
          selectedCompany.value = response.data[0]
        }
        
        console.log('Available companies loaded:', response.data)
      } else {
        throw new Error(response.error || 'Failed to load company list')
      }
    } catch (error) {
      setError('LOAD_COMPANIES_FAILED', parseAPIError(error))
    } finally {
      isLoadingCompanyList.value = false
    }
  }

  /**
   * Set selected company and reload data
   */
  async function setSelectedCompany(companyName: CompanyName) {
    if (!availableCompanies.value.includes(companyName)) {
      setError('INVALID_COMPANY', `Invalid company: ${companyName}`)
      return
    }

    selectedCompany.value = companyName
    
    // Reset timestamps when switching companies
    lastCompanyTimeSeriesTimestamp.value = 0
    
    // Clear existing data
    companyTimeSeriesData.value = []
    companyParameters.value = []
    
    // Reload data for new company
    await loadCompanyData()
    await loadCompanyTimeSeriesData()
  }

  /**
   * Load company data (parameters) for current company
   */
  async function loadCompanyData() {
    if (isLoadingCompanyData.value || !selectedCompany.value) return

    isLoadingCompanyData.value = true
    clearError()

    try {
      const response = await withRetry(() =>
        simulationAPI.getCompany(currentCountry.value, selectedCompany.value)
      )

      if (response.message === 'success') {
        companyParameters.value = response.data
        console.log('Company data loaded:', response.data)
      } else {
        throw new Error(response.error || 'Failed to load company data')
      }
    } catch (error) {
      setError('LOAD_COMPANY_DATA_FAILED', parseAPIError(error))
    } finally {
      isLoadingCompanyData.value = false
    }
  }

  /**
   * Load company time series data updates
   */
  async function loadCompanyTimeSeriesData() {
    if (!selectedCompany.value) return

    try {
      const response = await simulationAPI.getCompanyUpdates(
        currentCountry.value,
        selectedCompany.value,
        lastCompanyTimeSeriesTimestamp.value
      )

      if (response.message === 'success' && response.data.length > 0) {
        // Append new data points
        companyTimeSeriesData.value.push(...response.data)
        
        // Update timestamp for next request
        const latestTimestamp = Math.max(
          ...response.data.map(d => d.TIME_STAMP)
        )
        lastCompanyTimeSeriesTimestamp.value = latestTimestamp
        
        console.log('Company time series data loaded:', response.data.length, 'points')
      }
    } catch (error) {
      console.warn('Failed to load company time series data:', parseAPIError(error))
    }
  }

  /**
   * Update company parameter
   */
  async function updateCompanyParameter(
    parameterType: CompanyParameterType, 
    value: number,
    applyToAllCompanies: boolean = false
  ) {
    clearError()

    try {
      const targetCompany = applyToAllCompanies ? '*' : selectedCompany.value
      
      if (!targetCompany) {
        throw new Error('No company selected')
      }

      const response = await withRetry(() =>
        simulationAPI.updateCompanyParameter(currentCountry.value, targetCompany, {
          PARAMETER: parameterType,
          VALUE: value.toString()
        })
      )

      if (response.message === 'success') {
        // Reload company data to get updated values
        await loadCompanyData()
        console.log(`Company parameter ${parameterType} updated to ${value} for ${targetCompany}`)
      } else {
        throw new Error(response.error || 'Failed to update company parameter')
      }
    } catch (error) {
      setError('UPDATE_COMPANY_PARAMETER_FAILED', parseAPIError(error))
      throw error // Re-throw for component handling
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

    // Poll company time series data  
    companyDataPolling = setInterval(() => {
      if (isAuthenticated.value && selectedCompany.value) {
        loadCompanyTimeSeriesData()
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

    if (companyDataPolling) {
      clearInterval(companyDataPolling)
      companyDataPolling = null
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

      // Load available countries first
      await loadAvailableCountries()

      // Load initial parameters
      await loadParameters()

      // Load available companies and initial company data
      await loadAvailableCompanies()

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

  async function login(email: string, password: string) {
    isLoading.value = true
    clearError()

    try {
      // Import auth service
      const { authService } = await import('@/services/authService')
      
      // Login using JWT authentication
      const result = await authService.login(email, password)
      
      if (result.success && result.user) {
        user.value = result.user
        console.log('✅ User logged in:', result.user.email)
      } else {
        throw new Error(result.error || 'Login failed')
      }
    } catch (error) {
      setError('LOGIN_FAILED', parseAPIError(error))
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      // Import auth service
      const { authService } = await import('@/services/authService')
      
      // Logout and clear auth data
      authService.logout()
      user.value = null
      
      // Stop data polling
      stopDataPolling()
      clearError()
      
      console.log('✅ User logged out')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Initialize user from stored authentication
  async function initializeAuth() {
    try {
      const { authService } = await import('@/services/authService')
      
      if (authService.isAuthenticated()) {
        user.value = authService.getCurrentUser()
        console.log('✅ User restored from storage:', user.value?.email)
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    }
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

  // ===== WATCHERS =====

  // Watch for available countries to restore saved country
  watch(availableCountries, (newCountries) => {
    if (newCountries.length > 0) {
      const savedCountry = localStorage.getItem('ekosim_selected_country') as CountryCode
      if (savedCountry && newCountries.includes(savedCountry)) {
        simulationState.value.selectedCountry = savedCountry
      } else if (!simulationState.value.selectedCountry) {
        // Set first available country as default if none selected
        simulationState.value.selectedCountry = newCountries[0]
      }
    }
  }, { immediate: true })

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
    availableCountries: readonly(availableCountries),

    // Company state
    availableCompanies: readonly(availableCompanies),
    selectedCompany: readonly(selectedCompany),
    companyTimeSeriesData: readonly(companyTimeSeriesData),
    companyParameters: readonly(companyParameters),

    // Loading states
    isLoading: readonly(isLoading),
    isLoadingParameters: readonly(isLoadingParameters),
    isLoadingBankData: readonly(isLoadingBankData),
    isLoadingCompanyData: readonly(isLoadingCompanyData),
    isLoadingCompanyList: readonly(isLoadingCompanyList),
    isPollingData: readonly(isPollingData),

    // Computed
    isAuthenticated,
    currentCountry,
    currentParameters,
    hasError,
    latestMoneyData,
    latestTimeData,

    // Company computed
    currentCompany,
    latestCompanyData,
    latestCompanyTimeSeriesData,

    // Actions
    loadAvailableCountries,
    setCountry,
    loadParameters,
    updateParameter,
    loadMoneyDataUpdates,
    loadTimeDataUpdates,
    loadBankData,
    updateBankParameter,

    // Company actions
    loadAvailableCompanies,
    setSelectedCompany,
    loadCompanyData,
    loadCompanyTimeSeriesData,
    updateCompanyParameter,

    startDataPolling,
    stopDataPolling,
    initialize,
    cleanup,
    login,
    logout,
    initializeAuth,
    clearError
  }
})

// Export type for use in components
export type SimulationStore = ReturnType<typeof useSimulationStore>
