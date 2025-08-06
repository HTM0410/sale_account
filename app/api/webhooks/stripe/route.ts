import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'

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
        const paymentIntent = event.data.object
        console.log(`PaymentIntent ${paymentIntent.id} succeeded`)

        // Update order status if needed
        try {
          await prisma.order.updateMany({
            where: {
              metadata: {
                path: ['paymentIntentId'],
                equals: paymentIntent.id
              },
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
              }
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