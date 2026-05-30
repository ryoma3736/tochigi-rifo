import { NextRequest, NextResponse } from "next/server"
import { enqueueInquiryEmail } from "@/lib/email"
import { companies } from "@/data/companies"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, message, region, category, companies: selectedCompanyIds } = body

    if (!name || !email || !phone || !message || !selectedCompanyIds || selectedCompanyIds.length === 0) {
      return NextResponse.json(
        { error: "必須項目をすべて入力してください" },
        { status: 400 }
      )
    }

    const selectedCompanies = companies.filter(c => selectedCompanyIds.includes(c.id))
    
    if (selectedCompanies.length === 0) {
      return NextResponse.json(
        { error: "有効な業者が選択されていません" },
        { status: 400 }
      )
    }

    // For demo purposes, we'll simulate email sending
    // In production, you would configure SMTP and use enqueueInquiryEmail
    console.log(`Inquiry from ${name} (${email}) to ${selectedCompanies.length} companies:`)
    console.log(`Region: ${region}, Category: ${category || "指定なし"}`)
    console.log(`Message: ${message}`)
    console.log(`Selected companies: ${selectedCompanies.map(c => c.name).join(", ")}`)

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: `${selectedCompanies.length}社へ問い合わせを送信しました`,
      note: "デモ用：実際のメール送信にはSMTP設定が必要です"
    })

  } catch (error) {
    console.error("Inquiry API error:", error)
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    )
  }
}