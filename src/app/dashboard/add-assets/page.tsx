'use client'

import AddAssetForm from '@/components/assets/AddAssetForm'

export default function AddAssetsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Add New Asset
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              Search for a stock or cryptocurrency and enter your purchase details.
            </p>
          </div>
          <div className="mt-5">
            <AddAssetForm />
          </div>
        </div>
      </div>
    </div>
  )
}
