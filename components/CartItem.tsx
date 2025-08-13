'use client'

import { useState } from 'react'
import { useCartStore, CartItem as CartItemType } from '@/lib/stores/cartStore'
import Image from 'next/image'
import Link from 'next/link'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore()
  const [isUpdating, setIsUpdating] = useState(false)

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN')
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return ''
    if (duration === 1) return '1 tháng'
    return `${duration} tháng`
  }

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return
    
    setIsUpdating(true)
    try {
      updateQuantity(item.id, newQuantity)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = () => {
    removeItem(item.id)
  }

  const incrementQuantity = () => {
    handleQuantityChange(item.quantity + 1)
  }

  const decrementQuantity = () => {
    if (item.quantity > 1) {
      handleQuantityChange(item.quantity - 1)
    }
  }

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-4">
        {/* Product Image */}
        <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-base font-medium text-gray-900 line-clamp-2">
                <Link 
                  href={`/products/${item.productId}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {item.name}
                </Link>
              </h3>
              
              {/* Package Info */}
              {item.packageInfo && (
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {formatDuration(item.packageInfo.duration)}
                  </span>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                </div>
              )}

              {/* Price per item */}
              <div className="mt-2">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(item.price)}đ
                </span>
                {item.packageInfo && item.packageInfo.duration > 1 && (
                  <span className="text-sm text-gray-500 ml-2">
                    (~{formatPrice(Math.round(item.price / item.packageInfo.duration))}đ/tháng)
                  </span>
                )}
              </div>
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemove}
              className="ml-4 text-gray-400 hover:text-red-500 transition-colors p-1"
              title="Xóa khỏi giỏ hàng"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Quantity Controls and Total */}
          <div className="mt-4 flex items-center justify-between">
            {/* Quantity Controls */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Số lượng:</span>
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  type="button"
                  onClick={decrementQuantity}
                  disabled={item.quantity <= 1 || isUpdating}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="px-4 py-2 text-gray-900 font-medium min-w-[3rem] text-center">
                  {isUpdating ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
                  ) : (
                    item.quantity
                  )}
                </span>
                <button
                  type="button"
                  onClick={incrementQuantity}
                  disabled={isUpdating}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Item Total */}
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {formatPrice(item.price * item.quantity)}đ
              </div>
              {item.quantity > 1 && (
                <div className="text-xs text-gray-500">
                  {formatPrice(item.price)}đ × {item.quantity}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}