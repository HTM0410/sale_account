'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CheckoutResultPage() {
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending')
  const [message, setMessage] = useState<string>('Đang xử lý kết quả thanh toán...')
  const [orderId, setOrderId] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    // Handle VNPay return
    const vnpResponseCode = params.get('vnp_ResponseCode')
    const vnpTxnRef = params.get('vnp_TxnRef')

    // Handle Momo return
    const momoResultCode = params.get('resultCode')
    const momoOrderId = params.get('orderId')

    if (vnpResponseCode && vnpTxnRef) {
      setPaymentMethod('VNPay')
      setOrderId(vnpTxnRef)

      if (vnpResponseCode === '00') {
        setStatus('success')
        setMessage('Thanh toán VNPay thành công!')
      } else {
        setStatus('failed')
        setMessage('Thanh toán VNPay thất bại hoặc bị hủy.')
      }
    } else if (momoResultCode && momoOrderId) {
      setPaymentMethod('Momo')
      setOrderId(momoOrderId)

      if (momoResultCode === '0') {
        setStatus('success')
        setMessage('Thanh toán Momo thành công!')
      } else {
        setStatus('failed')
        setMessage('Thanh toán Momo thất bại hoặc bị hủy.')
      }
    } else {
      // Check for Stripe success
      const stripeSuccess = params.get('success')
      const stripeOrderId = params.get('order_id')

      if (stripeSuccess && stripeOrderId) {
        setPaymentMethod('Stripe')
        setOrderId(stripeOrderId)

        if (stripeSuccess === 'true') {
          setStatus('success')
          setMessage('Thanh toán thành công!')
        } else {
          setStatus('failed')
          setMessage('Thanh toán thất bại.')
        }
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          {status === 'success' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h1>
              <p className="text-gray-600 mb-6">
                Cảm ơn bạn đã mua hàng. Chúng tôi sẽ gửi thông tin tài khoản cho bạn sớm nhất.
              </p>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thất bại</h1>
              <p className="text-gray-600 mb-6">{message}</p>
            </>
          )}

          {status === 'pending' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <svg className="animate-spin h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Đang xử lý</h1>
              <p className="text-gray-600 mb-6">{message}</p>
            </>
          )}

          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-gray-900 mb-2">Thông tin thanh toán</h3>
              <p className="text-sm text-gray-600">Mã đơn hàng: {orderId}</p>
              {paymentMethod && <p className="text-sm text-gray-600">Phương thức: {paymentMethod}</p>}
            </div>
          )}

          <div className="space-y-3">
            {status === 'success' && (
              <Link
                href="/dashboard/orders"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Xem đơn hàng
              </Link>
            )}

            {status === 'failed' && orderId && (
              <Link
                href={`/checkout?retry=${orderId}`}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Thử lại thanh toán
              </Link>
            )}

            <Link
              href="/products"
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors inline-block"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

