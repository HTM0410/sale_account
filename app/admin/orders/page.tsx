import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import OrdersTable from '@/components/admin/OrdersTable'
import OrdersHeader from '@/components/admin/OrdersHeader'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quản lý đơn hàng - Admin Dashboard',
  description: 'Quản lý đơn hàng trong hệ thống marketplace',
}

interface OrdersPageProps {
  searchParams?: {
    search?: string
    status?: string
    page?: string
    from?: string
    to?: string
  }
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/signin?callbackUrl=/admin/orders')
  }

  // Parse search parameters
  const search = searchParams?.search || ''
  const status = searchParams?.status || 'all'
  const page = parseInt(searchParams?.page || '1')
  const from = searchParams?.from || ''
  const to = searchParams?.to || ''
  const limit = 20

  // Build filter conditions
  const whereConditions: any = {}

  if (search) {
    whereConditions.OR = [
      { id: { contains: search, mode: 'insensitive' } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } }
    ]
  }

  if (status && status !== 'all') {
    whereConditions.status = status
  }

  if (from || to) {
    whereConditions.createdAt = {}
    if (from) {
      whereConditions.createdAt.gte = new Date(from)
    }
    if (to) {
      whereConditions.createdAt.lte = new Date(new Date(to).setHours(23, 59, 59, 999))
    }
  }

  // Fetch orders and total count
  const [orders, totalCount, statusStats] = await Promise.all([
    prisma.order.findMany({
      where: whereConditions,
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
                imageUrl: true,
              }
            },
            productPackage: {
              select: {
                duration: true,
                description: true,
              }
            }
          }
        },
        accountDelivery: {
          select: {
            deliveryStatus: true,
            createdAt: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    
    prisma.order.count({
      where: whereConditions
    }),
    
    // Get status statistics
    prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })
  ])

  const totalPages = Math.ceil(totalCount / limit)
  
  // Transform status stats to object
  const statusCounts = statusStats.reduce((acc, stat) => {
    acc[stat.status] = stat._count.status
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      {/* Header */}
      <OrdersHeader 
        totalCount={totalCount}
        statusCounts={statusCounts}
        searchParams={searchParams}
      />

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
        <OrdersTable 
          orders={orders}
          totalCount={totalCount}
          currentPage={page}
          totalPages={totalPages}
          searchParams={searchParams}
        />
      </div>
    </div>
  )
}