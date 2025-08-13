'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import PaymentForm from './PaymentForm'
import PaymentMethodSelector, { PaymentMethod } from './PaymentMethodSelector'
import { redirectToVnpay } from '@/lib/payment/vnpayClient'
import { CustomerInfo } from './CheckoutClient'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentSectionProps {
  customerInfo: CustomerInfo
  total: number
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
  onBackToInfo: () => void
  isLoading: boolean
}

export default function PaymentSection({
  customerInfo,
  total,
  onSuccess,
  onError,
  onBackToInfo,
  isLoading
}: PaymentSectionProps) {
  const [clientSecret, setClientSecret] = useState<string>('')
  const [paymentIntentId, setPaymentIntentId] = useState<string>('')
  const [isCreatingIntent, setIsCreatingIntent] = useState(true)
  const [error, setError] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe')
  const [orderId, setOrderId] = useState<string>('')

  useEffect(() => {
    createPaymentIntent()
  }, []) // Only run once when component mounts

  const createPaymentIntent = async () => {
    setIsCreatingIntent(true)
    setError('')

    try {
      // Get cart items from localStorage (or pass them as props)
      const cartData = localStorage.getItem('cart-storage')
      let items = []
      
      if (cartData) {
        const parsed = JSON.parse(cartData)
        items = parsed.state?.items || []
      }

      if (items.length === 0) {
        throw new Error('Giỏ hàng trống')
      }

      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          customerInfo,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Không thể tạo payment intent')
      }

      setClientSecret(data.clientSecret)
      setPaymentIntentId(data.paymentIntentId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định'
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsCreatingIntent(false)
    }
  }

  const handlePaymentSuccess = (paymentIntentId: string) => {
    onSuccess(paymentIntentId)
  }

  const handlePaymentError = (error: string) => {
    onError(error)
  }









  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Lỗi khởi tạo thanh toán
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={createPaymentIntent}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={isCreatingIntent}
            >
              {isCreatingIntent ? 'Đang thử lại...' : 'Thử lại'}
            </button>
            <button
              onClick={onBackToInfo}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Quay lại thông tin
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isCreatingIntent) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Đang khởi tạo thanh toán
          </h2>
          <p className="text-gray-600">
            Vui lòng đợi trong giây lát...
          </p>
        </div>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <p className="text-gray-600">Không thể khởi tạo thanh toán</p>
        </div>
      </div>
    )
  }

  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#dc2626',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        spacingUnit: '4px',
        borderRadius: '6px',
      },
    },
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Thông tin thanh toán
        </h2>
        <button
          onClick={onBackToInfo}
          className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          disabled={isLoading}
        >
          ← Chỉnh sửa thông tin
        </button>
      </div>

      {/* Customer Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Thông tin khách hàng</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><span className="font-medium">Tên:</span> {customerInfo.firstName} {customerInfo.lastName}</p>
          <p><span className="font-medium">Email:</span> {customerInfo.email}</p>
          <p><span className="font-medium">Điện thoại:</span> {customerInfo.phone}</p>
          <p><span className="font-medium">Địa chỉ:</span> {customerInfo.address}, {customerInfo.city}, {customerInfo.country}</p>
        </div>
      </div>

      {/* Payment Total */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-gray-900">Tổng thanh toán:</span>
          <span className="text-2xl font-bold text-blue-600">
            {total.toLocaleString('vi-VN')}đ
          </span>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="mb-6">
        <PaymentMethodSelector
          selectedMethod={paymentMethod}
          onMethodChange={setPaymentMethod}
          disabled={isLoading}
        />
      </div>

      {/* Payment Form based on selected method */}
      {paymentMethod === 'stripe' ? (
        <Elements stripe={stripePromise} options={stripeOptions}>
          <PaymentForm
            paymentIntentId={paymentIntentId}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            isLoading={isLoading}
          />
        </Elements>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {paymentMethod === 'vnpay'
              ? 'Bạn sẽ được chuyển đến cổng thanh toán VNPay để hoàn tất giao dịch.'
              : 'Bạn sẽ được chuyển đến ví MoMo để hoàn tất giao dịch.'
            }
          </p>
          <button
            onClick={async () => {
              try {
                // Create pending order first
                const cartData = localStorage.getItem('cart-storage')
                const items = cartData ? (JSON.parse(cartData).state?.items || []) : []

                const pendingRes = await fetch('/api/orders/create-pending', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ items, customerInfo, total })
                })

                if (!pendingRes.ok) {
                  throw new Error('Không thể tạo đơn hàng')
                }

                const { orderId: newOrderId } = await pendingRes.json()
                setOrderId(newOrderId)

                // Redirect to payment gateway
                if (paymentMethod === 'vnpay') {
                  // Call VNPay payment with the new orderId
                  const vnpayResponse = await fetch('/api/vnpay/create-payment', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ orderId: newOrderId }),
                  })

                  const vnpayData = await vnpayResponse.json()

                  if (vnpayData.success && vnpayData.paymentUrl) {
                    window.location.href = vnpayData.paymentUrl
                  } else {
                    throw new Error(vnpayData.error || 'Không thể tạo thanh toán VNPay')
                  }
                } else if (paymentMethod === 'momo') {
                  // Call Momo payment with the new orderId
                  const momoResponse = await fetch('/api/momo/create-payment', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ orderId: newOrderId }),
                  })

                  const momoData = await momoResponse.json()

                  if (momoData.success && momoData.paymentUrl) {
                    window.location.href = momoData.paymentUrl
                  } else {
                    throw new Error(momoData.error || 'Không thể tạo thanh toán Momo')
                  }
                }
              } catch (e) {
                const msg = e instanceof Error ? e.message : 'Không thể khởi tạo thanh toán'
                setError(msg)
                onError(msg)
              }
            }}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading
              ? 'Đang xử lý...'
              : `Thanh toán với ${paymentMethod === 'vnpay' ? 'VNPay' : 'MoMo'}`
            }
          </button>
        </div>
      )}
    </div>
  )
}