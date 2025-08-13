'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { notifications } from '@/lib/notifications'

interface NotificationData {
  id: string
  type: string
  message: string
  metadata?: any
  isRead: boolean
  createdAt: string
}

interface SSEMessage {
  type: 'connected' | 'notification' | 'unread_count' | 'heartbeat' | 'broadcast'
  notification?: NotificationData
  count?: number
  message?: string
  timestamp: string
}

export function useNotifications() {
  const { data: session, status } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [eventSource, setEventSource] = useState<EventSource | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Function to connect to SSE
  const connect = useCallback(() => {
    if (!session?.user || status !== 'authenticated') {
      return
    }

    // Close existing connection
    if (eventSource) {
      eventSource.close()
    }

    try {
      const es = new EventSource('/api/notifications/stream')
      
      es.onopen = () => {
        console.log('Notification stream connected')
        setIsConnected(true)
        setConnectionError(null)
      }

      es.onmessage = (event) => {
        try {
          const data: SSEMessage = JSON.parse(event.data)
          
          switch (data.type) {
            case 'connected':
              console.log('Notification stream established:', data.message)
              break
              
            case 'notification':
              if (data.notification) {
                handleNewNotification(data.notification)
              }
              break
              
            case 'unread_count':
              if (typeof data.count === 'number') {
                setUnreadCount(data.count)
              }
              break
              
            case 'broadcast':
              if (data.message) {
                notifications.info(data.message)
              }
              break
              
            case 'heartbeat':
              // Keep connection alive
              break
              
            default:
              console.log('Unknown notification type:', data.type)
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error)
        }
      }

      es.onerror = (error) => {
        console.error('Notification stream error:', error)
        setIsConnected(false)
        setConnectionError('Lỗi kết nối thông báo')
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (session?.user) {
            connect()
          }
        }, 5000)
      }

      setEventSource(es)
    } catch (error) {
      console.error('Failed to create EventSource:', error)
      setConnectionError('Không thể kết nối thông báo')
    }
  }, [session, status, eventSource])

  // Function to disconnect
  const disconnect = useCallback(() => {
    if (eventSource) {
      eventSource.close()
      setEventSource(null)
      setIsConnected(false)
    }
  }, [eventSource])

  // Handle new notification
  const handleNewNotification = (notification: NotificationData) => {
    // Show toast notification based on type
    switch (notification.type) {
      case 'payment_success':
        notifications.paymentSuccess(notification.metadata?.amount || 0)
        break
        
      case 'payment_failed':
        notifications.paymentFailed(notification.message)
        break
        
      case 'credential_delivered':
        notifications.credentialDelivered(
          notification.metadata?.productName || 'Sản phẩm',
          notification.metadata?.orderId || ''
        )
        break
        
      case 'order_status_updated':
        notifications.orderPaid(notification.metadata?.orderId || '')
        break
        
      default:
        notifications.info(notification.message)
    }
  }

  // Function to mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      })
      
      if (response.ok) {
        // Update unread count locally
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }, [])

  // Function to mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH'
      })
      
      if (response.ok) {
        setUnreadCount(0)
        notifications.success('Đã đánh dấu tất cả thông báo là đã đọc')
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      notifications.error('Không thể đánh dấu thông báo')
    }
  }, [])

  // Function to get notifications list
  const getNotifications = useCallback(async (limit = 10, offset = 0) => {
    try {
      const response = await fetch(`/api/notifications?limit=${limit}&offset=${offset}`)
      
      if (response.ok) {
        return await response.json()
      }
      
      throw new Error('Failed to fetch notifications')
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return { notifications: [], total: 0 }
    }
  }, [])

  // Connect when session is available
  useEffect(() => {
    if (session?.user && status === 'authenticated') {
      connect()
    } else {
      disconnect()
    }

    // Cleanup on unmount
    return () => {
      disconnect()
    }
  }, [session, status])

  // Cleanup on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      disconnect()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      disconnect()
    }
  }, [disconnect])

  return {
    isConnected,
    unreadCount,
    connectionError,
    connect,
    disconnect,
    markAsRead,
    markAllAsRead,
    getNotifications
  }
}
