import { 
  instagramAuthService, 
  InstagramAuthConfig,
  InstagramBusinessAccount 
} from './instagram-auth'
import { 
  instagramAPI, 
  InstagramPost, 
  InstagramBusinessInfo 
} from './instagram-api'
import { instagramSyncService } from './instagram-sync'

export interface InstagramBusinessRelationship {
  id: string
  username: string
  businessInfo: InstagramBusinessInfo
  posts: InstagramPost[]
  analytics: InstagramAnalytics
  connectionStatus: 'connected' | 'disconnected' | 'pending'
  lastSync: Date
  syncInterval: number
  autoSync: boolean
  webhookUrl?: string
  accessToken?: string
  businessAccountId?: string
}

export interface InstagramAnalytics {
  engagementRate: number
  averageLikes: number
  averageComments: number
  postFrequency: number // posts per week
  bestPostingTime: string
  topHashtags: string[]
  audienceGrowth: {
    followers: number[]
    labels: string[]
  }
  contentPerformance: {
    images: number
    videos: number
    carousels: number
  }
  followerGrowth?: number
  monthlyReach?: number
  monthlyImpressions?: number
}

export interface InstagramRelationshipConfig {
  authConfig: InstagramAuthConfig
  autoSync?: boolean
  syncInterval?: number // milliseconds
  enableAnalytics?: boolean
  webhookUrl?: string
  enableRealTimeUpdates?: boolean
}

export interface WebhookListener {
  (data: any): void
}

class InstagramRelationshipService {
  private relationships = new Map<string, InstagramBusinessRelationship>()
  private webhookListeners = new Map<string, WebhookListener[]>()
  private config: InstagramRelationshipConfig | null = null
  private isInitialized = false

  initialize(config: InstagramRelationshipConfig): void {
    this.config = config
    this.isInitialized = true
    
    // Initialize auth service
    instagramAuthService.initialize(config.authConfig)
    
    // Load existing relationships
    this.loadRelationships()
  }

  async connectBusinessAccount(username: string): Promise<InstagramBusinessRelationship> {
    if (!this.isInitialized) {
      throw new Error('Instagram relationship service not initialized')
    }

    try {
      // Check if already connected
      const existingRelationship = this.getBusinessRelationship(username)
      if (existingRelationship && existingRelationship.connectionStatus === 'connected') {
        return existingRelationship
      }

      // Get business accounts from auth service
      const businessAccounts = await instagramAuthService.getBusinessAccounts()
      
      if (businessAccounts.length === 0) {
        throw new Error('Instagramビジネスアカウントが見つかりません')
      }

      // Find matching business account or use first one
      let selectedAccount = businessAccounts[0]
      const matchingAccount = businessAccounts.find(account => 
        account.name.toLowerCase().includes(username.toLowerCase()) ||
        account.instagram_business_account?.id === username
      )
      
      if (matchingAccount) {
        selectedAccount = matchingAccount
      }

      // Get Instagram business account ID
      let businessAccountId = selectedAccount.instagram_business_account?.id
      if (!businessAccountId) {
        businessAccountId = await instagramAuthService.getInstagramBusinessAccountId(selectedAccount.id)
      }

      // Fetch business info and posts
      const [businessInfo, posts] = await Promise.all([
        instagramAPI.getInstagramBusinessInfo(username),
        instagramAPI.getInstagramPosts(username, 12) // Get more posts for analytics
      ])

      if (!businessInfo) {
        throw new Error('ビジネス情報の取得に失敗しました')
      }

      // Generate analytics
      const analytics = this.config?.enableAnalytics ? this.generateAnalytics(posts) : this.getDefaultAnalytics()

      // Create relationship
      const relationship: InstagramBusinessRelationship = {
        id: this.generateRelationshipId(username, businessAccountId),
        username,
        businessInfo,
        posts,
        analytics,
        connectionStatus: 'connected',
        lastSync: new Date(),
        syncInterval: this.config?.syncInterval || 1000 * 60 * 30, // 30 minutes default
        autoSync: this.config?.autoSync !== false,
        webhookUrl: this.config?.webhookUrl,
        accessToken: instagramAuthService.getAccessToken() || undefined,
        businessAccountId
      }

      // Store relationship
      this.relationships.set(username, relationship)
      this.saveRelationships()

      // Start sync if auto-sync is enabled
      if (relationship.autoSync) {
        this.startAutoSync(username)
      }

      return relationship
    } catch (error) {
      console.error('Failed to connect business account:', error)
      throw new Error(`Instagramビジネスアカウントの接続に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  disconnectBusinessAccount(username: string): void {
    const relationship = this.relationships.get(username)
    if (relationship) {
      relationship.connectionStatus = 'disconnected'
      relationship.autoSync = false
      this.relationships.set(username, relationship)
      this.saveRelationships()
      
      // Stop sync
      instagramSyncService.stopSync(username)
      
      // Clear webhook listeners
      this.webhookListeners.delete(username)
    }
  }

  getBusinessRelationship(username: string): InstagramBusinessRelationship | null {
    return this.relationships.get(username) || null
  }

  getAllRelationships(): InstagramBusinessRelationship[] {
    return Array.from(this.relationships.values())
  }

  async refreshBusinessRelationship(username: string): Promise<InstagramBusinessRelationship> {
    const relationship = this.getBusinessRelationship(username)
    if (!relationship) {
      throw new Error('ビジネスリレーションシップが見つかりません')
    }

    if (relationship.connectionStatus !== 'connected') {
      throw new Error('接続されていないアカウントです')
    }

    try {
      // Refresh token if needed
      await instagramAuthService.validateToken()

      // Fetch updated data
      const [businessInfo, posts] = await Promise.all([
        instagramAPI.getInstagramBusinessInfo(username),
        instagramAPI.getInstagramPosts(username, 12)
      ])

      if (!businessInfo) {
        throw new Error('ビジネス情報の更新に失敗しました')
      }

      // Update analytics
      const analytics = this.config?.enableAnalytics ? this.generateAnalytics(posts) : relationship.analytics

      // Update relationship
      const updatedRelationship: InstagramBusinessRelationship = {
        ...relationship,
        businessInfo,
        posts,
        analytics,
        lastSync: new Date()
      }

      this.relationships.set(username, updatedRelationship)
      this.saveRelationships()

      return updatedRelationship
    } catch (error) {
      console.error('Failed to refresh business relationship:', error)
      
      // If token is invalid, disconnect
      if (error instanceof Error && error.message.includes('認証')) {
        relationship.connectionStatus = 'disconnected'
        this.relationships.set(username, relationship)
        this.saveRelationships()
      }
      
      throw new Error(`ビジネスリレーションシップの更新に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private startAutoSync(username: string): void {
    const relationship = this.relationships.get(username)
    if (!relationship || !relationship.autoSync) return

    instagramSyncService.startSync({
      username,
      interval: relationship.syncInterval,
      onUpdate: (posts) => {
        this.handleSyncUpdate(username, posts)
      },
      onError: (error) => {
        console.error(`Auto-sync error for ${username}:`, error)
      }
    })
  }

  private handleSyncUpdate(username: string, posts: InstagramPost[]): void {
    const relationship = this.relationships.get(username)
    if (!relationship) return

    // Update posts and analytics
    const analytics = this.config?.enableAnalytics ? this.generateAnalytics(posts) : relationship.analytics

    const updatedRelationship: InstagramBusinessRelationship = {
      ...relationship,
      posts,
      analytics,
      lastSync: new Date()
    }

    this.relationships.set(username, updatedRelationship)
    this.saveRelationships()

    // Notify webhook listeners
    this.notifyWebhookListeners(username, updatedRelationship)
  }

  addWebhookListener(username: string, listener: WebhookListener): void {
    if (!this.webhookListeners.has(username)) {
      this.webhookListeners.set(username, [])
    }
    this.webhookListeners.get(username)!.push(listener)
  }

  removeWebhookListener(username: string, listener: WebhookListener): void {
    const listeners = this.webhookListeners.get(username)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private notifyWebhookListeners(username: string, data: any): void {
    const listeners = this.webhookListeners.get(username)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error('Webhook listener error:', error)
        }
      })
    }
  }

  private generateAnalytics(posts: InstagramPost[]): InstagramAnalytics {
    if (posts.length === 0) {
      return this.getDefaultAnalytics()
    }

    const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0)
    const totalComments = posts.reduce((sum, post) => sum + post.comments, 0)
    const averageLikes = totalLikes / posts.length
    const averageComments = totalComments / posts.length
    
    // Calculate engagement rate (likes + comments) / followers * 100
    const engagementRate = posts.length > 0 ? 
      ((totalLikes + totalComments) / posts.length / Math.max(posts[0].likes, 1000)) * 100 : 0

    // Analyze posting frequency (posts per week)
    const oldestPost = new Date(Math.min(...posts.map(p => new Date(p.timestamp).getTime())))
    const newestPost = new Date(Math.max(...posts.map(p => new Date(p.timestamp).getTime())))
    const daysDiff = Math.ceil((newestPost.getTime() - oldestPost.getTime()) / (1000 * 60 * 60 * 24))
    const postFrequency = daysDiff > 0 ? (posts.length / daysDiff) * 7 : 0

    // Find best posting time (hour with most engagement)
    const hourEngagement = new Map<number, number>()
    posts.forEach(post => {
      const hour = new Date(post.timestamp).getHours()
      const engagement = post.likes + post.comments
      hourEngagement.set(hour, (hourEngagement.get(hour) || 0) + engagement)
    })
    
    let bestHour = 14 // Default to 2 PM
    let maxEngagement = 0
    hourEngagement.forEach((engagement, hour) => {
      if (engagement > maxEngagement) {
        maxEngagement = engagement
        bestHour = hour
      }
    })

    // Extract hashtags
    const hashtagCounts = new Map<string, number>()
    posts.forEach(post => {
      const hashtags = post.caption.match(/#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g) || []
      hashtags.forEach(tag => {
        const cleanTag = tag.toLowerCase()
        hashtagCounts.set(cleanTag, (hashtagCounts.get(cleanTag) || 0) + 1)
      })
    })

    const topHashtags = Array.from(hashtagCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag)

    // Content performance by type
    const contentTypes = posts.reduce((acc, post) => {
      acc[post.media_type.toLowerCase() + 's'] = (acc[post.media_type.toLowerCase() + 's'] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Audience growth simulation (would be real data in production)
    const audienceGrowth = this.generateAudienceGrowth(posts.length)

    return {
      engagementRate: Math.round(engagementRate * 100) / 100,
      averageLikes: Math.round(averageLikes),
      averageComments: Math.round(averageComments),
      postFrequency: Math.round(postFrequency * 10) / 10,
      bestPostingTime: `${bestHour}:00`,
      topHashtags,
      audienceGrowth,
      contentPerformance: {
        images: contentTypes.images || 0,
        videos: contentTypes.videos || 0,
        carousels: contentTypes.carousels || 0
      }
    }
  }

  private generateAudienceGrowth(postCount: number): {
    followers: number[]
    labels: string[]
  } {
    const followers = []
    const labels = []
    const baseFollowers = 1000
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - (i * 7))
      labels.push(date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }))
      
      // Simulate growth (would be real data in production)
      const growth = Math.random() * 50 - 10 // -10 to +40
      followers.push(Math.max(0, baseFollowers + (6 - i) * 20 + growth))
    }

    return { followers, labels }
  }

  private getDefaultAnalytics(): InstagramAnalytics {
    return {
      engagementRate: 0,
      averageLikes: 0,
      averageComments: 0,
      postFrequency: 0,
      bestPostingTime: '14:00',
      topHashtags: [],
      audienceGrowth: {
        followers: [1000, 1020, 1040, 1060, 1080, 1100, 1120],
        labels: ['6週間前', '5週間前', '4週間前', '3週間前', '2週間前', '1週間前', '今週']
      },
      contentPerformance: {
        images: 0,
        videos: 0,
        carousels: 0
      }
    }
  }

  private generateRelationshipId(username: string, businessAccountId: string): string {
    return `${username}_${businessAccountId}_${Date.now()}`
  }

  private saveRelationships(): void {
    if (typeof window === 'undefined') return

    try {
      const data = Array.from(this.relationships.entries()).map(([username, relationship]) => ({
        username,
        relationship: {
          ...relationship,
          lastSync: relationship.lastSync.toISOString()
        }
      }))
      
      localStorage.setItem('instagram_relationships', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save relationships:', error)
    }
  }

  private loadRelationships(): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('instagram_relationships')
      if (stored) {
        const data = JSON.parse(stored)
        data.forEach((item: any) => {
          const relationship: InstagramBusinessRelationship = {
            ...item.relationship,
            lastSync: new Date(item.relationship.lastSync)
          }
          this.relationships.set(item.username, relationship)
          
          // Restart auto-sync for connected accounts
          if (relationship.connectionStatus === 'connected' && relationship.autoSync) {
            this.startAutoSync(item.username)
          }
        })
      }
    } catch (error) {
      console.error('Failed to load relationships:', error)
    }
  }
}

// Export singleton instance
export const instagramRelationshipService = new InstagramRelationshipService()

// Export helper functions
export const initializeInstagramRelationship = (config: InstagramRelationshipConfig) => 
  instagramRelationshipService.initialize(config)
export const connectInstagramBusiness = (username: string) => 
  instagramRelationshipService.connectBusinessAccount(username)
export const disconnectInstagramBusiness = (username: string) => 
  instagramRelationshipService.disconnectBusinessAccount(username)
export const getInstagramBusinessRelationship = (username: string) => 
  instagramRelationshipService.getBusinessRelationship(username)
export const refreshInstagramBusinessRelationship = (username: string) => 
  instagramRelationshipService.refreshBusinessRelationship(username)