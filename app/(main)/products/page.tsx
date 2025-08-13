import { prisma } from '@/lib/db'
import ProductCard from '@/components/ProductCard'
import ProductFilters from '@/components/ProductFilters'
import Pagination from '@/components/Pagination'
import ProductsGridSkeleton from '@/components/ProductsGridSkeleton'
import { Suspense } from 'react'

interface SearchParams {
  category?: string
  search?: string
  min?: string
  max?: string
  sort?: string
  page?: string
}

const PRODUCTS_PER_PAGE = 12

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

  // Build orderBy clause for sorting
  let orderBy: any = { createdAt: 'desc' } // Default sort
  
  if (searchParams.sort) {
    switch (searchParams.sort) {
      case 'price_asc':
        orderBy = { price: 'asc' }
        break
      case 'price_desc':
        orderBy = { price: 'desc' }
        break
      case 'name_asc':
        orderBy = { name: 'asc' }
        break
      case 'name_desc':
        orderBy = { name: 'desc' }
        break
      case 'created_asc':
        orderBy = { createdAt: 'asc' }
        break
      case 'created_desc':
        orderBy = { createdAt: 'desc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }
  }

  // Pagination
  const currentPage = searchParams.page ? Math.max(1, parseInt(searchParams.page)) : 1
  const skip = (currentPage - 1) * PRODUCTS_PER_PAGE

  // Get total count for pagination
  const totalProducts = await prisma.product.count({ where })

  // Fetch products from Supabase database with pagination
  const products = await prisma.product.findMany({
    where,
    orderBy,
    take: PRODUCTS_PER_PAGE,
    skip,
  })

  // Get unique categories for filtering
  const categories = await prisma.product.findMany({
    where: { isActive: true },
    select: { category: true },
    distinct: ['category'],
  })

  // Calculate pagination values
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE)

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
            currentSort={searchParams.sort}
            currentPage={currentPage}
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
            <Suspense fallback={<ProductsGridSkeleton count={Math.min(12, totalProducts)} />}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </Suspense>
          )}
        </div>

        {/* Pagination */}
        {totalProducts > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalProducts={totalProducts}
            productsPerPage={PRODUCTS_PER_PAGE}
          />
        )}
      </div>
    </div>
  )
}