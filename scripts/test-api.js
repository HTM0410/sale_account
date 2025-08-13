const { default: fetch } = require('node-fetch')

const BASE_URL = 'http://localhost:3000'

async function testAPI() {
  console.log('🧪 Testing Premium Account Marketplace APIs')
  console.log('=' .repeat(50))
  
  const results = {
    products: false,
    search: false,
    analytics: false,
    notifications: false
  }
  
  try {
    // Test Products API
    console.log('\n📦 Testing Products API...')
    const productsResponse = await fetch(`${BASE_URL}/api/products`)
    if (productsResponse.ok) {
      const productsData = await productsResponse.json()
      console.log(`✅ Products API: ${productsData.products?.length || 0} products loaded`)
      results.products = true
    } else {
      console.log(`❌ Products API failed: ${productsResponse.status}`)
    }
    
    // Test Search API
    console.log('\n🔍 Testing Search API...')
    const searchResponse = await fetch(`${BASE_URL}/api/products?search=netflix`)
    if (searchResponse.ok) {
      const searchData = await searchResponse.json()
      console.log(`✅ Search API: Found ${searchData.products?.length || 0} results for "netflix"`)
      results.search = true
    } else {
      console.log(`❌ Search API failed: ${searchResponse.status}`)
    }
    
    // Test Analytics API (will fail without auth, but should return 401)
    console.log('\n📊 Testing Analytics API...')
    const analyticsResponse = await fetch(`${BASE_URL}/api/analytics/track`)
    if (analyticsResponse.status === 401 || analyticsResponse.status === 405) {
      console.log(`✅ Analytics API: Properly protected (${analyticsResponse.status})`)
      results.analytics = true
    } else {
      console.log(`❌ Analytics API unexpected response: ${analyticsResponse.status}`)
    }
    
    // Test Notifications Stream (will fail without auth, but should return 401)
    console.log('\n🔔 Testing Notifications Stream...')
    const notificationsResponse = await fetch(`${BASE_URL}/api/notifications/stream`)
    if (notificationsResponse.status === 401) {
      console.log(`✅ Notifications Stream: Properly protected (401)`)
      results.notifications = true
    } else {
      console.log(`❌ Notifications Stream unexpected response: ${notificationsResponse.status}`)
    }
    
    // Test Static Pages
    console.log('\n🌐 Testing Static Pages...')
    const pages = [
      { path: '/', name: 'Homepage' },
      { path: '/products', name: 'Products Page' },
      { path: '/auth/signin', name: 'Sign In Page' },
      { path: '/cart', name: 'Cart Page' }
    ]
    
    for (const page of pages) {
      try {
        const pageResponse = await fetch(`${BASE_URL}${page.path}`)
        if (pageResponse.ok) {
          console.log(`✅ ${page.name}: Loaded successfully`)
        } else {
          console.log(`❌ ${page.name}: Failed (${pageResponse.status})`)
        }
      } catch (error) {
        console.log(`❌ ${page.name}: Error - ${error.message}`)
      }
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message)
  }
  
  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📋 API Test Summary:')
  
  const allPassed = Object.values(results).every(result => result === true)
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅' : '❌'
    const name = test.charAt(0).toUpperCase() + test.slice(1)
    console.log(`${status} ${name} API: ${passed ? 'PASS' : 'FAIL'}`)
  })
  
  console.log('\n🎯 Overall API Status:', allPassed ? '✅ ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED')
  
  return allPassed
}

// Run API tests
testAPI()
  .then(success => {
    console.log('\n🏁 API testing completed!')
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('💥 API testing crashed:', error)
    process.exit(1)
  })
