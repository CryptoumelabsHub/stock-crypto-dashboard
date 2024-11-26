'use client'

import AssetList from '@/components/assets/AssetList'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function StocksPage() {
  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Stocks</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your stock investments and track their performance
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/dashboard/add-assets"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Stock
          </Link>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <AssetList />
        </div>
      </div>
    </div>
  )
}
