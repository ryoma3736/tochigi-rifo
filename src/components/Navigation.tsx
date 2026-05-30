'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Instagram, Home, BarChart3, Settings, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface NavigationProps {
  className?: string
}

const navigationItems = [
  {
    name: 'ホーム',
    href: '/',
    icon: Home,
    description: 'トップページ'
  },
  {
    name: 'Instagram統合',
    href: '/instagram-integration',
    icon: Instagram,
    description: 'Instagramビジネス連携'
  },
  {
    name: '分析',
    href: '/analytics',
    icon: BarChart3,
    description: 'データ分析'
  },
  {
    name: '設定',
    href: '/settings',
    icon: Settings,
    description: 'システム設定'
  }
]

export default function Navigation({ className }: NavigationProps) {
  const pathname = usePathname()
  const [cartCount, setCartCount] = useState(0)

  // Update cart count from localStorage or state management
  useEffect(() => {
    const updateCartCount = () => {
      // This is a simple implementation - in a real app you'd use proper state management
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartCount(cart.length)
    }

    updateCartCount()
    window.addEventListener('storage', updateCartCount)
    
    return () => window.removeEventListener('storage', updateCartCount)
  }, [])

  return (
    <nav className={cn("bg-white border-b sticky top-0 z-50", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                栃木リフォームポータル
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-6 lg:space-x-8">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center whitespace-nowrap px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200",
                      isActive
                        ? "border-pink-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="relative">
              <div className="flex items-center space-x-4">
                <Link
                  href="/cart"
                  className="relative inline-flex items-center p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500 rounded-full"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <span className="hidden lg:inline text-sm text-gray-500 whitespace-nowrap">
                  栃木県のリフォーム業者ポータル
                </span>
              </div>
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500"
            >
              <span className="sr-only">メニューを開く</span>
              {/* Mobile menu button */}
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200",
                  isActive
                    ? "bg-pink-50 border-pink-500 text-pink-700 border-l-4"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}