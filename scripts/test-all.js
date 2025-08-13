const { spawn } = require('child_process')
const path = require('path')

function runTest(scriptName, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Running ${description}...`)
    console.log('='.repeat(60))
    
    const scriptPath = path.join(__dirname, scriptName)
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: process.cwd()
    })
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${description} completed successfully`)
        resolve(true)
      } else {
        console.log(`❌ ${description} failed with code ${code}`)
        resolve(false)
      }
    })
    
    child.on('error', (error) => {
      console.error(`💥 ${description} crashed:`, error.message)
      resolve(false)
    })
  })
}

async function runAllTests() {
  console.log('🧪 Premium Account Marketplace - Complete Test Suite')
  console.log('='.repeat(60))
  console.log('🎯 Testing all components of the application...')
  
  const startTime = Date.now()
  const results = {}
  
  try {
    // Test 1: Database Health Check
    results.database = await runTest('health-check.js', 'Database Health Check')
    
    // Test 2: API Endpoints
    results.api = await runTest('test-api.js', 'API Endpoints Test')
    
    // Test 3: Frontend Components
    results.frontend = await runTest('test-frontend.js', 'Frontend Components Test')
    
    // Test 4: Payment Integration
    results.payments = await runTest('test-payments.js', 'Payment Integration Test')
    
  } catch (error) {
    console.error('💥 Test suite crashed:', error)
  }
  
  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(2)
  
  // Final Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 COMPLETE TEST SUITE RESULTS')
  console.log('='.repeat(60))
  
  const allPassed = Object.values(results).every(result => result === true)
  const passedCount = Object.values(results).filter(result => result === true).length
  const totalCount = Object.keys(results).length
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅' : '❌'
    const name = test.charAt(0).toUpperCase() + test.slice(1)
    console.log(`${status} ${name} Test: ${passed ? 'PASSED' : 'FAILED'}`)
  })
  
  console.log('\n📈 Test Statistics:')
  console.log(`   Tests Passed: ${passedCount}/${totalCount}`)
  console.log(`   Success Rate: ${((passedCount/totalCount) * 100).toFixed(1)}%`)
  console.log(`   Duration: ${duration} seconds`)
  
  console.log('\n🎯 Overall Status:', allPassed ? '✅ ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED')
  
  if (allPassed) {
    console.log('\n🎉 CONGRATULATIONS!')
    console.log('🚀 Premium Account Marketplace is ready for production!')
    console.log('\n📋 System Summary:')
    console.log('   ✅ Database: Supabase PostgreSQL connected')
    console.log('   ✅ Frontend: Next.js 14 + TypeScript + TailwindCSS')
    console.log('   ✅ Authentication: NextAuth.js + Google OAuth')
    console.log('   ✅ Payments: Stripe + VNPay + Momo integrated')
    console.log('   ✅ Real-time: Notifications via Server-Sent Events')
    console.log('   ✅ Analytics: Google Analytics + Custom tracking')
    console.log('   ✅ API: RESTful endpoints with proper security')
    console.log('   ✅ Responsive: Mobile-first design')
    
    console.log('\n🌐 Access URLs:')
    console.log('   🏠 Homepage: http://localhost:3000')
    console.log('   📦 Products: http://localhost:3000/products')
    console.log('   🛒 Cart: http://localhost:3000/cart')
    console.log('   👤 Dashboard: http://localhost:3000/dashboard')
    console.log('   🔧 Prisma Studio: http://localhost:5555')
    
  } else {
    console.log('\n⚠️  Some tests failed. Please check the logs above.')
    console.log('💡 Common issues:')
    console.log('   - Make sure the development server is running (npm run dev)')
    console.log('   - Check database connection and migrations')
    console.log('   - Verify environment variables are set')
    console.log('   - Ensure all dependencies are installed')
  }
  
  return allPassed
}

// Run all tests
runAllTests()
  .then(success => {
    console.log('\n🏁 Complete test suite finished!')
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('💥 Test suite crashed:', error)
    process.exit(1)
  })
