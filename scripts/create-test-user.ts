import { prisma } from '../lib/db'
import { hashPassword } from '../lib/auth'

async function createTestUser() {
  try {
    console.log('🧪 Creating test user...')
    
    const hashedPassword = await hashPassword('123456')
    
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        role: 'user',
        language: 'vi',
      },
    })
    
    console.log('✅ Test user created successfully:')
    console.log('📧 Email:', testUser.email)
    console.log('🔑 Password: 123456')
    console.log('👤 Role:', testUser.role)
    
  } catch (error) {
    const e = error as any
    if (e?.code === 'P2002') {
      console.log('ℹ️ Test user already exists')
    } else {
      console.error('❌ Error creating test user:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()