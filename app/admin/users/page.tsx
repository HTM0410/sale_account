import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import UsersTable from '@/components/admin/UsersTable'
import UsersHeader from '@/components/admin/UsersHeader'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quản lý người dùng - Admin Dashboard',
  description: 'Quản lý người dùng trong hệ thống marketplace',
}

interface UsersPageProps {
  searchParams?: {
    search?: string
    role?: string
    page?: string
    from?: string
    to?: string
  }
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/signin?callbackUrl=/admin/users')
  }

  // Parse search parameters
  const search = searchParams?.search || ''
  const role = searchParams?.role || 'all'
  const page = parseInt(searchParams?.page || '1')
  const from = searchParams?.from || ''
  const to = searchParams?.to || ''
  const limit = 20

  // Build filter conditions
  const whereConditions: any = {}

  if (search) {
    whereConditions.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ]
  }

  if (role && role !== 'all') {
    whereConditions.role = role
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

  // Fetch users and total count
  const [users, totalCount, roleStats] = await Promise.all([
    prisma.user.findMany({
      where: whereConditions,
      include: {
        orders: {
          select: {
            id: true,
            status: true,
            total: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        _count: {
          select: {
            orders: true,
            carts: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    
    prisma.user.count({
      where: whereConditions
    }),
    
    // Get role statistics
    prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    })
  ])

  const totalPages = Math.ceil(totalCount / limit)
  
  // Transform role stats to object
  const roleCounts = roleStats.reduce((acc, stat) => {
    acc[stat.role] = stat._count.role
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      {/* Header */}
      <UsersHeader 
        totalCount={totalCount}
        roleCounts={roleCounts}
        searchParams={searchParams}
      />

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
        <UsersTable 
          users={users}
          totalCount={totalCount}
          currentPage={page}
          totalPages={totalPages}
          searchParams={searchParams}
        />
      </div>
    </div>
  )
}