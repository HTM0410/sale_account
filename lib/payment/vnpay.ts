import crypto from 'crypto'
import { paymentConfig } from '../payment-config'

function sortObject(obj: Record<string, string | number>): Record<string, string | number> {
  const sorted: Record<string, string | number> = {}
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = obj[key]
    })
  return sorted
}

export function buildVnpayPaymentUrl(params: {
  amount: number
  orderId: string
  ip: string
}): string {
  const vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'
  const returnUrl = `${paymentConfig.appUrl}/checkout/result`

  const vnpParams: Record<string, string | number> = {
    vnp_Version: paymentConfig.vnpay.version,
    vnp_Command: 'pay',
    vnp_TmnCode: paymentConfig.vnpay.tmnCode,
    vnp_Locale: paymentConfig.vnpay.locale,
    vnp_CurrCode: paymentConfig.vnpay.currCode,
    vnp_TxnRef: params.orderId,
    vnp_OrderInfo: `Thanh toan don hang ${params.orderId}`,
    vnp_OrderType: paymentConfig.vnpay.orderType,
    vnp_Amount: Math.round(params.amount) * 100,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: params.ip || '127.0.0.1',
    vnp_CreateDate: new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14),
  }

  const sorted = sortObject(vnpParams)
  const signData = Object.keys(sorted)
    .map((k) => `${k}=${sorted[k]}`)
    .join('&')

  const hmac = crypto.createHmac('sha512', paymentConfig.vnpay.hashSecret)
  const secureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

  const query = new URLSearchParams(sorted as Record<string, string>)
  query.append('vnp_SecureHash', secureHash)

  return `${vnpUrl}?${query.toString()}`
}

export function verifyVnpayReturn(queryParams: URLSearchParams): boolean {
  const params: Record<string, string> = {}
  queryParams.forEach((value, key) => {
    params[key] = value
  })

  const secureHash = params['vnp_SecureHash']
  delete params['vnp_SecureHash']
  delete params['vnp_SecureHashType']

  const sorted = Object.keys(params)
    .sort()
    .reduce((acc, key) => ({ ...acc, [key]: params[key] }), {} as Record<string, string>)

  const signData = Object.keys(sorted)
    .map((k) => `${k}=${sorted[k]}`)
    .join('&')

  const hmac = crypto.createHmac('sha512', paymentConfig.vnpay.hashSecret)
  const checkHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

  return checkHash === secureHash
}

