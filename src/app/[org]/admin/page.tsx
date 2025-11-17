export default function AdminPage({ params }: { params: { org: string } }) {
  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{params.org} 管理者ダッシュボード</h1>
      <section className="rounded border p-4">
        <h2 className="text-lg font-medium">300社枠の運用</h2>
        <ul className="list-disc pl-6 text-sm">
          <li>枠使用状況の可視化（未実装）</li>
          <li>審査/承認/待機リスト管理（未実装）</li>
        </ul>
      </section>
      <section className="rounded border p-4">
        <h2 className="text-lg font-medium">概算料金テンプレート管理</h2>
        <p className="text-sm">カテゴリ・レンジ・オプションの登録編集（未実装）</p>
      </section>
      <section className="rounded border p-4">
        <h2 className="text-lg font-medium">メール配信設定</h2>
        <p className="text-sm">送信ドメイン認証（SPF/DKIM/DMARC）、キュー/レート制御（未実装）</p>
      </section>
    </main>
  )
}