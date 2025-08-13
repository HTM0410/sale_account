import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { buildVnpayPaymentUrl } from '@/lib/payment/vnpay'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, orderId } = await request.json()
    if (!amount || !orderId) {
      return NextResponse.json({ error: 'Missing amount or orderId' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
    const paymentUrl = buildVnpayPaymentUrl({ amount, orderId, ip })
    return NextResponse.json({ paymentUrl })
  } catch (error) {
    console.error('VNPay create-payment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

