import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams
    
    // Parse query parameters
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999999')
    const sort = searchParams.get('sort') || 'created_desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50)
    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {
      isActive: true
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Category filter
    if (category) {
      where.category = category
    }

    // Price filter (using packages if available, otherwise product price)
    if (minPrice > 0 || maxPrice < 999999999) {
      where.OR = [
        {
          packages: {
            some: {
              price: {
                gte: minPrice,
                lte: maxPrice
              },
              isActive: true
            }
          }
        },
        {
          AND: [
            { packages: { none: {} } }, // No packages
            {
              price: {
                gte: minPrice,
                lte: maxPrice
              }
            }
          ]
        }
      ]
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' }
    
    switch (sort) {
      case 'name_asc':
        orderBy = { name: 'asc' }
        break
      case 'name_desc':
        orderBy = { name: 'desc' }
        break
      case 'price_asc':
        orderBy = { price: 'asc' }
        break
      case 'price_desc':
        orderBy = { price: 'desc' }
        break
      case 'created_asc':
        orderBy = { createdAt: 'asc' }
        break
      case 'created_desc':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }

    // Fetch products with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          packages: {
            where: { isActive: true },
            orderBy: { price: 'asc' }
          }
        },
        orderBy,
        take: limit,
        skip: offset
      }),
      prisma.product.count({ where })
    ])

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        search,
        category,
        minPrice,
        maxPrice,
        sort
      }
    })

  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
