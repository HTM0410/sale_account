import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
    const isStaffRoute = req.nextUrl.pathname.startsWith('/staff')

    // Check admin access
    if (isAdminRoute) {
      if (!token?.role || !['ADMIN', 'STAFF'].includes(token.role as string)) {
        return NextResponse.redirect(new URL('/dashboard?error=access_denied', req.url))
      }
      
      // Staff can't access certain admin routes
      if (token.role === 'STAFF') {
        const restrictedPaths = ['/admin/users', '/admin/settings']
        const isRestricted = restrictedPaths.some(path => 
          req.nextUrl.pathname.startsWith(path)
        )
        
        if (isRestricted) {
          return NextResponse.redirect(new URL('/admin?error=insufficient_permissions', req.url))
        }
      }
    }

    // Check staff access
    if (isStaffRoute) {
      if (!token?.role || !['ADMIN', 'STAFF'].includes(token.role as string)) {
        return NextResponse.redirect(new URL('/dashboard?error=access_denied', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
        const isStaffRoute = req.nextUrl.pathname.startsWith('/staff')
        const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard')
        
        // Public routes don't need authentication
        if (!isAdminRoute && !isStaffRoute && !isDashboardRoute) {
          return true
        }
        
        // Protected routes need authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/staff/:path*',
    '/dashboard/:path*',
  ]
}
