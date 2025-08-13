'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useNotifications } from '@/lib/hooks/useNotifications'
import { Toaster } from 'react-hot-toast'

interface NotificationProviderProps {
  children: React.ReactNode
}

export default function NotificationProvider({ children }: NotificationProviderProps) {
  const { data: session, status } = useSession()
  const { isConnected, connectionError } = useNotifications()

  // Log connection status for debugging
  useEffect(() => {
    if (session?.user && status === 'authenticated') {
      console.log('Notification connection status:', isConnected ? 'Connected' : 'Disconnected')
      if (connectionError) {
        console.error('Notification connection error:', connectionError)
      }
    }
  }, [session, status, isConnected, connectionError])

  return (
    <>
      {children}
      
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            fontSize: '14px',
            maxWidth: '400px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            duration: 6000,
          },
          loading: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {/* Connection status indicator (only show when there's an error) */}
      {session?.user && connectionError && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-sm">Lỗi kết nối thông báo</p>
                <p className="text-xs">Thông báo thời gian thực không khả dụng</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
