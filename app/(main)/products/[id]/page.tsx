import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import ProductDetailClient from '@/components/ProductDetailClient'
import Link from 'next/link'
import { Metadata } from 'next'

interface ProductDetailPageProps {
  params: {
    id: string
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  // Fetch product from Supabase database for metadata
  const product = await prisma.product.findUnique({
    where: { id: params.id, isActive: true }
  })

  if (!product) {
    return {
      title: 'Sản phẩm không tồn tại',
    }
  }

  return {
    title: `${product.name} - Tài khoản Premium`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.imageUrl ? [product.imageUrl] : [],
    }
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  // Fetch product from Supabase database with packages
  const product = await prisma.product.findUnique({
    where: { 
      id: params.id,
      isActive: true 
    },
    include: {
      packages: {
        where: { isActive: true },
        orderBy: { duration: 'asc' }
      }
    }
  })

  if (!product) {
    notFound()
  }

  // Get related products in the same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      category: product.category,
      isActive: true,
      id: { not: product.id }
    },
    take: 4,
    orderBy: { createdAt: 'desc' }
  })

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN')
  }

  // Hàm helper để lấy tên sản phẩm sạch (loại bỏ thông tin tháng)
  const getCleanProductName = (name: string): string => {
    // Loại bỏ các pattern như "2 tháng", "Premium 3 tháng", "6 tháng", etc.
    return name
      .replace(/\s*\d+\s*tháng/gi, '')
      .replace(/Premium\s*\d+\s*tháng/gi, 'Premium')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const cleanProductName = getCleanProductName(product.name)

  const getStockStatus = () => {
    if (product.stock === 0) return { text: 'Hết hàng', color: 'text-red-600 bg-red-50', available: false }
    if (product.stock <= 5) return { text: `Còn ${product.stock} tài khoản`, color: 'text-orange-600 bg-orange-50', available: true }
    return { text: 'Còn hàng', color: 'text-green-600 bg-green-50', available: true }
  }

  const stockStatus = getStockStatus()

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol role="list" className="flex items-center space-x-4">
            <li>
              <Link href="/" className="text-gray-400 hover:text-gray-500">
                <svg className="flex-shrink-0 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span className="sr-only">Trang chủ</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link href="/products" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                  Sản phẩm
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-4 text-sm font-medium text-gray-500">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Product details */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Product image */}
          <div className="flex flex-col-reverse">
            <div className="aspect-w-1 aspect-h-1 w-full">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-96 object-center object-cover sm:rounded-lg"
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-24 h-24 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-bold text-2xl">{cleanProductName}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{cleanProductName}</h1>

            <div className="mt-3">
              <h2 className="sr-only">Thông tin sản phẩm</h2>
              <div className="flex items-baseline space-x-2">
                <span className="text-sm text-gray-500">Từ</span>
                <p className="text-3xl text-gray-900 font-bold">{formatPrice(product.price)}đ</p>
              </div>
            </div>

            {/* Category and Stock */}
            <div className="mt-6 flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {product.category}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stockStatus.color}`}>
                {stockStatus.text}
              </span>
            </div>

            {/* Description */}
            <div className="mt-6">
              <h3 className="sr-only">Mô tả</h3>
              <div className="text-base text-gray-700 space-y-6">
                <p>{product.description}</p>
              </div>
            </div>

            {/* Product Packages and Add to Cart */}
            <ProductDetailClient
              packages={product.packages}
              productId={product.id}
              productName={cleanProductName}
              productPrice={product.price}
              productImageUrl={product.imageUrl}
              available={stockStatus.available}
              stock={product.stock}
            />

            {/* Product details */}
            <div className="mt-10 border-t border-gray-200 pt-10">
              <h3 className="text-sm font-medium text-gray-900">Chi tiết sản phẩm</h3>
              <div className="mt-4 prose prose-sm text-gray-500">
                <ul>
                  <li>Danh mục: {product.category}</li>
                  <li>Trạng thái: {stockStatus.text}</li>
                  <li>Ngày thêm: {new Date(product.createdAt).toLocaleDateString('vi-VN')}</li>
                  <li>Cập nhật lần cuối: {new Date(product.updatedAt).toLocaleDateString('vi-VN')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-6">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="group relative">
                  <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none">
                    {relatedProduct.imageUrl ? (
                      <img
                        src={relatedProduct.imageUrl}
                        alt={relatedProduct.name}
                        className="w-full h-full object-center object-cover lg:w-full lg:h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-semibold">{relatedProduct.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex justify-between">
                    <div>
                      <h3 className="text-sm text-gray-700">
                        <Link href={`/products/${relatedProduct.id}`}>
                          <span aria-hidden="true" className="absolute inset-0" />
                          {relatedProduct.name}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">{relatedProduct.category}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{formatPrice(relatedProduct.price)}đ</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}