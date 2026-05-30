'use client'

import { useState } from 'react'
import InstagramContentScheduler from '@/components/InstagramContentScheduler'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  Clock,
  Instagram,
  PlusCircle,
  Settings,
  BarChart3
} from 'lucide-react'

export default function InstagramContentSchedulerPage() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'templates' | 'analytics'>('calendar')

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Instagramコンテンツスケジューラー</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            効果的なコンテンツ戦略を実現する、直感的なスケジューリングツール。
            カレンダー管理、テンプレート作成、投稿最適化を一括で。
          </p>
        </div>

        {/* Navigation Tabs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  コンテンツ管理
                </CardTitle>
                <CardDescription>
                  スケジュール、テンプレート、分析を管理
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={activeTab === 'calendar' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('calendar')}
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  カレンダー
                </Button>
                <Button
                  variant={activeTab === 'templates' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('templates')}
                  className="flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  テンプレート
                </Button>
                <Button
                  variant={activeTab === 'analytics' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('analytics')}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  分析
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <InstagramContentScheduler 
              username="eisho8400"
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                スマートスケジューリング
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                AIが最適な投稿時間を提案し、エンゲージメントを最大化します。
                ドラッグ＆ドロップで簡単にスケジュール調整が可能です。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-green-600" />
                テンプレート管理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                効果的な投稿テンプレートを作成・管理し、
                一貫性のあるブランドメッセージングを実現します。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                投稿最適化
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                データに基づいた洞察でコンテンツ戦略を改善し、
                フォロワー成長とエンゲージメントを促進します。
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
                <h4 className="font-medium mb-2">主な機能</h4>
                <ul className="space-y-1">
                  <li>• 自動投稿スケジューリング</li>
                  <li>• コンテンツテンプレート作成</li>
                  <li>• 最適な投稿時間提案</li>
                  <li>• リアルタイム通知</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">対応機能</h4>
                <ul className="space-y-1">
                  <li>• Instagram Graph API連携</li>
                  <li>• 画像・動画アップロード</li>
                  <li>• ハッシュタグ最適化</li>
                  <li>• エンゲージメント分析</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}