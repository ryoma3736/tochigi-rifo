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
}

export const serviceTemplates: ServiceTemplate[] = [
  {
    id: "kitchen-renovation",
    name: "キッチンリフォーム",
    category: "内装",
    description: "システムキッチン交換と内装改修の概算",
    minPrice: 500000,
    maxPrice: 1500000,
    unit: "一式",
    options: [
      { id: "dishwasher", name: "食洗機追加", priceDelta: 120000 },
      { id: "counter-stone", name: "天板を人工石へ", priceDelta: 250000 },
    ],
  },
  {
    id: "bathroom-renovation",
    name: "浴室リフォーム",
    category: "内装",
    description: "ユニットバス交換の概算",
    minPrice: 600000,
    maxPrice: 1800000,
    unit: "一式",
    options: [
      { id: "heater", name: "浴室暖房乾燥機", priceDelta: 100000 },
      { id: "mirror-large", name: "大型ミラー", priceDelta: 50000 },
    ],
  },
  {
    id: "exterior-deck",
    name: "ウッドデッキ",
    category: "外構",
    description: "外構木製デッキ施工の概算",
    minPrice: 300000,
    maxPrice: 800000,
    unit: "10㎡",
    options: [
      { id: "led", name: "LED照明追加", priceDelta: 30000 },
      { id: "steps", name: "ステップ追加", priceDelta: 40000 },
    ],
  },
]