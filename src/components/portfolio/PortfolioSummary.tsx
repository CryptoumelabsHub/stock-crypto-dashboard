'use client'

import { Asset } from '@prisma/client'
import { useAssetPrices } from '@/hooks/useAssetPrices'
import { usePortfolioAnalytics } from '@/hooks/usePortfolioAnalytics'
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface PortfolioSummaryProps {
  assets: Asset[]
}

const COLORS = ['#4F46E5', '#10B981']

export default function PortfolioSummary({ assets }: PortfolioSummaryProps) {
  const { prices, isLoading: isPricesLoading } = useAssetPrices(assets)
  const metrics = usePortfolioAnalytics(assets, prices)

  const allocationData = [
    { name: 'Stocks', value: metrics.assetAllocation.stocks },
    { name: 'Crypto', value: metrics.assetAllocation.crypto },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Portfolio Value Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="ml-3 text-lg font-medium text-gray-900">
              Portfolio Value
            </h3>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-semibold text-gray-900">
              ${metrics.totalValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p
              className={`mt-2 flex items-center text-sm ${
                metrics.dailyChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {metrics.dailyChange >= 0 ? (
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
              )}
              {Math.abs(metrics.dailyChangePercent).toFixed(2)}% Today
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div
              className={`p-2 rounded-lg ${
                metrics.totalProfitLoss >= 0
                  ? 'bg-green-100'
                  : 'bg-red-100'
              }`}
            >
              {metrics.totalProfitLoss >= 0 ? (
                <ArrowTrendingUpIcon
                  className="h-6 w-6 text-green-600"
                />
              ) : (
                <ArrowTrendingDownIcon className="h-6 w-6 text-red-600" />
              )}
            </div>
            <h3 className="ml-3 text-lg font-medium text-gray-900">
              Total P/L
            </h3>
          </div>
          <div className="mt-4">
            <p
              className={`text-2xl font-semibold ${
                metrics.totalProfitLoss >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              ${Math.abs(metrics.totalProfitLoss).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              {metrics.totalProfitLoss >= 0 ? ' +' : ' -'}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {Math.abs(metrics.totalProfitLossPercent).toFixed(2)}% Return
            </p>
          </div>
        </div>
      </div>

      {/* Asset Allocation */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <ChartPieIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-900">
            Asset Allocation
          </h3>
        </div>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {allocationData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${value.toFixed(2)}%`}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {allocationData.map((item, index) => (
              <div key={item.name} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <span className="text-sm text-gray-600">
                  {item.name}: {item.value.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Performance Overview
        </h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Top Performers
            </h4>
            <div className="space-y-2">
              {metrics.topPerformers.map((asset) => (
                <div
                  key={asset.symbol}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm text-gray-900">
                    {asset.symbol} ({asset.type})
                  </span>
                  <span className="text-sm text-green-600">
                    +{asset.profitLossPercent.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Worst Performers
            </h4>
            <div className="space-y-2">
              {metrics.worstPerformers.map((asset) => (
                <div
                  key={asset.symbol}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm text-gray-900">
                    {asset.symbol} ({asset.type})
                  </span>
                  <span className="text-sm text-red-600">
                    {asset.profitLossPercent.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
