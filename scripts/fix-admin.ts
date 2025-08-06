import { prisma } from '../lib/db'
import bcrypt from 'bcryptjs'

async function fixAdmin() {
  try {
    console.log('🔧 Fixing admin user...')
    
    // Hash the password
    const password = 'admin123'
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Update admin user with password
    const updatedAdmin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: { 
        password: hashedPassword,
        name: 'Administrator',
        role: 'admin',
        emailVerified: new Date()
      },
      create: {
        email: 'admin@example.com',
        name: 'Administrator', 
        password: hashedPassword,
        role: 'admin',
        emailVerified: new Date()
      }
    })
    
    console.log('✅ Admin user fixed!')
    console.log('📧 Email: admin@example.com')
    console.log('🔑 Password: admin123') 
    console.log('👤 Role:', updatedAdmin.role)
    
    // Test the password
    console.log('\n🧪 Testing password...')
    const isValid = await bcrypt.compare('admin123', updatedAdmin.password!)
    console.log('Password test:', isValid ? '✅ PASS' : '❌ FAIL')
    
  } catch (error) {
    console.error('❌ Error fixing admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixAdmin()