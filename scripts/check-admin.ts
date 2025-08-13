import { prisma } from '../lib/db'
import bcrypt from 'bcryptjs'

async function checkAdmin() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    })
    
    if (!admin) {
      console.log('❌ Admin user not found!')
      return
    }
    
    console.log('✅ Admin user found:')
    console.log('- Email:', admin.email)
    console.log('- Role:', admin.role)
    console.log('- Has password:', !!admin.password)
    console.log('- Password length:', admin.password?.length || 0)
    
    if (admin.password) {
      console.log('\n🔍 Testing password "admin123"...')
      const isValid = await bcrypt.compare('admin123', admin.password)
      console.log('- Password valid:', isValid ? '✅ YES' : '❌ NO')
      
      if (!isValid) {
        console.log('\n🔧 Resetting password...')
        const newPassword = await bcrypt.hash('admin123', 12)
        await prisma.user.update({
          where: { email: 'admin@example.com' },
          data: { password: newPassword }
        })
        console.log('✅ Password reset complete!')
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmin()