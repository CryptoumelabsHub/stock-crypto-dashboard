import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get response
  const response = NextResponse.next()

  // Add security headers
  const headers = response.headers
  
  // HSTS
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  
  // XSS Protection
  headers.set('X-XSS-Protection', '1; mode=block')
  
  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff')
  
  // Referrer Policy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Frame Options
  headers.set('X-Frame-Options', 'DENY')
  
  // CSP
  headers.set(
    'Content-Security-Policy',
    `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' https://www.alphavantage.co https://api.coingecko.com;
    `.replace(/\s+/g, ' ').trim()
  )

  // Permissions Policy
  headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  return response
}
