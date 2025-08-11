import { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mật khẩu', type: 'password' }
      },
      async authorize(credentials, _req) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
          language: user.language,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        token.language = user.language
      } else if (token.email && !token.role) {
        // Fetch user data from database for existing sessions
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email }
          })
          if (dbUser) {
            token.role = dbUser.role
            token.language = dbUser.language
          }
        } catch (error) {
          console.error('JWT callback error:', error)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string || 'user'
        session.user.language = token.language as string || 'vi'
      }
      return session
    },
    async signIn({ user, account, profile }) {
      console.log('SignIn callback triggered:', { provider: account?.provider, email: user.email })
      
      // Handle Google OAuth sign-ins
      if (account?.provider === 'google') {
        console.log('Processing Google OAuth sign-in...')
        try {
          // Check if user exists in database
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })
          console.log('Existing user found:', !!existingUser)
          
          if (!existingUser) {
            console.log('Creating new user...')
            // Create new user from Google profile
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || '',
                image: user.image,
                role: 'user',
                language: 'vi',
                emailVerified: new Date(),
              }
            })
            console.log('New user created successfully')
          }
          console.log('Google sign-in successful')
          return true
        } catch (error) {
          console.error('Google sign-in error:', error)
          // TEMPORARY: Allow sign-in even if database fails
          console.log('Bypassing database error, allowing sign-in...')
          return true
        }
      }
      
      // Allow credentials sign-ins
      if (account?.provider === 'credentials') {
        return true
      }
      
      console.log('Sign-in rejected - unknown provider')
      return false
    }
  },
  pages: {
    signIn: '/signin',
    error: '/error',
  },
  session: {
    strategy: 'jwt' as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// User helpers used by register route
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function createUser(params: { email: string, password: string, name: string, role?: string, language?: string }) {
  const hashed = await bcrypt.hash(params.password, 10)
  return prisma.user.create({
    data: {
      email: params.email,
      password: hashed,
      name: params.name,
      role: params.role ?? 'user',
      language: params.language ?? 'vi',
    }
  })
}

// Re-export hashing utility for scripts compatibility
export { hashPassword } from '@/lib/encryption'