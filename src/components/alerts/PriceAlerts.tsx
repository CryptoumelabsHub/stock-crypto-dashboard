import React, { useState } from 'react';
import { Asset } from '@/types/asset';
import { formatCurrency } from '@/lib/utils';

interface PriceAlert {
  id: string;
  assetSymbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  createdAt: Date;
  isActive: boolean;
}

interface PriceAlertsProps {
  assets: Asset[];
  alerts: PriceAlert[];
  onCreateAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteAlert: (alertId: string) => Promise<void>;
  onToggleAlert: (alertId: string, isActive: boolean) => Promise<void>;
}

export default function PriceAlerts({
  assets,
  alerts,
  onCreateAlert,
  onDeleteAlert,
  onToggleAlert,
}: PriceAlertsProps) {
  const [symbol, setSymbol] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !targetPrice) return;

    await onCreateAlert({
      assetSymbol: symbol,
      targetPrice: parseFloat(targetPrice),
      condition,
      isActive: true,
    });

    // Reset form
    setSymbol('');
    setTargetPrice('');
    setCondition('above');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Price Alerts</h2>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="symbol" className="block text-sm font-medium text-gray-700">
              Asset
            </label>
            <select
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              required
            >
              <option value="">Select Asset</option>
              {assets.map((asset) => (
                <option key={asset.symbol} value={asset.symbol}>
                  {asset.symbol}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
              Condition
            </label>
            <select
              id="condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value as 'above' | 'below')}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
          </div>

          <div>
            <label htmlFor="targetPrice" className="block text-sm font-medium text-gray-700">
              Target Price
            </label>
            <input
              type="number"
              id="targetPrice"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              required
              step="any"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Create Alert
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <span className="text-lg font-medium">{alert.assetSymbol}</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  Alert when price is {alert.condition}{' '}
                  {formatCurrency(alert.targetPrice)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => onToggleAlert(alert.id, !alert.isActive)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  alert.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {alert.isActive ? 'Active' : 'Inactive'}
              </button>
              <button
                onClick={() => onDeleteAlert(alert.id)}
                className="text-red-600 hover:text-red-800"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
