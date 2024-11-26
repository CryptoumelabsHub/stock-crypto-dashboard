import React from 'react';
import { formatCurrency, formatLargeNumber } from '@/lib/utils';

interface PortfolioMetric {
  label: string;
  value: string | number;
  change?: number;
  tooltip?: string;
}

interface PortfolioMetricsProps {
  metrics: {
    totalValue: number;
    dailyChange: number;
    weeklyChange: number;
    monthlyChange: number;
    totalReturn: number;
    volatility: number;
    sharpeRatio: number;
    beta: number;
  };
}

export default function PortfolioMetrics({ metrics }: PortfolioMetricsProps) {
  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatChange = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const allMetrics: PortfolioMetric[] = [
    {
      label: 'Total Value',
      value: formatCurrency(metrics.totalValue),
      tooltip: 'Current total portfolio value',
    },
    {
      label: '24h Change',
      value: formatChange(metrics.dailyChange),
      change: metrics.dailyChange,
      tooltip: 'Portfolio value change in the last 24 hours',
    },
    {
      label: '7d Change',
      value: formatChange(metrics.weeklyChange),
      change: metrics.weeklyChange,
      tooltip: 'Portfolio value change in the last 7 days',
    },
    {
      label: '30d Change',
      value: formatChange(metrics.monthlyChange),
      change: metrics.monthlyChange,
      tooltip: 'Portfolio value change in the last 30 days',
    },
    {
      label: 'Total Return',
      value: formatChange(metrics.totalReturn),
      change: metrics.totalReturn,
      tooltip: 'Total return since portfolio inception',
    },
    {
      label: 'Volatility',
      value: `${metrics.volatility.toFixed(2)}%`,
      tooltip: '30-day rolling volatility',
    },
    {
      label: 'Sharpe Ratio',
      value: metrics.sharpeRatio.toFixed(2),
      tooltip: 'Risk-adjusted return measure',
    },
    {
      label: 'Beta',
      value: metrics.beta.toFixed(2),
      tooltip: 'Portfolio sensitivity to market movements',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Portfolio Metrics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {allMetrics.map((metric) => (
          <div
            key={metric.label}
            className="p-4 bg-gray-50 rounded-lg"
            title={metric.tooltip}
          >
            <div className="text-sm text-gray-500 mb-1">{metric.label}</div>
            <div className="flex items-baseline space-x-2">
              <div
                className={`text-xl font-bold ${
                  metric.change !== undefined ? getChangeColor(metric.change) : ''
                }`}
              >
                {metric.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
