import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id || session.user.email || '' },
      select: { role: true }
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Check if product exists and has no orders
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        orderItems: true,
        cartItems: true,
        packages: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      )
    }

    // Check if product has orders (prevent deletion)
    if (product.orderItems.length > 0) {
      return NextResponse.json(
        { error: 'Không thể xóa sản phẩm đã có đơn hàng. Hãy tạm dừng thay vì xóa.' },
        { status: 400 }
      )
    }

    // Delete related data first
    await prisma.$transaction([
      // Delete cart items
      prisma.cartItem.deleteMany({
        where: { productId: params.id }
      }),
      
      // Delete product packages
      prisma.productPackage.deleteMany({
        where: { productId: params.id }
      }),
      
      // Delete product
      prisma.product.delete({
        where: { id: params.id }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Sản phẩm đã được xóa thành công'
    })

  } catch (error) {
    console.error('Product deletion error:', error)
    
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi xóa sản phẩm' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id || session.user.email || '' },
      select: { role: true }
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        packages: {
          orderBy: { price: 'asc' }
        },
        orderItems: {
          include: {
            order: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        cartItems: {
          include: {
            cart: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      product
    })

  } catch (error) {
    console.error('Product fetch error:', error)
    
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tải thông tin sản phẩm' },
      { status: 500 }
    )
  }
}