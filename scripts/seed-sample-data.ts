import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedSampleData() {
  try {
    console.log('🌱 Seeding sample data...')

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'customer1@example.com' },
        update: {},
        create: {
          email: 'customer1@example.com',
          name: 'Nguyễn Văn A',
          password: hashedPassword,
          role: 'CUSTOMER',
          phone: '0901234567',
          address: '123 Đường ABC',
          city: 'Hồ Chí Minh',
          country: 'Vietnam'
        }
      }),
      prisma.user.upsert({
        where: { email: 'customer2@example.com' },
        update: {},
        create: {
          email: 'customer2@example.com',
          name: 'Trần Thị B',
          password: hashedPassword,
          role: 'CUSTOMER',
          phone: '0907654321',
          address: '456 Đường XYZ',
          city: 'Hà Nội',
          country: 'Vietnam'
        }
      }),
      prisma.user.upsert({
        where: { email: 'staff@example.com' },
        update: {},
        create: {
          email: 'staff@example.com',
          name: 'Lê Văn Staff',
          password: hashedPassword,
          role: 'STAFF',
          phone: '0909999999',
          address: '789 Đường Staff',
          city: 'Đà Nẵng',
          country: 'Vietnam'
        }
      })
    ])

    console.log('✅ Created users:', users.length)

    // Create sample products
    const products = await Promise.all([
      prisma.product.upsert({
        where: { id: 'netflix-premium' },
        update: {},
        create: {
          id: 'netflix-premium',
          name: 'Netflix Premium Account',
          description: 'Tài khoản Netflix Premium 1 tháng, chất lượng 4K Ultra HD',
          price: 150000,
          category: 'streaming',
          isActive: true,
          stock: 50,
          imageUrl: '/images/netflix.jpg'
        }
      }),
      prisma.product.upsert({
        where: { id: 'spotify-premium' },
        update: {},
        create: {
          id: 'spotify-premium',
          name: 'Spotify Premium Account',
          description: 'Tài khoản Spotify Premium 1 tháng, nghe nhạc không giới hạn',
          price: 80000,
          category: 'music',
          isActive: true,
          stock: 30,
          imageUrl: '/images/spotify.jpg'
        }
      }),
      prisma.product.upsert({
        where: { id: 'youtube-premium' },
        update: {},
        create: {
          id: 'youtube-premium',
          name: 'YouTube Premium Account',
          description: 'Tài khoản YouTube Premium 1 tháng, xem video không quảng cáo',
          price: 100000,
          category: 'streaming',
          isActive: true,
          stock: 25,
          imageUrl: '/images/youtube.jpg'
        }
      }),
      prisma.product.upsert({
        where: { id: 'canva-pro' },
        update: {},
        create: {
          id: 'canva-pro',
          name: 'Canva Pro Account',
          description: 'Tài khoản Canva Pro 1 tháng, thiết kế chuyên nghiệp',
          price: 120000,
          category: 'design',
          isActive: true,
          stock: 20,
          imageUrl: '/images/canva.jpg'
        }
      }),
      prisma.product.upsert({
        where: { id: 'office-365' },
        update: {},
        create: {
          id: 'office-365',
          name: 'Microsoft Office 365',
          description: 'Tài khoản Office 365 Personal 1 năm, đầy đủ ứng dụng',
          price: 500000,
          category: 'productivity',
          isActive: true,
          stock: 15,
          imageUrl: '/images/office365.jpg'
        }
      })
    ])

    console.log('✅ Created products:', products.length)

    // Create sample orders
    const orders = []
    
    // Order 1 - Paid
    const order1 = await prisma.order.create({
      data: {
        userId: users[0].id,
        total: 150000,
        status: 'paid',
        items: {
          create: [
            {
              productId: products[0].id,
              quantity: 1,
              price: 150000
            }
          ]
        }
      }
    })
    orders.push(order1)

    // Order 2 - Pending
    const order2 = await prisma.order.create({
      data: {
        userId: users[1].id,
        total: 180000,
        status: 'pending',
        items: {
          create: [
            {
              productId: products[1].id,
              quantity: 1,
              price: 80000
            },
            {
              productId: products[2].id,
              quantity: 1,
              price: 100000
            }
          ]
        }
      }
    })
    orders.push(order2)

    // Order 3 - Paid (today)
    const order3 = await prisma.order.create({
      data: {
        userId: users[0].id,
        total: 620000,
        status: 'paid',
        createdAt: new Date(),
        items: {
          create: [
            {
              productId: products[3].id,
              quantity: 1,
              price: 120000
            },
            {
              productId: products[4].id,
              quantity: 1,
              price: 500000
            }
          ]
        }
      }
    })
    orders.push(order3)

    console.log('✅ Created orders:', orders.length)

    // Final statistics
    const stats = await Promise.all([
      prisma.user.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pending' } })
    ])

    console.log('\n📊 Final Statistics:')
    console.log('Total Users:', stats[0])
    console.log('Active Products:', stats[1])
    console.log('Total Orders:', stats[2])
    console.log('Pending Orders:', stats[3])

    console.log('\n🎉 Sample data seeded successfully!')

  } catch (error) {
    console.error('❌ Error seeding data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedSampleData()
