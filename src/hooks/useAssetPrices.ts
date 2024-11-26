import { useState, useEffect, useCallback } from 'react'
import { Asset } from '@prisma/client'

export interface AssetPrice {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: string
  error?: string
}

export function useAssetPrices(assets: Asset[]) {
  const [prices, setPrices] = useState<Record<string, AssetPrice>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchPrices = useCallback(async () => {
    if (assets.length === 0) {
      setIsLoading(false)
      return
    }

    try {
      setError(null)
      
      // Group assets by type
      const stocks = assets.filter((asset) => asset.assetType === 'STOCK')
      const crypto = assets.filter((asset) => asset.assetType === 'CRYPTO')

      const results: AssetPrice[] = []

      // Fetch stock prices with retry mechanism
      if (stocks.length > 0) {
        try {
          const stockSymbols = stocks.map((asset) => asset.symbol).join(',')
          const stockResponse = await fetch(
            `/api/prices?symbols=${stockSymbols}&type=STOCK`
          )
          if (!stockResponse.ok) {
            throw new Error('Failed to fetch stock prices')
          }
          const stockData = await stockResponse.json()
          results.push(...stockData)
        } catch (err) {
          console.error('Error fetching stock prices:', err)
          if (retryCount < 3) {
            setRetryCount(prev => prev + 1)
            setTimeout(fetchPrices, 2000) // Retry after 2 seconds
            return
          }
          throw err
        }
      }

      // Fetch crypto prices with retry mechanism
      if (crypto.length > 0) {
        try {
          const cryptoSymbols = crypto.map((asset) => asset.symbol).join(',')
          const cryptoResponse = await fetch(
            `/api/prices?symbols=${cryptoSymbols}&type=CRYPTO`
          )
          if (!cryptoResponse.ok) {
            throw new Error('Failed to fetch crypto prices')
          }
          const cryptoData = await cryptoResponse.json()
          results.push(...cryptoData)
        } catch (err) {
          console.error('Error fetching crypto prices:', err)
          if (retryCount < 3) {
            setRetryCount(prev => prev + 1)
            setTimeout(fetchPrices, 2000) // Retry after 2 seconds
            return
          }
          throw err
        }
      }

      // Convert array to record for easier lookup
      const pricesRecord = results.reduce((acc, price) => {
        acc[price.symbol] = price
        return acc
      }, {} as Record<string, AssetPrice>)

      setPrices(pricesRecord)
      setRetryCount(0) // Reset retry count on success
    } catch (err) {
      console.error('Error in fetchPrices:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch prices')
    } finally {
      setIsLoading(false)
    }
  }, [assets, retryCount])

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const startFetching = async () => {
      await fetchPrices()
      // Set up polling every 60 seconds if there are assets
      if (assets.length > 0) {
        intervalId = setInterval(fetchPrices, 60000)
      }
    }

    startFetching()

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [fetchPrices, assets])

  return { prices, isLoading, error, refetch: fetchPrices }
}
