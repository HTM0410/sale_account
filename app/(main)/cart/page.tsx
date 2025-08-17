'use client'

import { useCartStore } from '@/lib/stores/cartStore'
import Link from 'next/link'
import CartItem from '@/components/CartItem'

export const dynamic = 'force-dynamic'

export default function CartPage() {
  const { items, totalItems, totalPrice, clearCart } = useCartStore()

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN')
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng</h1>
            <span className="text-gray-500">({totalItems()} sản phẩm)</span>
          </div>

          {/* Empty State */}
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6.5M13 13l1.5 6.5M9 19.5h.01M15 19.5h.01" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-500 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng</h1>
          <span className="text-gray-500">({totalItems()} sản phẩm)</span>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Sản phẩm trong giỏ</h2>
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-500 focus:outline-none focus:underline"
                  >
                    Xóa tất cả
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Link
                href="/products"
                className="inline-flex items-center text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-4">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({totalItems()} sản phẩm)</span>
                    <span className="font-medium">{formatPrice(totalPrice())}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="font-medium text-green-600">Miễn phí</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-medium text-gray-900">Tổng cộng</span>
                      <span className="text-xl font-bold text-gray-900">{formatPrice(totalPrice())}đ</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-blue-600 border border-transparent rounded-md py-3 px-4 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors inline-flex items-center justify-center"
                >
                  Tiến hành thanh toán
                </Link>

                <div className="mt-4 text-center text-xs text-gray-500">
                  <p>Giao hàng tự động trong vòng 5 phút</p>
                  <p>Bảo mật thanh toán 100%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}