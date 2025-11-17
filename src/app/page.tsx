import Link from "next/link"
import { tenants } from "@/data/tenants"

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">建設・リフォーム向けSaaSポータル</h1>
        <p className="text-gray-600 mt-2">各社専用ポータル（テナント）から検索・同時問い合わせ・Instagram閲覧・サブスク管理を利用できます。</p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">テナント一覧</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tenants.map((t) => (
            <div key={t.id} className="rounded border p-4">
              <div className="font-semibold">{t.name}</div>
              <div className="text-sm text-gray-600">/{t.slug} ポータル</div>
              <div className="mt-2 flex gap-2">
                <Link className="rounded bg-blue-600 text-white px-3 py-1 text-sm" href={`/${t.slug}`}>ポータルへ</Link>
                <Link className="rounded bg-gray-200 px-3 py-1 text-sm" href={`/${t.slug}/subscribe`}>サブスク登録</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
