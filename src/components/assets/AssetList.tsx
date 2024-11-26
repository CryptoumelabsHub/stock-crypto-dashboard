'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Asset } from '@prisma/client'
import { TrashIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useAssetPrices } from '@/hooks/useAssetPrices'
import PriceChart from './PriceChart'

enum AssetType {
  STOCK = 'STOCK',
  CRYPTO = 'CRYPTO'
}

export default function AssetList() {
  const router = useRouter()
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const { prices, isLoading: isPricesLoading } = useAssetPrices(assets)

  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/assets')
      if (!response.ok) throw new Error('Failed to fetch assets')
      const data = await response.json()
      setAssets(data)
    } catch (error) {
      toast.error('Failed to load assets')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (assetId: string) => {
    try {
      const response = await fetch(`/api/assets?id=${assetId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete asset')

      setAssets((prev) => prev.filter((asset) => asset.id !== assetId))
      toast.success('Asset deleted successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete asset')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <p className="text-gray-500">Loading assets...</p>
      </div>
    )
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No assets found. Add some to get started!</p>
      </div>
    )
  }

  const calculateCurrentValue = (asset: Asset) => {
    const price = prices[asset.symbol]?.price || 0
    return price * asset.quantity
  }

  const calculateProfitLoss = (asset: Asset) => {
    const currentValue = calculateCurrentValue(asset)
    const costBasis = asset.buyPrice * asset.quantity
    return currentValue - costBasis
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Buy Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profit/Loss
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                24h Change
              </th>
              <th className="px-6 py-3 relative">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assets.map((asset) => (
              <tr key={asset.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {asset.symbol}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {asset.assetType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {asset.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${asset.buyPrice.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {isPricesLoading ? (
                    'Loading...'
                  ) : (
                    <span className={prices[asset.symbol]?.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                      ${prices[asset.symbol]?.price.toFixed(2) || '0.00'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${calculateCurrentValue(asset).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={
                      calculateProfitLoss(asset) >= 0 ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    ${Math.abs(calculateProfitLoss(asset)).toFixed(2)}
                    {calculateProfitLoss(asset) >= 0 ? ' +' : ' -'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {isPricesLoading ? (
                    'Loading...'
                  ) : (
                    <span
                      className={
                        (prices[asset.symbol]?.changePercent || 0) >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {prices[asset.symbol]?.changePercent.toFixed(2)}%
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => setSelectedAsset(selectedAsset?.id === asset.id ? null : asset)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <ChartBarIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedAsset && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Price History - {selectedAsset.symbol}
            </h3>
            <button
              onClick={() => setSelectedAsset(null)}
              className="text-gray-400 hover:text-gray-500"
            >
              ×
            </button>
          </div>
          <PriceChart 
            symbol={selectedAsset.symbol} 
            type={selectedAsset.assetType as AssetType} 
          />
        </div>
      )}
    </div>
  )
}
