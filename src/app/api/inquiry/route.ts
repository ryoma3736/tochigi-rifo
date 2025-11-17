import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.json()
  if (!body || !body.email || !Array.isArray(body.companies) || body.companies.length === 0) {
    return NextResponse.json({ error: "invalid" }, { status: 400 })
  }
  return NextResponse.json({ ok: true })
}