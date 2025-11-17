import { NextResponse } from "next/server"
import { enqueueInquiryEmail, type InquiryPayload } from "@/lib/email"

export async function POST(req: Request, { params }: { params: { org: string } }) {
  const body = await req.json()
  if (!body || !body.email || !Array.isArray(body.companies) || body.companies.length === 0) {
    return NextResponse.json({ error: "invalid" }, { status: 400 })
  }
  await enqueueInquiryEmail(body as InquiryPayload)
  return NextResponse.json({ ok: true })
}