import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import ProductsTable from '@/components/admin/ProductsTable'
import ProductsHeader from '@/components/admin/ProductsHeader'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quản lý sản phẩm - Admin Dashboard',
  description: 'Quản lý sản phẩm trong hệ thống marketplace',
}

interface ProductsPageProps {
  searchParams?: {
    search?: string
    category?: string
    status?: string
    page?: string
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/signin?callbackUrl=/admin/products')
  }

  // Parse search parameters
  const search = searchParams?.search || ''
  const category = searchParams?.category || ''
  const status = searchParams?.status || 'all'
  const page = parseInt(searchParams?.page || '1')
  const limit = 20

  // Build filter conditions
  const whereConditions: any = {}

  if (search) {
    whereConditions.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } }
    ]
  }

  if (category && category !== 'all') {
    whereConditions.category = category
  }

  if (status === 'active') {
    whereConditions.isActive = true
  } else if (status === 'inactive') {
    whereConditions.isActive = false
  }

  // Fetch products and total count
  const [products, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where: whereConditions,
      include: {
        packages: {
          orderBy: { price: 'asc' }
        },
        orderItems: {
          select: {
            quantity: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    
    prisma.product.count({
      where: whereConditions
    }),
    
    // Get unique categories for filter
    prisma.product.findMany({
      where: { isActive: true },
      distinct: ['category'],
      select: { category: true }
    })
  ])

  const totalPages = Math.ceil(totalCount / limit)
  const uniqueCategories = categories.map(c => c.category).filter(Boolean)

  return (
    <div>
      {/* Header */}
      <ProductsHeader 
        totalCount={totalCount}
        searchParams={searchParams}
        categories={uniqueCategories}
      />

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
        <ProductsTable 
          products={products}
          totalCount={totalCount}
          currentPage={page}
          totalPages={totalPages}
          searchParams={searchParams}
        />
      </div>
    </div>
  )
}