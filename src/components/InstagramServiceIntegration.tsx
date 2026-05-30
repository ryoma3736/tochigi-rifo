'use client'

import { useState, useEffect } from 'react'
import { serviceTemplates, ServiceTemplate } from '@/data/services'
import { 
  instagramRelationshipService,
  InstagramBusinessRelationship 
} from '@/services/instagram-relationship'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Instagram, 
  Link,
  TrendingUp,
  Calendar,
  Hash,
  ExternalLink,
  Eye,
  Heart,
  MessageCircle,
  BarChart3
} from 'lucide-react'

interface InstagramServiceIntegrationProps {
  services?: ServiceTemplate[]
  instagramUsername?: string
  className?: string
  showAnalytics?: boolean
  enableAutoSync?: boolean
  onServiceClick?: (service: ServiceTemplate, relatedPosts: any[]) => void
}

export default function InstagramServiceIntegration({ 
  services = serviceTemplates,
  instagramUsername = 'eisho8400',
  className = '',
  showAnalytics = true,
  enableAutoSync = false,
  onServiceClick
}: InstagramServiceIntegrationProps) {
  const [relationship, setRelationship] = useState<InstagramBusinessRelationship | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<ServiceTemplate | null>(null)

  useEffect(() => {
    loadIntegrationData()
  }, [instagramUsername])

  const loadIntegrationData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get existing relationship or create basic one
      const existingRelationship = instagramRelationshipService.getBusinessRelationship(instagramUsername)
      
      if (existingRelationship) {
        setRelationship(existingRelationship)
      } else {
        // Create mock relationship for demo
        const mockRelationship: InstagramBusinessRelationship = {
          id: 'relationship-123',
          username: instagramUsername,
          businessInfo: {
            id: '17841405822304930',
            username: instagramUsername,
            fullName: '栄匠（株式会社晃家）',
            biography: '栃木県鹿沼市のリフォーム専門会社。木質リフォーム、木質インテリア、家具製造販売、エクステリアを総合的に対応。',
            followers: 1240,
            following: 890,
            posts: 156,
            profilePictureUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20construction%20company%20logo%20%E6%A0%84%E5%8C%A0%20clean%20modern%20design%20wood%20texture&image_size=square',
            website: 'https://www.eisho.org/',
            email: 'info@eisho.org',
            phone: '0289-74-7717',
            address: '〒321-1111 栃木県鹿沼市板荷1358'
          },
          connectionStatus: 'connected',
          syncInterval: 3600000, // 1 hour
          posts: [
            {
              id: '1',
              imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20traditional%20wooden%20interior%20renovation%20before%20after%20comparison%20clean%20modern%20design%20tatami%20room&image_size=square',
              caption: '【施工事例】鹿沼市のお客様邸で和室の木質リフォームを完了しました🌲 天然木材の温もりが素敵な空間になりました！ #栃木リフォーム #木質リフォーム #和室リフォーム #栄匠',
              likes: 89,
              comments: 12,
              timestamp: '2025-11-14T17:09:11.498Z',
              permalink: 'https://www.instagram.com/p/CxY1cSmB7A3/',
              media_type: 'IMAGE'
            },
            {
              id: '2',
              imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20Japanese%20kitchen%20renovation%20wood%20cabinets%20clean%20design%20functional%20space&image_size=square',
              caption: '【キッチンリフォーム】天然木のカウンターと収納で家族の思い出が詰まった空間に✨ お客様のライフスタイルに合わせたカスタマイズが可能です！ #キッチンリフォーム #木質インテリア #カスタマイズ家具',
              likes: 124,
              comments: 18,
              timestamp: '2025-11-11T17:09:11.498Z',
              permalink: 'https://www.instagram.com/p/CxY2dSmB7A4/',
              media_type: 'IMAGE'
            },
            {
              id: '3',
              imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20exterior%20wood%20fence%20gate%20design%20natural%20cedar%20wood%20craftsmanship&image_size=square',
              caption: '【外構工事】国産杉を使用したウッドフェンスとゲートの施工完了🚪 木と自然を感じる外構で、お客様のお住まいを優しく演出します #外構工事 #エクステリア #ウッドフェンス #鹿沼市',
              likes: 67,
              comments: 8,
              timestamp: '2025-11-09T17:09:11.498Z',
              permalink: 'https://www.instagram.com/p/CxY3eSmB7A5/',
              media_type: 'IMAGE'
            },
            {
              id: '5',
              imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20traditional%20wooden%20bathroom%20renovation%20ofuro%20cedar%20wood%20relaxing%20space&image_size=square',
              caption: '【浴室リフォーム】檜の香りに包まれる癒しの空間に✨ 天然木材の抗菌効果と調湿効果で、健やかな毎日をサポートします #浴室リフォーム #檜風呂 #木質リフォーム #リラックス空間',
              likes: 98,
              comments: 15,
              timestamp: '2025-11-04T17:09:11.498Z',
              permalink: 'https://www.instagram.com/p/CxY5gSmB7A7/',
              media_type: 'IMAGE'
            }
          ],
          analytics: {
            engagementRate: 8.5,
            averageLikes: 94.5,
            averageComments: 13.25,
            postFrequency: 3.2,
            bestPostingTime: '17:00, 19:00, 21:00',
            topHashtags: ['#栃木リフォーム', '#木質リフォーム', '#キッチンリフォーム', '#浴室リフォーム', '#外構工事'],
            followerGrowth: 2.3,
            monthlyReach: 8500,
            monthlyImpressions: 12500,
            audienceGrowth: {
              followers: [1200, 1220, 1240],
              labels: ['1週間前', '3日前', '現在']
            },
            contentPerformance: {
              images: 120,
              videos: 25,
              carousels: 11
            }
          },
          lastSync: new Date(),
          autoSync: true
        }
        setRelationship(mockRelationship)
      }
    } catch (error) {
      console.error('Failed to load integration data:', error)
      setError('Instagramデータの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const getRelatedPostsWithScores = (service: ServiceTemplate) => {
    if (!relationship?.posts) return []
    
    const postScores = new Map<string, number>()
    const matchReasons = new Map<string, string[]>()
    
    // Create a mapping of post IDs to scores for intelligent ranking
    relationship.posts.forEach(post => {
      let score = 0
      const reasons: string[] = []
      
      // Direct ID matches (highest priority)
      if (service.relatedInstagramPosts?.includes(post.id)) {
        score += 100
        reasons.push('直接関連付け')
      }
      
      // Hashtag matching (high priority)
      if (service.instagramHashtags) {
        service.instagramHashtags.forEach(hashtag => {
          if (post.caption.includes(hashtag)) {
            score += 50
            reasons.push(`ハッシュタグ: ${hashtag}`)
          }
        })
      }
      
      // Category matching (medium priority)
      if (service.instagramCategory && post.caption.includes(service.instagramCategory)) {
        score += 30
        reasons.push(`カテゴリ: ${service.instagramCategory}`)
      }
      
      // Service name keyword matching
      const serviceKeywords = service.name.split(/[・\s]/).filter(word => word.length > 1)
      serviceKeywords.forEach(keyword => {
        if (post.caption.includes(keyword)) {
          score += 20
          reasons.push(`サービス名: ${keyword}`)
        }
      })
      
      // Category keyword matching
      if (service.category && post.caption.includes(service.category)) {
        score += 15
        reasons.push(`内装/外構: ${service.category}`)
      }
      
      // Description keyword matching
      const descriptionKeywords = service.description.split(/[・\s、。！？\s]/).filter(word => word.length > 2)
      descriptionKeywords.forEach(keyword => {
        if (post.caption.includes(keyword)) {
          score += 10
          reasons.push(`説明文: ${keyword}`)
        }
      })
      
      // Location-based matching (栃木県, 鹿沼市)
      const locationKeywords = ['栃木', '鹿沼', '宇都宮', '小山']
      locationKeywords.forEach(location => {
        if (post.caption.includes(location)) {
          score += 5
          reasons.push(`地域: ${location}`)
        }
      })
      
      if (score > 0) {
        postScores.set(post.id, score)
        matchReasons.set(post.id, reasons)
      }
    })
    
    // Sort by score and return top matches with metadata
    const scoredPosts = Array.from(postScores.entries())
      .map(([postId, score]) => ({
        post: relationship.posts.find(p => p.id === postId)!,
        score,
        reasons: matchReasons.get(postId) || []
      }))
      .sort((a, b) => b.score - a.score)
    
    return scoredPosts
  }

  const getRelatedPosts = (service: ServiceTemplate) => {
    return getRelatedPostsWithScores(service).map(item => item.post)
  }

  const handleServiceClick = (service: ServiceTemplate) => {
    setSelectedService(service)
    const relatedPosts = getRelatedPosts(service)
    onServiceClick?.(service, relatedPosts)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        <span className="ml-3 text-gray-600">Instagramデータを読み込み中...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-600">
            <Instagram className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!relationship) {
    return (
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-6">
          <div className="text-center text-gray-600">
            <Instagram className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Instagramビジネス連携</h3>
            <p className="text-sm mb-4">
              サービスとInstagram投稿を連携して、効果的なマーケティングを実現します
            </p>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600">
              Instagramで認証
            </Button>
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
            <div>
              <CardTitle className="flex items-center gap-2">
                <Instagram className="h-5 w-5" />
                サービス×Instagram連携
              </CardTitle>
              <CardDescription>
                Instagram投稿と連携したサービス紹介
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-200">
              <TrendingUp className="h-3 w-3 mr-1" />
              連携済み
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>フォロワー: {relationship.businessInfo.followers.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>平均いいね: {relationship.analytics?.averageLikes.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>エンゲージメント: {relationship.analytics?.engagementRate}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services
          .filter(service => service.showcasePriority && service.showcasePriority >= 6)
          .sort((a, b) => (b.showcasePriority || 0) - (a.showcasePriority || 0))
          .map(service => {
            const relatedPostsWithScores = getRelatedPostsWithScores(service)
            const relatedPosts = relatedPostsWithScores.map(item => item.post)
            const totalEngagement = relatedPosts.reduce((sum, post) => sum + post.likes + post.comments, 0)
            const avgScore = relatedPostsWithScores.length > 0 
              ? Math.round(relatedPostsWithScores.reduce((sum, item) => sum + item.score, 0) / relatedPostsWithScores.length)
              : 0
            
            return (
              <Card 
                key={service.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedService?.id === service.id ? 'ring-2 ring-pink-500' : ''
                }`}
                onClick={() => handleServiceClick(service)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription>{service.category}</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      優先度: {service.showcasePriority}/10
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Price Range */}
                  <div className="text-sm">
                    <span className="text-gray-600">価格帯: </span>
                    <span className="font-medium">
                      ¥{service.minPrice.toLocaleString()} - ¥{service.maxPrice.toLocaleString()}
                    </span>
                  </div>

                  {/* Instagram Integration */}
                  {relatedPosts.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Instagram className="h-4 w-4" />
                          <span>関連投稿: {relatedPosts.length}件</span>
                        </div>
                        {avgScore > 0 && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            一致度: {avgScore}%
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span>いいね: {relatedPosts.reduce((sum, post) => sum + post.likes, 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>コメント: {relatedPosts.reduce((sum, post) => sum + post.comments, 0).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>総エンゲージメント: {totalEngagement.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {/* Hashtags */}
                  {service.instagramHashtags && service.instagramHashtags.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Hash className="h-3 w-3" />
                        <span>推奨ハッシュタグ:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {service.instagramHashtags.slice(0, 3).map(hashtag => (
                          <Badge key={hashtag} variant="secondary" className="text-xs">
                            {hashtag}
                          </Badge>
                        ))}
                        {service.instagramHashtags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{service.instagramHashtags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Related Posts Preview */}
                  {relatedPosts.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs text-gray-600">関連投稿プレビュー:</div>
                      <div className="grid grid-cols-3 gap-1">
                        {relatedPostsWithScores.slice(0, 3).map(({post, score, reasons}) => (
                          <div key={post.id} className="aspect-square rounded overflow-hidden relative group">
                            <img 
                              src={post.imageUrl} 
                              alt="Instagram post"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                              <div className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity text-center p-1">
                                <div className="font-bold">{score}%</div>
                                <div className="text-xs">一致</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {relatedPosts.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{relatedPosts.length - 3}件の関連投稿
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        }
      </div>

      {/* Service Detail Analytics */}
      {selectedService && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {selectedService.name} - Instagram分析詳細
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const relatedPostsWithScores = getRelatedPostsWithScores(selectedService)
              const totalEngagement = relatedPostsWithScores.reduce((sum, item) => 
                sum + item.post.likes + item.post.comments, 0)
              const avgScore = relatedPostsWithScores.length > 0 
                ? Math.round(relatedPostsWithScores.reduce((sum, item) => sum + item.score, 0) / relatedPostsWithScores.length)
                : 0
              
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {relatedPostsWithScores.length}
                      </div>
                      <div className="text-sm text-gray-600">関連投稿数</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {avgScore}%
                      </div>
                      <div className="text-sm text-gray-600">平均一致度</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {totalEngagement.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">総エンゲージメント</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-pink-600">
                        {Math.round(selectedService.showcasePriority || 0)}/10
                      </div>
                      <div className="text-sm text-gray-600">優先度</div>
                    </div>
                  </div>
                  
                  {relatedPostsWithScores.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-800">関連Instagram投稿:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {relatedPostsWithScores.slice(0, 4).map(({post, score, reasons}) => (
                          <div key={post.id} className="bg-white rounded-lg p-4 border">
                            <div className="flex gap-3">
                              <img 
                                src={post.imageUrl} 
                                alt="Instagram post"
                                className="w-16 h-16 rounded object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                    一致度: {score}%
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {new Date(post.timestamp).toLocaleDateString('ja-JP')}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                                  {post.caption.replace(/#[^\s]+/g, '').trim()}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Heart className="h-3 w-3" />
                                    <span>{post.likes}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MessageCircle className="h-3 w-3" />
                                    <span>{post.comments}</span>
                                  </div>
                                </div>
                                {reasons.length > 0 && (
                                  <div className="mt-2">
                                    <details className="text-xs">
                                      <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                                        一致理由 ({reasons.length}件)
                                      </summary>
                                      <div className="mt-1 space-y-1">
                                        {reasons.slice(0, 3).map((reason, index) => (
                                          <div key={index} className="text-gray-500 text-xs">
                                            • {reason}
                                          </div>
                                        ))}
                                      </div>
                                    </details>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}

      {/* Analytics Summary */}
      {relationship.analytics && (
        <Card className="bg-gradient-to-r from-pink-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Instagram統合分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-pink-600">
                  {relationship.analytics.engagementRate}%
                </div>
                <div className="text-sm text-gray-600">エンゲージメント率</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {relationship.analytics.followerGrowth || 0}%
                </div>
                <div className="text-sm text-gray-600">フォロワー成長</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {(relationship.analytics as any).monthlyReach?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-600">月間リーチ</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {services.filter(s => s.showcasePriority && s.showcasePriority >= 7).length}
                </div>
                <div className="text-sm text-gray-600">連携サービス</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}