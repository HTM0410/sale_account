import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { encrypt, generateSecurePassword, generateUsername } from '@/lib/encryption'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      console.error('No Stripe signature found')
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Verify webhook signature
    let event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log(`Received webhook event: ${event.type}`)

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any
        console.log(`PaymentIntent ${paymentIntent.id} succeeded`)

        // Update order status if needed
        try {
          await prisma.order.updateMany({
            where: {
              metadata: {
                path: ['paymentIntentId'],
                equals: paymentIntent.id
              } as any as any,
              status: 'pending'
            },
            data: {
              status: 'paid',
              paidAt: new Date()
            }
          })
          console.log(`Order updated for PaymentIntent ${paymentIntent.id}`)
        } catch (error) {
          console.error('Failed to update order:', error)
        }

        // Auto deliver credentials if order exists and not delivered yet
        try {
          const order = await prisma.order.findFirst({
            where: {
              metadata: {
                path: ['paymentIntentId'],
                equals: paymentIntent.id
              } as any
            },
            include: {
              user: {
                select: { id: true, email: true, name: true }
              },
              items: {
                include: {
                  product: { select: { name: true } },
                  productPackage: { select: { duration: true, description: true } }
                }
              },
              accountDelivery: true
            }
          })

          if (order && !order.accountDelivery) {
            const firstItem = order.items[0]
            const productName = firstItem?.product?.name || 'Premium Account'
            const durationMonths = firstItem?.productPackage?.duration || firstItem?.duration || 1
            const expirationDate = new Date()
            expirationDate.setMonth(expirationDate.getMonth() + durationMonths)

            const username = generateUsername(productName)
            const password = generateSecurePassword(16)
            const productSlug = productName.toLowerCase().replace(/[^a-z0-9]/g, '')
            const loginUrl = `https://accounts.${productSlug}.com` 
            const notes = 'Đây là thông tin tài khoản tự động được cung cấp sau khi thanh toán thành công.'

            const credentialsText = [
              `Username: ${username}`,
              `Password: ${password}`,
              `Login URL: ${loginUrl}`,
              `Expiration Date: ${expirationDate.toISOString().slice(0, 10)}`,
              `Notes: ${notes}`
            ].join('\n')

            await prisma.accountDelivery.create({
              data: {
                orderId: order.id,
                credentials: encrypt(credentialsText),
                deliveryStatus: 'delivered',
                deliveryNotes: 'Tự động giao qua Stripe webhook',
                sentAt: new Date()
              }
            })

            // Notify user
            try {
              await prisma.notification.create({
                data: {
                  userId: order.user.id || order.user.email || '',
                  type: 'credential_delivered',
                  message: `Tài khoản ${productName} của bạn đã được giao thành công.`,
                  metadata: {
                    orderId: order.id,
                    productName: productName,
                  },
                  isRead: false
                }
              })
            } catch (notificationError) {
              console.error('Failed to create auto-delivery notification:', notificationError)
            }

            console.log(`Auto delivered credentials for order ${order.id}`)
          }
        } catch (deliveryError) {
          console.error('Auto delivery error:', deliveryError)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        console.log(`PaymentIntent ${paymentIntent.id} failed`)

        // Update order status to failed
        try {
          await prisma.order.updateMany({
            where: {
              metadata: {
                path: ['paymentIntentId'],
                equals: paymentIntent.id
              } as any
            },
            data: {
              status: 'failed'
            }
          })
          console.log(`Order marked as failed for PaymentIntent ${paymentIntent.id}`)
        } catch (error) {
          console.error('Failed to update failed order:', error)
        }
        break
      }

      case 'customer.created': {
        const customer = event.data.object
        console.log(`Customer ${customer.id} created`)
        // You can sync customer data to your database here if needed
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        console.log(`Invoice ${invoice.id} payment succeeded`)
        // Handle recurring payments if you add subscriptions later
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object
        console.log(`Checkout session ${session.id} completed`)
        // Handle checkout completion if using Stripe Checkout
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}