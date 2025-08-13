'use client'

import { useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'

interface PaymentFormProps {
  paymentIntentId: string
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
  isLoading: boolean
}

export default function PaymentForm({
  paymentIntentId,
  onSuccess,
  onError,
  isLoading
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded
      return
    }

    setIsProcessing(true)
    setMessage('')

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      })

      if (error) {
        // Payment failed
        let errorMessage = 'Thanh toán không thành công'
        
        switch (error.type) {
          case 'card_error':
          case 'validation_error':
            errorMessage = error.message || errorMessage
            break
          case 'invalid_request_error':
            errorMessage = 'Yêu cầu không hợp lệ. Vui lòng thử lại.'
            break
          default:
            errorMessage = 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.'
            break
        }
        
        setMessage(errorMessage)
        onError(errorMessage)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded
        setMessage('Thanh toán thành công!')
        onSuccess(paymentIntent.id)
      } else {
        // Unexpected state
        setMessage('Trạng thái thanh toán không xác định')
        onError('Trạng thái thanh toán không xác định')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định'
      setMessage(errorMessage)
      onError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const paymentElementOptions = {
    layout: 'tabs' as const,
    paymentMethodOrder: ['card', 'grabpay', 'paynow'],
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div>
        <PaymentElement 
          id="payment-element" 
          options={paymentElementOptions}
        />
      </div>

      {/* Error/Success Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('thành công') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-start space-x-2">
            {message.includes('thành công') ? (
              <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
            <p className="text-sm font-medium">{message}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements || isLoading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Đang xử lý thanh toán...
          </div>
        ) : (
          'Hoàn tất thanh toán'
        )}
      </button>

      {/* Payment Security Info */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>SSL 256-bit</span>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>Stripe Secure</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Thông tin thanh toán được bảo vệ và mã hóa bởi Stripe
        </p>
      </div>

      {/* Test Card Info (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">
            🧪 Test Mode - Thẻ test để thử nghiệm:
          </h4>
          <div className="text-xs text-yellow-700 space-y-1">
            <p><strong>Số thẻ:</strong> 4242 4242 4242 4242</p>
            <p><strong>Ngày hết hạn:</strong> 12/34</p>
            <p><strong>CVC:</strong> 123</p>
            <p><strong>Zip:</strong> 12345</p>
          </div>
        </div>
      )}
    </form>
  )
}