import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  instagramRelationshipService, 
  InstagramBusinessRelationship,
  InstagramRelationshipConfig 
} from '@/services/instagram-relationship'
import { instagramAPI, InstagramPost, InstagramBusinessInfo } from '@/services/instagram-api'

export interface UseInstagramOptions {
  autoRefresh?: boolean
  refreshInterval?: number // milliseconds
  enableAnalytics?: boolean
  enableRealTimeUpdates?: boolean
  onError?: (error: Error) => void
  onUpdate?: (data: InstagramBusinessRelationship) => void
}

export interface UseInstagramReturn {
  posts: InstagramPost[]
  businessInfo: InstagramBusinessInfo | null
  analytics: InstagramBusinessRelationship['analytics'] | null
  relationship: InstagramBusinessRelationship | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  connect: (config: InstagramRelationshipConfig) => Promise<void>
  disconnect: () => void
  syncStatus: {
    isSyncing: boolean
    lastUpdate: Date | null
    nextUpdate: Date | null
  }
}

export function useInstagram(
  username: string,
  options: UseInstagramOptions = {}
): UseInstagramReturn {
  const {
    autoRefresh = true,
    refreshInterval = 1000 * 60 * 15, // 15 minutes
    enableAnalytics = true,
    enableRealTimeUpdates = true,
    onError,
    onUpdate
  } = options

  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [businessInfo, setBusinessInfo] = useState<InstagramBusinessInfo | null>(null)
  const [analytics, setAnalytics] = useState<InstagramBusinessRelationship['analytics'] | null>(null)
  const [relationship, setRelationship] = useState<InstagramBusinessRelationship | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [nextUpdate, setNextUpdate] = useState<Date | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  // Cleanup function
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Load existing relationship or connect
  const loadOrConnect = useCallback(async () => {
    if (!username.trim()) {
      setError('ユーザー名が必要です')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Try to get existing relationship
      const existingRelationship = instagramRelationshipService.getBusinessRelationship(username)
      
      if (existingRelationship) {
        setRelationship(existingRelationship)
        setPosts(existingRelationship.posts)
        setBusinessInfo(existingRelationship.businessInfo)
        setAnalytics(existingRelationship.analytics)
        setLastUpdate(existingRelationship.lastSync)
      } else {
        // If no existing relationship, try to connect with basic API
        try {
          const [fetchedPosts, fetchedBusinessInfo] = await Promise.all([
            instagramAPI.getInstagramPosts(username, 6),
            instagramAPI.getInstagramBusinessInfo(username)
          ])

          if (isMountedRef.current) {
            setPosts(fetchedPosts)
            setBusinessInfo(fetchedBusinessInfo)
            setAnalytics(null) // No analytics without relationship
            setLastUpdate(new Date())
          }
        } catch (apiError) {
          console.error('Failed to fetch basic Instagram data:', apiError)
          throw new Error('Instagramデータの取得に失敗しました')
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Instagramデータの読み込みに失敗しました'
      setError(errorMessage)
      onError?.(error instanceof Error ? error : new Error(errorMessage))
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [username, onError])

  // Connect with full relationship service
  const connect = useCallback(async (config: InstagramRelationshipConfig) => {
    if (!username.trim()) {
      setError('ユーザー名が必要です')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Initialize the service
      instagramRelationshipService.initialize(config)

      // Connect to Instagram business account
      const newRelationship = await instagramRelationshipService.connectBusinessAccount(username)

      if (isMountedRef.current) {
        setRelationship(newRelationship)
        setPosts(newRelationship.posts)
        setBusinessInfo(newRelationship.businessInfo)
        setAnalytics(newRelationship.analytics)
        setLastUpdate(newRelationship.lastSync)
        onUpdate?.(newRelationship)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Instagram接続に失敗しました'
      setError(errorMessage)
      onError?.(error instanceof Error ? error : new Error(errorMessage))
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [username, onError, onUpdate])

  // Refresh data
  const refresh = useCallback(async () => {
    if (!username.trim()) return

    setIsSyncing(true)
    setError(null)

    try {
      if (relationship) {
        // Refresh through relationship service
        const updated = await instagramRelationshipService.refreshBusinessRelationship(username)
        
        if (isMountedRef.current) {
          setRelationship(updated)
          setPosts(updated.posts)
          setBusinessInfo(updated.businessInfo)
          setAnalytics(updated.analytics)
          setLastUpdate(updated.lastSync)
          onUpdate?.(updated)
        }
      } else {
        // Refresh through basic API
        const [fetchedPosts, fetchedBusinessInfo] = await Promise.all([
          instagramAPI.getInstagramPosts(username, 6),
          instagramAPI.getInstagramBusinessInfo(username)
        ])

        if (isMountedRef.current) {
          setPosts(fetchedPosts)
          setBusinessInfo(fetchedBusinessInfo)
          setLastUpdate(new Date())
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'データの更新に失敗しました'
      setError(errorMessage)
      onError?.(error instanceof Error ? error : new Error(errorMessage))
    } finally {
      if (isMountedRef.current) {
        setIsSyncing(false)
      }
    }
  }, [username, relationship, onError, onUpdate])

  // Disconnect
  const disconnect = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (relationship) {
      instagramRelationshipService.disconnectBusinessAccount(relationship.businessInfo.username)
    }

    setRelationship(null)
    setPosts([])
    setBusinessInfo(null)
    setAnalytics(null)
    setError(null)
    setLastUpdate(null)
    setNextUpdate(null)
  }, [relationship])

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      // Set up auto-refresh
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      intervalRef.current = setInterval(() => {
        refresh()
      }, refreshInterval)

      // Set next update time
      setNextUpdate(new Date(Date.now() + refreshInterval))

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setNextUpdate(null)
    }
  }, [autoRefresh, refreshInterval, refresh])

  // Initial load
  useEffect(() => {
    loadOrConnect()
  }, [loadOrConnect])

  // Webhook listener for real-time updates
  useEffect(() => {
    if (enableRealTimeUpdates && relationship) {
      const handleWebhookUpdate = (data: any) => {
        console.log('Received webhook update:', data)
        // Trigger a refresh when webhook event is received
        refresh()
      }

      instagramRelationshipService.addWebhookListener(username, handleWebhookUpdate)

      return () => {
        instagramRelationshipService.removeWebhookListener(username, handleWebhookUpdate)
      }
    }
  }, [enableRealTimeUpdates, username, relationship, refresh])

  return {
    posts,
    businessInfo,
    analytics,
    relationship,
    loading,
    error,
    refresh,
    connect,
    disconnect,
    syncStatus: {
      isSyncing,
      lastUpdate,
      nextUpdate
    }
  }
}

export function useInstagramWebSocket(
  username: string,
  options: {
    enabled?: boolean
    onMessage?: (data: any) => void
    onConnect?: () => void
    onDisconnect?: () => void
    onError?: (error: Error) => void
  } = {}
) {
  const { enabled = true, onMessage, onConnect, onDisconnect, onError } = options
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  // Cleanup function
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const connect = useCallback(() => {
    if (!enabled || !username.trim()) return

    try {
      // Create WebSocket connection for Instagram real-time updates
      const ws = new WebSocket(`ws://localhost:3001/instagram/${username}/ws`)
      
      ws.onopen = () => {
        if (isMountedRef.current) {
          setIsConnected(true)
          setConnectionError(null)
          onConnect?.()
        }
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessage?.(data)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        if (isMountedRef.current) {
          const errorMessage = 'WebSocket connection error'
          setConnectionError(errorMessage)
          onError?.(new Error(errorMessage))
        }
      }

      ws.onclose = () => {
        if (isMountedRef.current) {
          setIsConnected(false)
          onDisconnect?.()
          
          // Attempt to reconnect after 5 seconds
          if (enabled) {
            reconnectTimeoutRef.current = setTimeout(() => {
              if (isMountedRef.current) {
                connect()
              }
            }, 5000)
          }
        }
      }

      wsRef.current = ws
    } catch (error) {
      if (isMountedRef.current) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create WebSocket connection'
        setConnectionError(errorMessage)
        onError?.(error instanceof Error ? error : new Error(errorMessage))
      }
    }
  }, [username, enabled, onMessage, onConnect, onDisconnect, onError])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    if (isMountedRef.current) {
      setIsConnected(false)
      setConnectionError(null)
    }
  }, [])

  // Auto-connect when enabled
  useEffect(() => {
    if (enabled) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [enabled, connect, disconnect])

  return {
    isConnected,
    connectionError,
    connect,
    disconnect
  }
}