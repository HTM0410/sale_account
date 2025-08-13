import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')
const ALGORITHM = 'aes-256-cbc'

if (!process.env.ENCRYPTION_KEY) {
  console.warn('⚠️  ENCRYPTION_KEY not set in environment variables. Using random key (data will be lost on restart)')
}

export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(16)
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest() // 32 bytes
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
    return ['v2', iv.toString('hex'), encrypted.toString('hex')].join(':')
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

export function decrypt(encryptedText: string): string {
  // Try v2 format: v2:ivHex:cipherHex
  try {
    const parts = encryptedText.split(':')
    if (parts.length === 3 && parts[0] === 'v2') {
      const iv = Buffer.from(parts[1], 'hex')
      const cipherHex = parts[2]
      const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest()
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(cipherHex, 'hex')),
        decipher.final()
      ]).toString('utf8')
      return decrypted
    }
  } catch (e) {
    // fall through to legacy
  }

  // Legacy fallback: format ivHex:cipherHex (iv was not used previously)
  try {
    const parts = encryptedText.split(':')
    if (parts.length === 2) {
      const cipherHex = parts[1]
      const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY)
      let decrypted = decipher.update(cipherHex, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      return decrypted
    }
  } catch (error) {
    console.error('Legacy decryption error:', error)
  }

  throw new Error('Failed to decrypt data')
}

export function hashPassword(password: string): string {
  return crypto
    .createHash('sha256')
    .update(password + ENCRYPTION_KEY)
    .digest('hex')
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

// Generate secure random password
export function generateSecurePassword(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return password
}

// Generate secure username
export function generateUsername(productName: string): string {
  const cleanName = productName.toLowerCase().replace(/[^a-z0-9]/g, '')
  const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  
  return `${cleanName}_${randomSuffix}@premium.com`
} 