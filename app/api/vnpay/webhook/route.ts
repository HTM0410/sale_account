import { NextRequest, NextResponse } from 'next/server'
import { verifyVnpayReturn } from '@/lib/payment/vnpay'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Convert body to URLSearchParams for verification
    const params = new URLSearchParams()
    Object.entries(body).forEach(([key, value]) => {
      if (typeof value === 'string') {
        params.append(key, value)
      }
    })

    // Verify signature
    if (!verifyVnpayReturn(params)) {
      console.error('Invalid VNPay webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const {
      vnp_TxnRef: orderId,
      vnp_ResponseCode: responseCode,
      vnp_TransactionNo: transactionNo,
      vnp_BankCode: bankCode,
      vnp_Amount: amount
    } = body

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true,
            productPackage: true
          }
        }
      }
    })

    if (!order) {
      console.error(`Order not found: ${orderId}`)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if payment was successful
    if (responseCode === '00') {
      // Update order status to paid
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'paid',
          paidAt: new Date(),
          metadata: {
            ...((order.metadata as any) || {}),
            paymentProvider: 'vnpay',
            vnpayResponseCode: responseCode,
            vnpayTransactionNo: transactionNo,
            vnpayBankCode: bankCode,
            vnpayAmount: amount
          }
        }
      })

      // Create notification for user
      try {
        const notification = await prisma.notification.create({
          data: {
            userId: order.userId,
            type: 'payment_success',
            message: `Thanh toán đơn hàng ${orderId} đã thành công qua VNPay.`,
            metadata: {
              orderId,
              paymentProvider: 'vnpay',
              transactionNo,
              amount: order.total
            },
            isRead: false
          }
        })

        // Send real-time notification
        // const { sendNotificationToUser } = await import('../../notifications/stream/route')
        // await sendNotificationToUser(order.userId, notification)
      } catch (notificationError) {
        console.error('Failed to create payment success notification:', notificationError)
      }

      // TODO: Trigger automatic credential delivery if configured
      console.log(`VNPay payment successful for order ${orderId}, transaction ${transactionNo}`)

    } else {
      // Update order status to failed
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'failed',
          metadata: {
            ...((order.metadata as any) || {}),
            paymentProvider: 'vnpay',
            vnpayResponseCode: responseCode,
            vnpayAmount: amount,
            failureReason: `VNPay payment failed with code ${responseCode}`
          }
        }
      })

      // Create notification for user
      try {
        const notification = await prisma.notification.create({
          data: {
            userId: order.userId,
            type: 'payment_failed',
            message: `Thanh toán đơn hàng ${orderId} qua VNPay đã thất bại.`,
            metadata: {
              orderId,
              paymentProvider: 'vnpay',
              responseCode,
              amount: order.total
            },
            isRead: false
          }
        })

        // Send real-time notification
        // const { sendNotificationToUser } = await import('../../notifications/stream/route')
        // await sendNotificationToUser(order.userId, notification)
      } catch (notificationError) {
        console.error('Failed to create payment failed notification:', notificationError)
      }

      console.log(`VNPay payment failed for order ${orderId}, response code ${responseCode}`)
    }

    // Return success response to VNPay
    return NextResponse.json({
      RspCode: '00',
      Message: 'success'
    })

  } catch (error) {
    console.error('VNPay webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle GET requests for VNPay return URL
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams

    // Verify signature
    if (!verifyVnpayReturn(searchParams)) {
      console.error('Invalid VNPay return signature')
      return NextResponse.redirect(
        new URL('/checkout/result?error=invalid_signature', request.url)
      )
    }

    const orderId = searchParams.get('vnp_TxnRef')
    const responseCode = searchParams.get('vnp_ResponseCode')

    if (!orderId || !responseCode) {
      return NextResponse.redirect(
        new URL('/checkout/result?error=missing_params', request.url)
      )
    }

    // Redirect to result page with parameters
    const resultUrl = new URL('/checkout/result', request.url)
    searchParams.forEach((value, key) => {
      resultUrl.searchParams.set(key, value)
    })

    return NextResponse.redirect(resultUrl)

  } catch (error) {
    console.error('VNPay return handling error:', error)
    return NextResponse.redirect(
      new URL('/checkout/result?error=processing_error', request.url)
    )
  }
}
