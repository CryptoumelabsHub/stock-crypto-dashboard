interface MarketNews {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

interface MarketIndicator {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export class MarketDataService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_MARKET_API_URL || 'https://api.example.com';
    this.apiKey = process.env.NEXT_PUBLIC_MARKET_API_KEY || '';
  }

  private async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const queryParams = new URLSearchParams({
      ...params,
      apiKey: this.apiKey,
    });

    const response = await fetch(`${this.baseUrl}${endpoint}?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`Market data API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getNews(symbols: string[]): Promise<MarketNews[]> {
    return this.fetch<MarketNews[]>('/news', {
      symbols: symbols.join(','),
      limit: '10',
    });
  }

  async getMarketIndicators(): Promise<MarketIndicator[]> {
    return this.fetch<MarketIndicator[]>('/indicators');
  }

  async getHistoricalPrices(
    symbol: string,
    interval: '1d' | '1w' | '1m' = '1d',
    limit: number = 30
  ): Promise<{
    timestamps: number[];
    prices: number[];
  }> {
    return this.fetch(`/historical/${symbol}`, {
      interval,
      limit: limit.toString(),
    });
  }

  async getVolumeData(
    symbol: string,
    interval: '1h' | '1d' = '1d',
    limit: number = 24
  ): Promise<{
    timestamps: number[];
    volumes: number[];
  }> {
    return this.fetch(`/volume/${symbol}`, {
      interval,
      limit: limit.toString(),
    });
  }
}
