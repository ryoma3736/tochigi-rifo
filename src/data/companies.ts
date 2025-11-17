export type Company = {
  id: string
  name: string
  regions: string[]
  categories: string[]
  instagramHandle: string
  description: string
}

export const companies: Company[] = [
  {
    id: "alpha-build",
    name: "アルファ建設",
    regions: ["栃木県", "群馬県"],
    categories: ["内装", "外構"],
    instagramHandle: "alpha_build_co",
    description: "戸建て・マンションの内装リフォームと外構工事を対応",
  },
  {
    id: "beta-reform",
    name: "ベータリフォーム",
    regions: ["栃木県", "茨城県"],
    categories: ["内装"],
    instagramHandle: "beta_reform",
    description: "水回り中心のリフォームに強み",
  },
  {
    id: "garden-works",
    name: "ガーデンワークス",
    regions: ["栃木県"],
    categories: ["外構"],
    instagramHandle: "garden_works_tochigi",
    description: "外構・エクステリアのデザイン施工",
  },
]