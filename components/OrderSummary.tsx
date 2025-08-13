'use client'

import { CartItem } from '@/lib/stores/cartStore'
import Image from 'next/image'
import Link from 'next/link'

interface OrderSummaryProps {
  items: CartItem[]
}

export default function OrderSummary({ items }: OrderSummaryProps) {
  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN')
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return ''
    if (duration === 1) return '1 tháng'
    return `${duration} tháng`
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Đơn hàng của bạn ({totalItems} sản phẩm)
      </h2>

      {/* Order Items */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            {/* Product Image */}
            <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-md overflow-hidden">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                {item.name}
              </h3>
              
              {/* Package Info */}
              {item.packageInfo && (
                <div className="mt-1 flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {formatDuration(item.packageInfo.duration)}
                  </span>
                  {item.description && (
                    <span className="text-xs text-gray-500 truncate">
                      {item.description}
                    </span>
                  )}
                </div>
              )}

              {/* Quantity and Price */}
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Số lượng: {item.quantity}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {formatPrice(item.price * item.quantity)}đ
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Totals */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal ({totalItems} sản phẩm)</span>
          <span className="font-medium text-gray-900">{formatPrice(subtotal)}đ</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Phí xử lý</span>
          <span className="font-medium text-green-600">Miễn phí</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Giao hàng</span>
          <span className="font-medium text-green-600">Tự động (5 phút)</span>
        </div>
        
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between">
            <span className="text-base font-semibold text-gray-900">Tổng cộng</span>
            <span className="text-xl font-bold text-gray-900">{formatPrice(subtotal)}đ</span>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 p-3 bg-green-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div className="text-sm text-green-800">
            <p className="font-medium">Thanh toán bảo mật 100%</p>
            <p className="text-green-700">
              Thông tin thanh toán được mã hóa bởi Stripe
            </p>
          </div>
        </div>
      </div>

      {/* Edit Cart Link */}
      <div className="mt-4 text-center">
        <Link
          href="/cart"
          className="text-sm text-blue-600 hover:text-blue-500 font-medium"
        >
          Chỉnh sửa giỏ hàng
        </Link>
      </div>
    </div>
  )
}