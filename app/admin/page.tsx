import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import AdminStatsGrid from '@/components/admin/AdminStatsGrid'
import RecentOrdersTable from '@/components/admin/RecentOrdersTable'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard - Tổng quan',
  description: 'Tổng quan hệ thống marketplace',
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/signin?callbackUrl=/admin')
  }

  // Fetch dashboard statistics
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    recentOrders,
    monthlyRevenue,
    pendingOrders
  ] = await Promise.all([
    // Total users
    prisma.user.count(),
    
    // Total products
    prisma.product.count({
      where: { isActive: true }
    }),
    
    // Total orders
    prisma.order.count(),
    
    // Recent orders (last 10)
    prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    
    // Monthly revenue (current month)
    prisma.order.aggregate({
      where: {
        status: 'paid',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
        }
      },
      _sum: {
        total: true
      }
    }),
    
    // Pending orders
    prisma.order.count({
      where: {
        status: 'pending'
      }
    })
  ])

  const stats = {
    totalUsers,
    totalProducts,
    totalOrders,
    monthlyRevenue: monthlyRevenue._sum.total || 0,
    pendingOrders
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Chào mừng trở lại, Admin!
        </h1>
        <p className="text-gray-600">
          Tổng quan hoạt động hệ thống Premium Account Marketplace.
        </p>
      </div>

      {/* Stats Grid */}
      <AdminStatsGrid stats={stats} />

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Đơn hàng gần đây
                </h2>
                <a
                  href="/admin/orders"
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  Xem tất cả
                </a>
              </div>
            </div>
            <div className="p-6">
              <RecentOrdersTable orders={recentOrders} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* System Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Trạng thái hệ thống
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Database</span>
                </div>
                <span className="text-sm font-medium text-green-600">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Payment Gateway</span>
                </div>
                <span className="text-sm font-medium text-green-600">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Email Service</span>
                </div>
                <span className="text-sm font-medium text-yellow-600">Limited</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Hành động nhanh
            </h2>
            <div className="space-y-3">
              <a
                href="/admin/products/new"
                className="block w-full px-4 py-2 text-left border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Thêm sản phẩm mới</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </a>

              <a
                href="/admin/orders?status=pending"
                className="block w-full px-4 py-2 text-left border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Xử lý đơn hàng chờ</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                      {pendingOrders}
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>

              <a
                href="/admin/users"
                className="block w-full px-4 py-2 text-left border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Quản lý người dùng</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            </div>
          </div>

          {/* Today's Summary */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
            <h2 className="text-lg font-semibold mb-4">
              Tóm tắt hôm nay
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-90">Đơn hàng mới:</span>
                <span className="font-semibold">
                  {recentOrders.filter(order => 
                    new Date(order.createdAt).toDateString() === new Date().toDateString()
                  ).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-90">Doanh thu:</span>
                <span className="font-semibold">
                  {recentOrders
                    .filter(order => 
                      new Date(order.createdAt).toDateString() === new Date().toDateString() &&
                      order.status === 'paid'
                    )
                    .reduce((sum, order) => sum + order.total, 0)
                    .toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}