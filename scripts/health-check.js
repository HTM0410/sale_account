const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function healthCheck() {
  console.log('🏥 Premium Account Marketplace - Health Check')
  console.log('=' .repeat(50))
  
  const results = {
    database: false,
    products: false,
    users: false,
    orders: false,
    notifications: false,
    searchHistory: false
  }
  
  try {
    // Database connection
    console.log('\n🔍 Checking database connection...')
    await prisma.$queryRaw`SELECT 1`
    results.database = true
    console.log('✅ Database connection: OK')
    
    // Products check
    console.log('\n📦 Checking products...')
    const productCount = await prisma.product.count()
    const activeProducts = await prisma.product.count({ where: { isActive: true } })
    results.products = productCount > 0
    console.log(`✅ Products: ${productCount} total, ${activeProducts} active`)
    
    // Users check
    console.log('\n👥 Checking users...')
    const userCount = await prisma.user.count()
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
    results.users = userCount > 0
    console.log(`✅ Users: ${userCount} total, ${adminCount} admin(s)`)
    
    // Orders check
    console.log('\n🛒 Checking orders...')
    const orderCount = await prisma.order.count()
    const paidOrders = await prisma.order.count({ where: { status: 'paid' } })
    results.orders = true // Orders can be 0 initially
    console.log(`✅ Orders: ${orderCount} total, ${paidOrders} paid`)
    
    // Notifications check
    console.log('\n🔔 Checking notifications...')
    const notificationCount = await prisma.notification.count()
    const unreadNotifications = await prisma.notification.count({ where: { isRead: false } })
    results.notifications = true // Notifications can be 0 initially
    console.log(`✅ Notifications: ${notificationCount} total, ${unreadNotifications} unread`)
    
    // Search history check
    console.log('\n🔍 Checking search history...')
    const searchHistoryCount = await prisma.searchHistory.count()
    results.searchHistory = true // Search history can be 0 initially
    console.log(`✅ Search history: ${searchHistoryCount} entries`)
    
    // Product packages check
    console.log('\n📋 Checking product packages...')
    const packageCount = await prisma.productPackage.count()
    const activePackages = await prisma.productPackage.count({ where: { isActive: true } })
    console.log(`✅ Product packages: ${packageCount} total, ${activePackages} active`)
    
    // Recent activity
    console.log('\n📊 Recent activity:')
    const recentOrders = await prisma.order.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } },
        items: { include: { product: { select: { name: true } } } }
      }
    })
    
    if (recentOrders.length > 0) {
      recentOrders.forEach(order => {
        console.log(`  📦 Order ${order.id.slice(-8)} - ${order.status} - ${order.total.toLocaleString('vi-VN')} VND`)
      })
    } else {
      console.log('  📦 No recent orders')
    }
    
  } catch (error) {
    console.error('❌ Health check failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
  
  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📋 Health Check Summary:')
  
  const allPassed = Object.values(results).every(result => result === true)
  
  Object.entries(results).forEach(([check, passed]) => {
    const status = passed ? '✅' : '❌'
    const name = check.charAt(0).toUpperCase() + check.slice(1)
    console.log(`${status} ${name}: ${passed ? 'PASS' : 'FAIL'}`)
  })
  
  console.log('\n🎯 Overall Status:', allPassed ? '✅ HEALTHY' : '⚠️  ISSUES DETECTED')
  
  if (allPassed) {
    console.log('\n🚀 System is ready for production!')
  }
  
  return allPassed
}

// Run health check
healthCheck()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('💥 Health check crashed:', error)
    process.exit(1)
  })
