"use client"

import { useEffect } from "react"

/**
 * Premium 演出（バニラ / 依存ライブラリ追加なし・CSS + rAF + getBoundingClientRect）。
 * lp-factory premium spec / reveal.ts の移植。デザインのみ — DOM 構造・文言・データは一切変更しない。
 *
 * すべて data 属性の付与と style.transform / textContent のみで実現する（markup は書き換えない）。
 * world = 地域 / trust（信頼・誠実・安心）。誇張せず、compositor(transform/opacity) だけで動かす。
 *
 * - sticky nav      : スクロールで <nav> に is-scrolled（blur 暗幕 + hairline）を付与
 * - scroll-reveal   : 既存セクション/カードを fade + translateY28px (cubic-bezier(.22,1,.36,1)) で stagger 表示
 * - headline reveal : 各セクションの見出し(h1/h2/h3)を独立して上品にスライド reveal
 * - hero ambient    : トップ(最初の section)の背景に落ち着いた光の漂い + 写真の小振幅 parallax
 * - image parallax  : 写真(.overflow-hidden 内の <img>)に小振幅の縦 parallax
 * - countup         : 評価 / 件数 / 社数 / フォロワー等の数値を 0 → 最終値へカウントアップ
 *
 * prefers-reduced-motion: reduce では一切動かさず即最終状態にする（CSS 側でも担保）。
 */
export default function PremiumMotion() {
  useEffect(() => {
    if (typeof document === "undefined") return

    const reduced =
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches

    // --- sticky nav 背景トグル（既存 <nav> をそのまま使う） ---
    const nav = document.querySelector<HTMLElement>("nav")
    const onNavScroll = () => {
      if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 8)
    }
    if (nav) {
      onNavScroll()
      window.addEventListener("scroll", onNavScroll, { passive: true })
    }

    // ========================================================================
    // 1. reveal 対象を自動収集（既存の card / 見出しブロックに印を付ける）
    //    構造もクラスも書き換えず、data 属性のみ付与（=見た目の演出だけ）。
    //    カード単位で stagger reveal させたいので、まず card / grid item / 見出しブロックを
    //    第一候補にし、互いに入れ子になっているものだけ祖先側を除外する。
    // ========================================================================
    const candidateSelectors = [
      "[class*='rounded-xl']", // カード（業者/サービス/問い合わせ等）
      "[class*='grid'] > *", // カテゴリ/サービス/業者グリッドの各アイテム
      "main > section > div", // 見出し付きブロック
    ]
    const candidates: HTMLElement[] = []
    const candSet = new Set<HTMLElement>()
    for (const sel of candidateSelectors) {
      document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
        if (!candSet.has(el)) {
          candSet.add(el)
          candidates.push(el)
        }
      })
    }
    // 入れ子の祖先候補は除外（子=より細かい単位を優先して reveal）
    const reveals: HTMLElement[] = []
    for (const el of candidates) {
      let hasDescendantCandidate = false
      for (const other of candidates) {
        if (other !== el && el.contains(other)) {
          hasDescendantCandidate = true
          break
        }
      }
      if (hasDescendantCandidate) continue
      el.setAttribute("data-reveal", "")
      reveals.push(el)
    }
    // フォールバック: 万一何も拾えなければ section 単位で reveal
    if (reveals.length === 0) {
      document.querySelectorAll<HTMLElement>("main section").forEach((el) => {
        el.setAttribute("data-reveal", "")
        reveals.push(el)
      })
    }

    // stagger: 兄弟内の index に応じて遅延（最大 5 段）
    for (const el of reveals) {
      const parent = el.parentElement
      if (!parent) continue
      const siblings = Array.from(parent.children).filter((c) =>
        (c as HTMLElement).hasAttribute("data-reveal"),
      )
      const idx = siblings.indexOf(el)
      const delay = Math.min(idx, 5) * 80
      el.style.setProperty("--reveal-delay", `${delay}ms`)
    }

    // ========================================================================
    // 2. headline reveal — 各セクションの見出しを独立して reveal
    //    既に reveal 対象になっている祖先があっても、見出しは少し遅らせて
    //    上品に立ち上がらせる（reveal の子要素として二重に動いて見えないよう、
    //    reveal 祖先を持つ見出しには僅かな追従遅延だけを与える）。
    // ========================================================================
    const headlines: HTMLElement[] = []
    document
      .querySelectorAll<HTMLElement>("main h1, main h2, main h3")
      .forEach((el) => {
        if (el.hasAttribute("data-reveal")) return // 既に reveal 単位なら二重付与しない
        el.setAttribute("data-reveal-head", "")
        headlines.push(el)
      })

    // ========================================================================
    // 3. hero ambient — トップ(最初の section)に落ち着いた背景アニメ層を仕込む
    //    markup は変えず、空の装飾レイヤーを1枚だけ prepend（pointer-events:none）。
    //    trust トーン: 淡い光がゆっくり漂う + 全体に微 parallax。誇張なし。
    // ========================================================================
    const hero =
      document.querySelector<HTMLElement>("main > section") ||
      document.querySelector<HTMLElement>("main section")
    let heroAmbient: HTMLElement | null = null
    if (hero && !hero.querySelector(":scope > .premium-hero-ambient")) {
      hero.setAttribute("data-premium-hero", "")
      heroAmbient = document.createElement("div")
      heroAmbient.className = "premium-hero-ambient"
      heroAmbient.setAttribute("aria-hidden", "true")
      // 最背面: リフォーム業種の写真（明るいリビング /hero.jpg）を full-bleed cover で敷き、
      // 継続 Ken Burns（scale 1↔1.08 ~20s alternate, compositor only）でゆっくり動かす。
      // 写真の上に「白〜淡い暖色の半透明グラデ scrim」を重ね、見出し/検索 UI を WCAG AA で
      // 読めるようにする（明るさ・親しみは維持）。markup(page.tsx) は不変、装飾レイヤーのみ注入。
      const heroPhoto = document.createElement("div")
      heroPhoto.className = "premium-hero-photo"
      const heroPhotoImg = document.createElement("img")
      heroPhotoImg.src = "/hero.jpg"
      heroPhotoImg.alt = ""
      heroPhotoImg.setAttribute("aria-hidden", "true")
      heroPhotoImg.decoding = "async"
      heroPhotoImg.loading = "eager"
      heroPhoto.appendChild(heroPhotoImg)
      const heroScrim = document.createElement("div")
      heroScrim.className = "premium-hero-scrim"
      // 内側レイヤーが drift アニメ(keyframes)を担当し、外側は JS が scroll-parallax
      // (transform) を担当する。両者を分離して transform の競合を避ける。
      // 2 層を別 keyframes / 別周期で漂わせることで、どの瞬間も「動いている」
      // 連続モーションを得る（互いに位相が異なるので静止フレームが生まれない）。
      const heroAmbientInner = document.createElement("div")
      heroAmbientInner.className = "premium-hero-ambient__inner"
      const heroAmbientInner2 = document.createElement("div")
      heroAmbientInner2.className =
        "premium-hero-ambient__inner premium-hero-ambient__inner--b"
      // 重ね順（背面→前面）: 写真 → scrim → 暖色グロー2層
      heroAmbient.appendChild(heroPhoto)
      heroAmbient.appendChild(heroScrim)
      heroAmbient.appendChild(heroAmbientInner)
      heroAmbient.appendChild(heroAmbientInner2)
      hero.prepend(heroAmbient)
    }

    // ========================================================================
    // 4. image parallax — 写真(.overflow-hidden 内の <img>)に小振幅の縦 parallax
    //    既存の hover micro-zoom と両立させるため、img をラップする
    //    .overflow-hidden 要素側へ印を付け、CSS で headroom を確保する。
    // ========================================================================
    document
      .querySelectorAll<HTMLElement>(".overflow-hidden")
      .forEach((box) => {
        const img = box.querySelector("img")
        if (!img) return
        if (box.hasAttribute("data-premium-parallax")) return
        box.setAttribute("data-premium-parallax", "img")
      })

    // ========================================================================
    // 5. countup — 数値要素を 0 → 最終値へ。markup は変えず textContent のみ。
    //    対象: 統計タイル(text-2xl/3xl/4xl font-bold) / 評価 / 件数 / 社数。
    //    元テキストの prefix/suffix(¥, %, 件, 社, 万円 等)を保ったまま数字だけ補間。
    // ========================================================================
    type Counter = {
      el: HTMLElement
      prefix: string
      suffix: string
      target: number
      decimals: number
      useComma: boolean
      finalText: string
    }

    const numberRe = /([^\d]*?)([\d,]+(?:\.\d+)?)(.*)$/

    const parseCounter = (el: HTMLElement): Counter | null => {
      const raw = (el.textContent ?? "").trim()
      if (!raw) return null
      const m = raw.match(numberRe)
      if (!m) return null
      const prefix = m[1]
      const numStr = m[2]
      const suffix = m[3]
      const useComma = numStr.includes(",")
      const cleaned = numStr.replace(/,/g, "")
      const target = parseFloat(cleaned)
      if (!isFinite(target)) return null
      // 桁が異常に大きい/小さいテキスト崩れを避ける（複数数値混在は対象外）
      if (/[\d,]+(?:\.\d+)?[^\d]+[\d,]+/.test(raw)) return null
      const decimalPart = cleaned.split(".")[1]
      const decimals = decimalPart ? decimalPart.length : 0
      return { el, prefix, suffix, target, decimals, useComma, finalText: raw }
    }

    const formatNumber = (
      n: number,
      decimals: number,
      useComma: boolean,
    ): string => {
      const fixed = n.toFixed(decimals)
      if (!useComma) return fixed
      return Number(fixed).toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    }

    // countup 候補セレクタ（統計タイルの数値 + 評価/件数の inline 数値）
    const counterSelectors = [
      "[class*='text-2xl'][class*='font-bold']",
      "[class*='text-3xl'][class*='font-bold']",
      "[class*='text-4xl'][class*='font-bold']",
    ]
    const counterEls: HTMLElement[] = []
    const counterSet = new Set<HTMLElement>()
    for (const sel of counterSelectors) {
      document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
        // テキストノードを直接持つ末端のみ（子に別の数値ブロックを含まない）
        if (el.querySelector("[class*='text-2xl'],[class*='text-3xl']")) return
        if (!counterSet.has(el)) {
          counterSet.add(el)
          counterEls.push(el)
        }
      })
    }

    const counters: Counter[] = []
    for (const el of counterEls) {
      const c = parseCounter(el)
      if (c) {
        el.setAttribute("data-countup", "")
        counters.push(c)
      }
    }

    const animateCount = (c: Counter): void => {
      const duration = 1400
      const start = performance.now()
      const tick = (now: number): void => {
        const p = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
        const val = formatNumber(c.target * eased, c.decimals, c.useComma)
        c.el.textContent = `${c.prefix}${val}${c.suffix}`
        if (p < 1) requestAnimationFrame(tick)
        else c.el.textContent = c.finalText
      }
      // 0 から開始（最初のフレームのちらつきを抑える）
      c.el.textContent = `${c.prefix}${formatNumber(0, c.decimals, c.useComma)}${c.suffix}`
      requestAnimationFrame(tick)
    }

    // ========================================================================
    // reduced-motion: 即最終状態にして終了
    // ========================================================================
    if (reduced) {
      for (const el of reveals) el.classList.add("is-revealed")
      for (const el of headlines) el.classList.add("is-revealed")
      for (const c of counters) c.el.textContent = c.finalText
      return () => {
        if (nav) window.removeEventListener("scroll", onNavScroll)
      }
    }

    // ========================================================================
    // rAF ループ: reveal / headline / countup の inView 判定 + parallax
    // ========================================================================
    const parallax = Array.from(
      document.querySelectorAll<HTMLElement>("[data-premium-parallax]"),
    )

    const counted = new WeakSet<HTMLElement>()

    const inView = (el: HTMLElement): boolean => {
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      return r.top < vh * 0.92 && r.bottom > 0
    }

    let heroScroll = 0

    const update = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight

      for (const el of reveals) {
        if (!el.classList.contains("is-revealed") && inView(el)) {
          el.classList.add("is-revealed")
        }
      }
      for (const el of headlines) {
        if (!el.classList.contains("is-revealed") && inView(el)) {
          el.classList.add("is-revealed")
        }
      }
      for (const c of counters) {
        if (!counted.has(c.el) && inView(c.el)) {
          counted.add(c.el)
          animateCount(c)
        }
      }

      for (const el of parallax) {
        const kind = el.getAttribute("data-premium-parallax")
        const r = el.getBoundingClientRect()
        if (r.bottom < -100 || r.top > vh + 100) continue
        const progress = (r.top + r.height / 2 - vh / 2) / vh // ≈ -1..1
        if (kind === "img") {
          // 写真: 内側の <img> を小振幅(±10px)で動かす（headroom は CSS 確保）。
          // transform を直接書くと hover の scale を上書きしてしまうため、
          // CSS 変数 --px-y を渡し、合成は CSS 側に委ねる（hover scale と両立）。
          const offset = Math.max(-10, Math.min(10, -progress * 12))
          el.style.setProperty("--px-y", `${offset.toFixed(1)}px`)
        } else {
          const offset = Math.max(-36, Math.min(36, -progress * 42))
          el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`
        }
      }

      // hero ambient: ゆるやかな下方向 parallax（落ち着いた漂い、compositor only）
      if (heroAmbient && hero) {
        const r = hero.getBoundingClientRect()
        if (r.bottom > 0 && r.top < vh) {
          heroScroll = -r.top
          const y = Math.max(0, Math.min(80, heroScroll * 0.18))
          heroAmbient.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`
        }
      }
    }

    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    window.addEventListener("load", update)
    const t = window.setTimeout(update, 400)

    return () => {
      if (nav) window.removeEventListener("scroll", onNavScroll)
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
      window.removeEventListener("load", update)
      window.clearTimeout(t)
    }
  }, [])

  return null
}
