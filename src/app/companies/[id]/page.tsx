import { companies } from "@/data/companies"
import Link from "next/link"
import InstagramEmbed from "@/components/InstagramEmbed"
import InstagramProfile from "@/components/InstagramProfile"
import InstagramDashboard from "@/components/InstagramDashboard"

type Props = { params: { id: string } }

export default function CompanyPage({ params }: Props) {
  const company = companies.find((c) => c.id === params.id)
  if (!company) return <div className="p-6">見つかりませんでした</div>
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">{company.name}</h1>
            {company.address && (
              <p className="text-sm text-gray-600 mt-1">{company.address}</p>
            )}
          </div>
          {company.rating && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span className="text-sm font-medium">{company.rating}</span>
              <span className="text-xs text-gray-500">({company.reviewCount || 0}件)</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">対応地域</p>
            <p className="text-sm font-medium">{company.regions.join(" / ")}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">カテゴリ</p>
            <p className="text-sm font-medium">{company.categories.join(" / ")}</p>
          </div>
          {company.experience && (
            <div>
              <p className="text-sm text-gray-600 mb-1">実績年数</p>
              <p className="text-sm font-medium">{company.experience}年</p>
            </div>
          )}
          {company.projects && (
            <div>
              <p className="text-sm text-gray-600 mb-1">施工実績</p>
              <p className="text-sm font-medium">{company.projects.toLocaleString()}件</p>
            </div>
          )}
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">会社概要</p>
          <p className="text-gray-700 leading-relaxed">{company.description}</p>
        </div>

        {company.specialties && company.specialties.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">得意分野</p>
            <div className="flex flex-wrap gap-2">
              {company.specialties.map((specialty, index) => (
                <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {company.certifications && company.certifications.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">保有資格</p>
            <div className="space-y-1">
              {company.certifications.map((cert, index) => (
                <p key={index} className="text-sm text-gray-700">• {cert}</p>
              ))}
            </div>
          </div>
        )}

        {company.awards && company.awards.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">受賞歴</p>
            <div className="space-y-1">
              {company.awards.map((award, index) => (
                <p key={index} className="text-sm text-gray-700">• {award}</p>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <p>
              Instagram: <Link href={`https://www.instagram.com/${company.instagramHandle}/`} className="text-blue-600 underline" target="_blank">@{company.instagramHandle}</Link>
            </p>
            {company.email && (
              <p>
                Email: <a href={`mailto:${company.email}`} className="text-blue-600 underline">{company.email}</a>
              </p>
            )}
            {company.phone && (
              <p>
                電話: <a href={`tel:${company.phone.replace(/[^0-9]/g, '')}`} className="text-blue-600 underline">{company.phone}</a>
              </p>
            )}
            {company.fax && (
              <p className="text-gray-600">{company.fax}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Instagramビジネス情報</h2>
        <InstagramProfile handle={company.instagramHandle} className="" />
      </div>

      <Link href="/" className="text-blue-600 underline text-sm">← トップページに戻る</Link>
    </main>
  )
}