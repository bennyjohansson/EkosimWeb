/**
 * Modern Authentication Service (TypeScript)
 * This is a preview of how auth-api.js will be migrated to TypeScript
 */

import type { User, AuthCredentials, AuthResponse } from '@/types/simulation'

export interface AuthConfig {
  baseURL: string
  apiPath: string
  tokenKey: string
  userKey: string
}

export class AuthService {
  private config: AuthConfig
  private token: string | null = null
  private user: User | null = null

  constructor(config?: Partial<AuthConfig>) {
    this.config = {
      baseURL: '',
      apiPath: '/api/auth',
      tokenKey: 'auth_token',
      userKey: 'auth_user',
      ...config
    }
    
    this.loadFromStorage()
  }

  /**
   * Register a new user
   */
  async register(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.config.baseURL}${this.config.apiPath}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      const data = await response.json()

      if (data.success) {
        this.setAuthData(data.data.token, data.data.user)
        return { success: true, user: data.data.user, token: data.data.token }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      }
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.config.baseURL}${this.config.apiPath}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success) {
        this.setAuthData(data.data.token, data.data.user)
        return { success: true, user: data.data.user, token: data.data.token }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      }
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    this.clearAuthData()
    // In Vue app, we'll use router.push instead of window.location
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.user
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return !!(this.token && this.user)
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    return this.token
  }

  /**
   * Private methods
   */
  private setAuthData(token: string, user: User): void {
    this.token = token
    this.user = user
    localStorage.setItem(this.config.tokenKey, token)
    localStorage.setItem(this.config.userKey, JSON.stringify(user))
  }

  private clearAuthData(): void {
    this.token = null
    this.user = null
    localStorage.removeItem(this.config.tokenKey)
    localStorage.removeItem(this.config.userKey)
  }

  private loadFromStorage(): void {
    this.token = localStorage.getItem(this.config.tokenKey)
    const storedUser = localStorage.getItem(this.config.userKey)
    
    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser)
      } catch {
        this.clearAuthData()
      }
    }
  }
}

// Singleton instance
export const authService = new AuthService()
