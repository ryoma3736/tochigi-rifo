import nodemailer from "nodemailer"
import { companies, type Company } from "@/data/companies"

export type InquiryPayload = {
  name: string
  email: string
  phone: string
  message: string
  region: string
  category: string
  companies: string[]
}

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter {
  const host = process.env.SMTP_HOST
  const portStr = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || user || ""

  if (!host || !portStr || !user || !pass || !from) {
    throw new Error("smtp_not_configured")
  }

  if (transporter) return transporter

  const port = Number(portStr)
  const secure = port === 465
  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })
  return transporter
}

function buildComplianceFooter(): string {
  return (
    process.env.EMAIL_COMPLIANCE_FOOTER ||
    [
      "---",
      "このメールは『栃木ポータルサイトSOLO』からの代理送信です。",
      "お問い合わせ内容は選択された各社へ共有されています。個人情報の取扱いは各社の方針に従います。",
      "誤送信・受信停止をご希望の際は本メールへご返信ください。",
    ].join("\n")
  )
}

function resolveRecipients(ids: string[]): { email: string; name: string }[] {
  const map = new Map(companies.map((c) => [c.id, c]))
  return ids
    .map((id) => map.get(id))
    .filter((c): c is Company & { email: string; name: string } => !!c && typeof c.email === "string" && typeof c.name === "string")
    .map((c) => ({ email: c.email, name: c.name }))
}

export async function enqueueInquiryEmail(payload: InquiryPayload) {
  const recipients = resolveRecipients(payload.companies)
  if (recipients.length === 0) {
    throw new Error("no_recipient_emails")
  }

  const t = getTransporter()
  const subject = `[同時問い合わせ] ${payload.region} / ${payload.category || "カテゴリ未指定"} - ${payload.name}様`
  const body = [
    "以下の内容でお問い合わせがありました。",
    "",
    "お客様情報",
    `- 氏名: ${payload.name}`,
    `- メール: ${payload.email}`,
    `- 電話: ${payload.phone}`,
    `- 地域: ${payload.region}`,
    `- カテゴリ: ${payload.category || "未指定"}`,
    "",
    "ご要望・現状",
    payload.message || "(未記入)",
    "",
    "送信先企業ID",
    `- ${payload.companies.join(", ")}`,
    "",
    buildComplianceFooter(),
  ].join("\n")

  const from = process.env.SMTP_FROM || process.env.SMTP_USER!

  const sendList = recipients.map((r) =>
    t.sendMail({
      from,
      to: `${r.name} <${r.email}>`,
      replyTo: payload.email,
      subject,
      text: body,
    })
  )

  await Promise.all(sendList)

  return { queued: true, sent: recipients.length }
}