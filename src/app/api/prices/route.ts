import { NextResponse } from 'next/server'
import { LRUCache } from 'lru-cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/auth'

// Rate limiting setup
const rateLimit = new LRUCache({
  max: 500, // Maximum number of items to store
  ttl: 60000, // 1 minute
})

// Price cache setup
const priceCache = new LRUCache({
  max: 100, // Maximum number of items to store
  ttl: 60000, // 1 minute cache
})

// Rate limit middleware
const rateLimiter = (ip: string) => {
  const tokenCount = (rateLimit.get(ip) as number) || 0
  if (tokenCount > 30) {
    // 30 requests per minute
    throw new Error('Too many requests')
  }
  rateLimit.set(ip, tokenCount + 1)
}

// Helper function to validate symbols
const validateSymbols = (symbols: string) => {
  const symbolArray = symbols.split(',')
  if (symbolArray.length > 10) {
    throw new Error('Too many symbols requested. Maximum is 10.')
  }
  return symbolArray.map(s => s.trim().toUpperCase())
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const symbols = searchParams.get('symbols')
    const type = searchParams.get('type')
    const ip = request.headers.get('x-forwarded-for') || 'unknown'

    // Validate inputs
    if (!symbols || !type) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Apply rate limiting
    try {
      rateLimiter(ip)
    } catch (error) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    // Validate and process symbols
    const symbolArray = validateSymbols(symbols)

    // Check cache first
    const cachedResults = symbolArray
      .map(symbol => {
        const cacheKey = `${type}-${symbol}`
        return priceCache.get(cacheKey)
      })
      .filter(Boolean)

    if (cachedResults.length === symbolArray.length) {
      return NextResponse.json(cachedResults)
    }

    // Fetch prices based on type
    if (type === 'STOCK') {
      const promises = symbolArray.map(async symbol => {
        const cacheKey = `STOCK-${symbol}`
        const cached = priceCache.get(cacheKey)
        if (cached) return cached

        try {
          const response = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
          )
          
          if (!response.ok) {
            throw new Error('Failed to fetch stock data')
          }

          const data = await response.json()
          const quote = data['Global Quote']
          
          if (!quote || !quote['05. price']) {
            throw new Error('Invalid API response')
          }

          const result = {
            symbol,
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
            volume: parseInt(quote['06. volume']),
            timestamp: quote['07. latest trading day'],
          }

          priceCache.set(cacheKey, result)
          return result
        } catch (error) {
          console.error(`Error fetching stock data for ${symbol}:`, error)
          return {
            symbol,
            error: 'Failed to fetch stock data',
            timestamp: new Date().toISOString(),
          }
        }
      })

      const results = await Promise.all(promises)
      return NextResponse.json(results)
    }

    if (type === 'CRYPTO') {
      try {
        const ids = symbolArray.map(s => s.toLowerCase()).join(',')
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currency=usd&include_24hr_change=true&include_24hr_vol=true`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch crypto data')
        }

        const data = await response.json()
        const results = symbolArray.map(symbol => {
          const id = symbol.toLowerCase()
          const coinData = data[id]

          if (!coinData) {
            return {
              symbol,
              error: 'Crypto data not found',
              timestamp: new Date().toISOString(),
            }
          }

          const result = {
            symbol,
            price: coinData.usd,
            change: coinData.usd_24h_change,
            changePercent: coinData.usd_24h_change,
            volume: coinData.usd_24h_vol,
            timestamp: new Date().toISOString(),
          }

          priceCache.set(`CRYPTO-${symbol}`, result)
          return result
        })

        return NextResponse.json(results)
      } catch (error) {
        console.error('Error fetching crypto data:', error)
        return NextResponse.json(
          symbolArray.map(symbol => ({
            symbol,
            error: 'Failed to fetch crypto data',
            timestamp: new Date().toISOString(),
          }))
        )
      }
    }

    return NextResponse.json(
      { error: 'Invalid asset type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
