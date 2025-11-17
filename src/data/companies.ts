export type Company = {
  id: string
  tenantId: string
  name: string
  regions: string[]
  categories: string[]
  instagramHandle: string
  description: string
  email: string
  instagramPostUrl?: string
}

export const companies: Company[] = [
  {
    id: "alpha-build",
    tenantId: "t-alpha",
    name: "アルファ建設",
    regions: ["栃木県", "群馬県"],
    categories: ["内装", "外構"],
    instagramHandle: "alpha_build_co",
    description: "戸建て・マンションの内装リフォームと外構工事を対応",
    email: "contact@alpha-build.example.com",
    instagramPostUrl: "https://www.instagram.com/p/CxY1cSmB7A3/",
  },
  {
    id: "beta-reform",
    tenantId: "t-beta",
    name: "ベータリフォーム",
    regions: ["栃木県", "茨城県"],
    categories: ["内装"],
    instagramHandle: "beta_reform",
    description: "水回り中心のリフォームに強み",
    email: "contact@beta-reform.example.com",
    instagramPostUrl: "https://www.instagram.com/p/CxY1cSmB7A3/",
  },
  {
    id: "garden-works",
    tenantId: "t-garden",
    name: "ガーデンワークス",
    regions: ["栃木県"],
    categories: ["外構"],
    instagramHandle: "garden_works_tochigi",
    description: "外構・エクステリアのデザイン施工",
    email: "contact@garden-works.example.com",
    instagramPostUrl: "https://www.instagram.com/p/CxY1cSmB7A3/",
  },
]