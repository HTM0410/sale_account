import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Netflix Premium 1 tháng',
        category: 'streaming',
        description: 'Tài khoản Netflix Premium với chất lượng 4K, hỗ trợ 4 thiết bị cùng lúc',
        price: 150000,
        stock: 50,
        imageUrl: '/images/netflix.jpg',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Spotify Premium 3 tháng',
        category: 'music',
        description: 'Nghe nhạc không quảng cáo, tải offline, chất lượng cao',
        price: 200000,
        stock: 30,
        imageUrl: '/images/spotify.jpg',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Adobe Creative Cloud 1 tháng',
        category: 'software',
        description: 'Bộ công cụ thiết kế chuyên nghiệp: Photoshop, Illustrator, Premiere Pro',
        price: 450000,
        stock: 20,
        imageUrl: '/images/adobe.jpg',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Canva Pro 6 tháng',
        category: 'design',
        description: 'Công cụ thiết kế online với hàng triệu template và elements premium',
        price: 300000,
        stock: 40,
        imageUrl: '/images/canva.jpg',
      },
    }),
    prisma.product.create({
      data: {
        name: 'YouTube Premium 2 tháng',
        category: 'streaming',
        description: 'Xem video không quảng cáo, nghe nhạc nền, tải offline',
        price: 120000,
        stock: 60,
        imageUrl: '/images/youtube.jpg',
      },
    }),
  ])

  // Create sample admin user (upsert to avoid duplicate)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10), // Password: admin123
      name: 'Admin User',
      role: 'ADMIN',
      language: 'vi',
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log(`📦 Created ${products.length} products`)
  console.log(`👤 Created admin user: ${adminUser.email}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })