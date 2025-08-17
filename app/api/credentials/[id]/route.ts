import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/encryption'

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

    // Get the credential delivery record
    const delivery = await prisma.accountDelivery.findUnique({
      where: { id: params.id },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                email: true
              }
            },
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    description: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!delivery) {
      return NextResponse.json(
        { error: 'Credential delivery not found' },
        { status: 404 }
      )
    }

    // Check if user owns this credential
    const userId = session.user.id || session.user.email
    const orderUserId = delivery.order.user.id || delivery.order.user.email
    
    if (userId !== orderUserId) {
      return NextResponse.json(
        { error: 'Forbidden - You can only view your own credentials' },
        { status: 403 }
      )
    }

    // Decrypt credentials (fallback to plaintext for legacy/seeded data)
    let decryptedCredentials: string
    try {
      decryptedCredentials = decrypt(delivery.credentials)
    } catch (error) {
      console.warn('Decrypt failed; falling back to plaintext credentials')
      decryptedCredentials = delivery.credentials
    }

    // Mark notification as read if it exists
    try {
      await prisma.notification.updateMany({
        where: {
          userId: userId,
          type: 'credential_delivered',
          metadata: {
            path: ['orderId'],
            equals: delivery.orderId
          } as any,
          isRead: false
        },
        data: {
          isRead: true
        }
      })
    } catch (notificationError) {
      console.error('Failed to mark notification as read:', notificationError)
      // Don't fail the whole operation if notification update fails
    }

    return NextResponse.json({
      success: true,
      credential: {
        id: delivery.id,
        credentials: decryptedCredentials,
        deliveryStatus: delivery.deliveryStatus,
        deliveryNotes: delivery.deliveryNotes,
        sentAt: delivery.sentAt,
        product: delivery.order.items[0]?.product,
        orderId: delivery.orderId
      }
    })

  } catch (error) {
    console.error('Get credential error:', error)
    
    return NextResponse.json(
      { error: 'Failed to get credential' },
      { status: 500 }
    )
  }
} 