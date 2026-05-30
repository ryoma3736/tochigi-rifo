"use client"
import { useEffect, useRef, useState } from "react"

type Props = {
  handle: string
  postUrl?: string
  className?: string
}

let scriptLoaded = false
let scriptLoading = false
const pendingEmbeds: Array<() => void> = []

function loadScript() {
  if (scriptLoaded) return Promise.resolve()
  if (scriptLoading) return new Promise<void>(resolve => pendingEmbeds.push(resolve))
  
  scriptLoading = true
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script")
    script.src = "https://www.instagram.com/embed.js"
    script.async = true
    script.onload = () => {
      scriptLoaded = true
      scriptLoading = false
      resolve()
      pendingEmbeds.forEach(cb => cb())
      pendingEmbeds.length = 0
    }
    script.onerror = () => {
      scriptLoading = false
      reject(new Error("Instagram embed script failed to load"))
      pendingEmbeds.forEach(cb => cb())
      pendingEmbeds.length = 0
    }
    document.body.appendChild(script)
  })
}

export default function InstagramEmbed({ handle, postUrl, className }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const embedProcessed = useRef(false)

  useEffect(() => {
    if (!postUrl || !ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !embedProcessed.current) {
          setIsVisible(true)
          embedProcessed.current = true
          
          loadScript()
            .then(() => {
              const ig = (window as unknown as { instgrm?: { Embeds?: { process: () => void } } }).instgrm
              if (ig?.Embeds) {
                ig.Embeds.process()
              }
            })
            .catch(() => {
              setError("読み込みに失敗しました")
            })
          
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    )

    observer.observe(ref.current)
    
    return () => {
      observer.disconnect()
    }
  }, [postUrl])

  if (!postUrl) {
    return (
      <div className={className}>
        <p className="text-sm text-gray-600">投稿URL未設定。プロフィールをご覧ください。</p>
        <a className="text-blue-600 underline" href={`https://www.instagram.com/${handle}/`} target="_blank" rel="noopener noreferrer">@{handle}</a>
      </div>
    )
  }

  return (
    <div className={className} ref={ref}>
      {error ? (
        <div>
          <p className="text-sm text-gray-600">{error}</p>
          <a className="text-blue-600 underline" href={`https://www.instagram.com/${handle}/`} target="_blank" rel="noopener noreferrer">@{handle}</a>
        </div>
      ) : (
        <>
          {isVisible && (
            <blockquote 
              className="instagram-media" 
              data-instgrm-permalink={postUrl} 
              data-instgrm-version="14"
              data-instgrm-cookie="true"
            />
          )}
          {!isVisible && (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-gray-400 text-sm">Instagram 投稿を読み込み中...</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}