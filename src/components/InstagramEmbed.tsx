"use client"
import { useEffect, useRef, useState } from "react"

type Props = {
  handle: string
  postUrl?: string
  className?: string
}

export default function InstagramEmbed({ handle, postUrl, className }: Props) {
  const [error, setError] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!postUrl) return
    const script = document.createElement("script")
    script.src = "https://www.instagram.com/embed.js"
    script.async = true
    script.onload = () => {
      try {
        const ig = (window as unknown as { instgrm?: { Embeds?: { process: () => void } } }).instgrm
        if (ig?.Embeds) ig.Embeds.process()
      } catch {
        setError("読み込みに失敗しました")
      }
    }
    script.onerror = () => setError("読み込みに失敗しました")
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [postUrl])

  if (!postUrl) {
    return (
      <div className={className}>
        <p className="text-sm text-gray-600">投稿URL未設定。プロフィールをご覧ください。</p>
        <a className="text-blue-600 underline" href={`https://www.instagram.com/${handle}/`} target="_blank">@{handle}</a>
      </div>
    )
  }

  return (
    <div className={className} ref={ref}>
      {error ? (
        <div>
          <p className="text-sm text-gray-600">{error}</p>
          <a className="text-blue-600 underline" href={`https://www.instagram.com/${handle}/`} target="_blank">@{handle}</a>
        </div>
      ) : (
        <blockquote className="instagram-media" data-instgrm-permalink={postUrl} data-instgrm-version="14"></blockquote>
      )}
    </div>
  )
}