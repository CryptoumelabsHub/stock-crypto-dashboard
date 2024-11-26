export enum AssetType {
  STOCK = 'STOCK',
  CRYPTO = 'CRYPTO'
}

export interface Asset {
  id: string;
  symbol: string;
  assetType: AssetType;
  quantity: number;
  buyPrice: number;
  portfolioId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}
