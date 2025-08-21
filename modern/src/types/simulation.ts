
/**
 * TypeScript interfaces for EkoSim Economic Simulation System
 * 
 * Based on analysis of legacy API endpoints and database structure:
 * - Countries: Bennyland, Saraland, Otherland (SQLite databases)
 * - Economic entities: Consumers, Companies, Banks, Government
 * - Time-series data: Money supply, GDP, Company performance
 * - Parameters: Interest rates, spending behavior, taxes, etc.
 * - Authentication: User management for educational multiplayer features
 */

// ===== CORE TYPES =====

export type CountryCode = 'Bennyland' | 'Saraland' | 'Otherland'
export type CompanyName = string
export type ParameterName = string
export type Timestamp = number

// ===== AUTHENTICATION TYPES =====

export interface User {
  id: string
  username: string
  email: string
  level: 'beginner' | 'intermediate' | 'expert'
  createdAt: string
  lastLoginAt?: string
}

export interface UserGameData {
  userId: string
  score: number
  achievements: string[]
  unlockedScenarios: string[]
  completedTutorials: string[]
  preferences: {
    difficulty: 'easy' | 'medium' | 'hard'
    autoSave: boolean
    notifications: boolean
  }
}

export interface AuthCredentials {
  username?: string
  email: string
  password: string
  level?: 'beginner' | 'intermediate' | 'advanced'
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  username: string
  email: string
  password: string
  level: 'beginner' | 'intermediate' | 'advanced'
}

export interface AuthResponse {
  success: boolean
  token?: string
  user?: User
  error?: string
}

export interface GameSession {
  id: string
  userId: string
  countryCode: CountryCode
  isMultiplayer: boolean
  participants?: string[]
  createdAt: string
  lastActivity: string
  gameSettings: {
    difficulty: 'beginner' | 'intermediate' | 'expert'
    scenario?: string
    timeLimit?: number
  }
}

// ===== API RESPONSE WRAPPER =====

export interface ApiResponse<T = any> {
  message: 'success' | 'error'
  data: T
  error?: string
}

// ===== ECONOMIC PARAMETERS =====

export interface EconomicParameter {
  key: number
  PARAMETER: string
  VALUE: string | number
  DESCRIPTION?: string
}

// Common economic parameters from legacy system analysis
export type EconomicParameterType = 
  | 'TargetInterestRate'
  | 'InterestRateMethod' 
  | 'AverageSpendwill'
  | 'AverageBorrowwill'
  | 'InflationTarget'
  | 'IncomeTax'
  | 'CapitalGainsTax'
  | 'BudgetBalance'

export interface ParameterUpdate {
  PARAMETER: EconomicParameterType
  VALUE: string | number
}

// ===== MONEY DATA (TIME SERIES) =====

export interface MoneyDataPoint {
  key: number
  TIME: number
  TOTAL_CAPITAL?: number
  CONSUMER_CAPITAL?: number
  CONSUMER_DEBTS?: number
  CONSUMER_DEPOSITS?: number
  BANK_CAPITAL?: number
  BANK_LOANS?: number
  BANK_DEPOSITS?: number
  BANK_LIQUIDITY?: number
  COMPANY_CAIPTAL?: number  // Note: This has a typo in the legacy database
  COMPANY_DEBTS?: number
  MARKET_CAPITAL?: number
  CITY_CAPITAL?: number
}

// ===== TIME DATA (GDP & ECONOMIC INDICATORS) =====

export interface TimeDataPoint {
  key: number
  TIME: number
  TIME_STAMP: number
  GDP: number
  TOTAL_MONEY?: number
  GOVERNMENT_BUDGET?: number
  TAX_REVENUE?: number
  INTEREST_PAYMENTS?: number
  SOCIAL_BENEFITS?: number
}

// ===== COMPANY DATA =====

export interface CompanyData {
  key: number
  NAME: string
  TIME_STAMP: number
  CAPITAL?: number
  REVENUE?: number
  PROFIT?: number
  EMPLOYEES?: number
  WAGES?: number
  PRODUCTIVITY?: number
  INVESTMENT?: number
  MARKET_SHARE?: number
  STOCK_PRICE?: number
  DIVIDENDS?: number
  DEBT?: number
  EFFICIENCY?: number
}

export interface CompanyParameter {
  PARAMETER: string
  VALUE: string | number
}

// ===== WORLD DATA =====

export interface WorldTableEntry {
  key: number
  COUNTRY: CountryCode
  TOTAL_GDP?: number
  POPULATION?: number
  TRADE_BALANCE?: number
  CURRENCY_RATE?: number
  LAST_UPDATE?: number
}

// ===== HIGH SCORE DATA =====

export interface HighScoreEntry {
  key: number
  PLAYER_NAME: string
  COUNTRY: CountryCode
  GDP_SCORE: number
  EFFICIENCY_SCORE?: number
  TIMESTAMP: number
  TOTAL_SCORE?: number
}

// ===== CHART DATA STRUCTURES =====

export interface ChartDataPoint {
  x: number | string
  y: number
}

export interface ChartDataset {
  label: string
  data: ChartDataPoint[]
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  fill?: boolean
}

export interface ChartConfiguration {
  type: 'line' | 'bar' | 'pie'
  data: {
    labels: string[]
    datasets: ChartDataset[]
  }
  options?: any
}

// ===== SIMULATION STATE =====

export interface SimulationState {
  selectedCountry: CountryCode
  lastMoneyTimestamp: number
  lastTimeTimestamp: number
  lastCompanyTimestamp: number
  isRunning: boolean
  currentParameters: EconomicParameter[]
}

// ===== API ENDPOINTS INTERFACE =====

export interface SimulationAPI {
  // Parameter management
  getParameter(country: CountryCode, parameterName: ParameterName): Promise<ApiResponse<EconomicParameter>>
  getAllParameters(country: CountryCode): Promise<ApiResponse<EconomicParameter[]>>
  updateParameter(country: CountryCode, parameter: ParameterUpdate): Promise<ApiResponse<string>>
  
  // Company management  
  getCompany(country: CountryCode, companyName: CompanyName): Promise<ApiResponse<CompanyData[]>>
  updateCompanyParameter(country: CountryCode, companyName: CompanyName, parameter: CompanyParameter): Promise<ApiResponse<string>>
  getCompanyUpdates(country: CountryCode, companyName: CompanyName, lastTimestamp: number): Promise<ApiResponse<CompanyData[]>>
  
  // Time series data
  getMoneyDataUpdates(country: CountryCode, lastTimestamp: number): Promise<ApiResponse<MoneyDataPoint[]>>
  getTimeDataUpdates(country: CountryCode, lastTimestamp: number): Promise<ApiResponse<TimeDataPoint[]>>
  
  // World data
  getWorldTable(): Promise<ApiResponse<WorldTableEntry[]>>
  getHighScore(): Promise<ApiResponse<HighScoreEntry[]>>
}

// ===== COMPONENT PROPS INTERFACES =====

export interface CountrySelectorProps {
  selectedCountry: CountryCode
  onCountryChange: (country: CountryCode) => void
  availableCountries: CountryCode[]
}

export interface ParameterFormProps {
  parameters: EconomicParameter[]
  onParameterUpdate: (parameter: ParameterUpdate) => void
  isLoading?: boolean
}

export interface ChartComponentProps {
  title: string
  data: ChartDataset[]
  type: 'line' | 'bar' | 'pie'
  height?: number
  onDataUpdate?: () => void
}

export interface CompanyViewProps {
  selectedCountry: CountryCode
  selectedCompany?: CompanyName
  onCompanyChange: (company: CompanyName) => void
}

// ===== STORE INTERFACES =====

export interface SimulationStore {
  // State
  state: SimulationState
  user: User | null
  
  // Getters
  isAuthenticated: boolean
  currentCountry: CountryCode
  
  // Actions
  setCountry(country: CountryCode): void
  login(email: string, password: string): Promise<void>
  logout(): Promise<void>
  loadParameters(): Promise<void>
  updateParameter(parameter: ParameterUpdate): Promise<void>
  startDataPolling(): void
  stopDataPolling(): void
}

// ===== ERROR HANDLING =====

export interface SimulationError {
  code: string
  message: string
  details?: any
  timestamp: number
}

export class SimulationAPIError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'SimulationAPIError'
  }
}

// ===== UTILITY TYPES =====

export type PartialSimulationState = Partial<SimulationState>
export type RequiredUser = Required<User>
export type ChartType = ChartConfiguration['type']

// ===== CONSTANTS =====

export const COUNTRIES: readonly CountryCode[] = ['Bennyland', 'Saraland', 'Otherland'] as const
export const DEFAULT_COUNTRY: CountryCode = 'Bennyland'

export const ECONOMIC_PARAMETERS: readonly EconomicParameterType[] = [
  'TargetInterestRate',
  'InterestRateMethod',
  'AverageSpendwill', 
  'AverageBorrowwill',
  'InflationTarget',
  'IncomeTax',
  'CapitalGainsTax',
  'BudgetBalance'
] as const

export const API_ENDPOINTS = {
  PARAMETERS: '/ekosim/read',
  ALL_PARAMETERS: '/ekosim/getAllParameters',
  UPDATE_PARAMETER: '/ekosim/put',
  COMPANY: '/ekosim/getCompany',
  UPDATE_COMPANY: '/ekosim/putCompanyParameter',
  MONEY_UPDATES: '/ekosim/moneytable/update',
  TIME_UPDATES: '/ekosim/timetable/update',
  COMPANY_UPDATES: '/ekosim/companytable/update',
  WORLD_TABLE: '/ekosim/worldtable/',
  HIGH_SCORE: '/ekosim/getHighScore/'
} as const
