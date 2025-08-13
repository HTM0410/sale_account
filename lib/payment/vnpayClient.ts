export async function redirectToVnpay(params: { amount: number; orderId: string }) {
  const res = await fetch('/api/vnpay/create-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error('Failed to create VNPay payment')
  const data = await res.json()
  if (!data.paymentUrl) throw new Error('Missing payment URL')
  window.location.href = data.paymentUrl
}

