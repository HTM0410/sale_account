'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { notifications } from '@/lib/notifications'
import { generateSecurePassword, generateUsername } from '@/lib/encryption'

interface CredentialDeliveryFormProps {
  orderId: string
  productName: string
  onSuccess?: () => void
}

interface DeliveryData {
  credentials: string
  deliveryNotes: string
  internalNotes: string
}

export default function CredentialDeliveryForm({ 
  orderId, 
  productName, 
  onSuccess 
}: CredentialDeliveryFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState<DeliveryData>({
    credentials: '',
    deliveryNotes: '',
    internalNotes: ''
  })

  // Auto-generate credentials based on product type
  const generateCredentials = async () => {
    setIsGenerating(true)
    try {
      const username = generateUsername(productName)
      const password = generateSecurePassword(16)
      
      const credentials = `Username: ${username}\nPassword: ${password}\nURL: https://${productName.toLowerCase().replace(/\s+/g, '')}.com/login\n\nLưu ý: Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu.`
      
      setFormData(prev => ({
        ...prev,
        credentials
      }))
      
      notifications.success('Đã tạo thông tin tài khoản tự động!')
    } catch (error) {
      console.error('Error generating credentials:', error)
      notifications.error('Lỗi khi tạo thông tin tài khoản')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.credentials.trim()) {
      notifications.error('Vui lòng nhập thông tin tài khoản')
      return
    }

    setIsLoading(true)
    const loadingToast = notifications.loading('Đang giao thông tin tài khoản...')

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/deliver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credentials: formData.credentials,
          deliveryNotes: formData.deliveryNotes
        }),
      })

      notifications.dismiss(loadingToast)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Lỗi khi giao thông tin tài khoản')
      }

      const result = await response.json()
      
      notifications.credentialDelivered(productName, orderId)
      
      // Reset form
      setFormData({
        credentials: '',
        deliveryNotes: '',
        internalNotes: ''
      })

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }

      // Refresh the page to update order status
      router.refresh()

    } catch (error) {
      notifications.dismiss(loadingToast)
      console.error('Delivery error:', error)
      notifications.error(error instanceof Error ? error.message : 'Lỗi khi giao thông tin tài khoản')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof DeliveryData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Giao thông tin tài khoản
        </h3>
        <p className="text-sm text-gray-600">
          Giao thông tin tài khoản cho đơn hàng #{orderId} - {productName}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Auto-generate button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={generateCredentials}
            disabled={isGenerating}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang tạo...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Tự động tạo
              </>
            )}
          </button>
        </div>

        {/* Credentials field */}
        <div>
          <label htmlFor="credentials" className="block text-sm font-medium text-gray-700 mb-2">
            Thông tin tài khoản <span className="text-red-500">*</span>
          </label>
          <textarea
            id="credentials"
            name="credentials"
            rows={8}
            required
            value={formData.credentials}
            onChange={(e) => handleInputChange('credentials', e.target.value)}
            placeholder="Nhập thông tin tài khoản (username, password, URL đăng nhập, etc.)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
          <p className="mt-1 text-sm text-gray-500">
            Thông tin này sẽ được mã hóa và gửi cho khách hàng
          </p>
        </div>

        {/* Delivery notes */}
        <div>
          <label htmlFor="deliveryNotes" className="block text-sm font-medium text-gray-700 mb-2">
            Ghi chú cho khách hàng
          </label>
          <textarea
            id="deliveryNotes"
            name="deliveryNotes"
            rows={3}
            value={formData.deliveryNotes}
            onChange={(e) => handleInputChange('deliveryNotes', e.target.value)}
            placeholder="Ghi chú sẽ được hiển thị cho khách hàng (tùy chọn)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Internal notes */}
        <div>
          <label htmlFor="internalNotes" className="block text-sm font-medium text-gray-700 mb-2">
            Ghi chú nội bộ
          </label>
          <textarea
            id="internalNotes"
            name="internalNotes"
            rows={2}
            value={formData.internalNotes}
            onChange={(e) => handleInputChange('internalNotes', e.target.value)}
            placeholder="Ghi chú nội bộ (chỉ admin thấy)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Submit button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isLoading || !formData.credentials.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang giao...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Gửi thông tin tài khoản
              </>
            )}
          </button>
        </div>
      </form>

      {/* Security notice */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Bảo mật thông tin
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                • Thông tin tài khoản sẽ được mã hóa trước khi lưu vào database<br/>
                • Chỉ khách hàng sở hữu đơn hàng mới có thể xem thông tin<br/>
                • Hệ thống sẽ tự động gửi thông báo cho khách hàng
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 