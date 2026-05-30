// Test script for Instagram Service Integration scoring algorithm
const { serviceTemplates } = require('./src/data/services.ts')

// Mock Instagram posts similar to eisho8400 data
const mockInstagramPosts = [
  {
    id: '1',
    caption: '【施工事例】鹿沼市のお客様邸で和室の木質リフォームを完了しました🌲 天然木材の温もりが素敵な空間になりました！ #栃木リフォーム #木質リフォーム #和室リフォーム #栄匠',
    likes: 89,
    comments: 12
  },
  {
    id: '2', 
    caption: '【キッチンリフォーム】天然木のカウンターと収納で家族の思い出が詰まった空間に✨ お客様のライフスタイルに合わせたカスタマイズが可能です！ #キッチンリフォーム #木質インテリア #カスタマイズ家具',
    likes: 124,
    comments: 18
  },
  {
    id: '3',
    caption: '【外構工事】国産杉を使用したウッドフェンスとゲートの施工完了🚪 木と自然を感じる外構で、お客様のお住まいを優しく演出します #外構工事 #エクステリア #ウッドフェンス #鹿沼市',
    likes: 67,
    comments: 8
  }
]

// Test the scoring algorithm
function testScoringAlgorithm() {
  console.log('🧪 Testing Instagram Service Integration Scoring Algorithm')
  console.log('=' .repeat(60))
  
  const testServices = serviceTemplates.filter(s => s.showcasePriority && s.showcasePriority >= 7)
  
  testServices.forEach(service => {
    console.log(`\n🔍 Testing Service: ${service.name}`)
    console.log(`   Category: ${service.category}`)
    console.log(`   Hashtags: ${service.instagramHashtags?.join(', ') || 'None'}`)
    
    mockInstagramPosts.forEach(post => {
      let score = 0
      const reasons = []
      
      // Direct ID matches (100 points)
      if (service.relatedInstagramPosts?.includes(post.id)) {
        score += 100
        reasons.push('✅ Direct ID match (+100)')
      }
      
      // Hashtag matching (50 points each)
      if (service.instagramHashtags) {
        service.instagramHashtags.forEach(hashtag => {
          if (post.caption.includes(hashtag)) {
            score += 50
            reasons.push(`✅ Hashtag match: ${hashtag} (+50)`)
          }
        })
      }
      
      // Category matching (30 points)
      if (service.instagramCategory && post.caption.includes(service.instagramCategory)) {
        score += 30
        reasons.push(`✅ Category match: ${service.instagramCategory} (+30)`)
      }
      
      // Service name keyword matching (20 points each)
      const serviceKeywords = service.name.split(/[・\s]/).filter(word => word.length > 1)
      serviceKeywords.forEach(keyword => {
        if (post.caption.includes(keyword)) {
          score += 20
          reasons.push(`✅ Service keyword: ${keyword} (+20)`)
        }
      })
      
      // Location matching (5 points each)
      const locationKeywords = ['栃木', '鹿沼', '宇都宮', '小山']
      locationKeywords.forEach(location => {
        if (post.caption.includes(location)) {
          score += 5
          reasons.push(`✅ Location match: ${location} (+5)`)
        }
      })
      
      if (score > 0) {
        console.log(`   📱 Post ${post.id}: ${score} points`)
        reasons.forEach(reason => console.log(`      ${reason}`))
      }
    })
  })
}

// Run the test
testScoringAlgorithm()