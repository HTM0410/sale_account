'use client'

import { useState } from 'react'
import { ProductPackage } from '@prisma/client'

interface ProductPackageListProps {
  packages: ProductPackage[]
  onPackageSelect?: (packageData: ProductPackage) => void
}

export default function ProductPackageList({ packages, onPackageSelect }: ProductPackageListProps) {
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    packages.length > 0 ? packages[0].id : null
  )

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
  }

  const formatDuration = (duration: number) => {
    if (duration === 1) return '1 tháng'
    return `${duration} tháng`
  }

  const calculateSavings = (pkg: ProductPackage) => {
    // Tính tiết kiệm so với giá 1 tháng
    const monthlyPackage = packages.find(p => p.duration === 1)
    if (!monthlyPackage || pkg.duration === 1) return null
    
    const expectedPrice = monthlyPackage.price * pkg.duration
    const actualPrice = pkg.price
    const savings = ((expectedPrice - actualPrice) / expectedPrice * 100).toFixed(0)
    
    return savings !== '0' ? `${savings}%` : null
  }

  const handlePackageSelect = (pkg: ProductPackage) => {
    setSelectedPackageId(pkg.id)
    if (onPackageSelect) {
      onPackageSelect(pkg)
    }
  }

  const getBadgeColor = (duration: number) => {
    switch (duration) {
      case 1:
        return 'bg-blue-100 text-blue-800'
      case 3:
        return 'bg-green-100 text-green-800'
      case 6:
        return 'bg-purple-100 text-purple-800'
      case 12:
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPopularBadge = (duration: number) => {
    // Gói 3 tháng thường được chọn nhiều nhất
    return duration === 3
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <p className="font-medium">Chưa có gói sản phẩm</p>
        <p className="text-sm">Các gói sẽ được cập nhật sớm</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Chọn gói sử dụng</h3>
        <span className="text-sm text-gray-500">{packages.length} gói khả dụng</span>
      </div>

      <div className="grid gap-3">
        {packages
          .sort((a, b) => a.duration - b.duration) // Sort by duration ascending
          .map((pkg) => {
            const isSelected = selectedPackageId === pkg.id
            const savings = calculateSavings(pkg)
            const isPopular = getPopularBadge(pkg.duration)

            return (
              <div
                key={pkg.id}
                className={`
                  relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }
                `}
                onClick={() => handlePackageSelect(pkg)}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div className="absolute -top-2 left-4">
                    <span className="bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Phổ biến
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Radio button */}
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${isSelected ? 'border-blue-500' : 'border-gray-300'}
                    `}>
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      )}
                    </div>

                    {/* Package info */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(pkg.duration)}`}>
                          {formatDuration(pkg.duration)}
                        </span>
                        {savings && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Tiết kiệm {savings}
                          </span>
                        )}
                      </div>
                      
                      {pkg.description && (
                        <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">
                      {formatPrice(pkg.price)}
                    </div>
                    {pkg.duration > 1 && (
                      <div className="text-sm text-gray-500">
                        ~{formatPrice(Math.floor(pkg.price / pkg.duration))}/tháng
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
      </div>

      {/* Selected package summary */}
      {selectedPackageId && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Gói đã chọn:</span>
            <div className="text-right">
              {(() => {
                const selectedPkg = packages.find(p => p.id === selectedPackageId)
                if (!selectedPkg) return null
                
                return (
                  <div>
                    <div className="font-bold text-gray-900">
                      {formatDuration(selectedPkg.duration)} - {formatPrice(selectedPkg.price)}
                    </div>
                    {selectedPkg.description && (
                      <div className="text-xs text-gray-500">{selectedPkg.description}</div>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}