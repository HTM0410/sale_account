import { prisma } from '../lib/db'

async function seedTestData() {
  try {
    console.log('🌱 Seeding test data...')

    // Create some test orders
    const users = await prisma.user.findMany()
    const products = await prisma.product.findMany({
      include: { packages: true }
    })

    if (users.length > 0 && products.length > 0) {
      // Create test orders with different statuses
      const orderStatuses = ['pending', 'paid', 'failed', 'cancelled']
      
      for (let i = 0; i < 15; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)]
        const randomProduct = products[Math.floor(Math.random() * products.length)]
        const randomPackage = randomProduct.packages[0] // Use first package
        const randomStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)]
        
        if (randomPackage) {
          // Create order
          const order = await prisma.order.create({
            data: {
              userId: randomUser.id,
              total: randomPackage.price,
              status: randomStatus,
              metadata: {
                paymentIntentId: `pi_test_${Date.now()}_${i}`,
                customerInfo: {
                  name: randomUser.name || 'Test Customer',
                  email: randomUser.email,
                  phone: '0123456789',
                  address: '123 Test Street',
                  city: 'Ho Chi Minh City',
                  country: 'Vietnam'
                }
              },
              createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random within last 30 days
            }
          })
          
          // Create order item
          await prisma.orderItem.create({
            data: {
              orderId: order.id,
              productId: randomProduct.id,
              productPackageId: randomPackage.id,
              quantity: 1,
              price: randomPackage.price,
              metadata: {
                packageDuration: randomPackage.duration,
                packageDescription: randomPackage.description
              }
            }
          })
          
          // If order is paid, create account delivery (50% chance)
          if (randomStatus === 'paid' && Math.random() > 0.5) {
            const credentials = JSON.stringify({
              username: `user${i}@${randomProduct.name.toLowerCase().replace(/\s/g, '')}`,
              password: `pass${Date.now()}`,
              loginUrl: 'https://example.com/login',
              expiresAt: new Date(Date.now() + randomPackage.duration * 24 * 60 * 60 * 1000).toISOString(),
              notes: 'Test account delivery'
            })
            
            await prisma.accountDelivery.create({
              data: {
                orderId: order.id,
                credentials: credentials,
                deliveryStatus: Math.random() > 0.3 ? 'delivered' : 'pending',
                deliveryNotes: 'Automatically generated test delivery',
                sentAt: Math.random() > 0.5 ? new Date() : null
              }
            })
          }
        }
      }
      
      // Add some cart items for test
      for (let i = 0; i < 5; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)]
        const randomProduct = products[Math.floor(Math.random() * products.length)]
        const randomPackage = randomProduct.packages[0]
        
        if (randomPackage) {
          // Find or create cart
          let cart = await prisma.cart.findFirst({
            where: { userId: randomUser.id }
          })
          
          if (!cart) {
            cart = await prisma.cart.create({
              data: { userId: randomUser.id }
            })
          }
          
          // Add cart item (if not exists)
          const existingItem = await prisma.cartItem.findFirst({
            where: {
              cartId: cart.id,
              productId: randomProduct.id,
              productPackageId: randomPackage.id
            }
          })
          
          if (!existingItem) {
            await prisma.cartItem.create({
              data: {
                cartId: cart.id,
                productId: randomProduct.id,
                productPackageId: randomPackage.id,
                quantity: 1
              }
            })
          }
        }
      }
      
      console.log('✅ Test data created successfully!')
      
      // Show summary
      const ordersCount = await prisma.order.count()
      const deliveriesCount = await prisma.accountDelivery.count()
      const cartItemsCount = await prisma.cartItem.count()
      
      console.log(`📊 Summary:`)
      console.log(`- Orders: ${ordersCount}`)
      console.log(`- Account Deliveries: ${deliveriesCount}`)  
      console.log(`- Cart Items: ${cartItemsCount}`)
      
    } else {
      console.log('❌ Need users and products to create test orders')
    }
    
  } catch (error) {
    console.error('❌ Error seeding data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedTestData()