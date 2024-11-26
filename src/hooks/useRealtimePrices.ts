import { useState, useEffect } from 'react';
import { WebSocketService } from '@/services/websocket';
import { Asset, AssetType } from '@/types/asset';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.example.com/ws';
const wsService = new WebSocketService(WS_URL);

interface PriceUpdate {
  symbol: string;
  price: number;
  timestamp: number;
}

export function useRealtimePrices(assets: Asset[]) {
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    // Connect to WebSocket when the hook is first used
    wsService.connect();

    // Cleanup on unmount
    return () => {
      wsService.disconnect();
    };
  }, []);

  useEffect(() => {
    const symbols = assets.map(asset => asset.symbol);
    
    // Handle price updates
    const handlePriceUpdate = (update: PriceUpdate) => {
      setPrices(prev => ({
        ...prev,
        [update.symbol]: update.price,
      }));
    };

    // Subscribe to price updates for each asset
    symbols.forEach(symbol => {
      wsService.subscribe(`price:${symbol}`, handlePriceUpdate);
    });

    // Cleanup subscriptions when assets change
    return () => {
      symbols.forEach(symbol => {
        wsService.unsubscribe(`price:${symbol}`, handlePriceUpdate);
      });
    };
  }, [assets]);

  // Return current prices and loading state
  return {
    prices,
    isConnected: wsService.socket?.readyState === WebSocket.OPEN,
  };
}
