import React from 'react';
import { Asset } from '@/types/asset';
import { formatCurrency } from '@/lib/utils';

interface PortfolioOverviewProps {
  assets: Asset[];
  totalValue: number;
  totalGainLoss: number;
  gainLossPercentage: number;
}

export default function PortfolioOverview({
  assets,
  totalValue,
  totalGainLoss,
  gainLossPercentage,
}: PortfolioOverviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Portfolio Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm text-gray-500">Total Value</h3>
          <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm text-gray-500">Total Gain/Loss</h3>
          <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalGainLoss)}
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm text-gray-500">Return</h3>
          <p className={`text-2xl font-bold ${gainLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {gainLossPercentage.toFixed(2)}%
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm text-gray-500">Total Assets</h3>
          <p className="text-2xl font-bold">{assets.length}</p>
        </div>
      </div>
    </div>
  );
}
