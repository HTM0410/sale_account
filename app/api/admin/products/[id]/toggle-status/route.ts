import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'

export async function PATCH(
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

    // Parse request body
    const { isActive } = await request.json()

    // Update product status
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: { isActive }
    })

    return NextResponse.json({
      success: true,
      message: `Sản phẩm đã được ${isActive ? 'kích hoạt' : 'tạm dừng'}`,
      product: updatedProduct
    })

  } catch (error) {
    console.error('Product toggle status error:', error)
    
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi cập nhật trạng thái sản phẩm' },
      { status: 500 }
    )
  }
}