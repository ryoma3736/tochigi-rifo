import { 
  instagramAPI,
  InstagramPost,
  InstagramBusinessInfo 
} from './instagram-api'
import { 
  instagramAuthService 
} from './instagram-auth'

export interface InstagramScheduledPost {
  id: string
  username: string
  imageUrl: string
  caption: string
  scheduledTime: Date
  status: 'pending' | 'published' | 'failed' | 'cancelled'
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  hashtags: string[]
  location?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  errorMessage?: string
  platformPostId?: string
}

export interface InstagramScheduleConfig {
  autoPublish: boolean
  timezone: string
  defaultHashtags: string[]
  maxPostsPerDay: number
  bestPostingTimes: string[] // HH:mm format
  contentCategories: string[]
}

export interface InstagramContentCalendar {
  date: Date
  posts: InstagramScheduledPost[]
  stats: {
    totalPosts: number
    publishedPosts: number
    pendingPosts: number
    engagementRate: number
  }
}

export interface InstagramContentTemplate {
  id: string
  name: string
  description: string
  imageTemplate: string // URL or base64
  captionTemplate: string
  hashtags: string[]
  category: string
  usage: number
  lastUsed?: Date
}

class InstagramContentScheduler {
  private scheduledPosts = new Map<string, InstagramScheduledPost[]>()
  private contentTemplates = new Map<string, InstagramContentTemplate[]>()
  private config: InstagramScheduleConfig = {
    autoPublish: true,
    timezone: 'Asia/Tokyo',
    defaultHashtags: ['#栃木リフォーム', '#木質リフォーム', '#栄匠'],
    maxPostsPerDay: 3,
    bestPostingTimes: ['09:00', '14:00', '19:00'],
    contentCategories: ['施工事例', '職人の技', 'お客様の声', '商品紹介', 'お知らせ']
  }

  constructor() {
    this.loadScheduledPosts()
    this.loadContentTemplates()
    this.startScheduler()
  }

  /**
   * Schedule a new Instagram post
   */
  async schedulePost(
    username: string,
    postData: {
      imageUrl: string
      caption: string
      scheduledTime: Date
      mediaType?: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
      hashtags?: string[]
      location?: string
      tags?: string[]
    }
  ): Promise<InstagramScheduledPost> {
    try {
      // Validate posting time
      const now = new Date()
      if (postData.scheduledTime <= now) {
        throw new Error('投稿時間は現在時刻より後に設定してください')
      }

      // Check daily post limit
      const dailyPosts = this.getPostsForDate(username, postData.scheduledTime)
      if (dailyPosts.length >= this.config.maxPostsPerDay) {
        throw new Error(`1日の最大投稿数(${this.config.maxPostsPerDay}件)に達しています`)
      }

      // Create scheduled post
      const scheduledPost: InstagramScheduledPost = {
        id: this.generatePostId(username),
        username,
        imageUrl: postData.imageUrl,
        caption: postData.caption,
        scheduledTime: postData.scheduledTime,
        status: 'pending',
        mediaType: postData.mediaType || 'IMAGE',
        hashtags: postData.hashtags || this.config.defaultHashtags,
        location: postData.location,
        tags: postData.tags || [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Store the post
      const userPosts = this.scheduledPosts.get(username) || []
      userPosts.push(scheduledPost)
      this.scheduledPosts.set(username, userPosts)
      this.saveScheduledPosts()

      // Schedule the actual publishing
      if (this.config.autoPublish) {
        this.scheduleAutoPublish(scheduledPost)
      }

      return scheduledPost
    } catch (error) {
      console.error('Failed to schedule post:', error)
      throw new Error(`投稿のスケジューリングに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get all scheduled posts for a user
   */
  getScheduledPosts(username: string): InstagramScheduledPost[] {
    return this.scheduledPosts.get(username) || []
  }

  /**
   * Get posts for a specific date
   */
  getPostsForDate(username: string, date: Date): InstagramScheduledPost[] {
    const posts = this.getScheduledPosts(username)
    const targetDate = date.toDateString()
    
    return posts.filter(post => 
      post.scheduledTime.toDateString() === targetDate &&
      post.status !== 'cancelled'
    )
  }

  /**
   * Get content calendar for a date range
   */
  getContentCalendar(
    username: string,
    startDate: Date,
    endDate: Date
  ): InstagramContentCalendar[] {
    const calendar: InstagramContentCalendar[] = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const posts = this.getPostsForDate(username, currentDate)
      const publishedPosts = posts.filter(p => p.status === 'published')
      const pendingPosts = posts.filter(p => p.status === 'pending')
      
      // Calculate engagement rate for published posts
      let totalEngagement = 0
      let totalReach = 0
      
      publishedPosts.forEach(post => {
        // This would be calculated from actual post performance
        totalEngagement += Math.floor(Math.random() * 100) + 50
        totalReach += Math.floor(Math.random() * 1000) + 500
      })
      
      const engagementRate = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0
      
      calendar.push({
        date: new Date(currentDate),
        posts,
        stats: {
          totalPosts: posts.length,
          publishedPosts: publishedPosts.length,
          pendingPosts: pendingPosts.length,
          engagementRate: Math.round(engagementRate * 100) / 100
        }
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return calendar
  }

  /**
   * Cancel a scheduled post
   */
  cancelScheduledPost(username: string, postId: string): boolean {
    try {
      const posts = this.getScheduledPosts(username)
      const postIndex = posts.findIndex(p => p.id === postId)
      
      if (postIndex === -1) {
        throw new Error('投稿が見つかりません')
      }
      
      const post = posts[postIndex]
      if (post.status === 'published') {
        throw new Error('既に公開済みの投稿はキャンセルできません')
      }
      
      post.status = 'cancelled'
      post.updatedAt = new Date()
      
      this.scheduledPosts.set(username, posts)
      this.saveScheduledPosts()
      
      // Cancel auto-publish if scheduled
      this.cancelAutoPublish(postId)
      
      return true
    } catch (error) {
      console.error('Failed to cancel post:', error)
      return false
    }
  }

  /**
   * Create content template
   */
  createContentTemplate(
    username: string,
    template: Omit<InstagramContentTemplate, 'id' | 'usage' | 'lastUsed'>
  ): InstagramContentTemplate {
    const newTemplate: InstagramContentTemplate = {
      ...template,
      id: this.generateTemplateId(username),
      usage: 0
    }
    
    const templates = this.contentTemplates.get(username) || []
    templates.push(newTemplate)
    this.contentTemplates.set(username, templates)
    this.saveContentTemplates()
    
    return newTemplate
  }

  /**
   * Get content templates
   */
  getContentTemplates(username: string, category?: string): InstagramContentTemplate[] {
    const templates = this.contentTemplates.get(username) || []
    
    if (category) {
      return templates.filter(t => t.category === category)
    }
    
    return templates
  }

  /**
   * Use content template to create a scheduled post
   */
  async useTemplate(
    username: string,
    templateId: string,
    scheduledTime: Date,
    customizations?: {
      imageUrl?: string
      caption?: string
      hashtags?: string[]
      location?: string
      tags?: string[]
    }
  ): Promise<InstagramScheduledPost> {
    try {
      const templates = this.getContentTemplates(username)
      const template = templates.find(t => t.id === templateId)
      
      if (!template) {
        throw new Error('テンプレートが見つかりません')
      }
      
      // Update template usage
      template.usage++
      template.lastUsed = new Date()
      this.saveContentTemplates()
      
      // Create post from template with customizations
      return await this.schedulePost(username, {
        imageUrl: customizations?.imageUrl || template.imageTemplate,
        caption: customizations?.caption || template.captionTemplate,
        scheduledTime,
        hashtags: customizations?.hashtags || template.hashtags,
        location: customizations?.location,
        tags: customizations?.tags
      })
    } catch (error) {
      console.error('Failed to use template:', error)
      throw new Error(`テンプレートの使用に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get best posting times based on analytics
   */
  getBestPostingTimes(username: string): string[] {
    // This would be based on actual analytics data
    // For now, return configured best times
    return this.config.bestPostingTimes
  }

  /**
   * Get content suggestions based on performance
   */
  getContentSuggestions(username: string): {
    bestTimes: string[]
    recommendedHashtags: string[]
    contentTypes: string[]
    postingFrequency: number
  } {
    const posts = this.getScheduledPosts(username)
    const publishedPosts = posts.filter(p => p.status === 'published')
    
    // Analyze published posts for patterns
    const hashtagCounts = new Map<string, number>()
    const timeEngagement = new Map<string, number>()
    
    publishedPosts.forEach(post => {
      // Count hashtag usage
      post.hashtags.forEach(tag => {
        hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1)
      })
      
      // Track posting time performance (simulated)
      const hour = post.scheduledTime.getHours().toString().padStart(2, '0') + ':00'
      timeEngagement.set(hour, (timeEngagement.get(hour) || 0) + Math.random() * 100)
    })
    
    // Get top hashtags
    const topHashtags = Array.from(hashtagCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag)
    
    // Get best performing times
    const bestTimes = Array.from(timeEngagement.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([time]) => time)
    
    return {
      bestTimes: bestTimes.length > 0 ? bestTimes : this.config.bestPostingTimes,
      recommendedHashtags: topHashtags.length > 0 ? topHashtags : this.config.defaultHashtags,
      contentTypes: ['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'],
      postingFrequency: Math.min(publishedPosts.length / 7, this.config.maxPostsPerDay) // posts per day average
    }
  }

  /**
   * Private: Start the scheduler
   */
  private startScheduler(): void {
    // Check for posts to publish every minute
    setInterval(() => {
      this.checkAndPublishPosts()
    }, 60000) // 1 minute
    
    console.log('Instagram content scheduler started')
  }

  /**
   * Private: Check and publish due posts
   */
  private async checkAndPublishPosts(): Promise<void> {
    const now = new Date()
    
    this.scheduledPosts.forEach(async (posts, username) => {
      const duePosts = posts.filter(post => 
        post.status === 'pending' &&
        post.scheduledTime <= now
      )
      
      for (const post of duePosts) {
        try {
          await this.publishPost(post)
        } catch (error) {
          console.error(`Failed to publish post ${post.id}:`, error)
          post.status = 'failed'
          post.errorMessage = error instanceof Error ? error.message : 'Unknown error'
          post.updatedAt = new Date()
        }
      }
      
      if (duePosts.length > 0) {
        this.saveScheduledPosts()
      }
    })
  }

  /**
   * Private: Publish a post to Instagram
   */
  private async publishPost(post: InstagramScheduledPost): Promise<void> {
    try {
      // Validate authentication
      if (!instagramAuthService.isAuthenticated()) {
        throw new Error('Instagram認証が必要です')
      }
      
      // Here you would implement the actual Instagram API call
      // For now, we'll simulate a successful publish
      console.log(`Publishing post to Instagram: ${post.id}`)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update post status
      post.status = 'published'
      post.publishedAt = new Date()
      post.platformPostId = `instagram_post_${Date.now()}`
      post.updatedAt = new Date()
      
      console.log(`Successfully published post: ${post.id}`)
    } catch (error) {
      console.error('Failed to publish post:', error)
      throw error
    }
  }

  /**
   * Private: Schedule auto-publish for a post
   */
  private scheduleAutoPublish(post: InstagramScheduledPost): void {
    const delay = post.scheduledTime.getTime() - Date.now()
    
    if (delay > 0) {
      setTimeout(async () => {
        if (post.status === 'pending') {
          try {
            await this.publishPost(post)
            this.saveScheduledPosts()
          } catch (error) {
            console.error(`Auto-publish failed for post ${post.id}:`, error)
          }
        }
      }, delay)
    }
  }

  /**
   * Private: Cancel auto-publish for a post
   */
  private cancelAutoPublish(postId: string): void {
    // Clear the timeout if it exists
    // This would require tracking timeouts, which we'll implement if needed
    console.log(`Cancelled auto-publish for post: ${postId}`)
  }

  /**
   * Private: Generate unique post ID
   */
  private generatePostId(username: string): string {
    return `${username}_post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Private: Generate unique template ID
   */
  private generateTemplateId(username: string): string {
    return `${username}_template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Private: Save scheduled posts to localStorage
   */
  private saveScheduledPosts(): void {
    if (typeof window === 'undefined') return
    
    try {
      const data = Array.from(this.scheduledPosts.entries()).map(([username, posts]) => ({
        username,
        posts: posts.map(post => ({
          ...post,
          scheduledTime: post.scheduledTime.toISOString(),
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
          publishedAt: post.publishedAt?.toISOString()
        }))
      }))
      
      localStorage.setItem('instagram_scheduled_posts', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save scheduled posts:', error)
    }
  }

  /**
   * Private: Load scheduled posts from localStorage
   */
  private loadScheduledPosts(): void {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem('instagram_scheduled_posts')
      if (stored) {
        const data = JSON.parse(stored)
        data.forEach((item: any) => {
          const posts: InstagramScheduledPost[] = item.posts.map((post: any) => ({
            ...post,
            scheduledTime: new Date(post.scheduledTime),
            createdAt: new Date(post.createdAt),
            updatedAt: new Date(post.updatedAt),
            publishedAt: post.publishedAt ? new Date(post.publishedAt) : undefined
          }))
          this.scheduledPosts.set(item.username, posts)
        })
      }
    } catch (error) {
      console.error('Failed to load scheduled posts:', error)
    }
  }

  /**
   * Private: Save content templates to localStorage
   */
  private saveContentTemplates(): void {
    if (typeof window === 'undefined') return
    
    try {
      const data = Array.from(this.contentTemplates.entries()).map(([username, templates]) => ({
        username,
        templates: templates.map(template => ({
          ...template,
          lastUsed: template.lastUsed?.toISOString()
        }))
      }))
      
      localStorage.setItem('instagram_content_templates', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save content templates:', error)
    }
  }

  /**
   * Private: Load content templates from localStorage
   */
  private loadContentTemplates(): void {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem('instagram_content_templates')
      if (stored) {
        const data = JSON.parse(stored)
        data.forEach((item: any) => {
          const templates: InstagramContentTemplate[] = item.templates.map((template: any) => ({
            ...template,
            lastUsed: template.lastUsed ? new Date(template.lastUsed) : undefined
          }))
          this.contentTemplates.set(item.username, templates)
        })
      }
    } catch (error) {
      console.error('Failed to load content templates:', error)
    }
  }
}

// Export singleton instance
export const instagramContentScheduler = new InstagramContentScheduler()

// Export helper functions
export const scheduleInstagramPost = (
  username: string,
  postData: {
    imageUrl: string
    caption: string
    scheduledTime: Date
    mediaType?: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
    hashtags?: string[]
    location?: string
    tags?: string[]
  }
) => instagramContentScheduler.schedulePost(username, postData)

export const getScheduledInstagramPosts = (username: string) => 
  instagramContentScheduler.getScheduledPosts(username)

export const getInstagramContentCalendar = (
  username: string,
  startDate: Date,
  endDate: Date
) => instagramContentScheduler.getContentCalendar(username, startDate, endDate)

export const cancelScheduledInstagramPost = (username: string, postId: string) => 
  instagramContentScheduler.cancelScheduledPost(username, postId)

export const createInstagramContentTemplate = (
  username: string,
  template: Omit<InstagramContentTemplate, 'id' | 'usage' | 'lastUsed'>
) => instagramContentScheduler.createContentTemplate(username, template)

export const getInstagramContentTemplates = (username: string, category?: string) => 
  instagramContentScheduler.getContentTemplates(username, category)

export const useInstagramTemplate = (
  username: string,
  templateId: string,
  scheduledTime: Date,
  customizations?: {
    imageUrl?: string
    caption?: string
    hashtags?: string[]
    location?: string
    tags?: string[]
  }
) => instagramContentScheduler.useTemplate(username, templateId, scheduledTime, customizations)

export const getInstagramContentSuggestions = (username: string) => 
  instagramContentScheduler.getContentSuggestions(username)