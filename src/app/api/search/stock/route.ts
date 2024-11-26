import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query) {
      return new NextResponse('Query parameter is required', { status: 400 })
    }

    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    const response = await fetch(
      `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${apiKey}`
    )

    const data = await response.json()
    const matches = data.bestMatches || []

    const results = matches.map((match: any) => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
      type: match['3. type'],
      region: match['4. region'],
    }))

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error in GET /api/search/stock:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
