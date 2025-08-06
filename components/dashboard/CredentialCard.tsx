'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Order, OrderItem, Product, ProductPackage, AccountDelivery } from '@prisma/client'

type OrderWithRelations = Order & {
  items: (OrderItem & {
    product: Product
    productPackage: ProductPackage | null
  })[]
  accountDelivery: AccountDelivery | null
}

interface CredentialCardProps {
  order: OrderWithRelations
}

export default function CredentialCard({ order }: CredentialCardProps) {
  const [showCredentials, setShowCredentials] = useState<{ [key: string]: boolean }>({})
  const [copiedItems, setCopiedItems] = useState<{ [key: string]: boolean }>({})

  const formatDuration = (duration?: number) => {
    if (!duration) return ''
    if (duration === 1) return '1 tháng'
    return `${duration} tháng`
  }

  const toggleCredentials = (itemId: string) => {
    setShowCredentials(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const copyToClipboard = async (text: string, itemId: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItems(prev => ({
        ...prev,
        [`${itemId}-${type}`]: true
      }))
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedItems(prev => ({
          ...prev,
          [`${itemId}-${type}`]: false
        }))
      }, 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  // Mock credentials data - in real app, this would come from accountDelivery
  const getMockCredentials = (product: Product, quantity: number) => {
    const credentials = []
    for (let i = 0; i < quantity; i++) {
      credentials.push({
        username: `${product.name.toLowerCase().replace(/\s+/g, '')}_user${i + 1}`,
        password: `Pass${Math.random().toString(36).substring(2, 10)}`,
        additionalInfo: product.category === 'Streaming' 
          ? 'Profile 1 - Full HD quality available' 
          : 'Premium features unlocked'
      })
    }
    return credentials
  }

  if (!order.accountDelivery) {
    return null
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Đơn hàng #{order.id.slice(-8).toUpperCase()}
            </h3>
            <p className="text-sm text-gray-600">
              Giao ngày: {new Date(order.accountDelivery.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Đã giao
            </span>
          </div>
        </div>

        {order.accountDelivery.deliveryNotes && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Ghi chú:</strong> {order.accountDelivery.deliveryNotes}
            </p>
          </div>
        )}
      </div>

      {/* Account Items */}
      <div className="space-y-4">
        {order.items.map((item) => {
          const credentials = getMockCredentials(item.product, item.quantity)
          
          return (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              {/* Product Header */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-md overflow-hidden">
                  {item.product.imageUrl ? (
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
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
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                  <div className="flex items-center space-x-2 mt-1 text-sm text-gray-600">
                    <span>Số lượng: {item.quantity}</span>
                    {item.productPackage && (
                      <>
                        <span>•</span>
                        <span className="text-blue-600">
                          {formatDuration(item.productPackage.duration)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => toggleCredentials(item.id)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  {showCredentials[item.id] ? (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 01.52-2.507m5.497 5.979l-.003-.004m-.015-.016a7 7 0 01.015.016l.003.004zM8.5 12.5l3-3 3 3" />
                      </svg>
                      Ẩn
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Xem
                    </>
                  )}
                </button>
              </div>

              {/* Credentials */}
              {showCredentials[item.id] && (
                <div className="space-y-4">
                  {credentials.map((cred, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900">
                          Tài khoản {index + 1}
                        </h5>
                        <span className="text-xs text-gray-500">
                          Nhận ngày {new Date(order.accountDelivery!.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Username */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Tên đăng nhập
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={cred.username}
                              readOnly
                              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white font-mono"
                            />
                            <button
                              onClick={() => copyToClipboard(cred.username, item.id, `username-${index}`)}
                              className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-500 bg-white hover:bg-gray-50 hover:text-gray-700 transition-colors"
                            >
                              {copiedItems[`${item.id}-username-${index}`] ? (
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Password */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Mật khẩu
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={cred.password}
                              readOnly
                              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white font-mono"
                            />
                            <button
                              onClick={() => copyToClipboard(cred.password, item.id, `password-${index}`)}
                              className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-500 bg-white hover:bg-gray-50 hover:text-gray-700 transition-colors"
                            >
                              {copiedItems[`${item.id}-password-${index}`] ? (
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      {cred.additionalInfo && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <p className="text-sm text-blue-800">
                            <strong>Lưu ý:</strong> {cred.additionalInfo}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Usage Instructions */}
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">Hướng dẫn sử dụng:</p>
                        <ul className="mt-1 list-disc list-inside space-y-1">
                          <li>Đăng nhập vào trang web chính thức của dịch vụ</li>
                          <li>Sử dụng thông tin tài khoản đã cung cấp ở trên</li>
                          <li>Thay đổi mật khẩu sau lần đăng nhập đầu tiên để bảo mật</li>
                          <li>Không chia sẻ thông tin tài khoản với người khác</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}