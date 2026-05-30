import type { Metadata } from "next";
import { Zen_Maru_Gothic, M_PLUS_Rounded_1c, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import PremiumMotion from "@/components/PremiumMotion";

// 丸ゴシック（地域リフォーム = 親しみやすさ）。Sora / Geist Sans は廃止。
const zenMaru = Zen_Maru_Gothic({
  variable: "--font-rounded",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const mPlusRounded = M_PLUS_Rounded_1c({
  variable: "--font-rounded-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "栃木リフォームポータルサイト",
  description: "栃木県のプロフェッショナルなリフォーム業者を簡単に見つけて、一括で問い合わせ。地域に根ざした信頼できる建設・リフォーム向けポータルサイト。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" data-premium="trust">
      <body
        className={`${zenMaru.variable} ${mPlusRounded.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <PremiumMotion />
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
