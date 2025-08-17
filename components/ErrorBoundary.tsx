'use client'

import React from 'react'
import { trackErrorBoundary } from '@/lib/analytics'
import * as Sentry from '@sentry/nextjs'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    
    // Track error in Sentry with context
    Sentry.withScope((scope) => {
      scope.setTag('errorBoundary', true)
      scope.setContext('errorInfo', errorInfo as any)
      scope.setLevel('error')
      Sentry.captureException(error)
    })
    
    // Track error in analytics
    trackErrorBoundary(error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                  Đã xảy ra lỗi
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.
                </p>
                
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4 text-left">
                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                      Chi tiết lỗi (chỉ hiển thị trong development)
                    </summary>
                    <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto max-h-40">
                      {this.state.error.message}
                      {'\n\n'}
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
                
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={this.resetError}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Thử lại
                  </button>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Về trang chủ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

// Hook for functional components to handle errors
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    console.error('Error handled:', error, errorInfo)
    
    // Track error in Sentry
    Sentry.withScope((scope) => {
      scope.setTag('errorHandler', true)
      if (errorInfo) {
        scope.setContext('errorInfo', errorInfo)
      }
      scope.setLevel('error')
      Sentry.captureException(error)
    })
    
    trackErrorBoundary(error, errorInfo || {})
  }
}
