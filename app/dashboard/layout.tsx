import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - Premium Account Marketplace',
  description: 'Quản lý tài khoản và đơn hàng của bạn',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/signin?callbackUrl=/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Xin chào, {session.user?.name || session.user?.email}
              </span>
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full"
                />
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar />
        
        {/* Main Content */}
        <main className="flex-1 py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}