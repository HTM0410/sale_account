'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'Có lỗi cấu hình server. Vui lòng liên hệ quản trị viên.'
      case 'AccessDenied':
        return 'Truy cập bị từ chối. Bạn không có quyền truy cập.'
      case 'Verification':
        return 'Token xác thực không hợp lệ hoặc đã hết hạn.'
      case 'OAuthSignin':
        return 'Có lỗi khi đăng nhập với Google. Vui lòng thử lại sau.'
      case 'OAuthCallback':
        return 'Có lỗi trong quá trình xử lý callback OAuth.'
      case 'OAuthCreateAccount':
        return 'Không thể tạo tài khoản OAuth. Email có thể đã được sự dụng.'
      case 'EmailCreateAccount':
        return 'Không thể tạo tài khoản với email này.'
      case 'Callback':
        return 'Có lỗi trong quá trình callback xác thực.'
      case 'OAuthAccountNotLinked':
        return 'Email này đã được liên kết với phương thức đăng nhập khác.'
      case 'EmailSignin':
        return 'Không thể gửi email xác thực.'
      case 'CredentialsSignin':
        return 'Email hoặc mật khẩu không đúng.'
      case 'SessionRequired':
        return 'Bạn cần đăng nhập để truy cập trang này.'
      default:
        return 'Có lỗi không xác định xảy ra trong quá trình đăng nhập.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Lỗi đăng nhập
          </h2>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">
              {getErrorMessage(error)}
            </p>
            {error && (
              <p className="text-xs text-red-500 mt-2">
                Mã lỗi: {error}
              </p>
            )}
          </div>
          <div className="mt-6 space-y-3">
            <Link
              href="/signin"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Thử đăng nhập lại
            </Link>
            <Link
              href="/register"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Tạo tài khoản mới
            </Link>
            <Link
              href="/"
              className="w-full flex justify-center py-2 px-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}