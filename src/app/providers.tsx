'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'
import * as Sentry from '@sentry/nextjs'
import { useReportWebVitals } from 'next/web-vitals'

function WebVitals() {
  useReportWebVitals((metric) => {
    // Log to Sentry
    Sentry.captureMessage('Web Vitals', {
      extra: {
        metric,
      },
    })

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(metric)
    }

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      })
    }
  })

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <WebVitals />
      <Toaster position="bottom-right" />
      {children}
    </SessionProvider>
  )
}
