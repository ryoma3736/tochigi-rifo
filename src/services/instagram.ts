export interface InstagramPost {
  id: string
  imageUrl: string
  caption: string
  likes: number
  comments: number
  timestamp: string
  permalink: string
}

export interface InstagramBusinessInfo {
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

// Mock Instagram data based on scraped 栄匠 (Eisho) business information
const mockInstagramData: Record<string, InstagramBusinessInfo> = {
  "eisho8400": {
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

const mockInstagramPosts: Record<string, InstagramPost[]> = {
  "eisho8400": [
    {
      id: "1",
      imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20traditional%20wooden%20interior%20renovation%20before%20after%20comparison%20clean%20modern%20design%20tatami%20room&image_size=square",
      caption: "【施工事例】鹿沼市のお客様邸で和室の木質リフォームを完了しました🌲 天然木材の温もりが素敵な空間になりました！ #栃木リフォーム #木質リフォーム #和室リフォーム #栄匠",
      likes: 89,
      comments: 12,
      timestamp: "2024-11-15T10:30:00Z",
      permalink: "https://www.instagram.com/p/CxY1cSmB7A3/"
    },
    {
      id: "2",
      imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20Japanese%20kitchen%20renovation%20wood%20cabinets%20clean%20design%20functional%20space&image_size=square",
      caption: "【キッチンリフォーム】天然木のカウンターと収納で家族の思い出が詰まった空間に✨ お客様のライフスタイルに合わせたカスタマイズが可能です！ #キッチンリフォーム #木質インテリア #カスタマイズ家具",
      likes: 124,
      comments: 18,
      timestamp: "2024-11-12T14:20:00Z",
      permalink: "https://www.instagram.com/p/CxY2dSmB7A4/"
    },
    {
      id: "3",
      imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20exterior%20wood%20fence%20gate%20design%20natural%20cedar%20wood%20craftsmanship&image_size=square",
      caption: "【外構工事】国産杉を使用したウッドフェンスとゲートの施工完了🚪 木と自然を感じる外構で、お客様のお住まいを優しく演出します #外構工事 #エクステリア #ウッドフェンス #鹿沼市",
      likes: 67,
      comments: 8,
      timestamp: "2024-11-10T09:15:00Z",
      permalink: "https://www.instagram.com/p/CxY3eSmB7A5/"
    },
    {
      id: "4",
      imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20craftsman%20working%20with%20wood%20traditional%20tools%20professional%20workmanship%20detail%20shot&image_size=square",
      caption: "【職人の技】創業以来、大切にしてきた木との対話🪚 一つ一つ丁寧に、お客様の想いを形にしていきます。これからも「最高のおもてなし」をお約束します #職人の技 #木工作家 #手作り家具 #栄匠",
      likes: 156,
      comments: 24,
      timestamp: "2024-11-08T16:45:00Z",
      permalink: "https://www.instagram.com/p/CxY4fSmB7A6/"
    },
    {
      id: "5",
      imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20traditional%20wooden%20bathroom%20renovation%20ofuro%20cedar%20wood%20relaxing%20space&image_size=square",
      caption: "【浴室リフォーム】檜の香りに包まれる癒しの空間に✨ 天然木材の抗菌効果と調湿効果で、健やかな毎日をサポートします #浴室リフォーム #檜風呂 #木質リフォーム #リラックス空間",
      likes: 98,
      comments: 15,
      timestamp: "2024-11-05T11:30:00Z",
      permalink: "https://www.instagram.com/p/CxY5gSmB7A7/"
    }
  ]
}

export async function getInstagramBusinessInfo(username: string): Promise<InstagramBusinessInfo | null> {
  // In a real implementation, this would call Instagram's Basic Display API or Graph API
  // For now, return mock data based on our scraped research
  return mockInstagramData[username] || null
}

export async function getInstagramPosts(username: string, limit: number = 6): Promise<InstagramPost[]> {
  // In a real implementation, this would fetch real posts from Instagram API
  // For now, return mock posts that represent realistic content for 栄匠
  const posts = mockInstagramPosts[username] || []
  return posts.slice(0, limit)
}

export function formatInstagramNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function formatInstagramDate(timestamp: string): string {
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