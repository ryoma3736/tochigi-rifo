import { instagramAPI } from './instagram-api'

export interface InstagramSyncOptions {
  username: string
  interval?: number // milliseconds
  onUpdate?: (posts: any[]) => void
  onError?: (error: Error) => void
}

export class InstagramSyncService {
  private syncIntervals = new Map<string, NodeJS.Timeout>()
  private lastUpdateTimes = new Map<string, Date>()

  /**
   * Start syncing Instagram posts for a specific username
   */
  startSync(options: InstagramSyncOptions): void {
    const { username, interval = 1000 * 60 * 30, onUpdate, onError } = options // Default 30 minutes

    // Clear existing sync if any
    this.stopSync(username)

    const syncInterval = setInterval(async () => {
      try {
        const posts = await instagramAPI.getInstagramPosts(username, 6)
        const lastUpdate = this.lastUpdateTimes.get(username)
        
        // Check if there are new posts
        if (!lastUpdate || this.hasNewPosts(posts, lastUpdate)) {
          this.lastUpdateTimes.set(username, new Date())
          onUpdate?.(posts)
        }
      } catch (error) {
        console.error(`Instagram sync error for ${username}:`, error)
        onError?.(error as Error)
      }
    }, interval)

    this.syncIntervals.set(username, syncInterval)

    // Initial sync
    this.performInitialSync(options)
  }

  /**
   * Stop syncing for a specific username
   */
  stopSync(username: string): void {
    const interval = this.syncIntervals.get(username)
    if (interval) {
      clearInterval(interval)
      this.syncIntervals.delete(username)
      this.lastUpdateTimes.delete(username)
    }
  }

  /**
   * Stop all sync operations
   */
  stopAllSync(): void {
    this.syncIntervals.forEach((interval) => clearInterval(interval))
    this.syncIntervals.clear()
    this.lastUpdateTimes.clear()
  }

  /**
   * Get sync status for a username
   */
  getSyncStatus(username: string): {
    isSyncing: boolean
    lastUpdate: Date | null
  } {
    return {
      isSyncing: this.syncIntervals.has(username),
      lastUpdate: this.lastUpdateTimes.get(username) || null
    }
  }

  /**
   * Perform initial sync immediately
   */
  private async performInitialSync(options: InstagramSyncOptions): Promise<void> {
    const { username, onUpdate, onError } = options
    
    try {
      const posts = await instagramAPI.getInstagramPosts(username, 6)
      this.lastUpdateTimes.set(username, new Date())
      onUpdate?.(posts)
    } catch (error) {
      console.error(`Initial Instagram sync error for ${username}:`, error)
      onError?.(error as Error)
    }
  }

  /**
   * Check if there are new posts since last update
   */
  private hasNewPosts(posts: any[], lastUpdate: Date): boolean {
    if (posts.length === 0) return false
    
    // Check the most recent post
    const latestPost = posts[0]
    const postTimestamp = new Date(latestPost.timestamp)
    
    return postTimestamp > lastUpdate
  }

  /**
   * Get all active sync usernames
   */
  getActiveSyncs(): string[] {
    return Array.from(this.syncIntervals.keys())
  }
}

// Export singleton instance
export const instagramSyncService = new InstagramSyncService()

// WebSocket support for real-time updates
export interface InstagramWebSocketMessage {
  type: 'instagram_update'
  username: string
  posts: any[]
  timestamp: string
}

export class InstagramWebSocketManager {
  private clients = new Set<WebSocket>()

  addClient(client: WebSocket): void {
    this.clients.add(client)
    
    client.onclose = () => {
      this.clients.delete(client)
    }
  }

  broadcastUpdate(message: InstagramWebSocketMessage): void {
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message))
      }
    })
  }

  getClientCount(): number {
    return this.clients.size
  }
}

export const instagramWebSocketManager = new InstagramWebSocketManager()