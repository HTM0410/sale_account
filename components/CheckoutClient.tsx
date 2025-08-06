'use client'

import { useState, useEffect } from 'react'
import { useCartStore } from '@/lib/stores/cartStore'
import { useRouter } from 'next/navigation'
import { User } from 'next-auth'
import OrderSummary from './OrderSummary'
import CustomerInfoForm from './CustomerInfoForm'
import PaymentSection from './PaymentSection'

interface CheckoutClientProps {
  user: User
}

export interface CustomerInfo {
  email: string
  firstName: string
  lastName: string
  phone: string
  address: string
  city: string
  country: string
}

export default function CheckoutClient({ user }: CheckoutClientProps) {
  const { items, totalPrice, clearCart } = useCartStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<'info' | 'payment' | 'processing'>('info')
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    email: user.email || '',
    firstName: user.name?.split(' ')[0] || '',
    lastName: user.name?.split(' ').slice(1).join(' ') || '',
    phone: '',
    address: '',
    city: '',
    country: 'Vietnam'
  })

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items, router])

  const handleCustomerInfoSubmit = (info: CustomerInfo) => {
    setCustomerInfo(info)
    setCurrentStep('payment')
  }

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setIsLoading(true)
    try {
      // Create order in database
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          customerInfo,
          items,
          total: totalPrice(),
        }),
      })

      if (response.ok) {
        const order = await response.json()
        clearCart()
        router.push(`/checkout/success?order_id=${order.id}`)
      } else {
        throw new Error('Failed to create order')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      router.push('/checkout/error')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    router.push('/checkout/error')
  }

  const handleBackToInfo = () => {
    setCurrentStep('info')
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Giỏ hàng trống
        </h2>
        <p className="text-gray-600 mb-6">
          Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán
        </p>
        <a
          href="/products"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Tiếp tục mua sắm
        </a>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Forms */}
      <div className="space-y-8">
        {/* Progress Steps */}
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${
            currentStep === 'info' ? 'text-blue-600' : 'text-green-600'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === 'info' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
            }`}>
              {currentStep === 'info' ? '1' : '✓'}
            </div>
            <span className="font-medium">Thông tin</span>
          </div>
          <div className="flex-1 h-px bg-gray-200"></div>
          <div className={`flex items-center space-x-2 ${
            currentStep === 'payment' ? 'text-blue-600' : 
            currentStep === 'processing' ? 'text-green-600' : 'text-gray-400'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === 'payment' ? 'bg-blue-600 text-white' : 
              currentStep === 'processing' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {currentStep === 'processing' ? '✓' : '2'}
            </div>
            <span className="font-medium">Thanh toán</span>
          </div>
        </div>

        {/* Customer Information Form */}
        {currentStep === 'info' && (
          <CustomerInfoForm
            initialData={customerInfo}
            onSubmit={handleCustomerInfoSubmit}
            isLoading={isLoading}
          />
        )}

        {/* Payment Section */}
        {currentStep === 'payment' && (
          <PaymentSection
            customerInfo={customerInfo}
            total={totalPrice()}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onBackToInfo={handleBackToInfo}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Right Column - Order Summary */}
      <div className="lg:sticky lg:top-4 lg:h-fit">
        <OrderSummary items={items} />
      </div>
    </div>
  )
}