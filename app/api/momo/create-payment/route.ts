import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createMomoPaymentUrl } from '@/lib/payment/momo'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { 
        id: orderId,
        userId: user.id 
      },
      include: {
        items: {
          include: {
            product: true,
            productPackage: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: 'Order is not pending' },
        { status: 400 }
      )
    }

    // Create order info
    const orderInfo = `Thanh toan don hang ${order.id}`

    // Create Momo payment URL
    const result = await createMomoPaymentUrl(
      order.id,
      Math.round(order.total),
      orderInfo
    )

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Update order with payment method
    await prisma.order.update({
      where: { id: order.id },
      data: {
        metadata: {
          ...((order.metadata as any) || {}),
          paymentMethod: 'momo',
          paymentInitiated: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      success: true,
      paymentUrl: result.payUrl,
      orderId: order.id
    })

  } catch (error) {
    console.error('Momo payment creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
