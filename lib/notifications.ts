import { toast } from 'react-hot-toast'

export const notifications = {
  // Success notifications
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
    })
  },

  // Error notifications
  error: (message: string) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
    })
  },

  // Info notifications
  info: (message: string) => {
    toast(message, {
      duration: 3000,
      position: 'top-right',
      icon: 'ℹ️',
    })
  },

  // Warning notifications
  warning: (message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: '⚠️',
    })
  },

  // Loading notifications
  loading: (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
    })
  },

  // Dismiss loading notification
  dismiss: (toastId: string) => {
    toast.dismiss(toastId)
  },

  // Custom credential delivery notification
  credentialDelivered: (productName: string, orderId: string) => {
    toast.success(
      `Tài khoản ${productName} đã được giao thành công!`,
      {
        duration: 6000,
        position: 'top-right',
        icon: '🎉',
      }
    )
  },

  // Order status notifications
  orderPaid: (orderId: string) => {
    toast.success(
      `Đơn hàng #${orderId} đã thanh toán thành công!`,
      {
        duration: 5000,
        position: 'top-right',
        icon: '💳',
      }
    )
  },

  orderDelivered: (orderId: string) => {
    toast.success(
      `Đơn hàng #${orderId} đã được giao!`,
      {
        duration: 5000,
        position: 'top-right',
        icon: '📦',
      }
    )
  },

  // Payment notifications
  paymentSuccess: (amount: number) => {
    toast.success(
      `Thanh toán thành công ${amount.toLocaleString('vi-VN')} VNĐ!`,
      {
        duration: 5000,
        position: 'top-right',
        icon: '✅',
      }
    )
  },

  paymentFailed: (error: string) => {
    toast.error(
      `Thanh toán thất bại: ${error}`,
      {
        duration: 6000,
        position: 'top-right',
        icon: '❌',
      }
    )
  },

  // Cart notifications
  addedToCart: (productName: string) => {
    toast.success(
      `Đã thêm ${productName} vào giỏ hàng!`,
      {
        duration: 3000,
        position: 'top-right',
        icon: '🛒',
      }
    )
  },

  removedFromCart: (productName: string) => {
    toast(
      `Đã xóa ${productName} khỏi giỏ hàng`,
      {
        duration: 3000,
        position: 'top-right',
        icon: '🗑️',
      }
    )
  },

  // Auth notifications
  loginSuccess: (userName: string) => {
    toast.success(
      `Chào mừng trở lại, ${userName}!`,
      {
        duration: 3000,
        position: 'top-right',
        icon: '👋',
      }
    )
  },

  logoutSuccess: () => {
    toast(
      'Đã đăng xuất thành công',
      {
        duration: 2000,
        position: 'top-right',
        icon: '👋',
      }
    )
  },

  // Profile notifications
  profileUpdated: () => {
    toast.success(
      'Thông tin cá nhân đã được cập nhật!',
      {
        duration: 3000,
        position: 'top-right',
        icon: '👤',
      }
    )
  },

  // Admin notifications
  adminAction: (action: string) => {
    toast.success(
      `Thao tác ${action} thành công!`,
      {
        duration: 3000,
        position: 'top-right',
        icon: '⚙️',
      }
    )
  },

  // Network notifications
  networkError: () => {
    toast.error(
      'Lỗi kết nối mạng. Vui lòng thử lại!',
      {
        duration: 5000,
        position: 'top-right',
        icon: '🌐',
      }
    )
  },

  // Copy notifications
  copiedToClipboard: (text: string) => {
    toast.success(
      `Đã sao chép ${text} vào clipboard!`,
      {
        duration: 2000,
        position: 'top-right',
        icon: '📋',
      }
    )
  },

  // Generic notifications
  generic: {
    success: (title: string, message?: string) => {
      toast.success(message || title, {
        duration: 4000,
        position: 'top-right',
      })
    },
    
    error: (title: string, message?: string) => {
      toast.error(message || title, {
        duration: 5000,
        position: 'top-right',
      })
    },
    
    info: (title: string, message?: string) => {
      toast(message || title, {
        duration: 3000,
        position: 'top-right',
        icon: 'ℹ️',
      })
    }
  }
} 