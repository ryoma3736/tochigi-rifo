"use client"
import Link from "next/link"
import { useState } from "react"
import { serviceTemplates } from "@/data/services"
import { companies } from "@/data/companies"

type InquiryItem = {
  companyId: string
}

export default function Home() {
  const [region, setRegion] = useState<string>("栃木県")
  const [category, setCategory] = useState<string>("")
  const [budgetMin, setBudgetMin] = useState<number>(0)
  const [budgetMax, setBudgetMax] = useState<number>(2000000)
  const [cart, setCart] = useState<InquiryItem[]>([])

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
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      message: String(formData.get("message") || ""),
      region,
      category,
      companies: cart.map((c) => c.companyId),
    }
    const res = await fetch("/api/inquiry", {
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
    <main className="mx-auto max-w-6xl p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">建設・リフォーム検索と同時問い合わせ</h1>
        <div className="text-sm">選択中: {cart.length}社</div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 space-y-4">
          <div>
            <label className="block text-sm">地域</label>
            <select
              className="mt-1 w-full rounded border p-2"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm">カテゴリ</label>
            <select
              className="mt-1 w-full rounded border p-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">すべて</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm">概算料金レンジ</label>
            <div className="flex gap-2">
              <input
                type="number"
                className="w-1/2 rounded border p-2"
                value={budgetMin}
                onChange={(e) => setBudgetMin(Number(e.target.value))}
                placeholder="最小"
              />
              <input
                type="number"
                className="w-1/2 rounded border p-2"
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
                placeholder="最大"
              />
            </div>
          </div>
          <div className="rounded bg-yellow-50 p-3 text-sm">
            300社限定。現在の空き枠は表示のみ対応
          </div>
        </div>

        <div className="md:col-span-3 space-y-6">
          <h2 className="text-lg font-medium">サービスの概算料金</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredServices.map((s) => (
              <div key={s.id} className="rounded border p-4">
                <div className="font-semibold">{s.name}</div>
                <div className="text-sm text-gray-600">{s.description}</div>
                <div className="mt-2">概算: ¥{s.minPrice.toLocaleString()}〜¥{s.maxPrice.toLocaleString()} / {s.unit}</div>
                <div className="mt-2 text-sm">オプション: {s.options.map((o) => o.name).join(" / ")}</div>
              </div>
            ))}
          </div>

          <h2 className="text-lg font-medium">業者一覧</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCompanies.map((c) => {
              const selected = cart.some((i) => i.companyId === c.id)
              return (
                <div key={c.id} className="rounded border p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{c.name}</div>
                    <button
                      className={`rounded px-3 py-1 text-sm ${selected ? "bg-green-600 text-white" : "bg-gray-200"}`}
                      onClick={() => toggleCart(c.id)}
                    >
                      {selected ? "問い合わせ対象" : "選択"}
                    </button>
                  </div>
                  <div className="text-sm">対応地域: {c.regions.join(" / ")}</div>
                  <div className="text-sm">カテゴリ: {c.categories.join(" / ")}</div>
                  <div className="text-sm">Instagram: <Link className="text-blue-600 underline" href={`https://www.instagram.com/${c.instagramHandle}/`} target="_blank">@{c.instagramHandle}</Link></div>
                  <div className="text-gray-600 text-sm">{c.description}</div>
                  <Link className="text-blue-600 underline text-sm" href={`/companies/${c.id}`}>詳細を見る</Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="rounded border p-4">
        <h2 className="text-lg font-medium">同時問い合わせ</h2>
        <p className="text-sm">選択中の業者数: {cart.length}社</p>
        <form action={submitInquiry} className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input name="name" required placeholder="氏名" className="rounded border p-2" />
          <input name="email" required type="email" placeholder="メール" className="rounded border p-2" />
          <input name="phone" required placeholder="電話番号" className="rounded border p-2" />
          <textarea name="message" placeholder="ご要望・現状など" className="md:col-span-3 rounded border p-2" />
          <button className="rounded bg-blue-600 text-white px-4 py-2 md:col-span-3" disabled={cart.length === 0}>
            問い合わせを送信
          </button>
        </form>
        <p className="mt-2 text-xs text-gray-600">メールは各社へ同時送信。以降はお客様と業者の直接連絡で商談を進めます。手数料なし。</p>
      </section>
    </main>
  )
}
