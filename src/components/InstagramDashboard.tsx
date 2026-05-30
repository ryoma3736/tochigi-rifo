"use client"
import { useState, useCallback } from "react"
import { useInstagram } from "@/hooks/useInstagram"
import { instagramAPI } from "@/services/instagram-api"

interface InstagramDashboardProps {
  handle: string
  className?: string
  showAnalytics?: boolean
  showRefreshControls?: boolean
}

export default function InstagramDashboard({ 
  handle, 
  className,
  showAnalytics = true,
  showRefreshControls = true
}: InstagramDashboardProps) {
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  const {
    posts,
    businessInfo,
    loading,
    error,
    refresh,
    syncStatus
  } = useInstagram(handle, {
    autoRefresh: true,
    refreshInterval: 1000 * 60 * 15, // 15 minutes
    onError: (error) => {
      console.error('Instagram dashboard error:', error)
    }
  })

  const handlePostClick = useCallback((post: any) => {
    setSelectedPost(post)
    setShowModal(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowModal(false)
    setSelectedPost(null)
  }, [])

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg p-4">
                <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
                <div className="h-6 bg-gray-300 rounded w-20"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-lg font-semibold mb-2">Instagram連携エラー</h3>
          <p className="mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={refresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              再試行
            </button>
            <a 
              href={`https://www.instagram.com/${handle}/`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Instagramで見る
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (!businessInfo) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
        <div className="text-center text-gray-600">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-lg font-semibold mb-2">Instagram情報なし</h3>
          <p>このアカウントの情報が見つかりませんでした。</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <img 
            src={businessInfo.profilePictureUrl} 
            alt={`${businessInfo.fullName}のプロフィール画像`}
            className="w-20 h-20 rounded-full object-cover border-3 border-gray-100"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-800">{businessInfo.fullName}</h2>
            <p className="text-gray-600">@{businessInfo.username}</p>
            {businessInfo.biography && (
              <p className="text-sm text-gray-700 mt-2 leading-relaxed">{businessInfo.biography}</p>
            )}
          </div>
        </div>
        {showRefreshControls && (
          <div className="flex items-center gap-2">
            {syncStatus.isSyncing && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                自動更新中
              </span>
            )}
            <button
              onClick={refresh}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              title="最新情報を取得"
            >
              <span className="text-lg">🔄</span>
            </button>
          </div>
        )}
      </div>

      {/* Analytics */}
      {showAnalytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">
              {instagramAPI.formatInstagramNumber(businessInfo.posts)}
            </div>
            <div className="text-sm text-blue-600">投稿数</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-700">
              {instagramAPI.formatInstagramNumber(businessInfo.followers)}
            </div>
            <div className="text-sm text-purple-600">フォロワー</div>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-pink-700">
              {instagramAPI.formatInstagramNumber(businessInfo.following)}
            </div>
            <div className="text-sm text-pink-600">フォロー中</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-700">
              {posts.length > 0 ? instagramAPI.formatInstagramNumber(
                posts.reduce((sum, post) => sum + (post.likes || 0), 0)
              ) : '0'}
            </div>
            <div className="text-sm text-green-600">総いいね数</div>
          </div>
        </div>
      )}

      {/* Recent Posts Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">最近の投稿</h3>
          {syncStatus.lastUpdate && (
            <p className="text-sm text-gray-500">
              最終更新: {instagramAPI.formatInstagramDate(syncStatus.lastUpdate.toISOString())}
            </p>
          )}
        </div>
        
        {posts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="group cursor-pointer bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-200"
                onClick={() => handlePostClick(post)}
              >
                <div className="relative aspect-square">
                  <img 
                    src={post.imageUrl} 
                    alt={post.caption || 'Instagram投稿'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                    <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-center">
                      <div className="text-sm font-medium mb-1">❤️ {instagramAPI.formatInstagramNumber(post.likes || 0)}</div>
                      <div className="text-xs">💬 {instagramAPI.formatInstagramNumber(post.comments || 0)}</div>
                    </div>
                  </div>
                  {post.media_type === 'VIDEO' && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white p-1 rounded">
                      <span className="text-xs">▶️</span>
                    </div>
                  )}
                </div>
                {post.caption && (
                  <div className="p-3">
                    <p className="text-xs text-gray-600 line-clamp-2">{post.caption}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {instagramAPI.formatInstagramDate(post.timestamp)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">📷</div>
            <p>投稿が見つかりませんでした</p>
          </div>
        )}

        <div className="text-center mt-6">
          <a 
            href={`https://www.instagram.com/${handle}/`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
          >
            <span>📸</span>
            <span>Instagramで全ての投稿を見る</span>
          </a>
        </div>
      </div>

      {/* Post Detail Modal */}
      {showModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">投稿詳細</h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
              <div className="space-y-4">
                <img 
                  src={selectedPost.imageUrl} 
                  alt={selectedPost.caption || 'Instagram投稿'}
                  className="w-full rounded-lg"
                />
                {selectedPost.caption && (
                  <div>
                    <h4 className="font-medium mb-2">キャプション</h4>
                    <p className="text-gray-700 leading-relaxed">{selectedPost.caption}</p>
                  </div>
                )}
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <span>❤️</span>
                    <span>{instagramAPI.formatInstagramNumber(selectedPost.likes || 0)} いいね</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span>💬</span>
                    <span>{instagramAPI.formatInstagramNumber(selectedPost.comments || 0)} コメント</span>
                  </span>
                  <span>
                    {instagramAPI.formatInstagramDate(selectedPost.timestamp)}
                  </span>
                </div>
                <a
                  href={selectedPost.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <span>Instagramで見る</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}