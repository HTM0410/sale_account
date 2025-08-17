import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard'

export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id || session.user.email || '' },
    select: { role: true }
  })

  if (!user || !['ADMIN', 'STAFF'].includes(user.role)) {
    redirect('/')
  }

  // Fetch analytics data
  const [
    totalUsers,
    totalOrders,
    totalRevenue,
    paidOrders,
    pendingOrders,
    failedOrders,
    recentOrders,
    popularProducts,
    userGrowth,
    revenueByMonth,
    ordersByPaymentMethod
  ] = await Promise.all([
    // Total users
    prisma.user.count(),
    
    // Total orders
    prisma.order.count(),
    
    // Total revenue (paid orders only)
    prisma.order.aggregate({
      where: { status: 'paid' },
      _sum: { total: true }
    }),
    
    // Paid orders count
    prisma.order.count({
      where: { status: 'paid' }
    }),
    
    // Pending orders count
    prisma.order.count({
      where: { status: 'pending' }
    }),
    
    // Failed orders count
    prisma.order.count({
      where: { status: 'failed' }
    }),
    
    // Recent orders (last 10)
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        },
        items: {
          include: {
            product: {
              select: { name: true }
            }
          }
        }
      }
    }),
    
    // Popular products (by order count)
    prisma.product.findMany({
      include: {
        _count: {
          select: {
            orderItems: {
              where: {
                order: {
                  status: 'paid'
                }
              }
            }
          }
        }
      },
      orderBy: {
        orderItems: {
          _count: 'desc'
        }
      },
      take: 5
    }),
    
    // User growth (last 6 months)
    prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count
      FROM "User" 
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `,
    
    // Revenue by month (last 6 months)
    prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        SUM("total") as revenue
      FROM "Order" 
      WHERE "status" = 'paid' 
        AND "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `,
    
    // Orders by payment method
    prisma.$queryRaw`
      SELECT 
        COALESCE(metadata->>'paymentProvider', 'stripe') as payment_method,
        COUNT(*) as count
      FROM "Order" 
      WHERE "status" = 'paid'
      GROUP BY metadata->>'paymentProvider'
      ORDER BY count DESC
    `
  ])

  const analytics = {
    overview: {
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      paidOrders,
      pendingOrders,
      failedOrders,
      conversionRate: totalOrders > 0 ? (paidOrders / totalOrders * 100) : 0
    },
    recentOrders,
    popularProducts,
    userGrowth: userGrowth as Array<{ month: Date; count: bigint }>,
    revenueByMonth: revenueByMonth as Array<{ month: Date; revenue: number }>,
    ordersByPaymentMethod: ordersByPaymentMethod as Array<{ payment_method: string; count: bigint }>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600">Tổng quan về hiệu suất và số liệu kinh doanh</p>
      </div>
      
      <AnalyticsDashboard data={analytics} />
    </div>
  )
}