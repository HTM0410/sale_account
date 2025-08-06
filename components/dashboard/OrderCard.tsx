import Link from 'next/link'
import Image from 'next/image'
import { Order, OrderItem, Product, ProductPackage, AccountDelivery } from '@prisma/client'

type OrderWithRelations = Order & {
  items: (OrderItem & {
    product: Product
    productPackage: ProductPackage | null
  })[]
  accountDelivery: AccountDelivery | null
}

interface OrderCardProps {
  order: OrderWithRelations
}

export default function OrderCard({ order }: OrderCardProps) {
  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN')
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return ''
    if (duration === 1) return '1 tháng'
    return `${duration} tháng`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Đã thanh toán'
      case 'pending':
        return 'Chờ xử lý'
      case 'failed':
        return 'Thất bại'
      case 'cancelled':
        return 'Đã hủy'
      default:
        return status
    }
  }

  const getDeliveryStatus = () => {
    if (!order.accountDelivery) {
      return order.status === 'paid' ? 'Đang xử lý' : 'Chưa giao'
    }
    
    switch (order.accountDelivery.deliveryStatus) {
      case 'delivered':
        return 'Đã giao'
      case 'pending':
        return 'Đang xử lý'
      case 'failed':
        return 'Thất bại'
      default:
        return order.accountDelivery.deliveryStatus
    }
  }

  const getDeliveryStatusColor = () => {
    if (!order.accountDelivery) {
      return order.status === 'paid' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
    }
    
    switch (order.accountDelivery.deliveryStatus) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const canViewCredentials = order.status === 'paid' && order.accountDelivery?.deliveryStatus === 'delivered'

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        {/* Order Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Đơn hàng #{order.id.slice(-8).toUpperCase()}
              </h3>
              <p className="text-sm text-gray-600">
                {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="flex space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDeliveryStatusColor()}`}>
                {getDeliveryStatus()}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-md overflow-hidden">
                  {item.product.imageUrl ? (
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {item.product.name}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-600">
                      Số lượng: {item.quantity}
                    </span>
                    {item.productPackage && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-blue-600">
                          {formatDuration(item.productPackage.duration)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatPrice(item.price * item.quantity)}đ
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Actions */}
        <div className="mt-6 lg:mt-0 lg:ml-8 flex flex-col space-y-3 lg:items-end">
          <div className="text-right">
            <p className="text-sm text-gray-600">Tổng cộng</p>
            <p className="text-xl font-bold text-gray-900">
              {formatPrice(order.total)}đ
            </p>
          </div>

          <div className="flex flex-col space-y-2">
            <Link
              href={`/dashboard/orders/${order.id}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Chi tiết đơn hàng
            </Link>
            
            {canViewCredentials && (
              <Link
                href={`/dashboard/credentials/${order.id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Xem tài khoản
              </Link>
            )}

            {order.status === 'paid' && !canViewCredentials && (
              <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md">
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang giao tài khoản
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}