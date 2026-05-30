'use client'

import InstagramServiceIntegration from '@/components/InstagramServiceIntegration'
import { useState } from 'react'

export default function TestInstagramIntegration() {
  const [selectedService, setSelectedService] = useState<any>(null)
  const [relatedPosts, setRelatedPosts] = useState<any[]>([])

  const handleServiceClick = (service: any, posts: any[]) => {
    setSelectedService(service)
    setRelatedPosts(posts)
    console.log('Selected service:', service.name)
    console.log('Related posts:', posts.length)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Instagramサービス連携テスト
          </h1>
          <p className="text-gray-600">
            eisho8400のInstagram投稿とサービスのマッチングをテストします
          </p>
        </div>

        <InstagramServiceIntegration 
          instagramUsername="eisho8400"
          showAnalytics={true}
          enableAutoSync={true}
          onServiceClick={handleServiceClick}
        />

        {selectedService && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              選択されたサービス: {selectedService.name}
            </h2>
            <p className="text-gray-600 mb-4">{selectedService.description}</p>
            <div className="text-sm text-gray-500">
              関連投稿数: {relatedPosts.length}件
            </div>
          </div>
        )}
      </div>
    </div>
  )
}