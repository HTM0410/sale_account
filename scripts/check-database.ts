import { prisma } from '../lib/db'

async function checkDatabase() {
  try {
    // Check users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })
    
    console.log('=== USERS ===')
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Created: ${user.createdAt.toLocaleDateString()}`)
    })
    
    // Check products
    const productsCount = await prisma.product.count()
    const products = await prisma.product.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        category: true,
        isActive: true
      }
    })
    
    console.log(`\n=== PRODUCTS (${productsCount} total) ===`)
    products.forEach(product => {
      console.log(`- ${product.name} (${product.category}) - Active: ${product.isActive}`)
    })
    
    // Check orders
    const ordersCount = await prisma.order.count()
    const orders = await prisma.order.findMany({
      take: 3,
      select: {
        id: true,
        status: true,
        total: true,
        user: {
          select: {
            email: true
          }
        }
      }
    })
    
    console.log(`\n=== ORDERS (${ordersCount} total) ===`)
    orders.forEach(order => {
      console.log(`- Order ${order.id.slice(-8)} - ${order.status} - ${order.total}đ - ${order.user?.email}`)
    })
    
    console.log('\n✅ Database check completed!')
    
  } catch (error) {
    console.error('❌ Database error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()