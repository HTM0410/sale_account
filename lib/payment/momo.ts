import crypto from 'crypto'
import { paymentConfig } from '../payment-config'

export interface MomoPaymentRequest {
  partnerCode: string
  partnerName: string
  storeId: string
  requestId: string
  amount: number
  orderId: string
  orderInfo: string
  redirectUrl: string
  ipnUrl: string
  lang: string
  extraData: string
  requestType: string
  signature: string
}

export interface MomoPaymentResponse {
  partnerCode: string
  orderId: string
  requestId: string
  amount: number
  responseTime: number
  message: string
  resultCode: number
  payUrl?: string
  deeplink?: string
  qrCodeUrl?: string
}

export interface MomoNotification {
  partnerCode: string
  orderId: string
  requestId: string
  amount: number
  orderInfo: string
  orderType: string
  transId: number
  resultCode: number
  message: string
  payType: string
  responseTime: number
  extraData: string
  signature: string
}

/**
 * Create HMAC SHA256 signature for Momo
 */
function createMomoSignature(data: string, secretKey: string): string {
  return crypto
    .createHmac('sha256', secretKey)
    .update(data, 'utf-8')
    .digest('hex')
}

/**
 * Create Momo payment request
 */
export function createMomoPaymentRequest(
  orderId: string,
  amount: number,
  orderInfo: string
): MomoPaymentRequest {
  const { momo } = paymentConfig
  
  const requestId = `${orderId}_${Date.now()}`
  const extraData = ''
  const requestType = 'payWithATM'
  
  // Create signature
  const rawSignature = `accessKey=${momo.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${momo.notifyUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${momo.partnerCode}&redirectUrl=${momo.returnUrl}&requestId=${requestId}&requestType=${requestType}`
  
  const signature = createMomoSignature(rawSignature, momo.secretKey)
  
  return {
    partnerCode: momo.partnerCode,
    partnerName: 'Premium Account Marketplace',
    storeId: momo.partnerCode,
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl: momo.returnUrl,
    ipnUrl: momo.notifyUrl,
    lang: 'vi',
    extraData,
    requestType,
    signature,
  }
}

/**
 * Send payment request to Momo
 */
export async function sendMomoPaymentRequest(
  paymentRequest: MomoPaymentRequest
): Promise<MomoPaymentResponse> {
  const { momo } = paymentConfig
  
  const response = await fetch(momo.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentRequest),
  })
  
  if (!response.ok) {
    throw new Error(`Momo API error: ${response.status}`)
  }
  
  return response.json()
}

/**
 * Verify Momo notification signature
 */
export function verifyMomoNotification(notification: MomoNotification): boolean {
  const { momo } = paymentConfig
  
  const rawSignature = `accessKey=${momo.accessKey}&amount=${notification.amount}&extraData=${notification.extraData}&message=${notification.message}&orderId=${notification.orderId}&orderInfo=${notification.orderInfo}&orderType=${notification.orderType}&partnerCode=${notification.partnerCode}&payType=${notification.payType}&requestId=${notification.requestId}&responseTime=${notification.responseTime}&resultCode=${notification.resultCode}&transId=${notification.transId}`
  
  const expectedSignature = createMomoSignature(rawSignature, momo.secretKey)
  
  return expectedSignature === notification.signature
}

/**
 * Check if Momo payment was successful
 */
export function isMomoPaymentSuccessful(resultCode: number): boolean {
  return resultCode === 0
}

/**
 * Get Momo response message
 */
export function getMomoResponseMessage(resultCode: number): string {
  const messages: Record<number, string> = {
    0: 'Giao dịch thành công',
    9000: 'Giao dịch được xác nhận thành công',
    8000: 'Giao dịch đang được xử lý',
    7000: 'Giao dịch bị từ chối bởi người dùng',
    6000: 'Giao dịch bị từ chối bởi ngân hàng',
    5000: 'Giao dịch bị từ chối (Lỗi không xác định)',
    4000: 'Giao dịch bị từ chối do vượt quá số tiền thanh toán hàng ngày',
    3000: 'Giao dịch bị hủy',
    2000: 'Giao dịch bị từ chối do sai thông tin',
    1000: 'Giao dịch bị từ chối do tài khoản người dùng bị khóa',
    10: 'Lỗi không xác định',
    11: 'Truy cập bị từ chối',
    12: 'Phiên bản API không được hỗ trợ cho yêu cầu này',
    13: 'Mã xác thực không chính xác',
    20: 'Yêu cầu bị từ chối do lỗi nghiệp vụ',
    21: 'Số tiền không hợp lệ',
    40: 'RequestId bị trùng',
    41: 'OrderId bị trùng',
    42: 'OrderId không hợp lệ hoặc không được tìm thấy',
    43: 'Yêu cầu bị từ chối do thông tin đơn hàng không hợp lệ',
  }
  
  return messages[resultCode] || 'Lỗi không xác định'
}

/**
 * Create Momo payment URL
 */
export async function createMomoPaymentUrl(
  orderId: string,
  amount: number,
  orderInfo: string
): Promise<{ payUrl?: string; error?: string }> {
  try {
    const paymentRequest = createMomoPaymentRequest(orderId, amount, orderInfo)
    const response = await sendMomoPaymentRequest(paymentRequest)
    
    if (response.resultCode === 0 && response.payUrl) {
      return { payUrl: response.payUrl }
    } else {
      return { error: getMomoResponseMessage(response.resultCode) }
    }
  } catch (error) {
    console.error('Momo payment URL creation error:', error)
    return { error: 'Không thể tạo URL thanh toán Momo' }
  }
}
