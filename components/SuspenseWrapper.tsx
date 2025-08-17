'use client'

import { Suspense } from 'react'

interface SuspenseWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function SuspenseWrapper({ 
  children, 
  fallback = <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div> 
}: SuspenseWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  )
}
