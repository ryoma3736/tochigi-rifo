export type Tenant = {
  id: string
  slug: string
  name: string
}

export const tenants: Tenant[] = [
  { id: "t-alpha", slug: "alpha", name: "アルファポータル" },
  { id: "t-beta", slug: "beta", name: "ベータポータル" },
  { id: "t-garden", slug: "garden", name: "ガーデンポータル" },
]