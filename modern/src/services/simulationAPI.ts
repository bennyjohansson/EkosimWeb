
/**
 * Modern API service layer for EkoSim Economic Simulation
 * 
 * This service implements the SimulationAPI interface and provides:
 * - Type-safe API calls to the legacy backend
 * - Error handling and response validation
 * - Automatic request/response transformation
 * - Modern fetch-based HTTP client
 */

import type {
  ApiResponse,
  SimulationAPI,
  CountryCode,
  ParameterName,
  CompanyName,
  EconomicParameter,
  ParameterUpdate,
  CompanyData,
  CompanyParameter,
  CompanyTimeSeriesData,
  MoneyDataPoint,
  TimeDataPoint,
  WorldTableEntry,
  HighScoreEntry
} from '@/types/simulation'

import { API_ENDPOINTS, SimulationAPIError } from '@/types/simulation'

/**
 * HTTP client configuration
 */
const API_BASE_URL = ''  // Use proxy in development, empty string for relative URLs
const DEFAULT_TIMEOUT = 10000

/**
 * HTTP client with error handling
 */
class HTTPClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    // Get auth headers from auth service
    let authHeaders = {}
    try {
      const { authService } = await import('@/services/authService')
      authHeaders = authService.getAuthHeaders()
    } catch (error) {
      // Auth service not available, continue without auth headers
      console.warn('Auth service not available:', error)
    }
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
      ...options,
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT)
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new SimulationAPIError(
          `HTTP_${response.status}`,
          `HTTP ${response.status}: ${response.statusText}`,
          { url, status: response.status }
        )
      }

      const data = await response.json()
      
      // Validate response structure
      if (!this.isValidApiResponse(data)) {
        throw new SimulationAPIError(
          'INVALID_RESPONSE',
          'Invalid API response format',
          { url, data }
        )
      }

      return data as ApiResponse<T>
    } catch (error) {
      if (error instanceof SimulationAPIError) {
        throw error
      }
      
      if (error instanceof TypeError) {
        throw new SimulationAPIError(
          'NETWORK_ERROR',
          'Network connection failed',
          { url, originalError: error.message }
        )
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new SimulationAPIError(
          'TIMEOUT_ERROR',
          'Request timeout',
          { url, timeout: DEFAULT_TIMEOUT }
        )
      }

      throw new SimulationAPIError(
        'UNKNOWN_ERROR',
        'An unexpected error occurred',
        { url, originalError: error }
      )
    }
  }

  private isValidApiResponse(data: any): boolean {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.message === 'string' &&
      'data' in data
    )
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const url = params 
      ? `${endpoint}?${new URLSearchParams(params).toString()}`
      : endpoint
    
    return this.request<T>(url)
  }

  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }
}

/**
 * Main simulation API service implementation
 */
export class SimulationAPIService implements SimulationAPI {
  private client: HTTPClient

  constructor() {
    this.client = new HTTPClient()
  }

  // ===== PARAMETER MANAGEMENT =====

  async getParameter(
    country: CountryCode,
    parameterName: ParameterName
  ): Promise<ApiResponse<EconomicParameter>> {
    const endpoint = `${API_ENDPOINTS.PARAMETERS}/${country}`
    const params = { parameterID: parameterName }
    
    return this.client.get<EconomicParameter>(endpoint, params)
  }

  async getAllParameters(country: CountryCode): Promise<ApiResponse<EconomicParameter[]>> {
    const endpoint = `${API_ENDPOINTS.ALL_PARAMETERS}/${country}`
    
    return this.client.get<EconomicParameter[]>(endpoint)
  }

  async updateParameter(
    country: CountryCode,
    parameter: ParameterUpdate
  ): Promise<ApiResponse<string>> {
    const endpoint = `${API_ENDPOINTS.UPDATE_PARAMETER}/${country}`
    
    return this.client.put<string>(endpoint, parameter)
  }

  // ===== COMPANY MANAGEMENT =====

  async getCompany(
    country: CountryCode,
    companyName: CompanyName
  ): Promise<ApiResponse<CompanyData[]>> {
    const endpoint = `${API_ENDPOINTS.COMPANY}/${country}`
    const params = { myCompany: companyName }
    
    return this.client.get<CompanyData[]>(endpoint, params)
  }

  async getCompanyList(country: CountryCode): Promise<ApiResponse<CompanyName[]>> {
    // For now, return the hardcoded list from legacy analysis
    // This could be enhanced later to fetch from an API endpoint
    // Using country parameter for future extensibility
    console.log(`Loading company list for country: ${country}`)
    
    const companies: CompanyName[] = [
      'johansson_och_johansson',
      'limpan_AB', 
      'bempa_AB',
      'bempa_CO',
      'benny_enterprises',
      'benny_inc'
    ]
    
    return Promise.resolve({
      message: 'success',
      data: companies
    })
  }

  async updateCompanyParameter(
    country: CountryCode,
    companyName: CompanyName,
    parameter: CompanyParameter
  ): Promise<ApiResponse<string>> {
    const endpoint = `${API_ENDPOINTS.UPDATE_COMPANY}/${country}`
    const params = { myCompany: companyName }
    const url = `${endpoint}?${new URLSearchParams(params).toString()}`
    
    return this.client.put<string>(url, parameter)
  }

  async getCompanyUpdates(
    country: CountryCode,
    companyName: CompanyName,
    lastTimestamp: number
  ): Promise<ApiResponse<CompanyTimeSeriesData[]>> {
    const endpoint = `${API_ENDPOINTS.COMPANY_UPDATES}/${country}`
    const params = { 
      myCompany: companyName,
      timestamp: lastTimestamp.toString()
    }
    
    return this.client.get<CompanyTimeSeriesData[]>(endpoint, params)
  }

  // ===== TIME SERIES DATA =====

  async getMoneyDataUpdates(
    country: CountryCode,
    lastTimestamp: number
  ): Promise<ApiResponse<MoneyDataPoint[]>> {
    const endpoint = `${API_ENDPOINTS.MONEY_UPDATES}/${country}`
    const params = { timestamp: lastTimestamp.toString() }
    
    return this.client.get<MoneyDataPoint[]>(endpoint, params)
  }

  async getTimeDataUpdates(
    country: CountryCode,
    lastTimestamp: number
  ): Promise<ApiResponse<TimeDataPoint[]>> {
    const endpoint = `${API_ENDPOINTS.TIME_UPDATES}/${country}`
    const params = { timestamp: lastTimestamp.toString() }
    
    return this.client.get<TimeDataPoint[]>(endpoint, params)
  }

  // ===== WORLD DATA =====

  async getWorldTable(): Promise<ApiResponse<WorldTableEntry[]>> {
    return this.client.get<WorldTableEntry[]>(API_ENDPOINTS.WORLD_TABLE)
  }

  async getHighScore(): Promise<ApiResponse<HighScoreEntry[]>> {
    return this.client.get<HighScoreEntry[]>(API_ENDPOINTS.HIGH_SCORE)
  }

  async getAvailableCountries(): Promise<ApiResponse<CountryCode[]>> {
    return this.client.get<CountryCode[]>(API_ENDPOINTS.AVAILABLE_COUNTRIES)
  }

  // ===== UTILITY METHODS =====

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getWorldTable()
      return true
    } catch (error) {
      console.error('API connection test failed:', error)
      return false
    }
  }

  /**
   * Get API health status
   */
  async getHealth(): Promise<{
    status: 'healthy' | 'unhealthy'
    timestamp: number
    details?: any
  }> {
    try {
      const start = Date.now()
      await this.getWorldTable()
      const responseTime = Date.now() - start

      return {
        status: 'healthy',
        timestamp: Date.now(),
        details: { responseTime }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: Date.now(),
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }
}

// ===== SINGLETON INSTANCE =====

export const simulationAPI = new SimulationAPIService()

// ===== HELPER FUNCTIONS =====

/**
 * Create parameter update object with type safety
 */
export function createParameterUpdate(
  parameter: string,
  value: string | number
): ParameterUpdate {
  return {
    PARAMETER: parameter as any,
    VALUE: value
  }
}

/**
 * Format timestamp for API calls  
 */
export function formatTimestamp(timestamp: number): string {
  return timestamp.toString()
}

/**
 * Parse API error for user display
 */
export function parseAPIError(error: unknown): string {
  if (error instanceof SimulationAPIError) {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'Unable to connect to the simulation server. Please check your connection.'
      case 'TIMEOUT_ERROR':
        return 'Request timed out. The server may be busy.'
      case 'HTTP_404':
        return 'Requested data not found.'
      case 'HTTP_500':
        return 'Server error occurred. Please try again later.'
      default:
        return error.message
    }
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}

/**
 * Retry logic for API calls
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries) {
        break
      }
      
      // Don't retry on certain errors
      if (error instanceof SimulationAPIError) {
        if (error.code.startsWith('HTTP_4')) {
          // Client errors shouldn't be retried
          break
        }
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
  
  throw lastError
}

export default simulationAPI
