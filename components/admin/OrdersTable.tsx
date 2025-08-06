'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Order, OrderItem, Product, ProductPackage, User, AccountDelivery } from '@prisma/client'

type OrderWithRelations = Order & {
  user: {
    name: string | null
    email: string
  } | null
  items: (OrderItem & {
    product: {
      name: string
      imageUrl: string
    }
    productPackage: {
      duration: number
      description: string | null
    } | null
  })[]
  accountDelivery: {
    deliveryStatus: string
    createdAt: Date
  } | null
}

interface OrdersTableProps {
  orders: OrderWithRelations[]
  totalCount: number
  currentPage: number
  totalPages: number
  searchParams?: {
    search?: string
    status?: string
    page?: string
    from?: string
    to?: string
  }
}

export default function OrdersTable({ 
  orders, 
  totalCount, 
  currentPage, 
  totalPages,
  searchParams
}: OrdersTableProps) {
  const router = useRouter()
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN')
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

  const getDeliveryStatusColor = (status?: string) => {
    switch (status) {
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

  const getDeliveryStatusText = (status?: string) => {
    switch (status) {
      case 'delivered':
        return 'Đã giao'
      case 'pending':
        return 'Đang xử lý'
      case 'failed':
        return 'Thất bại'
      default:
        return 'Chưa giao'
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId)

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const generatePageUrl = (page: number) => {
    const params = new URLSearchParams()
    if (searchParams?.search) params.set('search', searchParams.search)
    if (searchParams?.status) params.set('status', searchParams.status)
    if (searchParams?.from) params.set('from', searchParams.from)
    if (searchParams?.to) params.set('to', searchParams.to)
    params.set('page', page.toString())
    return `/admin/orders?${params.toString()}`
  }

  const getItemsText = (items: OrderWithRelations['items']) => {
    if (items.length === 1) {
      return items[0].product.name
    }
    return `${items[0].product.name} +${items.length - 1} SP khác`
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Không tìm thấy đơn hàng nào
        </h3>
        <p className="text-gray-600">
          Hãy thử thay đổi bộ lọc hoặc khoảng thời gian tìm kiếm.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đơn hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sản phẩm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giao hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    #{order.id.slice(-8).toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {order.user?.name || 'Không có tên'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.user?.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      {order.items[0]?.product.imageUrl ? (
                        <Image
                          src={order.items[0].product.imageUrl}
                          alt={order.items[0].product.name}
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded bg-gray-200 flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="ml-2">
                      <div className="text-sm text-gray-900 max-w-32 truncate">
                        {getItemsText(order.items)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatPrice(order.total)}đ
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    disabled={updatingStatus === order.id}
                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.status)}`}
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="paid">Đã thanh toán</option>
                    <option value="failed">Thất bại</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDeliveryStatusColor(order.accountDelivery?.deliveryStatus)}`}>
                    {getDeliveryStatusText(order.accountDelivery?.deliveryStatus)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-500"
                    >
                      Chi tiết
                    </Link>
                    {order.status === 'paid' && !order.accountDelivery && (
                      <Link
                        href={`/admin/orders/${order.id}/deliver`}
                        className="text-green-600 hover:text-green-500"
                      >
                        Giao hàng
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex-1 flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> đến{' '}
              <span className="font-medium">
                {Math.min(currentPage * 20, totalCount)}
              </span>{' '}
              của <span className="font-medium">{totalCount}</span> đơn hàng
            </div>
            <div className="flex space-x-2">
              {currentPage > 1 && (
                <Link
                  href={generatePageUrl(currentPage - 1)}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Trước
                </Link>
              )}
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                if (pageNum > totalPages) return null
                
                return (
                  <Link
                    key={pageNum}
                    href={generatePageUrl(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      pageNum === currentPage
                        ? 'text-blue-600 bg-blue-50 border border-blue-300'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </Link>
                )
              })}
              
              {currentPage < totalPages && (
                <Link
                  href={generatePageUrl(currentPage + 1)}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Sau
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}