import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { CartItem } from '@/lib/stores/cartStore'

export interface CreatePaymentIntentRequest {
  items: CartItem[]
  customerInfo: {
    email: string
    firstName: string
    lastName: string
    phone: string
    address: string
    city: string
    country: string
  }
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

    const { items, customerInfo }: CreatePaymentIntentRequest = await request.json()

    // Validate request data
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    if (!customerInfo || !customerInfo.email) {
      return NextResponse.json(
        { error: 'Customer information is required' },
        { status: 400 }
      )
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    // Convert to cents for Stripe (VND doesn't use cents, but Stripe expects integer)
    const stripeAmount = Math.round(totalAmount)

    // Create or retrieve Stripe customer
    let customer
    try {
      // Try to find existing customer by email
      const existingCustomers = await stripe.customers.list({
        email: customerInfo.email,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0]
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: customerInfo.email,
          name: `${customerInfo.firstName} ${customerInfo.lastName}`,
          phone: customerInfo.phone,
          address: {
            line1: customerInfo.address,
            city: customerInfo.city,
            country: customerInfo.country === 'Vietnam' ? 'VN' : customerInfo.country,
          },
          metadata: {
            userId: session.user.id || session.user.email || 'unknown',
          }
        })
      }
    } catch (error) {
      console.error('Error creating/finding customer:', error)
      // Continue without customer if there's an error
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
      currency: 'vnd', // Vietnamese Dong
      customer: customer?.id,
      description: `Payment for ${items.length} digital product(s)`,
      metadata: {
        userId: session.user.id || session.user.email || 'unknown',
        userEmail: session.user.email || customerInfo.email,
        itemCount: items.length.toString(),
        items: JSON.stringify(items.map(item => ({
          productId: item.productId,
          packageId: item.productPackageId,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))),
        customerInfo: JSON.stringify(customerInfo),
      },
      automatic_payment_methods: {
        enabled: true,
      },
      // Note: Cannot use both automatic_payment_methods and payment_method_types
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount,
    })

  } catch (error) {
    console.error('Error creating payment intent:', error)
    
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