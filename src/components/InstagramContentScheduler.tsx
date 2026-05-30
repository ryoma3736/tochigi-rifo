'use client'

import { useState, useEffect } from 'react'
import {
  instagramContentScheduler,
  InstagramScheduledPost,
  InstagramContentTemplate,
  InstagramContentCalendar,
  getInstagramContentSuggestions
} from '@/services/instagram-scheduler'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  AlertCircle,
  Image,
  Video,
  Copy,
  Hash,
  MapPin,
  Users,
  BarChart3,
  Settings,
  RefreshCw
} from 'lucide-react'

interface InstagramContentSchedulerProps {
  username?: string
  className?: string
  onScheduleComplete?: (post: InstagramScheduledPost) => void
  onScheduleError?: (error: Error) => void
}

export default function InstagramContentScheduler({
  username = 'eisho8400',
  className = '',
  onScheduleComplete,
  onScheduleError
}: InstagramContentSchedulerProps) {
  const [scheduledPosts, setScheduledPosts] = useState<InstagramScheduledPost[]>([])
  const [contentTemplates, setContentTemplates] = useState<InstagramContentTemplate[]>([])
  const [contentCalendar, setContentCalendar] = useState<InstagramContentCalendar[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // Form states
  const [newPost, setNewPost] = useState({
    imageUrl: '',
    caption: '',
    scheduledTime: new Date(),
    mediaType: 'IMAGE' as const,
    hashtags: [] as string[],
    location: '',
    tags: [] as string[]
  })

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    imageTemplate: '',
    captionTemplate: '',
    hashtags: [] as string[],
    category: '施工事例'
  })

  useEffect(() => {
    loadData()
  }, [username])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const posts = instagramContentScheduler.getScheduledPosts(username)
      const templates = instagramContentScheduler.getContentTemplates(username)
      
      // Get calendar for current month
      const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
      const calendar = instagramContentScheduler.getContentCalendar(username, startDate, endDate)

      setScheduledPosts(posts)
      setContentTemplates(templates)
      setContentCalendar(calendar)
    } catch (error) {
      console.error('Failed to load scheduler data:', error)
      setError(error instanceof Error ? error.message : 'データの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSchedulePost = async () => {
    try {
      setLoading(true)
      setError(null)

      const post = await instagramContentScheduler.schedulePost(username, newPost)
      
      // Reset form
      setNewPost({
        imageUrl: '',
        caption: '',
        scheduledTime: new Date(),
        mediaType: 'IMAGE',
        hashtags: [],
        location: '',
        tags: []
      })
      setShowNewPostForm(false)
      
      // Reload data
      await loadData()
      
      onScheduleComplete?.(post)
    } catch (error) {
      console.error('Failed to schedule post:', error)
      setError(error instanceof Error ? error.message : '投稿のスケジューリングに失敗しました')
      onScheduleError?.(error as Error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async () => {
    try {
      setLoading(true)
      setError(null)

      const template = await instagramContentScheduler.createContentTemplate(username, newTemplate)
      
      // Reset form
      setNewTemplate({
        name: '',
        description: '',
        imageTemplate: '',
        captionTemplate: '',
        hashtags: [],
        category: '施工事例'
      })
      setShowTemplateForm(false)
      
      // Reload templates
      const templates = instagramContentScheduler.getContentTemplates(username)
      setContentTemplates(templates)
      
    } catch (error) {
      console.error('Failed to create template:', error)
      setError(error instanceof Error ? error.message : 'テンプレートの作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelPost = async (postId: string) => {
    try {
      const success = instagramContentScheduler.cancelScheduledPost(username, postId)
      if (success) {
        await loadData()
      }
    } catch (error) {
      console.error('Failed to cancel post:', error)
      setError(error instanceof Error ? error.message : '投稿のキャンセルに失敗しました')
    }
  }

  const handleUseTemplate = async (templateId: string) => {
    try {
      const template = contentTemplates.find(t => t.id === templateId)
      if (!template) return

      // Pre-fill form with template data
      setNewPost({
        ...newPost,
        imageUrl: template.imageTemplate,
        caption: template.captionTemplate,
        hashtags: template.hashtags
      })
      setShowNewPostForm(true)
    } catch (error) {
      console.error('Failed to use template:', error)
      setError(error instanceof Error ? error.message : 'テンプレートの使用に失敗しました')
    }
  }

  const getStatusBadge = (status: InstagramScheduledPost['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">予約済み</Badge>
      case 'published':
        return <Badge variant="outline" className="text-green-600 border-green-200">公開済み</Badge>
      case 'failed':
        return <Badge variant="outline" className="text-red-600 border-red-200">失敗</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="text-gray-600 border-gray-200">キャンセル</Badge>
      default:
        return <Badge variant="outline">不明</Badge>
    }
  }

  const getMediaTypeIcon = (mediaType: InstagramScheduledPost['mediaType']) => {
    switch (mediaType) {
      case 'VIDEO':
        return <Video className="h-4 w-4" />
      case 'CAROUSEL_ALBUM':
        return <Copy className="h-4 w-4" />
      default:
        return <Image className="h-4 w-4" />
    }
  }

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
            <p className="text-sm text-gray-600">コンテンツスケジューラーを読み込んでいます...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>Instagramコンテンツスケジューラー</CardTitle>
                <CardDescription>
                  @{username} - 投稿の計画、予約、管理
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                onClick={() => setShowNewPostForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                新規投稿
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* New Post Form */}
      {showNewPostForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              新規投稿を予約
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">画像URL</label>
                <input
                  type="url"
                  value={newPost.imageUrl}
                  onChange={(e) => setNewPost({...newPost, imageUrl: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">メディアタイプ</label>
                <select
                  value={newPost.mediaType}
                  onChange={(e) => setNewPost({...newPost, mediaType: e.target.value as any})}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="IMAGE">画像</option>
                  <option value="VIDEO">動画</option>
                  <option value="CAROUSEL_ALBUM">カルーセル</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">キャプション</label>
              <textarea
                value={newPost.caption}
                onChange={(e) => setNewPost({...newPost, caption: e.target.value})}
                className="w-full px-3 py-2 border rounded-md h-24"
                placeholder="投稿のキャプションを入力..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">予約日時</label>
                <input
                  type="datetime-local"
                  value={newPost.scheduledTime.toISOString().slice(0, 16)}
                  onChange={(e) => setNewPost({...newPost, scheduledTime: new Date(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">場所</label>
                <input
                  type="text"
                  value={newPost.location}
                  onChange={(e) => setNewPost({...newPost, location: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="場所 (オプション)"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">ハッシュタグ</label>
              <input
                type="text"
                value={newPost.hashtags.join(' ')}
                onChange={(e) => setNewPost({...newPost, hashtags: e.target.value.split(' ').filter(Boolean)})}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="#栃木リフォーム #木質リフォーム"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSchedulePost}
                disabled={loading || !newPost.imageUrl || !newPost.caption}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Clock className="mr-2 h-4 w-4" />
                予約する
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowNewPostForm(false)}
                disabled={loading}
              >
                キャンセル
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduled Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            予約済み投稿 ({scheduledPosts.length}件)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>予約済みの投稿がありません</p>
              <p className="text-sm mt-2">新規投稿を予約して、Instagramマーケティングを始めましょう</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledPosts.map((post) => (
                <div key={post.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getMediaTypeIcon(post.mediaType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(post.status)}
                          <span className="text-sm text-gray-500">
                            {formatDateTime(post.scheduledTime)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                          {post.caption || 'キャプションなし'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {post.hashtags.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              <span>{post.hashtags.length}個</span>
                            </div>
                          )}
                          {post.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{post.location}</span>
                            </div>
                          )}
                          {post.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{post.tags.length}人</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {post.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelPost(post.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5" />
              コンテンツテンプレート ({contentTemplates.length}件)
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplateForm(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              新規テンプレート
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {contentTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Copy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>テンプレートがありません</p>
              <p className="text-sm mt-2">よく使用する投稿パターンをテンプレートとして保存できます</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contentTemplates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-sm">{template.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      使用回数: {template.usage}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUseTemplate(template.id)}
                    >
                      使用
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            コンテンツカレンダー
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contentCalendar.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>カレンダーデータがありません</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {['日', '月', '火', '水', '木', '金', '土'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
              {contentCalendar.map((day) => (
                <div
                  key={day.date.toISOString()}
                  className={`border rounded-lg p-2 min-h-[80px] ${
                    day.date.toDateString() === new Date().toDateString()
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="text-xs font-medium mb-1">
                    {day.date.getDate()}
                  </div>
                  {day.stats.totalPosts > 0 && (
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-xs">
                        {day.stats.totalPosts}件
                      </Badge>
                      <div className="text-xs text-gray-500">
                        エンゲージメント: {day.stats.engagementRate.toFixed(1)}%
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}