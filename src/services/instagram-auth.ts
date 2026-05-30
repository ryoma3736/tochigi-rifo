import axios from 'axios'

export interface InstagramAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scope?: string[]
}

export interface InstagramAuthToken {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
}

export interface InstagramBusinessAccount {
  id: string
  instagram_business_account?: {
    id: string
  }
  name: string
  access_token: string
}

export interface InstagramAuthState {
  isAuthenticated: boolean
  accessToken: string | null
  businessAccountId: string | null
  userId: string | null
  expiresAt: Date | null
  refreshToken: string | null
}

class InstagramAuthService {
  private config: InstagramAuthConfig | null = null
  private authState: InstagramAuthState = {
    isAuthenticated: false,
    accessToken: null,
    businessAccountId: null,
    userId: null,
    expiresAt: null,
    refreshToken: null
  }

  private baseURL = 'https://graph.facebook.com/v18.0'
  private authURL = 'https://www.facebook.com/v18.0/dialog/oauth'
  private tokenURL = 'https://graph.facebook.com/v18.0/oauth/access_token'

  initialize(config: InstagramAuthConfig): void {
    this.config = config
    this.loadAuthState()
  }

  private loadAuthState(): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('instagram_auth_state')
      if (stored) {
        const state = JSON.parse(stored)
        this.authState = {
          ...state,
          expiresAt: state.expiresAt ? new Date(state.expiresAt) : null
        }
      }
    } catch (error) {
      console.error('Failed to load auth state:', error)
    }
  }

  private saveAuthState(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('instagram_auth_state', JSON.stringify(this.authState))
    } catch (error) {
      console.error('Failed to save auth state:', error)
    }
  }

  private clearAuthState(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem('instagram_auth_state')
    } catch (error) {
      console.error('Failed to clear auth state:', error)
    }
  }

  getAuthUrl(state?: string): string {
    if (!this.config) {
      throw new Error('Instagram auth service not initialized')
    }

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: (this.config.scope || ['instagram_basic', 'instagram_content_publish', 'pages_show_list']).join(','),
      response_type: 'code',
      state: state || this.generateState()
    })

    return `${this.authURL}?${params.toString()}`
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  async exchangeCodeForToken(code: string): Promise<InstagramAuthToken> {
    if (!this.config) {
      throw new Error('Instagram auth service not initialized')
    }

    try {
      const response = await axios.get(this.tokenURL, {
        params: {
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.config.redirectUri,
          code: code
        }
      })

      const token = response.data
      this.updateAuthState(token)
      
      return token
    } catch (error) {
      console.error('Token exchange error:', error)
      throw new Error('Instagram認証トークンの取得に失敗しました')
    }
  }

  private updateAuthState(token: InstagramAuthToken): void {
    this.authState = {
      ...this.authState,
      accessToken: token.access_token,
      refreshToken: token.refresh_token || this.authState.refreshToken,
      expiresAt: new Date(Date.now() + (token.expires_in * 1000))
    }
    this.saveAuthState()
  }

  async refreshAccessToken(): Promise<string> {
    if (!this.config || !this.authState.refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await axios.get(this.tokenURL, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          fb_exchange_token: this.authState.refreshToken
        }
      })

      const token = response.data
      this.updateAuthState(token)
      
      return token.access_token
    } catch (error) {
      console.error('Token refresh error:', error)
      throw new Error('トークンの更新に失敗しました')
    }
  }

  async getBusinessAccounts(): Promise<InstagramBusinessAccount[]> {
    if (!this.authState.accessToken) {
      throw new Error('Not authenticated')
    }

    try {
      const response = await axios.get(`${this.baseURL}/me/accounts`, {
        params: {
          access_token: this.authState.accessToken,
          fields: 'id,name,instagram_business_account'
        }
      })

      return response.data.data.map((account: any) => ({
        id: account.id,
        name: account.name,
        instagram_business_account: account.instagram_business_account,
        access_token: this.authState.accessToken!
      }))
    } catch (error) {
      console.error('Failed to get business accounts:', error)
      throw new Error('ビジネスアカウントの取得に失敗しました')
    }
  }

  async getInstagramBusinessAccountId(pageId: string): Promise<string> {
    if (!this.authState.accessToken) {
      throw new Error('Not authenticated')
    }

    try {
      const response = await axios.get(`${this.baseURL}/${pageId}`, {
        params: {
          access_token: this.authState.accessToken,
          fields: 'instagram_business_account'
        }
      })

      const instagramAccount = response.data.instagram_business_account
      if (!instagramAccount) {
        throw new Error('Instagramビジネスアカウントが見つかりません')
      }

      return instagramAccount.id
    } catch (error) {
      console.error('Failed to get Instagram business account ID:', error)
      throw new Error('InstagramビジネスアカウントIDの取得に失敗しました')
    }
  }

  async validateToken(): Promise<boolean> {
    if (!this.authState.accessToken) {
      return false
    }

    // Check if token is expired
    if (this.authState.expiresAt && this.authState.expiresAt < new Date()) {
      try {
        await this.refreshAccessToken()
        return true
      } catch (error) {
        this.logout()
        return false
      }
    }

    try {
      const response = await axios.get(`${this.baseURL}/me`, {
        params: {
          access_token: this.authState.accessToken,
          fields: 'id'
        }
      })

      this.authState.userId = response.data.id
      this.authState.isAuthenticated = true
      this.saveAuthState()
      
      return true
    } catch (error) {
      console.error('Token validation error:', error)
      this.logout()
      return false
    }
  }

  getCurrentAuthState(): InstagramAuthState {
    return { ...this.authState }
  }

  getAccessToken(): string | null {
    return this.authState.accessToken
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated && this.authState.accessToken !== null
  }

  logout(): void {
    this.authState = {
      isAuthenticated: false,
      accessToken: null,
      businessAccountId: null,
      userId: null,
      expiresAt: null,
      refreshToken: null
    }
    this.clearAuthState()
  }

  // OAuth flow helper
  async completeOAuthFlow(code: string, pageId?: string): Promise<{
    accessToken: string
    businessAccountId: string
    userId: string
  }> {
    // Exchange code for token
    const token = await this.exchangeCodeForToken(code)
    
    // Validate token and get user info
    await this.validateToken()
    
    // If pageId is provided, get Instagram business account ID
    let businessAccountId = ''
    if (pageId) {
      businessAccountId = await this.getInstagramBusinessAccountId(pageId)
      this.authState.businessAccountId = businessAccountId
      this.saveAuthState()
    }

    return {
      accessToken: token.access_token,
      businessAccountId,
      userId: this.authState.userId!
    }
  }

  // Utility method to generate secure random state
  generateSecureState(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
}

// Export singleton instance
export const instagramAuthService = new InstagramAuthService()

// Export helper functions
export const initializeInstagramAuth = (config: InstagramAuthConfig) => instagramAuthService.initialize(config)
export const getInstagramAuthUrl = (state?: string) => instagramAuthService.getAuthUrl(state)
export const completeInstagramOAuth = (code: string, pageId?: string) => instagramAuthService.completeOAuthFlow(code, pageId)
export const getInstagramAuthState = () => instagramAuthService.getCurrentAuthState()
export const isInstagramAuthenticated = () => instagramAuthService.isAuthenticated()
export const logoutInstagram = () => instagramAuthService.logout()
export const getInstagramBusinessAccounts = () => instagramAuthService.getBusinessAccounts()
export const validateInstagramToken = () => instagramAuthService.validateToken()