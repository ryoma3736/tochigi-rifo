"use client"
import { useState } from "react"

export default function SubscribePage({ params }: { params: { org: string } }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startCheckout = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/${params.org}/api/billing/create-session`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? "エラーが発生しました")
        return
      }
      if (data?.url) {
        window.location.href = data.url
        return
      }
      setError("セッションURLが取得できませんでした")
    } catch (e) {
      setError("ネットワークエラー")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold mb-4">{params.org} サブスク登録</h1>
      <p className="text-sm text-gray-600 mb-6">このテナントの月額プランに登録します。決済はStripeで処理されます。</p>
      <button onClick={startCheckout} disabled={loading} className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">
        {loading ? "リダイレクト中..." : "Stripeで購読する"}
      </button>
      {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
    </div>
  )
}