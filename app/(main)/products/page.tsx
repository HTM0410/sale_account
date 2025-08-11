import { prisma } from '@/lib/db'
import ProductCard from '@/components/ProductCard'
import ProductFilters from '@/components/ProductFilters'
import { Suspense } from 'react'

interface SearchParams {
  category?: string
  search?: string
  min?: string
  max?: string
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  // Build where clause for filtering
  const where: any = {
    isActive: true,
  }

  if (searchParams.category) {
    where.category = searchParams.category
  }

  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: 'insensitive' } },
      { description: { contains: searchParams.search, mode: 'insensitive' } },
    ]
  }

  // Price range filter
  const AND: any[] = []
  const min = searchParams.min ? Number(searchParams.min) : undefined
  const max = searchParams.max ? Number(searchParams.max) : undefined
  if (!Number.isNaN(min) && min !== undefined) {
    AND.push({ price: { gte: Math.max(0, Math.floor(min)) } })
  }
  if (!Number.isNaN(max) && max !== undefined) {
    AND.push({ price: { lte: Math.max(0, Math.floor(max)) } })
  }
  if (AND.length > 0) {
    where.AND = AND
  }

  // Fetch products from Supabase database
  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  // Get unique categories for filtering
  const categories = await prisma.product.findMany({
    where: { isActive: true },
    select: { category: true },
    distinct: ['category'],
  })

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">Tài khoản Premium</h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Khám phá bộ sưu tập tài khoản premium chất lượng cao với giá tốt nhất
          </p>
        </div>

        {/* Filters */}
        <Suspense fallback={<div className="mt-8 h-16 bg-gray-100 rounded-lg animate-pulse" />}>
          <ProductFilters 
            categories={categories.map(c => c.category)} 
            currentCategory={searchParams.category}
            currentSearch={searchParams.search}
            currentMin={searchParams.min}
            currentMax={searchParams.max}
          />
        </Suspense>

        {/* Products Grid */}
        <div className="mt-8">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V8a2 2 0 00-2-2h-1" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có sản phẩm</h3>
              <p className="mt-1 text-sm text-gray-500">Không tìm thấy sản phẩm nào phù hợp với tiêu chí tìm kiếm.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Hiển thị {products.length} sản phẩm
        </div>
      </div>
    </div>
  )
}