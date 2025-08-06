interface AdminStatsGridProps {
  stats: {
    totalUsers: number
    totalProducts: number
    totalOrders: number
    monthlyRevenue: number
    pendingOrders: number
  }
}

export default function AdminStatsGrid({ stats }: AdminStatsGridProps) {
  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN')
  }

  const statCards = [
    {
      title: 'Tổng người dùng',
      value: stats.totalUsers.toString(),
      change: '+12%',
      changeType: 'increase' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      bgColor: 'bg-blue-500',
      bgColorLight: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      title: 'Sản phẩm hoạt động',
      value: stats.totalProducts.toString(),
      change: '+3',
      changeType: 'increase' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      bgColor: 'bg-green-500',
      bgColorLight: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      title: 'Tổng đơn hàng',
      value: stats.totalOrders.toString(),
      change: '+18%',
      changeType: 'increase' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      bgColor: 'bg-purple-500',
      bgColorLight: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
    {
      title: 'Doanh thu tháng',
      value: `${formatPrice(stats.monthlyRevenue)}đ`,
      change: '+24%',
      changeType: 'increase' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      bgColor: 'bg-yellow-500',
      bgColorLight: 'bg-yellow-100',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Đơn chờ xử lý',
      value: stats.pendingOrders.toString(),
      change: stats.pendingOrders > 5 ? 'High' : 'Normal',
      changeType: stats.pendingOrders > 5 ? 'warning' as const : 'neutral' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-red-500',
      bgColorLight: 'bg-red-100',
      textColor: 'text-red-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 ${stat.bgColorLight} rounded-lg flex items-center justify-center`}>
                <span className={stat.textColor}>
                  {stat.icon}
                </span>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">
                {stat.title}
              </p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              {stat.changeType === 'increase' && (
                <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              )}
              {stat.changeType === 'warning' && (
                <svg className="w-4 h-4 text-yellow-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}
              <span className={`text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-600' :
                stat.changeType === 'warning' ? 'text-yellow-600' :
                'text-gray-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                {stat.changeType === 'increase' ? 'vs tháng trước' :
                 stat.changeType === 'warning' ? 'mức độ' :
                 'trạng thái'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}