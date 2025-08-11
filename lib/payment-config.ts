export const paymentConfig = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  vnpay: {
    tmnCode: process.env.VNPAY_TMN_CODE || '',
    hashSecret: process.env.VNPAY_HASH_SECRET || '',
    version: '2.1.0',
    locale: 'vn',
    currCode: 'VND',
    orderType: 'billpayment',
  },
}

