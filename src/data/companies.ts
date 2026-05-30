export type Company = {
  id: string
  name: string
  regions: string[]
  categories: string[]
  instagramHandle: string
  description: string
  email: string
  instagramPostUrl?: string
  rating?: number
  reviewCount?: number
  experience?: number // Years of experience
  projects?: number // Number of completed projects
  specialties?: string[]
  certifications?: string[]
  awards?: string[]
  address?: string
  phone?: string
  fax?: string
}

export const companies: Company[] = [
  {
    id: "eisho",
    name: "栄匠（株式会社晃家）",
    regions: ["栃木県"],
    categories: ["内装", "外構"],
    instagramHandle: "eisho8400",
    description: "栃木県鹿沼市にあるリフォーム専門会社。木質リフォーム、木質インテリア、家具製造販売、エクステリアを総合的に対応。創業以来、何万人ものお客様との出会いの中で、お客様が求めているもの、価値観や考えを共有することにより、理想の空間を作り上げるご提案ができるようになりました。",
    email: "info@eisho.org",
    instagramPostUrl: "https://www.instagram.com/p/CxY1cSmB7A3/?hl=ja",
    rating: 4.9,
    reviewCount: 156,
    experience: 30,
    projects: 3200,
    specialties: ["木質リフォーム", "木質インテリア", "家具製造", "エクステリア", "外構工事", "新築工事", "リノベーション"],
    certifications: ["一般建設業許可証（第25937号）", "木材業者登録証（第2168号）", "木材乾燥士"],
    awards: ["とちぎ住宅フェア出展", "お客様満足度第1位"],
    address: "〒321-1111 栃木県鹿沼市板荷1358",
    phone: "TEL: 0289-74-7717",
    fax: "FAX: 0289-74-7744"
  },
  {
    id: "beta-reform",
    name: "ベータリフォーム工業",
    regions: ["栃木県", "茨城県"],
    categories: ["内装"],
    instagramHandle: "eisho8400",
    description: "水回り中心のリフォームに15年の実績。特にキッチン・浴室・トイレのリフォームで高い評価を獲得しています。",
    email: "contact@beta-reform.example.com",
    instagramPostUrl: "https://www.instagram.com/p/CxY1cSmB7A3/?hl=ja",
    rating: 4.6,
    reviewCount: 89,
    experience: 15,
    projects: 620,
    specialties: ["水回りリフォーム", "キッチン工事", "浴室工事", "トイレ工事"],
    certifications: ["建設業許可", "住宅リフォーム推進協会", "水回りリフォーム認定業者"],
    awards: ["水回りリフォーム部門優秀賞"]
  },
  {
    id: "garden-works",
    name: "ガーデンワークス株式会社",
    regions: ["栃木県"],
    categories: ["外構"],
    instagramHandle: "eisho8400",
    description: "外構・エクステリアのデザイン施工を20年間専門に行っています。お庭のリノベーションから駐車場工事まで幅広く対応。",
    email: "contact@garden-works.example.com",
    instagramPostUrl: "https://www.instagram.com/p/CxY1cSmB7A3/?hl=ja",
    rating: 4.7,
    reviewCount: 156,
    experience: 20,
    projects: 430,
    specialties: ["外構工事", "エクステリア", "お庭リフォーム", "駐車場工事"],
    certifications: ["造園業許可", "外構工事認定業者", "エコガーデン認定"],
    awards: ["栃木県造園業協会優秀賞", "エコ外構コンテスト入賞"]
  },
  {
    id: "delta-home",
    name: "デルタホームサービス",
    regions: ["栃木県", "福島県"],
    categories: ["内装", "外構"],
    instagramHandle: "eisho8400",
    description: "総合リフォーム会社として18年の実績。内装から外装まで一貫した施工管理体制で、品質と納期を確実に提供します。",
    email: "info@delta-home.example.com",
    instagramPostUrl: "https://www.instagram.com/p/CxY1cSmB7A3/?hl=ja",
    rating: 4.5,
    reviewCount: 203,
    experience: 18,
    projects: 1200,
    specialties: ["総合リフォーム", "内装工事", "外壁工事", "屋根工事"],
    certifications: ["建設業許可", "住宅リフォーム推進協会", "ISO9001認証"],
    awards: ["全国住宅リフォーム協会認定店", "品質管理優良企業"]
  },
  {
    id: "echo-design",
    name: "エコーデザイン建築事務所",
    regions: ["栃木県"],
    categories: ["内装"],
    instagramHandle: "eisho8400",
    description: "デザイン性重視のリフォームを得意とする建築事務所。インテリアコーディネーターと協働で、おしゃれで機能的な空間づくりを実現します。",
    email: "design@echo-arch.example.com",
    instagramPostUrl: "https://www.instagram.com/p/CxY1cSmB7A3/?hl=ja",
    rating: 4.9,
    reviewCount: 78,
    experience: 12,
    projects: 340,
    specialties: ["デザインリフォーム", "インテリアデザイン", "空間デザイン", "カラーコーディネート"],
    certifications: ["一級建築士事務所", "インテリアコーディネーター協会", "デザイン住宅認定業者"],
    awards: ["住宅デザインコンテスト金賞", "インテリアデザイン賞"]
  },
  {
    id: "foxtrot-renovation",
    name: "フォックスロットリノベーション",
    regions: ["栃木県", "茨城県", "群馬県"],
    categories: ["内装", "外構"],
    instagramHandle: "eisho8400",
    description: "古民家・歴史的建築物のリノベーションを専門に22年間取り組んでいます。伝統を残しながら現代の暮らしやすさを融合させる施工が評判です。",
    email: "reno@foxtrot.example.com",
    instagramPostUrl: "https://www.instagram.com/p/CxY1cSmB7A3/",
    rating: 4.8,
    reviewCount: 94,
    experience: 22,
    projects: 380,
    specialties: ["古民家リノベーション", "歴史的建築物修復", "伝統工法", "耐震補強"],
    certifications: ["建設業許可", "文化財建造物修理業者", "伝統的建造物再生協会"],
    awards: ["文化庁長官表彰", "伝統建築技術保存賞"]
  },
]