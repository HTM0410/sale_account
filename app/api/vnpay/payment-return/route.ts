import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { verifyVnpayReturn } from '@/lib/payment/vnpay'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const ok = verifyVnpayReturn(url.searchParams)
    if (!ok) {
      return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 })
    }

    const vnp_TxnRef = url.searchParams.get('vnp_TxnRef') || ''
    const vnp_ResponseCode = url.searchParams.get('vnp_ResponseCode')

    if (vnp_ResponseCode === '00') {
      await prisma.order.updateMany({
        where: { id: vnp_TxnRef },
        data: { status: 'paid', paidAt: new Date(), metadata: { paymentProvider: 'vnpay' } },
      })
      return NextResponse.json({ success: true })
    }

    await prisma.order.updateMany({
      where: { id: vnp_TxnRef },
      data: { status: 'failed', metadata: { paymentProvider: 'vnpay' } },
    })
    return NextResponse.json({ success: false })
  } catch (error) {
    console.error('VNPay return error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

