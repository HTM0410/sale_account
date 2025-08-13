'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Product } from '@prisma/client'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsLoading(true)
    try {
      // TODO: Implement add to cart functionality
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      console.log('Added to cart:', product.id)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN')
  }

  // Hàm helper để lấy tên sản phẩm sạch (loại bỏ thông tin tháng)
  const getCleanProductName = (name: string): string => {
    // Loại bỏ các pattern như "2 tháng", "Premium 3 tháng", "6 tháng", etc.
    return name
      .replace(/\s*\d+\s*tháng/gi, '')
      .replace(/Premium\s*\d+\s*tháng/gi, 'Premium')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const getStockStatus = () => {
    if (product.stock === 0) return { text: 'Hết hàng', color: 'text-red-600 bg-red-50' }
    if (product.stock <= 5) return { text: `Còn ${product.stock}`, color: 'text-orange-600 bg-orange-50' }
    return { text: 'Còn hàng', color: 'text-green-600 bg-green-50' }
  }

  const stockStatus = getStockStatus()

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1">
        {/* Product Image */}
        <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-48 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-16 h-16 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-semibold text-lg">{getCleanProductName(product.name)}</span>
              </div>
            </div>
          )}
          
          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 text-gray-800">
              {product.category}
            </span>
          </div>

          {/* Stock status */}
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
              {stockStatus.text}
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {getCleanProductName(product.name)}
          </h3>
          
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>

          {/* Price */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">Từ</span>
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(product.price)}đ
              </span>
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isLoading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6.5M13 13l1.5 6.5M9 19.5h.01M15 19.5h.01" />
                </svg>
              )}
              {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}