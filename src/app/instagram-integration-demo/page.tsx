'use client'

import InstagramServiceIntegration from '@/components/InstagramServiceIntegration'

export default function InstagramIntegrationDemo() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Instagramサービス連携デモ
          </h1>
          <p className="text-gray-600">
            eisho8400のInstagram投稿とサービスのインテリジェントマッチングを体験してください
          </p>
        </div>

        <InstagramServiceIntegration 
          instagramUsername="eisho8400"
          showAnalytics={true}
          enableAutoSync={true}
        />
      </div>
    </div>
  )
}