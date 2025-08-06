'use client'

import { useSession, signOut } from 'next-auth/react'
import { useCartStore } from '@/lib/stores/cartStore'
import Link from 'next/link'

export default function Header() {
  const { data: session, status } = useSession()
  const { totalItems } = useCartStore()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Premium Account Marketplace
            </Link>
          </div>
          
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link 
                href="/" 
                className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Trang chủ
              </Link>
              <Link 
                href="/products" 
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sản phẩm
              </Link>
              
              {/* Cart Icon */}
              <Link 
                href="/cart"
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium relative"
              >
                <div className="flex items-center space-x-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6.5M13 13l1.5 6.5M9 19.5h.01M15 19.5h.01" />
                  </svg>
                  <span className="hidden sm:inline">Giỏ hàng</span>
                  {totalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {totalItems() > 99 ? '99+' : totalItems()}
                    </span>
                  )}
                </div>
              </Link>
              
              {status === 'loading' ? (
                <div className="px-3 py-2">
                  <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
                </div>
              ) : session ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    Xin chào, {session.user.name || session.user.email}
                  </span>
                  {session.user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="text-purple-600 hover:text-purple-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Quản trị
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    className="text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Tài khoản
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/signin"
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}