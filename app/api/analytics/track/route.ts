import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    
    const { event, ...data } = body

    // Log analytics event (in production, you might want to send to a proper analytics service)
    console.log('Analytics Event:', {
      event,
      data,
      userId: session?.user?.email || 'anonymous',
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    })

    // Here you could send data to external analytics services like:
    // - Google Analytics Measurement Protocol
    // - Mixpanel
    // - Amplitude
    // - Custom analytics database

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}

// GET endpoint for basic analytics dashboard (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    // In a real implementation, you'd check the user's role from the database
    // For now, we'll just return mock data

    const mockAnalytics = {
      totalUsers: 150,
      totalOrders: 45,
      totalRevenue: 12500000,
      conversionRate: 3.2,
      topProducts: [
        { name: 'YouTube Premium', sales: 25, revenue: 5000000 },
        { name: 'ChatGPT Plus', sales: 15, revenue: 4500000 },
        { name: 'Notion Pro', sales: 5, revenue: 3000000 }
      ],
      recentActivity: [
        { event: 'purchase', user: 'user@example.com', timestamp: new Date().toISOString() },
        { event: 'signup', user: 'newuser@example.com', timestamp: new Date().toISOString() }
      ]
    }

    return NextResponse.json(mockAnalytics)
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
