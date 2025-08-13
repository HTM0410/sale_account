'use client'

import { useState, useEffect } from 'react'
import { notifications } from '@/lib/notifications'

interface Credential {
  id: string
  credentials: string
  deliveryStatus: string
  deliveryNotes?: string
  sentAt: string
  product: {
    name: string
    description?: string
  }
  orderId: string
}

interface CredentialCardProps {
  deliveryId: string
}

export default function CredentialCard({ deliveryId }: CredentialCardProps) {
  const [credential, setCredential] = useState<Credential | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    fetchCredential()
  }, [deliveryId])

  const fetchCredential = async () => {
    try {
      const response = await fetch(`/api/credentials/${deliveryId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch credential')
      }

      const data = await response.json()
      setCredential(data.credential)
    } catch (error) {
      console.error('Error fetching credential:', error)
      notifications.error('Lỗi khi tải thông tin tài khoản')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      notifications.copiedToClipboard(fieldName)
      
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      notifications.error('Lỗi khi sao chép vào clipboard')
    }
  }

  const parseCredentials = (credentialsText: string) => {
    const lines = credentialsText.split('\n')
    const parsed: { [key: string]: string } = {}
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':')
      if (key && valueParts.length > 0) {
        parsed[key.trim()] = valueParts.join(':').trim()
      }
    })
    
    return parsed
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!credential) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy thông tin tài khoản</h3>
          <p className="mt-1 text-sm text-gray-500">
            Thông tin tài khoản có thể chưa được giao hoặc đã bị xóa.
          </p>
        </div>
      </div>
    )
  }

  const parsedCredentials = parseCredentials(credential.credentials)
  const sentDate = new Date(credential.sentAt)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                {credential.product.name}
              </h3>
              <p className="text-sm text-gray-500">
                Đã giao vào {sentDate.toLocaleDateString('vi-VN')} lúc {sentDate.toLocaleTimeString('vi-VN')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Đã giao
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 py-4">
          {/* Credentials */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Thông tin đăng nhập</h4>
            <div className="space-y-3">
              {Object.entries(parsedCredentials).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{key}</p>
                    <p className="text-sm text-gray-900 font-mono break-all">{value}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(value, key)}
                    className="ml-3 p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                    title={`Sao chép ${key}`}
                  >
                    {copiedField === key ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Copy all button */}
          <div className="mb-6">
            <button
              onClick={() => copyToClipboard(credential.credentials, 'Tất cả thông tin')}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Sao chép tất cả thông tin
            </button>
          </div>

          {/* Delivery notes */}
          {credential.deliveryNotes && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Ghi chú từ admin</h4>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">{credential.deliveryNotes}</p>
              </div>
            </div>
          )}

          {/* Security notice */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Lưu ý bảo mật
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Lưu trữ thông tin đăng nhập một cách an toàn</li>
                    <li>Đổi mật khẩu sau khi đăng nhập lần đầu</li>
                    <li>Không chia sẻ thông tin đăng nhập với người khác</li>
                    <li>Liên hệ hỗ trợ nếu gặp vấn đề</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}