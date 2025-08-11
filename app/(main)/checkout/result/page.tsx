'use client'

import { useEffect, useState } from 'react'

export default function CheckoutResultPage() {
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending')
  const [message, setMessage] = useState<string>('Đang xử lý kết quả thanh toán...')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('vnp_ResponseCode')
    if (code) {
      setStatus(code === '00' ? 'success' : 'failed')
      setMessage(code === '00' ? 'Thanh toán VNPay thành công!' : 'Thanh toán VNPay thất bại hoặc bị hủy.')
    }
  }, [])

  return (
    <div className="max-w-xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">Kết quả thanh toán</h1>
      <div
        className={`p-4 rounded border ${
          status === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          status === 'failed' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}
      >
        {message}
      </div>
      <a href="/dashboard/orders" className="inline-block mt-6 text-blue-600 hover:underline">
        Về đơn hàng của tôi
      </a>
    </div>
  )
}

