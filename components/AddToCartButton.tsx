'use client'

import { useState } from 'react'
import { ProductPackage } from '@prisma/client'
import { useCartStore, createCartItem } from '@/lib/stores/cartStore'
import { trackAddToCart, createItemData } from '@/lib/analytics'

interface AddToCartButtonProps {
  productId: string
  productName: string
  productPrice: number
  productImageUrl: string
  available: boolean
  stock: number
  selectedPackage?: ProductPackage | null
}

export default function AddToCartButton({ 
  productId, 
  productName, 
  productPrice, 
  productImageUrl, 
  available, 
  stock, 
  selectedPackage 
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const { addItem, getItemCount } = useCartStore()
  
  // Get current cart count for this item
  const currentCount = getItemCount(productId, selectedPackage?.id || null)

  const handleAddToCart = () => {
    if (!available) return

    setIsLoading(true)
    try {
      // Create cart item from product data
      const cartItem = createCartItem(
        {
          id: productId,
          name: productName,
          price: productPrice,
          imageUrl: productImageUrl,
        },
        quantity,
        selectedPackage
      )

      // Add to cart store
      addItem(cartItem)

      // Track analytics event
      const itemData = createItemData(
        { id: productId, name: productName, category: 'premium_account', price: productPrice },
        quantity,
        selectedPackage
      )
      trackAddToCart('VND', (selectedPackage?.price || productPrice) * quantity, [itemData])

      setIsAdded(true)
      setTimeout(() => setIsAdded(false), 2000) // Reset after 2 seconds
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const incrementQuantity = () => {
    if (quantity < stock) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  if (!available) {
    return (
      <button
        disabled
        className="w-full bg-gray-300 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-gray-500 cursor-not-allowed"
      >
        Hết hàng
      </button>
    )
  }

  return (
    <div className="space-y-4">
      {/* Package info */}
      {selectedPackage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-blue-900">
                {selectedPackage.description}
              </h4>
              <p className="text-sm text-blue-700">
                {selectedPackage.duration} tháng • {selectedPackage.price.toLocaleString('vi-VN')}đ
              </p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-blue-900">
                {selectedPackage.price.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quantity selector */}
      <div className="flex items-center space-x-4">
        <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
          Số lượng:
        </label>
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            type="button"
            onClick={decrementQuantity}
            disabled={quantity <= 1}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="px-4 py-2 text-gray-900 font-medium min-w-[3rem] text-center">
            {quantity}
          </span>
          <button
            type="button"
            onClick={incrementQuantity}
            disabled={quantity >= stock}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
        <span className="text-sm text-gray-500">
          (Tối đa {stock}{currentCount > 0 && `, trong giỏ: ${currentCount}`})
        </span>
      </div>

      {/* Add to cart button */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isLoading || !available}
        className={`w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white transition-colors ${
          isAdded
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-blue-600 hover:bg-blue-700'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Đang thêm...
          </>
        ) : isAdded ? (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Đã thêm vào giỏ!
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6.5M13 13l1.5 6.5M9 19.5h.01M15 19.5h.01" />
            </svg>
            Thêm vào giỏ hàng
          </>
        )}
      </button>

      {/* Additional info */}
      <div className="flex items-center text-sm text-gray-500">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Giao hàng tự động trong vòng 5 phút
      </div>
    </div>
  )
}