import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import CheckoutClient from '@/components/CheckoutClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Thanh toán - Premium Account Marketplace',
  description: 'Hoàn tất đơn hàng và thanh toán an toàn',
}

export default async function CheckoutPage() {
  // Check authentication - redirect if not logged in
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/signin?callbackUrl=/checkout')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
            <p className="mt-2 text-gray-600">
              Hoàn tất thông tin để hoàn thành đơn hàng của bạn
            </p>
          </div>

          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/cart" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6.5M13 13l1.5 6.5M9 19.5h.01M15 19.5h.01" />
                  </svg>
                  Giỏ hàng
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-blue-600 md:ml-2">Thanh toán</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Main Checkout Content */}
          <CheckoutClient user={session.user} />
        </div>
      </div>
    </div>
  )
}