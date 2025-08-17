import { NextRequest, NextResponse } from 'next/server'
import { verifyMomoNotification, isMomoPaymentSuccessful, type MomoNotification } from '@/lib/payment/momo'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const notification: MomoNotification = await request.json()

    // Verify signature
    if (!verifyMomoNotification(notification)) {
      console.error('Invalid Momo notification signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const { orderId, resultCode, transId, amount } = notification

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
    if (isMomoPaymentSuccessful(resultCode)) {
      // Update order status to paid
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'paid',
          paidAt: new Date(),
          metadata: {
            ...((order.metadata as any) || {}),
            paymentProvider: 'momo',
            transactionId: transId.toString(),
            momoResultCode: resultCode,
            momoAmount: amount
          }
        }
      })

      // Create notification for user
      try {
        const notification = await prisma.notification.create({
          data: {
            userId: order.userId,
            type: 'payment_success',
            message: `Thanh toán đơn hàng ${orderId} đã thành công qua Momo.`,
            metadata: {
              orderId,
              paymentProvider: 'momo',
              transactionId: transId.toString(),
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
      console.log(`Momo payment successful for order ${orderId}, transaction ${transId}`)

    } else {
      // Update order status to failed
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'failed',
          metadata: {
            ...((order.metadata as any) || {}),
            paymentProvider: 'momo',
            momoResultCode: resultCode,
            momoAmount: amount,
            failureReason: `Momo payment failed with code ${resultCode}`
          }
        }
      })

      // Create notification for user
      try {
        const notification = await prisma.notification.create({
          data: {
            userId: order.userId,
            type: 'payment_failed',
            message: `Thanh toán đơn hàng ${orderId} qua Momo đã thất bại.`,
            metadata: {
              orderId,
              paymentProvider: 'momo',
              resultCode,
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

      console.log(`Momo payment failed for order ${orderId}, result code ${resultCode}`)
    }

    // Return success response to Momo
    return NextResponse.json({
      partnerCode: notification.partnerCode,
      orderId: notification.orderId,
      requestId: notification.requestId,
      resultCode: 0,
      message: 'success',
      responseTime: Date.now()
    })

  } catch (error) {
    console.error('Momo webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
