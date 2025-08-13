import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedProductPackages() {
  console.log('🌱 Seeding ProductPackages...')

  try {
    // Get all existing products
    const products = await prisma.product.findMany({
      where: { isActive: true }
    })

    console.log(`Found ${products.length} products to create packages for`)

    for (const product of products) {
      console.log(`Creating packages for: ${product.name}`)

      // Tạo các gói khác nhau với giá khác nhau
      const packages = [
        {
          duration: 1,
          price: product.price, // Giá gốc cho 1 tháng
          description: 'Gói 1 tháng'
        },
        {
          duration: 3,
          price: Math.floor(product.price * 2.7), // Giảm giá cho gói 3 tháng
          description: 'Gói 3 tháng (Tiết kiệm 10%)'
        },
        {
          duration: 6,
          price: Math.floor(product.price * 5.1), // Giảm giá cho gói 6 tháng
          description: 'Gói 6 tháng (Tiết kiệm 15%)'
        },
        {
          duration: 12,
          price: Math.floor(product.price * 9.6), // Giảm giá cho gói 12 tháng
          description: 'Gói 12 tháng (Tiết kiệm 20%)'
        }
      ]

      // Tạo packages cho product này
      for (const pkg of packages) {
        try {
          await prisma.productPackage.upsert({
            where: {
              productId_duration: {
                productId: product.id,
                duration: pkg.duration
              }
            },
            update: {
              price: pkg.price,
              description: pkg.description,
              isActive: true
            },
            create: {
              productId: product.id,
              duration: pkg.duration,
              price: pkg.price,
              description: pkg.description,
              isActive: true
            }
          })
          
          console.log(`  ✓ Created ${pkg.duration} months package: ${pkg.price.toLocaleString('vi-VN')}đ`)
        } catch (error) {
          console.error(`  ✗ Error creating package for ${product.name} (${pkg.duration} months):`, error)
        }
      }
    }

    // Update product prices to show minimum package price
    for (const product of products) {
      const minPackage = await prisma.productPackage.findFirst({
        where: { 
          productId: product.id,
          isActive: true
        },
        orderBy: { price: 'asc' }
      })

      if (minPackage && minPackage.price !== product.price) {
        await prisma.product.update({
          where: { id: product.id },
          data: { price: minPackage.price }
        })
        console.log(`  ✓ Updated ${product.name} price to minimum: ${minPackage.price.toLocaleString('vi-VN')}đ`)
      }
    }

    console.log('✅ ProductPackages seeded successfully!')

  } catch (error) {
    console.error('❌ Error seeding ProductPackages:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Chạy seed function
if (require.main === module) {
  seedProductPackages()
    .then(() => {
      console.log('🎉 Seed completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Seed failed:', error)
      process.exit(1)
    })
}

export default seedProductPackages