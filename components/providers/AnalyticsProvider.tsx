'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import ErrorBoundary from '@/components/ErrorBoundary'
import { trackSessionStart, trackLogin, trackPageLoadTime } from '@/lib/analytics'
import LogRocket from 'logrocket'
import * as Sentry from '@sentry/nextjs'

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export default function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Initialize LogRocket
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_LOGROCKET_APP_ID && typeof window !== 'undefined') {
      LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_APP_ID)
      
      // Connect LogRocket to Sentry
      LogRocket.getSessionURL((sessionURL) => {
        Sentry.setContext("LogRocket", {
          sessionURL: sessionURL
        })
      })
    }
  }, [])

  // Track session start
  useEffect(() => {
    trackSessionStart()
    
    // Track page load time
    const startTime = performance.now()
    
    const handleLoad = () => {
      const loadTime = performance.now() - startTime
      trackPageLoadTime(pathname, loadTime)
    }

    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad)
      return () => window.removeEventListener('load', handleLoad)
    }
  }, [pathname])

  // Track login events and user identification
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Determine login method
      const loginMethod = session.user.image ? 'google' : 'email'
      trackLogin(loginMethod)

      // Identify user in LogRocket
      if (process.env.NEXT_PUBLIC_LOGROCKET_APP_ID) {
        LogRocket.identify(session.user.id || session.user.email || '', {
          name: session.user.name || '',
          email: session.user.email || '',
          role: session.user.role || 'CUSTOMER',
        })
      }

      // Identify user in Sentry
      Sentry.setUser({
        id: session.user.id || session.user.email || '',
        email: session.user.email || '',
        username: session.user.name || '',
      })
    }
  }, [session, status])

  // Track session duration on page unload
  useEffect(() => {
    const sessionStartTime = Date.now()

    const handleBeforeUnload = () => {
      const sessionDuration = Date.now() - sessionStartTime
      // Note: This might not always work due to browser limitations
      if (navigator.sendBeacon) {
        const data = JSON.stringify({
          event: 'session_end',
          session_duration: sessionDuration
        })
        navigator.sendBeacon('/api/analytics/track', data)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error)
      
      // Track error in Sentry (automatically captured)
      Sentry.captureException(event.error, {
        contexts: {
          page: {
            pathname: pathname,
            timestamp: new Date().toISOString()
          }
        }
      })
      
      // Track error in analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'exception', {
          description: event.error?.message || 'Unknown error',
          fatal: false,
          page: pathname
        })
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      
      // Track promise rejection in Sentry
      Sentry.captureException(new Error(`Promise rejection: ${event.reason}`), {
        contexts: {
          page: {
            pathname: pathname,
            timestamp: new Date().toISOString()
          }
        }
      })
      
      // Track promise rejection in analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'exception', {
          description: `Promise rejection: ${event.reason}`,
          fatal: false,
          page: pathname
        })
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [pathname])

  return (
    <ErrorBoundary>
      {/* Temporarily disabled GoogleAnalytics for deployment */}
      {/* <GoogleAnalytics /> */}
      {children}
    </ErrorBoundary>
  )
}
