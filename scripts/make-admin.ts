import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function makeAdmin() {
  try {
    const email = 'hoangtruongminh22@gmail.com'
    
    const admin = await prisma.user.upsert({
      where: { email },
      update: { role: 'ADMIN' },
      create: {
        email,
        name: 'Admin User',
        role: 'ADMIN',
        language: 'vi'
      }
    })
    
    console.log('✅ Admin user created/updated:', admin.email, 'Role:', admin.role)
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

makeAdmin()
