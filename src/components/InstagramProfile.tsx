"use client"
import { useState, useCallback } from "react"
import { useInstagram, useInstagramWebSocket } from "@/hooks/useInstagram"
import { instagramAPI } from "@/services/instagram-api"

interface InstagramProfileProps {
  handle: string
  className?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export default function InstagramProfile({ 
  handle, 
  className, 
  autoRefresh = false,
  refreshInterval = 1000 * 60 * 30 // 30 minutes
}: InstagramProfileProps) {
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)

  const {
    posts,
    businessInfo,
    loading,
    error,
    refresh,
    syncStatus
  } = useInstagram(handle, {
    autoRefresh,
    refreshInterval,
    onError: (error) => {
      console.error('Instagram sync error:', error)
    }
  })

  // WebSocket connection for real-time updates
  const { isConnected } = useInstagramWebSocket(handle, {
    onMessage: (newPosts) => {
      // Handle real-time updates
      setLastUpdateTime(new Date())
    }
  })

  const handleManualRefresh = useCallback(async () => {
    await refresh()
    setLastUpdateTime(new Date())
  }, [refresh])

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
        <div className="text-center text-gray-600">
          <p className="mb-2">⚠️ {error}</p>
          <a 
            href={`https://www.instagram.com/${handle}/`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 underline text-sm"
          >
            @{handle} をInstagramで見る
          </a>
        </div>
      </div>
    )
  }

  if (!businessInfo) {
    return null
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-4">
        <img 
          src={businessInfo.profilePictureUrl} 
          alt={`${businessInfo.fullName}のプロフィール画像`}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">{businessInfo.fullName}</h3>
              <p className="text-sm text-gray-600">@{businessInfo.username}</p>
            </div>
            <div className="flex items-center gap-2">
              {isConnected && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  ライブ
                </span>
              )}
              {autoRefresh && (
                <button
                  onClick={handleManualRefresh}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="最新情報を取得"
                >
                  <span className="text-sm">🔄</span>
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-4 text-sm text-gray-600 mt-1">
            <span><strong>{instagramAPI.formatInstagramNumber(businessInfo.posts)}</strong> 投稿</span>
            <span><strong>{instagramAPI.formatInstagramNumber(businessInfo.followers)}</strong> フォロワー</span>
            <span><strong>{instagramAPI.formatInstagramNumber(businessInfo.following)}</strong> フォロー中</span>
          </div>
          {syncStatus.lastUpdate && (
            <p className="text-xs text-gray-400 mt-1">
              最終更新: {instagramAPI.formatInstagramDate(syncStatus.lastUpdate.toISOString())}
            </p>
          )}
        </div>
      </div>

      {/* Biography */}
      {businessInfo.biography && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 leading-relaxed">{businessInfo.biography}</p>
        </div>
      )}

      {/* Contact Info */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-4">
        {businessInfo.website && (
          <a href={businessInfo.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
            <span>🌐</span>
            <span>ウェブサイト</span>
          </a>
        )}
        {businessInfo.email && (
          <a href={`mailto:${businessInfo.email}`} className="flex items-center gap-1 text-blue-600 hover:underline">
            <span>✉️</span>
            <span>メール</span>
          </a>
        )}
        {businessInfo.phone && (
          <a href={`tel:${businessInfo.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
            <span>📞</span>
            <span>電話</span>
          </a>
        )}
        {businessInfo.address && (
          <div className="flex items-center gap-1">
            <span>📍</span>
            <span>{businessInfo.address}</span>
          </div>
        )}
      </div>

      {/* Recent Posts */}
      {posts.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-800 mb-3">最近の投稿</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {posts.map((post) => (
              <div key={post.id} className="group cursor-pointer">
                <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                  <img 
                    src={post.imageUrl} 
                    alt={post.caption}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-center">
                        <div className="text-sm font-medium">❤️ {instagramAPI.formatInstagramNumber(post.likes)}</div>
                        <div className="text-xs">💬 {instagramAPI.formatInstagramNumber(post.comments)}</div>
                      </div>
                    </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-600 line-clamp-2">{post.caption}</p>
                  <p className="text-xs text-gray-400 mt-1">{instagramAPI.formatInstagramDate(post.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <a 
              href={`https://www.instagram.com/${handle}/`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              <span>📸</span>
              <span>Instagramで全ての投稿を見る</span>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}