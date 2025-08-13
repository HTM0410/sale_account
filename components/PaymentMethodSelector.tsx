'use client'

import { useState } from 'react'
import Image from 'next/image'

export type PaymentMethod = 'stripe' | 'vnpay' | 'momo'

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod
  onMethodChange: (method: PaymentMethod) => void
  disabled?: boolean
}

export default function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  disabled = false
}: PaymentMethodSelectorProps) {
  const paymentMethods = [
    {
      id: 'stripe' as PaymentMethod,
      name: 'Thẻ tín dụng/ghi nợ',
      description: 'Visa, Mastercard, American Express',
      icon: (
        <div className="flex space-x-1">
          <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
            VISA
          </div>
          <div className="w-8 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">
            MC
          </div>
        </div>
      ),
      available: true
    },
    {
      id: 'vnpay' as PaymentMethod,
      name: 'VNPay',
      description: 'Thanh toán qua VNPay - Hỗ trợ tất cả ngân hàng Việt Nam',
      icon: (
        <div className="w-12 h-8 bg-blue-700 rounded text-white text-xs flex items-center justify-center font-bold">
          VNPay
        </div>
      ),
      available: true
    },
    {
      id: 'momo' as PaymentMethod,
      name: 'Ví MoMo',
      description: 'Thanh toán nhanh chóng với ví điện tử MoMo',
      icon: (
        <div className="w-12 h-8 bg-pink-600 rounded text-white text-xs flex items-center justify-center font-bold">
          MoMo
        </div>
      ),
      available: true
    }
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Chọn phương thức thanh toán</h3>
      
      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
              selectedMethod === method.id
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                : 'border-gray-300 hover:border-gray-400'
            } ${
              disabled || !method.available
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
            onClick={() => {
              if (!disabled && method.available) {
                onMethodChange(method.id)
              }
            }}
          >
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="radio"
                  name="payment-method"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={() => {
                    if (!disabled && method.available) {
                      onMethodChange(method.id)
                    }
                  }}
                  disabled={disabled || !method.available}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
              </div>
              
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {method.icon}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900 cursor-pointer">
                        {method.name}
                      </label>
                      <p className="text-sm text-gray-500">
                        {method.description}
                      </p>
                    </div>
                  </div>
                  
                  {!method.available && (
                    <span className="text-xs text-red-500 font-medium">
                      Không khả dụng
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {selectedMethod === method.id && (
              <div className="absolute top-2 right-2">
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Payment method specific information */}
      {selectedMethod === 'stripe' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                Thanh toán an toàn với mã hóa SSL. Hỗ trợ thẻ Visa, Mastercard, American Express.
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedMethod === 'vnpay' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                Thanh toán qua VNPay - Hỗ trợ tất cả ngân hàng trong nước. An toàn và nhanh chóng.
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedMethod === 'momo' && (
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-pink-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-pink-800">
                Thanh toán nhanh chóng với ví điện tử MoMo. Quét mã QR hoặc đăng nhập ứng dụng.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
