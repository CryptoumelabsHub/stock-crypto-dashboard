'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface PriceData {
  timestamp: string
  price: number
}

interface PriceChartProps {
  symbol: string
  type: 'STOCK' | 'CRYPTO'
}

// Cache for historical data
const priceCache = new Map<string, { data: PriceData[]; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export default function PriceChart({ symbol, type }: PriceChartProps) {
  const [data, setData] = useState<PriceData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchHistoricalData = useCallback(async () => {
    const cacheKey = `${type}-${symbol}`
    const cachedData = priceCache.get(cacheKey)
    
    // Return cached data if it's still valid
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      setData(cachedData.data)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      let endpoint: string
      if (type === 'STOCK') {
        endpoint = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY}`
      } else {
        endpoint = `https://api.coingecko.com/api/v3/coins/${symbol.toLowerCase()}/market_chart?vs_currency=usd&days=30&interval=daily`
      }

      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error('Failed to fetch historical data')
      }
      const rawData = await response.json()

      let formattedData: PriceData[]
      if (type === 'STOCK') {
        const timeSeriesData = rawData['Time Series (Daily)']
        if (!timeSeriesData) {
          throw new Error('Invalid data format from API')
        }
        formattedData = Object.entries(timeSeriesData)
          .slice(0, 30)
          .map(([date, values]: [string, any]) => ({
            timestamp: date,
            price: parseFloat(values['4. close']),
          }))
          .reverse()
      } else {
        if (!rawData.prices || !Array.isArray(rawData.prices)) {
          throw new Error('Invalid data format from API')
        }
        formattedData = rawData.prices.map(([timestamp, price]: [number, number]) => ({
          timestamp: new Date(timestamp).toISOString().split('T')[0],
          price,
        }))
      }

      // Cache the data
      priceCache.set(cacheKey, {
        data: formattedData,
        timestamp: Date.now(),
      })

      setData(formattedData)
      setRetryCount(0)
    } catch (err) {
      console.error('Error fetching historical data:', err)
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1)
        setTimeout(fetchHistoricalData, 2000) // Retry after 2 seconds
        return
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch historical data')
    } finally {
      setIsLoading(false)
    }
  }, [symbol, type, retryCount])

  useEffect(() => {
    fetchHistoricalData()
  }, [fetchHistoricalData])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <div className="h-32 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <button
          onClick={() => {
            setRetryCount(0)
            fetchHistoricalData()
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Retry
        </button>
      </div>
    )
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(value) => value.split('-').slice(1).join('/')}
            stroke="#6B7280"
          />
          <YAxis
            tickFormatter={formatCurrency}
            stroke="#6B7280"
            domain={['auto', 'auto']}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), 'Price']}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '0.375rem',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#4F46E5"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
            name={`${symbol} Price`}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
