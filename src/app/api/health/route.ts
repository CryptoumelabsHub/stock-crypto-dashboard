import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import NextAuth from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/auth'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`

    // Check external API availability
    const alphaVantageResponse = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    )
    const coinGeckoResponse = await fetch(
      'https://api.coingecko.com/api/v3/ping'
    )

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      externalApis: {
        alphaVantage: alphaVantageResponse.ok ? 'healthy' : 'unhealthy',
        coinGecko: coinGeckoResponse.ok ? 'healthy' : 'unhealthy',
      },
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV,
    }

    return NextResponse.json(health)
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
