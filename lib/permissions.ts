import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
// import { UserRole } from '@prisma/client'
type UserRole = 'USER' | 'ADMIN'

export type Permission = 
  | 'read:products'
  | 'write:products'
  | 'delete:products'
  | 'read:orders'
  | 'write:orders'
  | 'delete:orders'
  | 'read:users'
  | 'write:users'
  | 'delete:users'
  | 'read:analytics'
  | 'write:analytics'
  | 'read:settings'
  | 'write:settings'
  | 'access:admin'
  | 'access:staff'

// Define role permissions
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'read:products',
    'write:products',
    'delete:products',
    'read:orders',
    'write:orders',
    'delete:orders',
    'read:users',
    'write:users',
    'delete:users',
    'read:analytics',
    'write:analytics',
    'read:settings',
    'write:settings',
    'access:admin',
    'access:staff',
  ],
  STAFF: [
    'read:products',
    'write:products',
    'read:orders',
    'write:orders',
    'read:users',
    'read:analytics',
    'access:staff',
  ],
  CUSTOMER: [
    'read:products',
    'read:orders', // Only their own orders
  ],
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  })

  return user
}

export async function hasPermission(permission: Permission): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) {
    return false
  }

  const userPermissions = ROLE_PERMISSIONS[user.role] || []
  return userPermissions.includes(permission)
}

export async function requirePermission(permission: Permission) {
  const hasAccess = await hasPermission(permission)
  if (!hasAccess) {
    throw new Error(`Access denied. Required permission: ${permission}`)
  }
}

export async function requireRole(role: UserRole | UserRole[]) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }

  const allowedRoles = Array.isArray(role) ? role : [role]
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Access denied. Required role: ${allowedRoles.join(' or ')}`)
  }

  return user
}

export function isAdmin(user: { role: UserRole }): boolean {
  return user.role === 'ADMIN'
}

export function isStaff(user: { role: UserRole }): boolean {
  return user.role === 'STAFF' || user.role === 'ADMIN'
}

export function isCustomer(user: { role: UserRole }): boolean {
  return user.role === 'CUSTOMER'
}

// Higher-order component for protecting pages
export function withAuth<T extends Record<string, any>>(
  handler: (req: any, res: any, user: any) => Promise<T>,
  options: {
    requireRole?: UserRole | UserRole[]
    requirePermission?: Permission
  } = {}
) {
  return async (req: any, res: any): Promise<T> => {
    try {
      const user = await getCurrentUser()
      
      if (!user) {
        throw new Error('Authentication required')
      }

      if (options.requireRole) {
        const allowedRoles = Array.isArray(options.requireRole) 
          ? options.requireRole 
          : [options.requireRole]
        
        if (!allowedRoles.includes(user.role)) {
          throw new Error(`Access denied. Required role: ${allowedRoles.join(' or ')}`)
        }
      }

      if (options.requirePermission) {
        const hasAccess = await hasPermission(options.requirePermission)
        if (!hasAccess) {
          throw new Error(`Access denied. Required permission: ${options.requirePermission}`)
        }
      }

      return await handler(req, res, user)
    } catch (error) {
      throw error
    }
  }
}

// Utility function to check if user can access admin routes
export async function canAccessAdmin(): Promise<boolean> {
  return await hasPermission('access:admin')
}

// Utility function to check if user can access staff routes
export async function canAccessStaff(): Promise<boolean> {
  return await hasPermission('access:staff')
}
