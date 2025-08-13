import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
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

    if (!user || !['ADMIN', 'STAFF'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Parse request body
    const { status } = await request.json()

    // Validate status
    if (!['pending', 'paid', 'failed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Trạng thái không hợp lệ' },
        { status: 400 }
      )
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: params.id }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Đơn hàng không tồn tại' },
        { status: 404 }
      )
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { status }
    })

    const statusTexts = {
      pending: 'chờ xử lý',
      paid: 'đã thanh toán',
      failed: 'thất bại',
      cancelled: 'đã hủy'
    }

    return NextResponse.json({
      success: true,
      message: `Trạng thái đơn hàng đã được cập nhật thành "${statusTexts[status as keyof typeof statusTexts]}"`,
      order: updatedOrder
    })

  } catch (error) {
    console.error('Order status update error:', error)
    
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng' },
      { status: 500 }
    )
  }
}