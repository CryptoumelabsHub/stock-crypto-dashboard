'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

enum AssetType {
  STOCK = 'STOCK',
  CRYPTO = 'CRYPTO'
}

interface AddAssetFormProps {
  onSuccess?: () => void
}

export default function AddAssetForm({ onSuccess }: AddAssetFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [assetType, setAssetType] = useState<AssetType>(AssetType.STOCK)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/search/${assetType.toLowerCase()}?query=${query}`)
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      toast.error('Failed to search assets')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      symbol: formData.get('symbol'),
      type: assetType,
      quantity: parseFloat(formData.get('quantity') as string),
      buyPrice: parseFloat(formData.get('buyPrice') as string),
    }

    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to add asset')
      }

      toast.success('Asset added successfully')
      router.refresh()
      onSuccess?.()
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      toast.error('Failed to add asset')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="assetType" className="block text-sm font-medium text-gray-700">
          Asset Type
        </label>
        <select
          id="assetType"
          name="type"
          value={assetType}
          onChange={(e) => setAssetType(e.target.value as AssetType)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value={AssetType.STOCK}>Stock</option>
          <option value={AssetType.CRYPTO}>Cryptocurrency</option>
        </select>
      </div>

      <div>
        <label htmlFor="symbol" className="block text-sm font-medium text-gray-700">
          Symbol
        </label>
        <div className="mt-1">
          <input
            id="symbol"
            type="text"
            name="symbol"
            required
            onChange={(e) => handleSearch(e.target.value)}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        {isSearching && (
          <p className="mt-2 text-sm text-gray-500">Searching...</p>
        )}
        {searchResults.length > 0 && (
          <ul className="mt-2 border border-gray-200 rounded-md divide-y divide-gray-200">
            {searchResults.map((result) => (
              <li
                key={result.symbol}
                className="p-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  const symbolInput = document.querySelector('input[name="symbol"]') as HTMLInputElement
                  if (symbolInput) {
                    symbolInput.value = result.symbol
                  }
                  setSearchResults([])
                }}
              >
                <div className="text-sm font-medium text-gray-900">
                  {result.symbol}
                </div>
                <div className="text-sm text-gray-500">{result.name}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
          Quantity
        </label>
        <div className="mt-1">
          <input
            id="quantity"
            type="number"
            name="quantity"
            step="any"
            required
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label htmlFor="buyPrice" className="block text-sm font-medium text-gray-700">
          Buy Price (USD)
        </label>
        <div className="mt-1">
          <input
            id="buyPrice"
            type="number"
            name="buyPrice"
            step="any"
            required
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Adding...' : 'Add Asset'}
        </button>
      </div>
    </form>
  )
}
