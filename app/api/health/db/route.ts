import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      provider: 'postgresql', // or 'sqlite' based on your setup
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    console.error('Database health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: 'Database connection failed',
      },
      { status: 500 }
    );
  }
}