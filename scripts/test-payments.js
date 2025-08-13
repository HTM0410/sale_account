const { default: fetch } = require('node-fetch')

const BASE_URL = 'http://localhost:3000'

async function testPayments() {
  console.log('💳 Testing Payment Integration')
  console.log('=' .repeat(50))
  
  const results = {
    stripe: false,
    vnpay: false,
    momo: false,
    webhooks: false
  }
  
  try {
    // Test Stripe Payment Intent Creation (should fail without auth)
    console.log('\n💳 Testing Stripe Integration...')
    const stripeResponse = await fetch(`${BASE_URL}/api/payment/create-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 100000 })
    })
    
    if (stripeResponse.status === 401) {
      console.log('✅ Stripe API: Properly protected (requires authentication)')
      results.stripe = true
    } else if (stripeResponse.status === 400) {
      console.log('✅ Stripe API: Validation working (bad request)')
      results.stripe = true
    } else {
      console.log(`❌ Stripe API unexpected response: ${stripeResponse.status}`)
    }
    
    // Test VNPay Payment Creation (should fail without auth)
    console.log('\n🏦 Testing VNPay Integration...')
    const vnpayResponse = await fetch(`${BASE_URL}/api/vnpay/create-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: 'test-order' })
    })
    
    if (vnpayResponse.status === 401) {
      console.log('✅ VNPay API: Properly protected (requires authentication)')
      results.vnpay = true
    } else {
      console.log(`❌ VNPay API unexpected response: ${vnpayResponse.status}`)
    }
    
    // Test Momo Payment Creation (should fail without auth)
    console.log('\n📱 Testing Momo Integration...')
    const momoResponse = await fetch(`${BASE_URL}/api/momo/create-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: 'test-order' })
    })
    
    if (momoResponse.status === 401) {
      console.log('✅ Momo API: Properly protected (requires authentication)')
      results.momo = true
    } else {
      console.log(`❌ Momo API unexpected response: ${momoResponse.status}`)
    }
    
    // Test Webhook Endpoints
    console.log('\n🔗 Testing Webhook Endpoints...')
    
    // Test Stripe Webhook
    const stripeWebhookResponse = await fetch(`${BASE_URL}/api/webhooks/stripe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'test' })
    })
    
    // Test VNPay Webhook
    const vnpayWebhookResponse = await fetch(`${BASE_URL}/api/vnpay/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vnp_TxnRef: 'test' })
    })
    
    // Test Momo Webhook
    const momoWebhookResponse = await fetch(`${BASE_URL}/api/momo/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: 'test' })
    })
    
    // Webhooks should return 400 or 500 for invalid data, not 404
    const webhookStatuses = [
      stripeWebhookResponse.status,
      vnpayWebhookResponse.status,
      momoWebhookResponse.status
    ]
    
    const webhooksWorking = webhookStatuses.every(status => 
      status !== 404 && status !== 405
    )
    
    if (webhooksWorking) {
      console.log('✅ Webhook Endpoints: All endpoints accessible')
      results.webhooks = true
    } else {
      console.log('❌ Webhook Endpoints: Some endpoints not found')
      console.log(`   Stripe: ${stripeWebhookResponse.status}`)
      console.log(`   VNPay: ${vnpayWebhookResponse.status}`)
      console.log(`   Momo: ${momoWebhookResponse.status}`)
    }
    
    // Test Payment Result Page
    console.log('\n📄 Testing Payment Result Page...')
    const resultPageResponse = await fetch(`${BASE_URL}/checkout/result`)
    if (resultPageResponse.ok) {
      console.log('✅ Payment Result Page: Accessible')
    } else {
      console.log(`❌ Payment Result Page: Failed (${resultPageResponse.status})`)
    }
    
    // Test Payment Configuration
    console.log('\n⚙️  Testing Payment Configuration...')
    
    // Check if environment variables are set (indirectly)
    const hasStripeConfig = process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    const hasVNPayConfig = process.env.VNPAY_TMN_CODE || process.env.VNPAY_HASH_SECRET
    const hasMomoConfig = process.env.MOMO_PARTNER_CODE || process.env.MOMO_SECRET_KEY
    
    console.log(`${hasStripeConfig ? '✅' : '⚠️ '} Stripe Configuration: ${hasStripeConfig ? 'Detected' : 'Missing env vars'}`)
    console.log(`${hasVNPayConfig ? '✅' : '⚠️ '} VNPay Configuration: ${hasVNPayConfig ? 'Detected' : 'Missing env vars'}`)
    console.log(`${hasMomoConfig ? '✅' : '⚠️ '} Momo Configuration: ${hasMomoConfig ? 'Detected' : 'Missing env vars'}`)
    
  } catch (error) {
    console.error('❌ Payment test failed:', error.message)
  }
  
  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📋 Payment Test Summary:')
  
  const allPassed = Object.values(results).every(result => result === true)
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅' : '❌'
    const name = test.charAt(0).toUpperCase() + test.slice(1)
    console.log(`${status} ${name} Integration: ${passed ? 'PASS' : 'FAIL'}`)
  })
  
  console.log('\n🎯 Overall Payment Status:', allPassed ? '✅ ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED')
  
  // Payment Methods Summary
  console.log('\n💳 Payment Methods Available:')
  console.log('✅ Stripe: International cards (Visa, Mastercard, Amex)')
  console.log('✅ VNPay: Vietnamese banks and e-wallets')
  console.log('✅ Momo: Vietnamese mobile wallet')
  
  return allPassed
}

// Run payment tests
testPayments()
  .then(success => {
    console.log('\n🏁 Payment testing completed!')
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('💥 Payment testing crashed:', error)
    process.exit(1)
  })
