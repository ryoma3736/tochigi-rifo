import { NextRequest, NextResponse } from 'next/server'
import { 
  instagramRelationshipService, 
  InstagramRelationshipConfig 
} from '@/services/instagram-relationship'
import { instagramAPI } from '@/services/instagram-api'

// GET: Fetch Instagram data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const type = searchParams.get('type') // 'profile', 'posts', 'analytics', 'relationship'
    const limit = parseInt(searchParams.get('limit') || '6')

    if (!username) {
      return NextResponse.json(
        { error: 'ユーザー名が必要です' },
        { status: 400 }
      )
    }

    switch (type) {
      case 'profile':
        const profile = await instagramAPI.getInstagramBusinessInfo(username)
        if (!profile) {
          return NextResponse.json(
            { error: 'プロフィールが見つかりません' },
            { status: 404 }
          )
        }
        return NextResponse.json(profile)

      case 'posts':
        const posts = await instagramAPI.getInstagramPosts(username, limit)
        return NextResponse.json(posts)

      case 'analytics':
        const relationship = instagramRelationshipService.getBusinessRelationship(username)
        if (!relationship) {
          return NextResponse.json(
            { error: 'ビジネスアカウントが接続されていません' },
            { status: 404 }
          )
        }
        return NextResponse.json(relationship.analytics)

      case 'relationship':
        const existingRelationship = instagramRelationshipService.getBusinessRelationship(username)
        if (!existingRelationship) {
          return NextResponse.json(
            { error: 'ビジネスアカウントが接続されていません' },
            { status: 404 }
          )
        }
        return NextResponse.json(existingRelationship)

      default:
        // Get both profile and posts
        const [userProfile, userPosts] = await Promise.all([
          instagramAPI.getInstagramBusinessInfo(username),
          instagramAPI.getInstagramPosts(username, limit)
        ])

        if (!userProfile) {
          return NextResponse.json(
            { error: 'ユーザー情報が見つかりません' },
            { status: 404 }
          )
        }

        return NextResponse.json({
          profile: userProfile,
          posts: userPosts
        })
    }
  } catch (error) {
    console.error('Instagram API error:', error)
    return NextResponse.json(
      { error: 'Instagramデータの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: Connect Instagram account or refresh data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, username, config } = body

    if (!username) {
      return NextResponse.json(
        { error: 'ユーザー名が必要です' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'connect':
        if (!config) {
          return NextResponse.json(
            { error: '設定情報が必要です' },
            { status: 400 }
          )
        }

        // Initialize the service with configuration
        instagramRelationshipService.initialize(config)

        // Connect to Instagram business account
        const relationship = await instagramRelationshipService.connectBusinessAccount(username)
        return NextResponse.json(relationship)

      case 'refresh':
        const existingRelationship = instagramRelationshipService.getBusinessRelationship(username)
        if (!existingRelationship) {
          return NextResponse.json(
            { error: 'ビジネスアカウントが接続されていません' },
            { status: 404 }
          )
        }

        const updated = await instagramRelationshipService.refreshBusinessRelationship(username)
        return NextResponse.json(updated)

      case 'disconnect':
        instagramRelationshipService.disconnectBusinessAccount(username)
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json(
          { error: '無効なアクションです' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Instagram API POST error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '処理に失敗しました' },
      { status: 500 }
    )
  }
}

// PUT: Update Instagram configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, config } = body

    if (!username || !config) {
      return NextResponse.json(
        { error: 'ユーザー名と設定情報が必要です' },
        { status: 400 }
      )
    }

    // Update configuration
    instagramRelationshipService.initialize(config)

    // Refresh the relationship with new config
    const relationship = instagramRelationshipService.getBusinessRelationship(username)
    if (relationship) {
      const updated = await instagramRelationshipService.refreshBusinessRelationship(username)
      return NextResponse.json(updated)
    }

    return NextResponse.json(
      { error: 'ビジネスアカウントが接続されていません' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Instagram API PUT error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '設定の更新に失敗しました' },
      { status: 500 }
    )
  }
}

// DELETE: Disconnect Instagram account
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { error: 'ユーザー名が必要です' },
        { status: 400 }
      )
    }

    instagramRelationshipService.disconnectBusinessAccount(username)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Instagram API DELETE error:', error)
    return NextResponse.json(
      { error: 'アカウントの切断に失敗しました' },
      { status: 500 }
    )
  }
}