import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import ProfileForm from '@/components/dashboard/ProfileForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hồ sơ cá nhân - Dashboard',
  description: 'Quản lý thông tin tài khoản của bạn',
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/signin?callbackUrl=/dashboard/profile')
  }

  // Get user data from database
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id || session.user.email || ''
    }
  })

  const accountStats = await prisma.order.findMany({
    where: {
      userId: session.user.id || session.user.email || ''
    },
    select: {
      status: true,
      total: true,
      createdAt: true
    }
  })

  const totalOrders = accountStats.length
  const totalSpent = accountStats.reduce((sum, order) => sum + order.total, 0)
  const memberSince = user?.createdAt || session.user.email ? new Date() : new Date()

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Hồ sơ cá nhân
        </h1>
        <p className="text-gray-600">
          Quản lý thông tin tài khoản và cài đặt của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Form */}
        <div className="lg:col-span-2">
          <ProfileForm user={user} />
        </div>

        {/* Account Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Account Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin tài khoản
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {session.user?.name || 'Chưa cập nhật tên'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {session.user?.email}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <dl className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Thành viên từ:</dt>
                    <dd className="text-gray-900">
                      {memberSince.toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Tổng đơn hàng:</dt>
                    <dd className="font-medium text-gray-900">{totalOrders}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Tổng chi tiêu:</dt>
                    <dd className="font-medium text-gray-900">
                      {totalSpent.toLocaleString('vi-VN')}đ
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Hành động
            </h2>
            
            <div className="space-y-3">
              <a
                href="/dashboard/orders"
                className="block w-full px-4 py-2 text-left border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Xem đơn hàng</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>

              <a
                href="/dashboard/credentials"
                className="block w-full px-4 py-2 text-left border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tài khoản đã mua</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>

              <button
                type="button"
                className="block w-full px-4 py-2 text-left border border-red-300 rounded-md text-red-700 hover:bg-red-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Xóa tài khoản</span>
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Bảo mật tài khoản</p>
                <p className="mt-1">
                  Thông tin của bạn được mã hóa và bảo vệ. Chúng tôi không chia sẻ dữ liệu với bên thứ ba.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}