export type ServiceOption = {
  id: string
  name: string
  priceDelta: number
}

export type ServiceTemplate = {
  id: string
  name: string
  category: string
  description: string
  minPrice: number
  maxPrice: number
  unit: string
  options: ServiceOption[]
  imageUrl?: string
  instagramHashtags?: string[]
  instagramCategory?: string
  relatedInstagramPosts?: string[]
  showcasePriority?: number // 1-10, higher means more likely to be featured
}

export const serviceTemplates: ServiceTemplate[] = [
  {
    id: "kitchen-renovation",
    name: "キッチンリフォーム",
    category: "内装",
    description: "システムキッチン交換と内装改修。最新のIHクッキングヒーター、人造大理石天板、食洗器一体型を標準装備。収納効率を高める引き出し式収納で、調理動線を最適化します。天然木のカウンターと収納で家族の思い出が詰まった空間を演出します。",
    minPrice: 500000,
    maxPrice: 1500000,
    unit: "一式",
    options: [
      { id: "dishwasher", name: "食洗機追加", priceDelta: 120000 },
      { id: "counter-stone", name: "天板を人工石へ", priceDelta: 250000 },
      { id: "induction", name: "IHクッキングヒーター", priceDelta: 180000 },
      { id: "storage", name: "収納ユニット追加", priceDelta: 80000 },
    ],
    imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20Japanese%20kitchen%20renovation%20wood%20cabinets%20clean%20design%20functional%20space&image_size=landscape_4_3",
    instagramHashtags: ["#キッチンリフォーム", "#木質インテリア", "#カスタマイズ家具", "#天然木", "#カウンター", "#収納", "#ライフスタイル", "#家族の思い出"],
    instagramCategory: "kitchen-renovation",
    relatedInstagramPosts: ["2"], // References to post ID from our Instagram data
    showcasePriority: 10,
  },
  {
    id: "bathroom-renovation",
    name: "浴室リフォーム",
    category: "内装",
    description: "ユニットバス交換で、快適なバスタイムを実現。保温性に優れた高断熱バス、換気暖房乾燥機、ミストサウナ機能付き。檜の香りに包まれる癒しの空間を演出します。天然木材の抗菌効果と調湿効果で、健やかな毎日をサポートします。",
    minPrice: 600000,
    maxPrice: 1800000,
    unit: "一式",
    options: [
      { id: "heater", name: "浴室暖房乾燥機", priceDelta: 100000 },
      { id: "mirror-large", name: "大型ミラー", priceDelta: 50000 },
      { id: "mist-sauna", name: "ミストサウナ", priceDelta: 150000 },
      { id: "audio", name: "浴室TV・オーディオ", priceDelta: 120000 },
    ],
    imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20Japanese%20bathroom%20renovation%20clean%20white%20design%20large%20mirror%20bathtub&image_size=landscape_4_3",
    instagramHashtags: ["#浴室リフォーム", "#檜風呂", "#木質リフォーム", "#リラックス空間", "#檜", "#癒し空間", "#抗菌効果", "#調湿効果"],
    instagramCategory: "bathroom-renovation",
    relatedInstagramPosts: ["5"], // References to post ID from our Instagram data
    showcasePriority: 9,
  },
  {
    id: "exterior-fence",
    name: "外構フェンス・ゲート",
    category: "外構",
    description: "国産杉を使用したウッドフェンスとゲートの施工。木と自然を感じる外構で、お客様のお住まいを優しく演出します。機能性とデザイン性を兼ね備えたフェンス施工で、プライバシー保護、防犯対策、風除け機能を考慮した設計を実現します。",
    minPrice: 150000,
    maxPrice: 600000,
    unit: "10m",
    options: [
      { id: "gate", name: "門扉設置", priceDelta: 120000 },
      { id: "intercom", name: "インターホン", priceDelta: 80000 },
      { id: "lighting", name: "外灯設置", priceDelta: 50000 },
      { id: "plants", name: "植栽付き", priceDelta: 100000 },
    ],
    imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20exterior%20wood%20fence%20gate%20design%20natural%20cedar%20wood%20craftsmanship&image_size=landscape_4_3",
    instagramHashtags: ["#外構工事", "#エクステリア", "#ウッドフェンス", "#鹿沼市", "#国産杉", "#木と自然", "#優しい演出", "#外構"],
    instagramCategory: "exterior-fence",
    relatedInstagramPosts: ["3"], // References to post ID from our Instagram data
    showcasePriority: 7,
  },
  {
    id: "interior-wall",
    name: "内装壁張替え",
    category: "内装",
    description: "クロス・壁紙の張替えで、お部屋の印象を一新。防カビ・抗菌クロス、調湿クロス、消臭クロスなど、健康と快適さを考慮した素材をご提案。職人による丁寧な施工で、美しい仕上がりを実現。",
    minPrice: 80000,
    maxPrice: 300000,
    unit: "1室",
    options: [
      { id: "insulation", name: "断熱材入替", priceDelta: 50000 },
      { id: "mold-proof", name: "防カビ処理", priceDelta: 20000 },
      { id: "premium-cross", name: "高級クロス", priceDelta: 30000 },
      { id: "accent-wall", name: "アクセントウォール", priceDelta: 40000 },
    ],
    imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20Japanese%20interior%20wall%20renovation%20clean%20white%20design%20wallpaper%20installation&image_size=landscape_4_3",
  },
  {
    id: "flooring-renovation",
    name: "フローリング張替え",
    category: "内装",
    description: "床材の張替えで、足触りと保温性を向上。高耐久性フローリング、床暖房対応、防音・防振処理付き。無垢材・複合材からお選びいただけ、お部屋の雰囲気に合わせた提案をいたします。",
    minPrice: 120000,
    maxPrice: 500000,
    unit: "10㎡",
    options: [
      { id: "floor-heating", name: "床暖房", priceDelta: 200000 },
      { id: "soundproof", name: "防音処理", priceDelta: 80000 },
      { id: "premium-wood", name: "無垢材", priceDelta: 150000 },
      { id: "cork", name: "コルクフロア", priceDelta: 60000 },
    ],
    imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20Japanese%20flooring%20installation%20clean%20wooden%20floor%20natural%20design&image_size=landscape_4_3",
  },
  {
    id: "exterior-wall",
    name: "外壁塗装・リフォーム",
    category: "外構",
    description: "外壁の塗装とリフォームで、建物の美観と耐久性を向上。高耐候性塗料、断熱塗料、防カビ処理を標準で施工。色選びから仕上がりまで、お客様のご要望に合わせた総合的な外壁リフォームをご提案。",
    minPrice: 400000,
    maxPrice: 1200000,
    unit: "一式",
    options: [
      { id: "insulation-coating", name: "断熱塗料", priceDelta: 200000 },
      { id: "mold-resistant", name: "防カビ処理", priceDelta: 80000 },
      { id: "scaffold", name: "足場設置", priceDelta: 150000 },
      { id: "color-consult", name: "色選び相談", priceDelta: 30000 },
    ],
    imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20Japanese%20exterior%20wall%20painting%20clean%20design%20fresh%20colors&image_size=landscape_4_3",
    instagramHashtags: ["#外壁リフォーム", "#外壁塗装", "#耐久性向上", "#栃木リフォーム"],
    instagramCategory: "exterior-wall",
    relatedInstagramPosts: ["3"],
    showcasePriority: 8,
  },
  {
    id: "custom-woodwork",
    name: "手作り家具・木工製品",
    category: "内装",
    description: "創業以来、大切にしてきた木との対話。一つ一つ丁寧に、お客様の想いを形にしていきます。職人の技で手作り家具や木工製品を制作。これからも「最高のおもてなし」をお約束します。",
    minPrice: 80000,
    maxPrice: 500000,
    unit: "1点",
    options: [
      { id: "premium-wood", name: "無垢材使用", priceDelta: 100000 },
      { id: "custom-design", name: "オリジナルデザイン", priceDelta: 50000 },
      { id: "hand-carved", name: "手彫り加工", priceDelta: 80000 },
      { id: "oil-finish", name: "オイル仕上げ", priceDelta: 30000 },
    ],
    imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20craftsman%20working%20with%20wood%20traditional%20tools%20professional%20workmanship%20detail%20shot&image_size=landscape_4_3",
    instagramHashtags: ["#職人の技", "#木工作家", "#手作り家具", "#栄匠", "#木との対話", "#丁寧な仕事", "#おもてなし", "#技術"],
    instagramCategory: "craftsmanship",
    relatedInstagramPosts: ["4"],
    showcasePriority: 9,
  },
  {
    id: "tatami-room",
    name: "和室リフォーム",
    category: "内装",
    description: "鹿沼市のお客様邸で和室の木質リフォームを完了。天然木材の温もりが素敵な空間になりました。伝統的な和の空間を現代の暮らしに合わせてリフォームします。",
    minPrice: 300000,
    maxPrice: 1200000,
    unit: "1室",
    options: [
      { id: "tatami-replace", name: "畳張替え", priceDelta: 150000 },
      { id: "fusuma-renew", name: "襖張替え", priceDelta: 80000 },
      { id: "wooden-frame", name: "木枠補修", priceDelta: 120000 },
      { id: "modern-lighting", name: "現代照明設置", priceDelta: 60000 },
    ],
    imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20traditional%20wooden%20interior%20renovation%20before%20after%20comparison%20clean%20modern%20design%20tatami%20room&image_size=landscape_4_3",
    instagramHashtags: ["#栃木リフォーム", "#木質リフォーム", "#和室リフォーム", "#栄匠", "#天然木材", "#温もり", "#伝統と現代", "#鹿沼市"],
    instagramCategory: "tatami-renovation",
    relatedInstagramPosts: ["1"],
    showcasePriority: 8,
  },
]