'use client'

import { useState, useEffect } from 'react'
import { useInstagram } from '@/hooks/useInstagram'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Instagram, 
  TrendingUp, 
  Users, 
  Heart, 
  MessageCircle, 
  Clock,
  Hash,
  BarChart3,
  RefreshCw,
  Settings,
  ExternalLink,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'

interface InstagramAnalyticsDashboardProps {
  username?: string
  className?: string
  showConnectionWizard?: boolean
  onConnectionComplete?: (relationship: any) => void
}

const COLORS = ['#E91E63', '#9C27B0', '#3F51B5', '#00BCD4', '#4CAF50', '#FF9800']

export default function InstagramAnalyticsDashboard({ 
  username = 'eisho8400',
  className = '',
  showConnectionWizard = false,
  onConnectionComplete
}: InstagramAnalyticsDashboardProps) {
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [showWizard, setShowWizard] = useState(showConnectionWizard)
  
  const {
    posts,
    businessInfo,
    analytics,
    relationship,
    loading,
    error,
    refresh,
    connect,
    disconnect,
    syncStatus
  } = useInstagram(username, {
    autoRefresh: true,
    refreshInterval: 1000 * 60 * 15, // 15 minutes
    enableAnalytics: true,
    enableRealTimeUpdates: true,
    onError: (error) => {
      console.error('Instagram dashboard error:', error)
    },
    onUpdate: (data) => {
      console.log('Instagram data updated:', data)
    }
  })

  const isConnected = !!relationship && relationship.connectionStatus === 'connected'
  const hasBusinessAccount = !!businessInfo

  // Calculate engagement metrics
  const totalEngagement = posts.reduce((sum, post) => sum + post.likes + post.comments, 0)
  const averageEngagement = posts.length > 0 ? totalEngagement / posts.length : 0
  const engagementRate = businessInfo && businessInfo.followers > 0 ? 
    ((averageEngagement / businessInfo.followers) * 100).toFixed(2) : '0.00'

  // Content type distribution
  const contentDistribution = posts.reduce((acc, post) => {
    const type = post.media_type.toLowerCase()
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(contentDistribution).map(([type, count]) => ({
    name: type === 'image' ? '画像' : type === 'video' ? '動画' : 'カルーセル',
    value: count,
    type
  }))

  // Recent posts performance
  const recentPostsData = posts.slice(0, 6).reverse().map((post, index) => ({
    name: `投稿${index + 1}`,
    likes: post.likes,
    comments: post.comments,
    engagement: post.likes + post.comments
  }))

  // Hashtag performance
  const hashtagData = analytics?.topHashtags?.slice(0, 8).map((hashtag, index) => ({
    hashtag,
    count: Math.floor(Math.random() * 50) + 10, // Simulated usage count
    rank: index + 1
  })) || []

  const handleConnect = async () => {
    setShowWizard(true)
  }

  const handleDisconnect = async () => {
    if (confirm('Instagramビジネスアカウントとの連携を解除しますか？')) {
      disconnect()
    }
  }

  const handleRefresh = async () => {
    await refresh()
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('ja-JP', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && !isConnected) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-pink-500 mx-auto" />
            <p className="text-sm text-gray-600">Instagramデータを読み込んでいます...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && !isConnected) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6">
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          {!hasBusinessAccount && (
            <div className="text-center space-y-4">
              <Instagram className="h-12 w-12 text-pink-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Instagramビジネス連携</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Instagramビジネスアカウントと連携して、投稿データや分析情報を取得します
                </p>
              </div>
              
              {showWizard ? (
                <div className="mt-4">
                  {/* Import the wizard component dynamically to avoid SSR issues */}
                  <div>Instagram認証ウィザードは現在準備中です</div>
                </div>
              ) : (
                <Button 
                  onClick={handleConnect}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  <Instagram className="mr-2 h-4 w-4" />
                  Instagramで認証
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg">
                <Instagram className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>Instagramビジネス分析</CardTitle>
                <CardDescription>
                  {businessInfo ? `@${businessInfo.username}` : 'Instagramビジネスアカウント'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isConnected && (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  接続済み
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              {isConnected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      {businessInfo && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-pink-50 to-pink-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-pink-600" />
                <span className="text-xs font-medium text-pink-600">フォロワー</span>
              </div>
              <div className="text-2xl font-bold text-pink-700">
                {formatNumber(businessInfo.followers)}
              </div>
              {analytics?.audienceGrowth?.followers && (
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">+2.5%</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-600">平均いいね</span>
              </div>
              <div className="text-2xl font-bold text-purple-700">
                {formatNumber(analytics?.averageLikes || 0)}
              </div>
              <div className="text-xs text-purple-600 mt-1">
                エンゲージメント率 {engagementRate}%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-600">平均コメント</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {formatNumber(analytics?.averageComments || 0)}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                投稿 {businessInfo.posts}件
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-green-600">投稿頻度</span>
              </div>
              <div className="text-2xl font-bold text-green-700">
                {analytics?.postFrequency?.toFixed(1) || '0.0'}
              </div>
              <div className="text-xs text-green-600 mt-1">
                週あたり
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Audience Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                フォロワー成長
              </CardTitle>
              <CardDescription>過去6週間のフォロワー数の推移</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={analytics.audienceGrowth.followers.map((followers, index) => ({
                  name: analytics.audienceGrowth.labels[index],
                  followers: Math.round(followers)
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="followers" 
                    stroke="#E91E63" 
                    strokeWidth={2}
                    dot={{ fill: '#E91E63' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Content Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                コンテンツタイプ
              </CardTitle>
              <CardDescription>投稿タイプの内訳</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name || ''} ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Posts Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                最近の投稿パフォーマンス
              </CardTitle>
              <CardDescription>直近6件の投稿のエンゲージメント</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={recentPostsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="likes" fill="#E91E63" name="いいね" />
                  <Bar dataKey="comments" fill="#9C27B0" name="コメント" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Hashtags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                人気のハッシュタグ
              </CardTitle>
              <CardDescription>最も使用されているハッシュタグ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hashtagData.map((tag, index) => (
                  <div key={tag.hashtag} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500 w-6">
                        {tag.rank}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {tag.hashtag}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {tag.count}回
                    </Badge>
                  </div>
                ))}
                {hashtagData.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    ハッシュタグデータがありません
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Posts Grid */}
      {posts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Instagram className="h-5 w-5" />
                最近の投稿
              </span>
              <span className="text-sm font-normal text-gray-500">
                {posts.length}件表示
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-gray-100"
                  onClick={() => setSelectedPost(post)}
                >
                  <img
                    src={post.imageUrl}
                    alt={post.caption?.slice(0, 50) || 'Instagram post'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span>{formatNumber(post.likes)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{formatNumber(post.comments)}</span>
                        </div>
                      </div>
                      <p className="text-xs mt-1 line-clamp-2">
                        {post.caption?.slice(0, 60) || 'No caption'}
                      </p>
                    </div>
                  </div>
                  {post.media_type === 'VIDEO' && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded">
                      <div className="w-3 h-3 border-2 border-white rounded-sm" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>投稿詳細</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPost(null)}
                >
                  <AlertCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <img
                src={selectedPost.imageUrl}
                alt="Instagram post"
                className="w-full rounded-lg"
              />
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{formatNumber(selectedPost.likes)} いいね</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{formatNumber(selectedPost.comments)} コメント</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(selectedPost.timestamp)}</span>
                  </div>
                </div>
                {selectedPost.caption && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">キャプション</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedPost.caption}
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(selectedPost.permalink, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Instagramで見る
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sync Status */}
      {syncStatus && (
        <div className="fixed bottom-4 right-4 bg-white border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 text-sm">
            {syncStatus.isSyncing ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                <span className="text-blue-600">同期中...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-green-600">同期完了</span>
              </>
            )}
            {syncStatus.lastUpdate && (
              <span className="text-xs text-gray-500 ml-2">
                最終更新: {formatDate(syncStatus.lastUpdate.toISOString())}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}