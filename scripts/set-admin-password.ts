import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function setAdminPassword() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const admin = await prisma.user.update({
      where: { email: 'admin@example.com' },
      data: { 
        password: hashedPassword,
        role: 'ADMIN'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true
      }
    })
    
    console.log('✅ Admin password set successfully!')
    console.log('Email:', admin.email)
    console.log('Role:', admin.role)
    console.log('Password hash:', admin.password ? 'Set' : 'Not set')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setAdminPassword()
