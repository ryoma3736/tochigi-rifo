"use client"
import Link from "next/link"
import { useState } from "react"
import { serviceTemplates } from "@/data/services"
import { companies } from "@/data/companies"
import { tenants } from "/Users/satoryouma/栃木ポータルサイトSOLO/portal/src/data/tenants"
import InstagramEmbed from "@/components/InstagramEmbed"

type Props = { org: string }

export default function OrgPortal({ org }: Props) {
  const tenant = tenants.find((t) => t.slug === org)
  const tenantId = tenant?.id

  const [region, setRegion] = useState<string>("栃木県")
  const [category, setCategory] = useState<string>("")
  const [budgetMin, setBudgetMin] = useState<number>(0)
  const [budgetMax, setBudgetMax] = useState<number>(2000000)
  const [cart, setCart] = useState<{ companyId: string }[]>([])

  const categories = Array.from(new Set(serviceTemplates.map((s) => s.category)))
  const regions = Array.from(new Set(companies.flatMap((c) => c.regions)))

  const filteredCompanies = companies.filter((c) =>
    (!tenantId || c.tenantId === tenantId) && c.regions.includes(region) && (category ? c.categories.includes(category) : true)
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
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      message: String(formData.get("message") || ""),
      region,
      category,
      companies: cart.map((c) => c.companyId),
    }
    const res = await fetch(`/${org}/api/inquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) alert("送信に失敗しました")
    else {
      alert("問い合わせを送信しました")
      setCart([])
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">{tenant ? tenant.name : "ポータル"}</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">選択中: <span className="font-semibold">{cart.length}社</span></span>
            {cart.length > 0 && (
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition shadow"
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
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-700 text-xl">🔧</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">リフォームをお考えですか？</h2>
          </div>
          <p className="text-gray-600">カテゴリ・地域・予算を選んで、最適な業者と施工事例をチェック！</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-blue-700 text-xl">🏠</span>
            <h3 className="text-lg font-semibold text-gray-800">カテゴリから探す</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              className={`rounded-xl border p-4 text-center transition ${!category ? "bg-blue-50 border-blue-400 text-blue-700" : "bg-white border-gray-200 hover:bg-gray-50"}`}
              onClick={() => setCategory("")}
            >
              <div className="text-2xl mb-2">🏡</div>
              <div className="text-sm font-medium">すべて</div>
            </button>
            {categories.map((c) => (
              <button
                key={c}
                className={`rounded-xl border p-4 text-center transition ${category === c ? "bg-blue-50 border-blue-400 text-blue-700" : "bg-white border-gray-200 hover:bg-gray-50"}`}
                onClick={() => setCategory(c)}
              >
                <div className="text-2xl mb-2">{c === "内装" ? "🛋️" : "🌳"}</div>
                <div className="text-sm font-medium">{c}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-blue-700 text-xl">📍</span>
            <h3 className="text-lg font-semibold text-gray-800">地域・予算で絞り込む</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">対応地域</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-3 text-sm"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                {regions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">予算下限（万円）</label>
              <input
                type="number"
                className="w-full rounded-lg border border-gray-300 p-3 text-sm"
                value={Math.floor(budgetMin / 10000)}
                onChange={(e) => setBudgetMin(Number(e.target.value) * 10000)}
                placeholder="例: 50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">予算上限（万円）</label>
              <input
                type="number"
                className="w-full rounded-lg border border-gray-300 p-3 text-sm"
                value={Math.floor(budgetMax / 10000)}
                onChange={(e) => setBudgetMax(Number(e.target.value) * 10000)}
                placeholder="例: 200"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow">この条件で検索</button>
            <button className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">条件をクリア</button>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-blue-700 text-xl">🛠️</span>
            <h3 className="text-lg font-semibold text-gray-800">施工事例・サービス</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredServices.map((s) => (
              <div key={s.id} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-lg transition">
                <div className="bg-gray-100 rounded-lg h-32 mb-3 flex items-center justify-center text-gray-400 text-sm">施工事例画像</div>
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
            <span className="text-blue-700 text-xl">👷</span>
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
                      <div className="bg-gray-100 rounded-lg w-16 h-16 flex items-center justify-center text-gray-400 text-xs">Logo</div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{c.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{c.description}</div>
                        <div className="text-xs text-gray-500 mt-1">対応: {c.regions.join(" / ")} | カテゴリ: {c.categories.join(" / ")}</div>
                      </div>
                    </div>
                    <button
                      className={`ml-3 rounded-full px-3 py-1.5 text-xs font-semibold transition ${selected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                      onClick={() => toggleCart(c.id)}
                    >
                      {selected ? "選択済み" : "選択"}
                    </button>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-700 text-lg">📸</span>
                      <span className="text-sm text-gray-700 font-medium">Instagram最新投稿</span>
                    </div>
                    <InstagramEmbed handle={c.instagramHandle} postUrl={c.instagramPostUrl} className="" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <Link className="text-blue-600 underline" href={`/companies/${c.id}`}>詳細を見る</Link>
                    <span>@{c.instagramHandle}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <section id="inquiry" className="mt-6 bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-blue-700 text-xl">📮</span>
            <h3 className="text-lg font-semibold text-gray-800">まとめて問い合わせ</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">選択中の業者（{cart.length}社）へ一括で問い合わせを送信します。</p>
          <form action={submitInquiry} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input name="name" required placeholder="氏名" className="rounded-lg border border-gray-300 p-3 text-sm" />
            <input name="email" required type="email" placeholder="メールアドレス" className="rounded-lg border border-gray-300 p-3 text-sm" />
            <input name="phone" required placeholder="電話番号" className="rounded-lg border border-gray-300 p-3 text-sm" />
            <textarea name="message" required placeholder="ご要望・現状をご記入ください" className="md:col-span-3 rounded-lg border border-gray-300 p-3 text-sm" rows={4} />
            <button
              className="md:col-span-3 rounded-lg bg-blue-600 text-white px-4 py-3 font-semibold hover:bg-blue-700 transition shadow disabled:opacity-50"
              disabled={cart.length === 0}
            >
              問い合わせを送信
            </button>
          </form>
          <p className="mt-3 text-xs text-gray-500">送信後、選択された各社から直接ご連絡が入ります。</p>
        </section>
      </section>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-xs text-gray-500">
          © 栃木ポータルサイトSOLO / {tenant?.name}
        </div>
      </footer>
    </main>
  )
}