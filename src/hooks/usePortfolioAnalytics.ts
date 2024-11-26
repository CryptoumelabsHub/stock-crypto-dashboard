import { useState, useEffect } from 'react'
import { Asset } from '@prisma/client'
import { AssetPrice } from './useAssetPrices'

export interface PortfolioMetrics {
  totalValue: number
  totalCost: number
  totalProfitLoss: number
  totalProfitLossPercent: number
  dailyChange: number
  dailyChangePercent: number
  assetAllocation: {
    stocks: number
    crypto: number
  }
  topPerformers: Array<{
    symbol: string
    type: string
    profitLossPercent: number
  }>
  worstPerformers: Array<{
    symbol: string
    type: string
    profitLossPercent: number
  }>
}

export function usePortfolioAnalytics(
  assets: Asset[],
  prices: Record<string, AssetPrice>
) {
  const [metrics, setMetrics] = useState<PortfolioMetrics>({
    totalValue: 0,
    totalCost: 0,
    totalProfitLoss: 0,
    totalProfitLossPercent: 0,
    dailyChange: 0,
    dailyChangePercent: 0,
    assetAllocation: {
      stocks: 0,
      crypto: 0,
    },
    topPerformers: [],
    worstPerformers: [],
  })

  useEffect(() => {
    const calculateMetrics = () => {
      let totalValue = 0
      let totalCost = 0
      let dailyChange = 0
      let stocksValue = 0
      let cryptoValue = 0

      const performanceData = assets.map((asset) => {
        const price = prices[asset.symbol]?.price || 0
        const currentValue = price * asset.quantity
        const costBasis = asset.buyPrice * asset.quantity
        const profitLoss = currentValue - costBasis
        const profitLossPercent = (profitLoss / costBasis) * 100

        totalValue += currentValue
        totalCost += costBasis
        dailyChange += (prices[asset.symbol]?.change || 0) * asset.quantity

        if (asset.assetType === 'STOCK') {
          stocksValue += currentValue
        } else {
          cryptoValue += currentValue
        }

        return {
          symbol: asset.symbol,
          type: asset.assetType,
          profitLossPercent,
        }
      })

      const totalProfitLoss = totalValue - totalCost
      const totalProfitLossPercent = (totalProfitLoss / totalCost) * 100
      const dailyChangePercent = (dailyChange / totalValue) * 100

      // Sort by performance
      const sortedPerformance = [...performanceData].sort(
        (a, b) => b.profitLossPercent - a.profitLossPercent
      )

      setMetrics({
        totalValue,
        totalCost,
        totalProfitLoss,
        totalProfitLossPercent,
        dailyChange,
        dailyChangePercent,
        assetAllocation: {
          stocks: (stocksValue / totalValue) * 100,
          crypto: (cryptoValue / totalValue) * 100,
        },
        topPerformers: sortedPerformance.slice(0, 3),
        worstPerformers: sortedPerformance.slice(-3).reverse(),
      })
    }

    if (assets.length > 0) {
      calculateMetrics()
    }
  }, [assets, prices])

  return metrics
}
