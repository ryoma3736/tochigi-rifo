"use client"
import Link from "next/link"
import { useState } from "react"
import { serviceTemplates } from "@/data/services"
import { companies } from "@/data/companies"
import InstagramEmbed from "@/components/InstagramEmbed"
import { Toaster, toast } from "sonner"

export default function UnifiedPortal() {
  const [region, setRegion] = useState<string>("栃木県")
  const [category, setCategory] = useState<string>("")
  const [budgetMin, setBudgetMin] = useState<number>(0)
  const [budgetMax, setBudgetMax] = useState<number>(2000000)
  const [cart, setCart] = useState<{ companyId: string }[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = Array.from(new Set(serviceTemplates.map((s) => s.category)))
  const regions = Array.from(new Set(companies.flatMap((c) => c.regions)))

  const filteredCompanies = companies.filter((c) =>
    c.regions.includes(region) && (category ? c.categories.includes(category) : true)
  )

  const filteredServices = serviceTemplates.filter((s) => {
    const inCategory = category ? s.category === category : true
    const priceOverlap = s.maxPrice >= budgetMin && s.minPrice <= budgetMax
    return inCategory && priceOverlap
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
      
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-800">SUUMO風リフォームポータル</Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">選択中: <span className="font-semibold">{cart.length}社</span></span>
            {cart.length > 0 && (
              <button
                className={`${primaryClasses.bg} text-white px-4 py-2 rounded-full text-sm font-semibold hover:${primaryClasses.bgHover} transition shadow focus:outline-none focus:ring-2 focus:ring-offset-2 ${primaryClasses.focusRing}`}
                onClick={() => document.getElementById("inquiry")?.scrollIntoView({ behavior: "smooth" })}
              >
                まとめて問い合わせ
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className={`${primaryClasses.bgLight} rounded-full flex items-center justify-center w-10 h-10`}>
              <span className={`${primaryClasses.text} text-xl`} aria-hidden="true">🔧</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">リフォームをお考えですか？</h2>
          </div>
          <p className="text-gray-600">カテゴリ・地域・予算を選んで、最適な業者と施工事例をチェック！</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className={`${primaryClasses.text} text-xl`} aria-hidden="true">🏠</span>
            <h3 className="text-lg font-semibold text-gray-800">カテゴリから探す</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              className={`rounded-xl border p-4 text-center transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${primaryClasses.focusRing} ${!category ? `${primaryClasses.bgLight} ${primaryClasses.border} ${primaryClasses.text}` : "bg-white border-gray-200 hover:bg-gray-50"}`}
              onClick={() => setCategory("")}
              aria-pressed={!category}
            >
              <div className="text-2xl mb-2" aria-hidden="true">🏡</div>
              <div className="text-sm font-medium">すべて</div>
            </button>
            {categories.map((c) => (
              <button
                key={c}
                className={`rounded-xl border p-4 text-center transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${primaryClasses.focusRing} ${category === c ? `${primaryClasses.bgLight} ${primaryClasses.border} ${primaryClasses.text}` : "bg-white border-gray-200 hover:bg-gray-50"}`}
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
              >
                <div className="text-2xl mb-2" aria-hidden="true">{c === "内装" ? "🛋️" : "🌳"}</div>
                <div className="text-sm font-medium">{c}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className={`${primaryClasses.text} text-xl`} aria-hidden="true">📍</span>
            <h3 className="text-lg font-semibold text-gray-800">地域・予算で絞り込む</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
          <div className="mt-4 flex gap-3">
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
              }}
            >
              条件をクリア
            </button>
          </div>
        </div>

        <div className="mt-6" id="services">
          <div className="flex items-center gap-3 mb-4">
            <span className={`${primaryClasses.text} text-xl`} aria-hidden="true">🛠️</span>
            <h3 className="text-lg font-semibold text-gray-800">施工事例・サービス</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredServices.map((s) => (
              <div key={s.id} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-lg transition">
                <div className="rounded-lg h-32 mb-3 overflow-hidden">
                  <img 
                    src={s.imageUrl || "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20Japanese%20renovation%20interior%20design%20clean%20minimalist%20style&image_size=landscape_4_3"} 
                    alt={`${s.name}の施工事例`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
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

        <div className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <span className={`${primaryClasses.text} text-xl`} aria-hidden="true">👷</span>
            <h3 className="text-lg font-semibold text-gray-800">対応業者一覧</h3>
            <span className="text-sm text-gray-500 ml-auto">{filteredCompanies.length}社が対応可能</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCompanies.map((c) => {
              const selected = cart.some((i) => i.companyId === c.id)
              return (
                <div key={c.id} className="bg-white rounded-xl shadow-sm border p-4 flex flex-col gap-3 hover:shadow-lg transition">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="rounded-lg w-16 h-16 flex items-center justify-center overflow-hidden">
                        <img 
                          src={`https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`professional construction company logo ${c.name} clean modern design`)}&image_size=square`}
                          alt={`${c.name}のロゴ`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{c.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{c.description}</div>
                        <div className="text-xs text-gray-500 mt-1">対応: {c.regions.join(" / ")} | カテゴリ: {c.categories.join(" / ")}</div>
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
                      <span className={`${primaryClasses.text} text-lg`} aria-hidden="true">🛠️</span>
                      <span className="text-sm text-gray-700 font-medium">施工事例</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <img 
                        src={`https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`modern Japanese renovation ${c.categories[0] || 'interior'} clean design before after`)}&image_size=square`}
                        alt={`${c.name}の施工事例1`}
                        className="w-full h-20 object-cover rounded-lg"
                        loading="lazy"
                      />
                      <img 
                        src={`https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`Japanese construction work ${c.categories[0] || 'exterior'} professional quality`)}&image_size=square`}
                        alt={`${c.name}の施工事例2`}
                        className="w-full h-20 object-cover rounded-lg"
                        loading="lazy"
                      />
                      <img 
                        src={`https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`completed renovation project ${c.regions[0] || 'Tochigi'} residential`)}&image_size=square`}
                        alt={`${c.name}の施工事例3`}
                        className="w-full h-20 object-cover rounded-lg"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`${primaryClasses.text} text-lg`} aria-hidden="true">📸</span>
                      <span className="text-sm text-gray-700 font-medium">Instagram最新投稿</span>
                    </div>
                    <InstagramEmbed handle={c.instagramHandle} postUrl={c.instagramPostUrl} className="" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <Link className={`${primaryClasses.link} underline`} href={`/companies/${c.id}`}>詳細を見る</Link>
                    <span>@{c.instagramHandle}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <section id="inquiry" className="mt-6 bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className={`${primaryClasses.text} text-xl`} aria-hidden="true">📮</span>
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
          © 栃木ポータルサイトSOLO / SUUMO風リフォームポータル
        </div>
      </footer>
    </main>
  )
}