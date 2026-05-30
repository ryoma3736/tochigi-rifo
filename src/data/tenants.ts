export type Tenant = {
  id: string
  slug: string
  name: string
  theme: {
    primary: string
    secondary: string
    accent: string
  }
}

export const tenants: Tenant[] = [
  { 
    id: "t-alpha", 
    slug: "alpha", 
    name: "アルファポータル",
    theme: {
      primary: "blue",
      secondary: "sky",
      accent: "indigo"
    }
  },
  { 
    id: "t-beta", 
    slug: "beta", 
    name: "ベータポータル",
    theme: {
      primary: "green",
      secondary: "emerald",
      accent: "teal"
    }
  },
  { 
    id: "t-garden", 
    slug: "garden", 
    name: "ガーデンポータル",
    theme: {
      primary: "emerald",
      secondary: "green",
      accent: "lime"
    }
  },
]