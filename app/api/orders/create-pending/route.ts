import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { items, customerInfo, total } = await request.json()
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Find user by email to get the correct user ID
    console.log('Session user email:', session.user.email)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    console.log('Found user:', user ? user.id : 'null')
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total: Math.round(total || 0),
        status: 'pending',
        metadata: {
          customerInfo,
          items,
          paymentProvider: 'vnpay',
        },
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productPackageId: item.productPackageId || null,
            quantity: item.quantity,
            price: item.price,
            duration: item.duration || null,
            metadata: {
              productName: item.name,
              packageDescription: item.description || null,
              packageInfo: item.packageInfo || null,
            },
          })),
        },
      },
    })

    return NextResponse.json({ orderId: order.id, total: order.total })
  } catch (error) {
    console.error('Create pending order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

