import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

export const runtime = "nodejs"

export async function POST(req: NextRequest, { params }: { params: { org: string } }) {
  const secret = process.env.STRIPE_SECRET_KEY
  const priceId = process.env.STRIPE_PRICE_ID_100K
  if (!secret || !priceId) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 })
  }

  const stripe = new Stripe(secret)
  const origin = req.headers.get("origin") ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/${params.org}?checkout=success`,
      cancel_url: `${origin}/${params.org}/subscribe?checkout=cancel`,
      metadata: { org: params.org },
    })
    return NextResponse.json({ url: session.url, id: session.id })
  } catch (error) {
    return NextResponse.json({ error: "session_creation_failed" }, { status: 500 })
  }
}