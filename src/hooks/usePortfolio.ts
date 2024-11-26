import { useMemo } from 'react';
import { Asset } from '@/types/asset';
import { calculatePercentageChange } from '@/lib/utils';

interface PortfolioStats {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  gainLossPercentage: number;
  assets: Asset[];
}

export function usePortfolio(assets: Asset[]): PortfolioStats {
  return useMemo(() => {
    const totalValue = assets.reduce((sum, asset) => {
      return sum + (asset.currentPrice * asset.quantity);
    }, 0);

    const totalCost = assets.reduce((sum, asset) => {
      return sum + (asset.buyPrice * asset.quantity);
    }, 0);

    const totalGainLoss = totalValue - totalCost;
    const gainLossPercentage = calculatePercentageChange(totalValue, totalCost);

    return {
      totalValue,
      totalCost,
      totalGainLoss,
      gainLossPercentage,
      assets,
    };
  }, [assets]);
}
