import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email)
      return
    }

    // Hash password
    const password = 'admin123'
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Administrator',
        password: hashedPassword,
        role: 'admin',
        emailVerified: new Date(),
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email: admin@example.com')
    console.log('🔑 Password: admin123')
    console.log('👤 User ID:', adminUser.id)
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createAdminUser()