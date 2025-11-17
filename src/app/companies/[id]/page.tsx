import { companies } from "@/data/companies"
import Link from "next/link"
import InstagramEmbed from "@/components/InstagramEmbed"

type Props = { params: { id: string } }

export default function CompanyPage({ params }: Props) {
  const company = companies.find((c) => c.id === params.id)
  if (!company) return <div className="p-6">見つかりませんでした</div>
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{company.name}</h1>
      <p className="text-sm">対応地域: {company.regions.join(" / ")}</p>
      <p className="text-sm">カテゴリ: {company.categories.join(" / ")}</p>
      <p className="text-gray-700">{company.description}</p>
      <p className="text-sm">
        Instagram: <Link href={`https://www.instagram.com/${company.instagramHandle}/`} className="text-blue-600 underline" target="_blank">@{company.instagramHandle}</Link>
      </p>
      <InstagramEmbed handle={company.instagramHandle} postUrl={company.instagramPostUrl} className="mt-2" />
      <Link href="/" className="text-blue-600 underline text-sm">戻る</Link>
    </main>
  )
}