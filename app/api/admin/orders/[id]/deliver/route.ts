import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { encrypt } from '@/lib/encryption'

export async function POST(
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
    const { credentials, deliveryNotes } = await request.json()

    if (!credentials) {
      return NextResponse.json(
        { error: 'Credentials is required' },
        { status: 400 }
      )
    }

    // Check if order exists and is paid
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        },
        accountDelivery: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.status !== 'paid') {
      return NextResponse.json(
        { error: 'Order must be paid before delivering credentials' },
        { status: 400 }
      )
    }

    // Encrypt credentials for security
    const encryptedCredentials = encrypt(credentials)

    if (order.accountDelivery) {
      // Update existing delivery
      await prisma.accountDelivery.update({
        where: { id: order.accountDelivery.id },
        data: {
          credentials: encryptedCredentials,
          deliveryStatus: 'delivered',
          deliveryNotes: deliveryNotes || 'Credentials updated',
          sentAt: new Date()
        }
      })
    } else {
      // Create new delivery
      await prisma.accountDelivery.create({
        data: {
          orderId: order.id,
          credentials: encryptedCredentials,
          deliveryStatus: 'delivered',
          deliveryNotes: deliveryNotes || 'Credentials delivered',
          sentAt: new Date()
        }
      })
    }

    // Create notification for user
    try {
      await prisma.notification.create({
        data: {
          userId: order.user.id || order.user.email || '',
          type: 'credential_delivered',
          message: `Tài khoản ${order.items[0]?.product.name} của bạn đã được giao thành công.`,
          metadata: {
            orderId: order.id,
            productName: order.items[0]?.product.name,
          },
          isRead: false
        }
      })
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError)
      // Don't fail the whole operation if notification creation fails
    }

    // Log the delivery action
    console.log(`Admin ${session.user.email} delivered credentials for order ${order.id}`)

    return NextResponse.json({
      success: true,
      message: 'Credentials delivered successfully',
      notification: 'User has been notified'
    })

  } catch (error) {
    console.error('Credential delivery error:', error)
    
    return NextResponse.json(
      { error: 'Failed to deliver credentials' },
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

    // Get delivery status
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        accountDelivery: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      delivery: order.accountDelivery,
      canDeliver: order.status === 'paid'
    })

  } catch (error) {
    console.error('Get delivery status error:', error)
    
    return NextResponse.json(
      { error: 'Failed to get delivery status' },
      { status: 500 }
    )
  }
} 