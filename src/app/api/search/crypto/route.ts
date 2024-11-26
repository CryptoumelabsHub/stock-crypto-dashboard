import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query) {
      return new NextResponse('Query parameter is required', { status: 400 })
    }

    const apiKey = process.env.COINGECKO_API_KEY
    const response = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${query}`,
      {
        headers: {
          'x-cg-demo-api-key': apiKey || '',
        },
      }
    )

    const data = await response.json()
    const coins = data.coins || []

    const results = coins.map((coin: any) => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      id: coin.id,
      market_cap_rank: coin.market_cap_rank,
    }))

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error in GET /api/search/crypto:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
