import axios from 'axios'

export interface InstagramPost {
  id: string
  imageUrl: string
  caption: string
  likes: number
  comments: number
  timestamp: string
  permalink: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
}

export interface InstagramBusinessInfo {
  id: string
  username: string
  fullName: string
  biography: string
  followers: number
  following: number
  posts: number
  profilePictureUrl: string
  website?: string
  email?: string
  phone?: string
  address?: string
}

export interface InstagramMediaResponse {
  data: Array<{
    id: string
    caption?: string
    media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
    media_url: string
    permalink: string
    timestamp: string
    like_count?: number
    comments_count?: number
  }>
  paging?: {
    cursors?: {
      before?: string
      after?: string
    }
    next?: string
  }
}

export interface InstagramUserResponse {
  id: string
  username: string
  account_type?: string
  media_count: number
  followers_count?: number
  follows_count?: number
  name?: string
  biography?: string
  profile_picture_url?: string
  website?: string
}

class InstagramAPIService {
  private baseURL = 'https://graph.instagram.com'
  private businessBaseURL = 'https://graph.facebook.com'
  
  // Instagram Basic Display API endpoints
  private async getBasicMedia(accessToken: string, userId: string, limit: number = 6): Promise<InstagramMediaResponse> {
    try {
      const response = await axios.get(`${this.baseURL}/${userId}/media`, {
        params: {
          access_token: accessToken,
          fields: 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count',
          limit: limit
        }
      })
      return response.data
    } catch (error) {
      console.error('Instagram Basic Display API error:', error)
      throw new Error('Instagramメディアの取得に失敗しました')
    }
  }

  // Instagram Graph API for Business endpoints
  private async getBusinessMedia(accessToken: string, businessAccountId: string, limit: number = 6): Promise<InstagramMediaResponse> {
    try {
      const response = await axios.get(`${this.businessBaseURL}/${businessAccountId}/media`, {
        params: {
          access_token: accessToken,
          fields: 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count',
          limit: limit
        }
      })
      return response.data
    } catch (error) {
      console.error('Instagram Graph API error:', error)
      throw new Error('Instagramビジネスメディアの取得に失敗しました')
    }
  }

  private async getBusinessAccountInfo(accessToken: string, businessAccountId: string): Promise<InstagramUserResponse> {
    try {
      const response = await axios.get(`${this.businessBaseURL}/${businessAccountId}`, {
        params: {
          access_token: accessToken,
          fields: 'id,username,account_type,media_count,followers_count,follows_count,name,biography,profile_picture_url,website'
        }
      })
      return response.data
    } catch (error) {
      console.error('Instagram Business Account Info error:', error)
      throw new Error('Instagramビジネスアカウント情報の取得に失敗しました')
    }
  }

  // Public methods
  async getInstagramPosts(username: string, limit: number = 6): Promise<InstagramPost[]> {
    try {
      // Check if we have API credentials
      const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
      const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
      
      if (!accessToken || !businessAccountId) {
        console.warn('Instagram API credentials not found, using mock data')
        return this.getMockInstagramPosts(username, limit)
      }

      // Try to get real data from Instagram API
      const mediaData = await this.getBusinessMedia(accessToken, businessAccountId, limit)
      
      return mediaData.data.map(media => ({
        id: media.id,
        imageUrl: media.media_url,
        caption: media.caption || '',
        likes: media.like_count || 0,
        comments: media.comments_count || 0,
        timestamp: media.timestamp,
        permalink: media.permalink,
        media_type: media.media_type
      }))
    } catch (error) {
      console.error('Failed to fetch Instagram posts, falling back to mock data:', error)
      return this.getMockInstagramPosts(username, limit)
    }
  }

  async getInstagramBusinessInfo(username: string): Promise<InstagramBusinessInfo | null> {
    try {
      // Check if we have API credentials
      const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
      const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
      
      if (!accessToken || !businessAccountId) {
        console.warn('Instagram API credentials not found, using mock data')
        return this.getMockBusinessInfo(username)
      }

      // Try to get real data from Instagram API
      const accountData = await this.getBusinessAccountInfo(accessToken, businessAccountId)
      
      return {
        id: accountData.id,
        username: accountData.username,
        fullName: accountData.name || accountData.username,
        biography: accountData.biography || '',
        followers: accountData.followers_count || 0,
        following: accountData.follows_count || 0,
        posts: accountData.media_count || 0,
        profilePictureUrl: accountData.profile_picture_url || '',
        website: accountData.website
      }
    } catch (error) {
      console.error('Failed to fetch Instagram business info, falling back to mock data:', error)
      return this.getMockBusinessInfo(username)
    }
  }

  // Mock data methods (fallback when API is not available)
  private getMockInstagramPosts(username: string, limit: number = 6): InstagramPost[] {
    const mockPosts: Record<string, InstagramPost[]> = {
      "eisho8400": [
        {
          id: "1",
          imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20traditional%20wooden%20interior%20renovation%20before%20after%20comparison%20clean%20modern%20design%20tatami%20room&image_size=square",
          caption: "【施工事例】鹿沼市のお客様邸で和室の木質リフォームを完了しました🌲 天然木材の温もりが素敵な空間になりました！ #栃木リフォーム #木質リフォーム #和室リフォーム #栄匠",
          likes: 89,
          comments: 12,
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          permalink: "https://www.instagram.com/p/CxY1cSmB7A3/",
          media_type: "IMAGE"
        },
        {
          id: "2",
          imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20Japanese%20kitchen%20renovation%20wood%20cabinets%20clean%20design%20functional%20space&image_size=square",
          caption: "【キッチンリフォーム】天然木のカウンターと収納で家族の思い出が詰まった空間に✨ お客様のライフスタイルに合わせたカスタマイズが可能です！ #キッチンリフォーム #木質インテリア #カスタマイズ家具",
          likes: 124,
          comments: 18,
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          permalink: "https://www.instagram.com/p/CxY2dSmB7A4/",
          media_type: "IMAGE"
        },
        {
          id: "3",
          imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20exterior%20wood%20fence%20gate%20design%20natural%20cedar%20wood%20craftsmanship&image_size=square",
          caption: "【外構工事】国産杉を使用したウッドフェンスとゲートの施工完了🚪 木と自然を感じる外構で、お客様のお住まいを優しく演出します #外構工事 #エクステリア #ウッドフェンス #鹿沼市",
          likes: 67,
          comments: 8,
          timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          permalink: "https://www.instagram.com/p/CxY3eSmB7A5/",
          media_type: "IMAGE"
        },
        {
          id: "4",
          imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20craftsman%20working%20with%20wood%20traditional%20tools%20professional%20workmanship%20detail%20shot&image_size=square",
          caption: "【職人の技】創業以来、大切にしてきた木との対話🪚 一つ一つ丁寧に、お客様の想いを形にしていきます。これからも「最高のおもてなし」をお約束します #職人の技 #木工作家 #手作り家具 #栄匠",
          likes: 156,
          comments: 24,
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          permalink: "https://www.instagram.com/p/CxY4fSmB7A6/",
          media_type: "IMAGE"
        },
        {
          id: "5",
          imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20traditional%20wooden%20bathroom%20renovation%20ofuro%20cedar%20wood%20relaxing%20space&image_size=square",
          caption: "【浴室リフォーム】檜の香りに包まれる癒しの空間に✨ 天然木材の抗菌効果と調湿効果で、健やかな毎日をサポートします #浴室リフォーム #檜風呂 #木質リフォーム #リラックス空間",
          likes: 98,
          comments: 15,
          timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
          permalink: "https://www.instagram.com/p/CxY5gSmB7A7/",
          media_type: "IMAGE"
        }
      ]
    }
    
    return mockPosts[username]?.slice(0, limit) || []
  }

  private getMockBusinessInfo(username: string): InstagramBusinessInfo | null {
    const mockBusinessData: Record<string, InstagramBusinessInfo> = {
      "eisho8400": {
        id: "17841405822304930",
        username: "eisho8400",
        fullName: "栄匠（株式会社晃家）",
        biography: "栃木県鹿沼市のリフォーム専門会社。木質リフォーム、木質インテリア、家具製造販売、エクステリアを総合的に対応。創業以来、何万人ものお客様との出会いの中で、お客様が求めているもの、価値観や考えを共有することにより、理想の空間を作り上げるご提案ができるようになりました。",
        followers: 1240,
        following: 890,
        posts: 156,
        profilePictureUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20construction%20company%20logo%20%E6%A0%84%E5%8C%A0%20clean%20modern%20design%20wood%20texture&image_size=square",
        website: "https://www.eisho.org/",
        email: "info@eisho.org",
        phone: "0289-74-7717",
        address: "〒321-1111 栃木県鹿沼市板荷1358"
      }
    }
    
    return mockBusinessData[username] || null
  }

  // Utility methods
  formatInstagramNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  formatInstagramDate(timestamp: string): string {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return '今日'
    } else if (diffDays === 1) {
      return '昨日'
    } else if (diffDays < 7) {
      return `${diffDays}日前`
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `${weeks}週間前`
    } else {
      const months = Math.floor(diffDays / 30)
      return `${months}ヶ月前`
    }
  }

  // Cache management
  private cache = new Map<string, { data: any; timestamp: number }>()
  private cacheExpiry = 1000 * 60 * 15 // 15 minutes

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data
    }
    return null
  }

  private setCached(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }
}

// Export singleton instance
export const instagramAPI = new InstagramAPIService()

// Export individual functions for backward compatibility
export const getInstagramBusinessInfo = (username: string) => instagramAPI.getInstagramBusinessInfo(username)
export const getInstagramPosts = (username: string, limit?: number) => instagramAPI.getInstagramPosts(username, limit)
export const formatInstagramNumber = (num: number) => instagramAPI.formatInstagramNumber(num)
export const formatInstagramDate = (timestamp: string) => instagramAPI.formatInstagramDate(timestamp)