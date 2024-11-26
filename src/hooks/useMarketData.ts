import { useState, useEffect } from 'react';
import { MarketDataService } from '@/services/marketData';
import { Asset } from '@/types/asset';

interface MarketData {
  news: Array<{
    id: string;
    title: string;
    summary: string;
    url: string;
    source: string;
    publishedAt: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
  }>;
  indicators: Array<{
    name: string;
    value: number;
    change: number;
    changePercent: number;
  }>;
  historicalData: {
    [symbol: string]: {
      timestamps: number[];
      prices: number[];
    };
  };
  volumeData: {
    [symbol: string]: {
      timestamps: number[];
      volumes: number[];
    };
  };
}

export function useMarketData(assets: Asset[]) {
  const [marketData, setMarketData] = useState<MarketData>({
    news: [],
    indicators: [],
    historicalData: {},
    volumeData: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const marketDataService = new MarketDataService();

  useEffect(() => {
    const symbols = assets.map((asset) => asset.symbol);
    let mounted = true;

    const fetchMarketData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [news, indicators] = await Promise.all([
          marketDataService.getNews(symbols),
          marketDataService.getMarketIndicators(),
        ]);

        const historicalData: MarketData['historicalData'] = {};
        const volumeData: MarketData['volumeData'] = {};

        // Fetch historical data for each asset
        await Promise.all(
          symbols.map(async (symbol) => {
            const [prices, volumes] = await Promise.all([
              marketDataService.getHistoricalPrices(symbol),
              marketDataService.getVolumeData(symbol),
            ]);

            if (mounted) {
              historicalData[symbol] = prices;
              volumeData[symbol] = volumes;
            }
          })
        );

        if (mounted) {
          setMarketData({
            news,
            indicators,
            historicalData,
            volumeData,
          });
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch market data');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMarketData();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [assets]);

  return {
    marketData,
    isLoading,
    error,
  };
}
