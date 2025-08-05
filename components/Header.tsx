'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Header() {
  const { data: session, status } = useSession()

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