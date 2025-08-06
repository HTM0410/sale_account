import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { CartItem } from '@/lib/stores/cartStore'

export interface CreateOrderRequest {
  paymentIntentId: string
  customerInfo: {
    email: string
    firstName: string
    lastName: string
    phone: string
    address: string
    city: string
    country: string
  }
  items: CartItem[]
  total: number
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { paymentIntentId, customerInfo, items, total }: CreateOrderRequest = await request.json()

    // Validate request data
    if (!paymentIntentId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      )
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not confirmed' },
        { status: 400 }
      )
    }

    // Verify the payment amount matches
    const expectedAmount = Math.round(total)
    if (paymentIntent.amount !== expectedAmount) {
      return NextResponse.json(
        { error: 'Payment amount mismatch' },
        { status: 400 }
      )
    }

    // Check if order already exists for this payment intent
    const existingOrder = await prisma.order.findFirst({
      where: {
        metadata: {
          path: ['paymentIntentId'],
          equals: paymentIntentId
        }
      }
    })

    if (existingOrder) {
      return NextResponse.json(existingOrder)
    }

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId: session.user.id || session.user.email || '',
        total: total,
        status: 'paid',
        paidAt: new Date(),
        metadata: {
          paymentIntentId: paymentIntentId,
          customerInfo: customerInfo,
          stripeCustomerId: paymentIntent.customer as string || undefined,
        },
        items: {
          create: items.map(item => ({
            productId: item.productId,
            productPackageId: item.productPackageId,
            quantity: item.quantity,
            price: item.price,
            duration: item.duration || null,
            // Additional metadata for the order item
            metadata: {
              productName: item.name,
              packageDescription: item.description || null,
              packageInfo: item.packageInfo || null,
            }
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true,
            productPackage: true,
          }
        }
      }
    })

    // TODO: Trigger account delivery process
    // This could be done via queue/webhook or immediate processing
    console.log(`Order ${order.id} created successfully for user ${session.user.email}`)

    // Optional: Send confirmation email
    // await sendOrderConfirmationEmail(order, customerInfo)

    // Optional: Update product stock
    for (const item of items) {
      try {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      } catch (error) {
        console.error(`Failed to update stock for product ${item.productId}:`, error)
        // Continue processing even if stock update fails
      }
    }

    return NextResponse.json({
      id: order.id,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
      items: order.items.length,
      message: 'Order created successfully'
    })

  } catch (error) {
    console.error('Error creating order:', error)
    
    // Return appropriate error response
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}