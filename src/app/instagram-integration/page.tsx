'use client'

import { useState } from 'react'
import InstagramAnalyticsDashboard from '@/components/InstagramAnalyticsDashboard'
import InstagramConnectionWizard from '@/components/InstagramConnectionWizard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Instagram, 
  Settings,
  BarChart3,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function InstagramIntegrationPage() {
  const [showWizard, setShowWizard] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')

  const handleConnectionComplete = (relationship: any) => {
    setConnectionStatus('connected')
    setShowWizard(false)
    console.log('Instagram connection completed:', relationship)
  }

  const handleConnectionError = (error: Error) => {
    setConnectionStatus('disconnected')
    console.error('Instagram connection failed:', error)
  }

  const handleConnect = () => {
    setConnectionStatus('connecting')
    setShowWizard(true)
  }

  const handleDisconnect = () => {
    setConnectionStatus('disconnected')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl">
              <Instagram className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Instagramビジネス連携</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Instagramビジネスアカウントと連携して、投稿データの分析、リアルタイム同期、
            効果的なソーシャルメディア戦略を実現します
          </p>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  接続ステータス
                </CardTitle>
                <CardDescription>
                  Instagramビジネスアカウントの連携状態
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {connectionStatus === 'connected' && (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    接続済み
                  </Badge>
                )}
                {connectionStatus === 'connecting' && (
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    接続中...
                  </Badge>
                )}
                {connectionStatus === 'disconnected' && (
                  <Badge variant="outline" className="text-gray-600 border-gray-200">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    未接続
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {connectionStatus === 'disconnected' && (
              <div className="text-center space-y-4 py-8">
                <div className="text-gray-500">
                  <Instagram className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Instagramビジネスアカウントと連携</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    リアルタイムデータ同期、詳細な分析、効果的なコンテンツ戦略のための連携を開始します
                  </p>
                </div>
                <Button 
                  onClick={handleConnect}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  <Instagram className="mr-2 h-4 w-4" />
                  Instagramで認証
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connection Wizard */}
        {showWizard && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Instagram連携設定
              </CardTitle>
              <CardDescription>
                ステップバイステップでInstagramビジネスアカウントを連携します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InstagramConnectionWizard 
                username="eisho8400"
                onConnectionComplete={handleConnectionComplete}
                onConnectionError={handleConnectionError}
                className="w-full"
              />
            </CardContent>
          </Card>
        )}

        {/* Analytics Dashboard */}
        {connectionStatus === 'connected' && (
          <InstagramAnalyticsDashboard 
            username="eisho8400"
            onConnectionComplete={handleConnectionComplete}
            className="w-full"
          />
        )}

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-600" />
                リアルタイム同期
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Instagramの投稿データを自動的に取得・同期し、常に最新の情報を提供します。
                設定可能な同期間隔で柔軟な運用が可能です。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                詳細な分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                エンゲージメント率、投稿頻度、ベスト投稿時間、人気ハッシュタグなど、
                インサイトに満ちた分析データを提供します。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Instagram className="h-5 w-5 text-pink-600" />
                ビジネス成長
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                データに基づいたコンテンツ戦略でフォロワー成長を促進し、
                効果的なソーシャルメディアマーケティングを実現します。
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Technical Information */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-700">
              技術仕様
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium mb-2">対応API</h4>
                <ul className="space-y-1">
                  <li>• Instagram Basic Display API</li>
                  <li>• Instagram Graph API</li>
                  <li>• Facebook Graph API</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">主な機能</h4>
                <ul className="space-y-1">
                  <li>• OAuth 2.0認証フロー</li>
                  <li>• リアルタイムWebhook通知</li>
                  <li>• 自動データ同期</li>
                  <li>• 詳細な分析レポート</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}