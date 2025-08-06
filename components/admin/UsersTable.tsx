'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Order } from '@prisma/client'

type UserWithRelations = User & {
  orders: {
    id: string
    status: string
    total: number
    createdAt: Date
  }[]
  _count: {
    orders: number
    carts: number
  }
}

interface UsersTableProps {
  users: UserWithRelations[]
  totalCount: number
  currentPage: number
  totalPages: number
  searchParams?: {
    search?: string
    role?: string
    page?: string
    from?: string
    to?: string
  }
}

export default function UsersTable({ 
  users, 
  totalCount, 
  currentPage, 
  totalPages,
  searchParams
}: UsersTableProps) {
  const router = useRouter()
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN')
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'user':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên'
      case 'user':
        return 'Người dùng'
      default:
        return role
    }
  }

  const getTotalSpent = (orders: UserWithRelations['orders']) => {
    return orders
      .filter(order => order.status === 'paid')
      .reduce((sum, order) => sum + order.total, 0)
  }

  const getLastOrderDate = (orders: UserWithRelations['orders']) => {
    if (orders.length === 0) return null
    return orders[0].createdAt // Already sorted by createdAt desc
  }

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    if (newRole === 'admin') {
      const confirmed = confirm(
        'Bạn có chắc chắn muốn cấp quyền quản trị cho người dùng này? ' +
        'Họ sẽ có quyền truy cập vào tất cả chức năng admin.'
      )
      if (!confirmed) return
    }

    setUpdatingRole(userId)

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Có lỗi xảy ra khi cập nhật vai trò người dùng')
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('Có lỗi xảy ra khi cập nhật vai trò người dùng')
    } finally {
      setUpdatingRole(null)
    }
  }

  const generatePageUrl = (page: number) => {
    const params = new URLSearchParams()
    if (searchParams?.search) params.set('search', searchParams.search)
    if (searchParams?.role) params.set('role', searchParams.role)
    if (searchParams?.from) params.set('from', searchParams.from)
    if (searchParams?.to) params.set('to', searchParams.to)
    params.set('page', page.toString())
    return `/admin/users?${params.toString()}`
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Không tìm thấy người dùng nào
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
                Người dùng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vai trò
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đơn hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng chi tiêu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đơn cuối
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
            {users.map((user) => {
              const totalSpent = getTotalSpent(user.orders)
              const lastOrder = getLastOrderDate(user.orders)
              
              return (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name || user.email}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || 'Chưa có tên'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                      disabled={updatingRole === user.id}
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getRoleColor(user.role)}`}
                    >
                      <option value="user">Người dùng</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user._count.orders} đơn hàng
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.orders.filter(o => o.status === 'paid').length} đã thanh toán
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(totalSpent)}đ
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lastOrder ? (
                      <div>
                        <div>
                          {new Date(lastOrder).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(lastOrder).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Chưa có</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="text-blue-600 hover:text-blue-500"
                      >
                        Chi tiết
                      </Link>
                      {user.orders.length > 0 && (
                        <Link
                          href={`/admin/orders?search=${user.email}`}
                          className="text-green-600 hover:text-green-500"
                        >
                          Đơn hàng
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
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
              của <span className="font-medium">{totalCount}</span> người dùng
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