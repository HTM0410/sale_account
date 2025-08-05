import NextAuth from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      image?: string
      role: string
      language: string
    }
  }

  interface User {
    id: string
    email: string
    name?: string
    image?: string
    role: string
    language: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    language?: string
  }
}