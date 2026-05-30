"use client"
import Link from "next/link"
import { useState, type ReactNode } from "react"
import { serviceTemplates } from "@/data/services"
import { companies } from "@/data/companies"
import InstagramEmbed from "@/components/InstagramEmbed"
import InstagramProfile from "@/components/InstagramProfile"
import InstagramDashboard from "@/components/InstagramDashboard"
import InstagramServiceIntegration from "@/components/InstagramServiceIntegration"
import { Toaster, toast } from "sonner"

/* 統一線アイコン（絵文字を全廃）。currentColor 継承 → 既存の text-* リマップで橙に着色。 */
function Icon({ name, className = "w-5 h-5" }: { name: string; className?: string }) {
  const paths: Record<string, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    home: <><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10.2V20h13v-9.8" /></>,
    sofa: <><path d="M5 11V8.5A2.5 2.5 0 0 1 7.5 6h9A2.5 2.5 0 0 1 19 8.5V11" /><path d="M3 14.5A2 2 0 0 1 5 12.5 2.2 2.2 0 0 1 7 15v2h10v-2a2.2 2.2 0 0 1 2-2.5 2 2 0 0 1 2 2V18H3z" /><path d="M6.5 18v1.5M17.5 18v1.5" /></>,
    tree: <><path d="M12 3 6.5 11.5H9L5 17.5h6V21h2v-3.5h6L15 11.5h2.5z" /></>,
    sliders: <><path d="M4 6h9M19 6h1M4 12h1M11 12h9M4 18h6M16 18h4" /><circle cx="16" cy="6" r="2" /><circle cx="8" cy="12" r="2" /><circle cx="13" cy="18" r="2" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.4-3.4" /></>,
    images: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10" r="1.5" /><path d="m20.5 16-5-5L7 19" /></>,
    building: <><path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16" /><path d="M14 10h5a1 1 0 0 1 1 1v10" /><path d="M3 21h18M7.5 8h3M7.5 12h3M7.5 16h3" /></>,
    camera: <><path d="M4 8a2 2 0 0 1 2-2h1.4l.9-1.8h7.4L17.6 6H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4z" /><circle cx="12" cy="12.5" r="3.4" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 7 8.5 6 8.5-6" /></>,
    spark: <><path d="M12 4l1.7 5 5 1.7-5 1.7L12 17.4l-1.7-5-5-1.7 5-1.7z" /></>,
  }
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}
function CategoryIcon({ cat, className }: { cat: string; className?: string }) {
  const name = cat === "内装" ? "sofa" : cat === "外構" ? "tree" : "home"
  return <Icon name={name} className={className} />
}

export default function Home() {
  const [region, setRegion] = useState<string>("栃木県")
  const [category, setCategory] = useState<string>("")
  const [budgetMin, setBudgetMin] = useState<number>(0)
  const [budgetMax, setBudgetMax] = useState<number>(2000000)
  const [cart, setCart] = useState<{ companyId: string }[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("recommended")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const categories = Array.from(new Set(serviceTemplates.map((s) => s.category)))
  const regions = Array.from(new Set(companies.flatMap((c) => c.regions)))

  const filteredCompanies = companies.filter((c) => {
    const matchesRegion = c.regions.includes(region)
    const matchesCategory = category ? c.categories.includes(category) : true
    const matchesSearch = searchQuery === "" || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesRegion && matchesCategory && matchesSearch
  }).sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name)
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      case "experience":
        return (b.experience || 0) - (a.experience || 0)
      default:
        return 0 // recommended order
    }
  })

  const filteredServices = serviceTemplates.filter((s) => {
    const inCategory = category ? s.category === category : true
    const priceOverlap = s.maxPrice >= budgetMin && s.minPrice <= budgetMax
    const matchesSearch = searchQuery === "" || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
    return inCategory && priceOverlap && matchesSearch
  })

  function toggleCart(companyId: string) {
    setCart((prev) => {
      const exists = prev.some((i) => i.companyId === companyId)
      if (exists) return prev.filter((i) => i.companyId !== companyId)
      return [...prev, { companyId }]
    })
  }

  async function submitInquiry(formData: FormData) {
    if (cart.length === 0) {
      toast.error("業者を選択してください")
      return
    }

    setIsSubmitting(true)
    
    try {
      const payload = {
        name: String(formData.get("name") || ""),
        email: String(formData.get("email") || ""),
        phone: String(formData.get("phone") || ""),
        message: String(formData.get("message") || ""),
        region,
        category,
        companies: cart.map((c) => c.companyId),
      }
      
      const res = await fetch(`/api/inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "不明なエラー" }))
        throw new Error(errorData.error || "送信に失敗しました")
      }
      
      toast.success(`${cart.length}社へ問い合わせを送信しました！各社から直接ご連絡が入ります。`)
      setCart([])
      
      const form = document.querySelector('form[action*="submitInquiry"]') as HTMLFormElement
      if (form) form.reset()
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "問い合わせの送信中にエラーが発生しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  const primaryClasses = {
    bg: "bg-blue-600",
    bgHover: "bg-blue-700",
    bgLight: "bg-blue-50",
    border: "border-blue-400",
    text: "text-blue-700",
    link: "text-blue-600",
    focusRing: "focus:ring-blue-500"
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />

      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="hero-band mb-8">
          <div className="hero-band__grid" aria-hidden="true" />
          <div className="hero-band__inner">
            <span className="hero-eyebrow">
              <Icon name="spark" className="w-4 h-4" />
              栃木県のリフォーム業者ポータル
            </span>
            <h1 className="hero-title">
              理想の住まいへ、<br className="hidden sm:block" />確かな職人と出会う。
            </h1>
            <p className="hero-sub">
              カテゴリ・地域・予算から、栃木の信頼できるリフォーム会社と施工事例を検索。
              気になる会社へ、まとめて無料でお問い合わせできます。
            </p>
            <div className="hero-chips">
              <span className="hero-chip"><Icon name="building" className="w-4 h-4" />地域密着 {companies.length}社</span>
              <span className="hero-chip"><Icon name="images" className="w-4 h-4" />施工事例で比較</span>
              <span className="hero-chip"><Icon name="mail" className="w-4 h-4" />無料一括問い合わせ</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="grid" className={`${primaryClasses.text} w-5 h-5`} />
            <h3 className="text-lg font-semibold text-gray-800">カテゴリから探す</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              className={`rounded-xl border p-4 text-center transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${primaryClasses.focusRing} ${!category ? `${primaryClasses.bgLight} ${primaryClasses.border} ${primaryClasses.text}` : "bg-white border-gray-200 hover:bg-gray-50"}`}
              onClick={() => setCategory("")}
              aria-pressed={!category}
            >
              <div className="mb-2 flex justify-center"><Icon name="home" className="w-7 h-7" /></div>
              <div className="text-sm font-medium">すべて</div>
            </button>
            {categories.map((c) => (
              <button
                key={c}
                className={`rounded-xl border p-4 text-center transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${primaryClasses.focusRing} ${category === c ? `${primaryClasses.bgLight} ${primaryClasses.border} ${primaryClasses.text}` : "bg-white border-gray-200 hover:bg-gray-50"}`}
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
              >
                <div className="mb-2 flex justify-center"><CategoryIcon cat={c} className="w-7 h-7" /></div>
                <div className="text-sm font-medium">{c}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="sliders" className={`${primaryClasses.text} w-5 h-5`} />
            <h3 className="text-lg font-semibold text-gray-800">詳細検索・絞り込み</h3>
          </div>
          
          {/* 検索バー */}
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="キーワードで検索（例：キッチン、外壁、トイレ）"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-transparent focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* 詳細フィルター */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label htmlFor="region-select" className="block text-sm text-gray-600 mb-2">対応地域</label>
              <select
                id="region-select"
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-transparent focus:ring-blue-500"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                {regions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="budget-min" className="block text-sm text-gray-600 mb-2">予算下限（万円）</label>
              <input
                id="budget-min"
                type="number"
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-transparent focus:ring-blue-500"
                value={Math.floor(budgetMin / 10000)}
                onChange={(e) => setBudgetMin(Number(e.target.value) * 10000)}
                placeholder="例: 50"
              />
            </div>
            <div>
              <label htmlFor="budget-max" className="block text-sm text-gray-600 mb-2">予算上限（万円）</label>
              <input
                id="budget-max"
                type="number"
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-transparent focus:ring-blue-500"
                value={Math.floor(budgetMax / 10000)}
                onChange={(e) => setBudgetMax(Number(e.target.value) * 10000)}
                placeholder="例: 200"
              />
            </div>
            <div>
              <label htmlFor="sort-by" className="block text-sm text-gray-600 mb-2">並び替え</label>
              <select
                id="sort-by"
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-transparent focus:ring-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recommended">おすすめ順</option>
                <option value="name">名前順</option>
                <option value="rating">評価順</option>
                <option value="experience">実績順</option>
              </select>
            </div>
          </div>

          {/* 表示オプション */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">表示：</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  className={`px-3 py-1 rounded text-sm transition ${viewMode === "grid" ? "bg-white shadow-sm" : "text-gray-600"}`}
                  onClick={() => setViewMode("grid")}
                >
                  グリッド
                </button>
                <button
                  className={`px-3 py-1 rounded text-sm transition ${viewMode === "list" ? "bg-white shadow-sm" : "text-gray-600"}`}
                  onClick={() => setViewMode("list")}
                >
                  リスト
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {filteredCompanies.length}社が対応可能
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              className={`${primaryClasses.bg} text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:${primaryClasses.bgHover} transition shadow focus:outline-none focus:ring-2 focus:ring-offset-2 ${primaryClasses.focusRing}`}
              onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
            >
              この条件で検索
            </button>
            <button 
              className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              onClick={() => {
                setCategory("")
                setRegion("栃木県")
                setBudgetMin(0)
                setBudgetMax(2000000)
                setSearchQuery("")
                setSortBy("recommended")
              }}
            >
              条件をクリア
            </button>
          </div>
        </div>

        <div className="mt-6" id="services">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="images" className={`${primaryClasses.text} w-5 h-5`} />
            <h3 className="text-lg font-semibold text-gray-800">施工事例・サービス</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredServices.map((s) => (
              <div key={s.id} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-lg transition">
                <div className="case-thumb h-32 mb-3">
                  {s.imageUrl ? (
                    <img src={s.imageUrl} alt={`${s.name}の施工事例`} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="case-thumb__ph"><CategoryIcon cat={s.category} className="w-9 h-9" /></div>
                  )}
                </div>
                <div className="font-semibold text-gray-800">{s.name}</div>
                <div className="text-sm text-gray-600 mt-1">{s.description}</div>
                <div className="mt-3 text-sm text-gray-700">
                  概算: ¥{Math.floor(s.minPrice / 10000)}〜{Math.floor(s.maxPrice / 10000)}万円 / {s.unit}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  オプション: {s.options.map((o) => o.name).join(" / ")}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <InstagramServiceIntegration 
            services={filteredServices}
            instagramUsername="eisho8400"
            className=""
            showAnalytics={true}
            enableAutoSync={true}
          />
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="building" className={`${primaryClasses.text} w-5 h-5`} />
            <h3 className="text-lg font-semibold text-gray-800">対応業者一覧</h3>
            <span className="text-sm text-gray-500 ml-auto">{filteredCompanies.length}社が対応可能</span>
          </div>
          
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCompanies.map((c) => {
                const selected = cart.some((i) => i.companyId === c.id)
                return (
                  <div key={c.id} className="bg-white rounded-xl shadow-sm border p-4 flex flex-col gap-3 hover:shadow-lg transition">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className="logo-tile w-16 h-16" aria-label={`${c.name}のロゴ`}>{c.name.slice(0, 1)}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{c.name}</div>
                          <div className="text-sm text-gray-600 mt-1">{c.description}</div>
                          <div className="text-xs text-gray-500 mt-1">対応: {c.regions.join(" / ")} | カテゴリ: {c.categories.join(" / ")}</div>
                          {c.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-yellow-500">★</span>
                              <span className="text-sm font-medium">{c.rating}</span>
                              <span className="text-xs text-gray-500">({c.reviewCount || 0}件)</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        className={`ml-3 rounded-full px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${selected ? `${primaryClasses.bg} text-white focus:ring-blue-500` : "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500"}`}
                        onClick={() => toggleCart(c.id)}
                        aria-pressed={selected}
                      >
                        {selected ? "選択済み" : "選択"}
                      </button>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="images" className={`${primaryClasses.text} w-4 h-4`} />
                        <span className="text-sm text-gray-700 font-medium">施工事例</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="case-mini h-20"><CategoryIcon cat={c.categories[0] || "内装"} className="w-6 h-6" /></div>
                        <div className="case-mini h-20"><Icon name="images" className="w-6 h-6" /></div>
                        <div className="case-mini h-20"><Icon name="home" className="w-6 h-6" /></div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="camera" className={`${primaryClasses.text} w-4 h-4`} />
                        <span className="text-sm text-gray-700 font-medium">Instagram最新投稿</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <InstagramDashboard 
                          handle={c.instagramHandle} 
                          className=""
                          showAnalytics={false}
                          showRefreshControls={false}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <Link className={`${primaryClasses.link} underline`} href={`/companies/${c.id}`}>詳細を見る</Link>
                      <span>@{c.instagramHandle}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCompanies.map((c) => {
                const selected = cart.some((i) => i.companyId === c.id)
                return (
                  <div key={c.id} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-lg transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="logo-tile w-12 h-12 text-base" aria-label={`${c.name}のロゴ`}>{c.name.slice(0, 1)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-gray-800">{c.name}</div>
                            {c.rating && (
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-500 text-sm">★</span>
                                <span className="text-sm font-medium">{c.rating}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">{c.description}</div>
                          <div className="text-xs text-gray-500 mt-1">対応: {c.regions.join(" / ")} | カテゴリ: {c.categories.join(" / ")}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Link className={`${primaryClasses.link} text-sm underline`} href={`/companies/${c.id}`}>詳細</Link>
                        <button
                          className={`rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${selected ? `${primaryClasses.bg} text-white focus:ring-blue-500` : "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500"}`}
                          onClick={() => toggleCart(c.id)}
                          aria-pressed={selected}
                        >
                          {selected ? "選択済み" : "選択"}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <section id="inquiry" className="mt-6 bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="mail" className={`${primaryClasses.text} w-5 h-5`} />
            <h3 className="text-lg font-semibold text-gray-800">まとめて問い合わせ</h3>
          </div>
          
          {cart.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">選択中の業者:</p>
              <div className="flex flex-wrap gap-2">
                {cart.map((item) => {
                  const company = companies.find((c) => c.id === item.companyId)
                  return company ? (
                    <span key={item.companyId} className={`inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm`}>
                      {company.name}
                      <button
                        type="button"
                        onClick={() => toggleCart(item.companyId)}
                        className="text-blue-600 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                        aria-label={`${company.name}を削除`}
                      >
                        ✕
                      </button>
                    </span>
                  ) : null
                })}
              </div>
            </div>
          )}
          
          <p className="text-sm text-gray-600 mb-4">選択中の業者（{cart.length}社）へ一括で問い合わせを送信します。</p>
          <form action={submitInquiry} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="inquiry-name" className="block text-sm text-gray-600 mb-2">氏名</label>
              <input id="inquiry-name" name="name" required placeholder="氏名" className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-transparent focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="inquiry-email" className="block text-sm text-gray-600 mb-2">メールアドレス</label>
              <input id="inquiry-email" name="email" required type="email" placeholder="メールアドレス" className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-transparent focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="inquiry-phone" className="block text-sm text-gray-600 mb-2">電話番号</label>
              <input id="inquiry-phone" name="phone" required placeholder="電話番号" className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-transparent focus:ring-blue-500" />
            </div>
            <div className="md:col-span-3">
              <label htmlFor="inquiry-message" className="block text-sm text-gray-600 mb-2">ご要望・現状</label>
              <textarea id="inquiry-message" name="message" required placeholder="ご要望・現状をご記入ください" className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-transparent focus:ring-blue-500" rows={4} />
            </div>
            <button
              type="submit"
              className={`md:col-span-3 rounded-lg bg-blue-600 text-white px-4 py-3 font-semibold hover:bg-blue-700 transition shadow disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              disabled={cart.length === 0 || isSubmitting}
            >
              {isSubmitting ? "送信中..." : "問い合わせを送信"}
            </button>
          </form>
          <p className="mt-3 text-xs text-gray-500">送信後、選択された各社から直接ご連絡が入ります。</p>
        </section>
      </section>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-xs text-gray-500">
          © 栃木リフォームポータルサイト
        </div>
      </footer>
    </main>
  )
}
