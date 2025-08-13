'use client'

import * as Sentry from '@sentry/nextjs'

// Google Analytics configuration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

// Track events
export const event = (action: string, parameters?: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, parameters)
  }
  
  // Also track in Sentry as breadcrumb for context
  Sentry.addBreadcrumb({
    message: `Analytics event: ${action}`,
    category: 'analytics',
    data: parameters,
    level: 'info'
  })
}

// E-commerce tracking
export const trackPurchase = (transactionId: string, value: number, currency: string = 'VND', items: any[] = []) => {
  event('purchase', {
    transaction_id: transactionId,
    value: value,
    currency: currency,
    items: items
  })
}

export const trackAddToCart = (currency: string = 'VND', value: number, items: any[] = []) => {
  event('add_to_cart', {
    currency: currency,
    value: value,
    items: items
  })
}

export const trackRemoveFromCart = (currency: string = 'VND', value: number, items: any[] = []) => {
  event('remove_from_cart', {
    currency: currency,
    value: value,
    items: items
  })
}

export const trackBeginCheckout = (currency: string = 'VND', value: number, items: any[] = []) => {
  event('begin_checkout', {
    currency: currency,
    value: value,
    items: items
  })
}

export const trackViewItem = (currency: string = 'VND', value: number, items: any[] = []) => {
  event('view_item', {
    currency: currency,
    value: value,
    items: items
  })
}

// User engagement tracking
export const trackLogin = (method: string = 'email') => {
  event('login', {
    method: method
  })
}

export const trackSignUp = (method: string = 'email') => {
  event('sign_up', {
    method: method
  })
}

export const trackSearch = (searchTerm: string) => {
  event('search', {
    search_term: searchTerm
  })
}

// Custom business events
export const trackPaymentMethod = (method: string) => {
  event('payment_method_selected', {
    payment_method: method
  })
}

export const trackCredentialDelivery = (orderId: string, productType: string) => {
  event('credential_delivered', {
    order_id: orderId,
    product_type: productType
  })
}

export const trackError = (error: string, page: string) => {
  event('exception', {
    description: error,
    page: page,
    fatal: false
  })
}

// Performance tracking
export const trackPageLoadTime = (page: string, loadTime: number) => {
  event('page_load_time', {
    page: page,
    load_time: loadTime
  })
}

// Admin actions tracking
export const trackAdminAction = (action: string, target: string) => {
  event('admin_action', {
    action: action,
    target: target
  })
}

// Utility function to create item data for GA4
export const createItemData = (product: any, quantity: number = 1, packageInfo?: any) => {
  return {
    item_id: product.id,
    item_name: product.name,
    item_category: product.category,
    price: packageInfo?.price || product.price,
    quantity: quantity,
    item_variant: packageInfo?.duration ? `${packageInfo.duration} tháng` : undefined
  }
}

// Error boundary tracking
export const trackErrorBoundary = (error: Error, errorInfo: any) => {
  event('exception', {
    description: error.message,
    stack: error.stack,
    component_stack: errorInfo.componentStack,
    fatal: true
  })
}

// Session tracking
export const trackSessionStart = () => {
  event('session_start')
}

export const trackSessionEnd = (duration: number) => {
  event('session_end', {
    session_duration: duration
  })
}

// Conversion tracking
export const trackConversion = (conversionType: string, value?: number) => {
  event('conversion', {
    conversion_type: conversionType,
    value: value
  })
}

// Feature usage tracking
export const trackFeatureUsage = (feature: string, action: string) => {
  event('feature_usage', {
    feature_name: feature,
    action: action
  })
}

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}
